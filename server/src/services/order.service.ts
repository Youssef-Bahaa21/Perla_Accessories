// server/src/services/order.service.ts
import { pool } from '../config/db';
import { RowDataPacket, OkPacket, ResultSetHeader } from 'mysql2';

export interface OrderItemDTO {
  product_id: number;
  quantity: number;
  unit_price: number | string; // Accept string as well for safety
}

export interface CreateOrderDTO {
  user_id: number | null;
  items: OrderItemDTO[];
  coupon_code?: string;
  shipping_name: string;
  shipping_email: string;
  shipping_address: string;
  shipping_city: string;
  shipping_phone: string;
  delivery_fee: number;
  payment_method?: 'cod' | 'vodafone_cash' | 'instapay';
}

export interface UpdateOrderDTO {
  status?: 'pending' | 'paid' | 'shipped' | 'completed' | 'cancelled';
  delivery_fee?: number;
}

export interface OrderItem extends RowDataPacket {
  product_id: number;
  quantity: number;
  unit_price: number;
  product_name: string;
  product_image: string | null;
}

export interface Order extends RowDataPacket {
  id: number;
  user_id: number | null;
  status: string;
  total: number;
  delivery_fee: number;
  shipping_name: string;
  shipping_email: string;
  shipping_address: string;
  shipping_city: string;
  shipping_phone: string;
  coupon_code: string | null;
  payment_method: string;
  payment_status: string;
  created_at: Date;
  updated_at: Date;
  items?: OrderItem[];
}

export class OrderService {
  async findAll(filter?: { userId?: number }) {
    const query = `
      SELECT id, user_id, status, total, delivery_fee,
             shipping_name, shipping_email, shipping_address, shipping_city, shipping_phone,
             coupon_code, payment_method, payment_status, created_at, updated_at
      FROM \`order\`
      WHERE archived = 0 ${filter?.userId ? 'AND user_id = ?' : ''};
    `;
    const [orders] = await pool.query<Order[]>(query, filter?.userId ? [filter.userId] : []);

    for (const order of orders) {
      const [items] = await pool.query<OrderItem[]>(`
        SELECT
          oi.product_id,
          oi.quantity,
          oi.unit_price,
          p.name AS product_name,
          (SELECT pi.image FROM product_images pi WHERE pi.product_id = p.id LIMIT 1) AS product_image
        FROM order_item oi
        JOIN product p ON oi.product_id = p.id
        WHERE oi.order_id = ?;
      `, [order.id]);
      order.items = items;
    }

    return orders;
  }

  async findOne(id: number) {
    const [results] = await pool.query<Order[]>(`
      SELECT id, user_id, status, total, delivery_fee,
             shipping_name, shipping_email, shipping_address, shipping_city, shipping_phone,
             coupon_code, payment_method, payment_status, created_at, updated_at
      FROM \`order\`
      WHERE id = ? AND archived = 0;
    `, [id]);

    if (!results.length) return null;
    const order = results[0];

    const [items] = await pool.query<OrderItem[]>(`
      SELECT
        oi.product_id,
        oi.quantity,
        oi.unit_price,
        p.name AS product_name,
        (SELECT pi.image FROM product_images pi WHERE pi.product_id = p.id LIMIT 1) AS product_image
      FROM order_item oi
      LEFT JOIN product p ON oi.product_id = p.id
      WHERE oi.order_id = ?;
    `, [id]);

    order.items = items || [];
    return order;
  }

  async create(dto: CreateOrderDTO) {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Ensure unit_price is a number for all items
      const items = dto.items.map(item => ({
        ...item,
        unit_price: Number(item.unit_price)
      }));

      const cartTotal = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
      let total = cartTotal;
      let discount = 0;
      let couponId: number | null = null;

      if (dto.coupon_code) {
        const code = dto.coupon_code.toLowerCase().trim();
        const [couponRows]: any = await conn.query(
          `SELECT * FROM coupon WHERE LOWER(code) = ? LIMIT 1`,
          [code]
        );
        const coupon = couponRows[0];

        const logAttempt = async (reason: string) => {
          await conn.query(
            `INSERT INTO coupon_attempts (code, reason, user_id, email)
             VALUES (?, ?, ?, ?)`,
            [code, reason, dto.user_id ?? null, dto.shipping_email ?? null]
          );
        };

        if (!coupon) {
          await logAttempt('Coupon does not exist');
          throw new Error('Invalid coupon code');
        }

        if (!coupon.is_active) {
          await logAttempt('Coupon is disabled');
          throw new Error('Coupon is disabled');
        }

        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
          await logAttempt('Coupon expired');
          throw new Error('Coupon expired');
        }

        if (cartTotal < coupon.min_order_amt) {
          await logAttempt(`Below minimum EGP ${coupon.min_order_amt}`);
          throw new Error(`Minimum order is EGP ${coupon.min_order_amt}`);
        }

        await conn.query(`SELECT * FROM coupon_usage WHERE coupon_id = ? FOR UPDATE`, [coupon.id]);

        const [globalUses]: any = await conn.query(
          `SELECT COUNT(*) AS cnt FROM coupon_usage WHERE coupon_id = ?`,
          [coupon.id]
        );
        if (coupon.usage_limit && globalUses[0].cnt >= coupon.usage_limit) {
          await logAttempt('Global usage limit reached');
          throw new Error('Coupon usage limit reached');
        }

        const userUsesQuery = dto.user_id
          ? `SELECT COUNT(*) AS cnt FROM coupon_usage WHERE coupon_id = ? AND user_id = ?`
          : dto.shipping_email
            ? `SELECT COUNT(*) AS cnt FROM coupon_usage WHERE coupon_id = ? AND email = ?`
            : null;

        if (userUsesQuery) {
          const [userUses]: any = await conn.query(userUsesQuery, [coupon.id, dto.user_id || dto.shipping_email]);
          if (userUses[0].cnt >= coupon.per_user_limit) {
            await logAttempt('Per user limit reached');
            throw new Error('You\'ve already used this coupon');
          }
        }

        discount = coupon.type === 'fixed'
          ? coupon.value
          : Math.floor(cartTotal * (coupon.value / 100));

        total = Math.max(0, cartTotal - discount);
        couponId = coupon.id;
      }

      const [orderRes]: any = await conn.query(`
        INSERT INTO \`order\` (
          user_id, status, total, delivery_fee,
          shipping_name, shipping_email, shipping_address, shipping_city, shipping_phone,
          coupon_code, payment_method
        ) VALUES (?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        dto.user_id ?? null,
        total.toFixed(2),
        Number(dto.delivery_fee ?? 0).toFixed(2),
        dto.shipping_name,
        dto.shipping_email,
        dto.shipping_address,
        dto.shipping_city,
        dto.shipping_phone,
        dto.coupon_code ?? null,
        dto.payment_method ?? 'cod'
      ]);

      const orderId = orderRes.insertId;
      if (!orderId) throw new Error('Order ID not returned');

      if (items.length > 0) {
        // First, validate stock availability for all items
        for (const item of items) {
          const [stockCheck]: any = await conn.query(`
            SELECT stock FROM product WHERE id = ?
          `, [item.product_id]);

          if (!stockCheck || stockCheck.length === 0) {
            throw new Error(`Product with ID ${item.product_id} not found`);
          }

          const currentStock = stockCheck[0].stock;
          if (currentStock < item.quantity) {
            throw new Error(`Insufficient stock for product ID ${item.product_id}. Available: ${currentStock}, Requested: ${item.quantity}`);
          }
        }

        // If all stock validations pass, insert order items and update stock
        for (const item of items) {
          // Insert order item
          const [insertRes]: any = await conn.query(`
            INSERT INTO order_item (order_id, product_id, quantity, unit_price)
            VALUES (?, ?, ?, ?)
          `, [
            orderId,
            item.product_id,
            item.quantity,
            item.unit_price.toFixed(2)
          ]);
          if (insertRes.affectedRows !== 1)
            throw new Error(`Failed to insert order item for product ID ${item.product_id}`);

          // Update product stock
          const [updateRes]: any = await conn.query(`
            UPDATE product SET stock = stock - ? WHERE id = ?
          `, [item.quantity, item.product_id]);
          if (updateRes.affectedRows !== 1)
            throw new Error(`Failed to update stock for product ID ${item.product_id}`);
        }
      } else {
        throw new Error('No items provided in order');
      }

      if (couponId) {
        await conn.query(`
          INSERT INTO coupon_usage (coupon_id, order_id, user_id, email)
          VALUES (?, ?, ?, ?)
        `, [couponId, orderId, dto.user_id ?? null, dto.shipping_email ?? null]);
      }

      await conn.commit();
      const fullOrder = await this.findOne(orderId);
      return fullOrder;
    } catch (err) {
      await conn.rollback();
      console.error('Order creation failed:', err);
      throw err;
    } finally {
      conn.release();
    }
  }

  async update(id: number, dto: UpdateOrderDTO) {
    const fields: string[] = [];
    const params: any[] = [];

    if (dto.status) {
      fields.push('status = ?');
      params.push(dto.status);
    }
    if (dto.delivery_fee !== undefined) {
      fields.push('delivery_fee = ?');
      params.push(dto.delivery_fee);
    }

    if (!fields.length) return;
    params.push(id);

    await pool.query(`
      UPDATE \`order\` SET ${fields.join(', ')}
      WHERE id = ?;
    `, params);
  }

  async remove(id: number) {
    await pool.query(`
      UPDATE \`order\` SET archived = 1 WHERE id = ?;
    `, [id]);
  }
}
