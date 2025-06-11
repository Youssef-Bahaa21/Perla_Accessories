// server/src/controllers/order.controller.ts
import { RequestHandler } from 'express';
import { OrderService, CreateOrderDTO, UpdateOrderDTO } from '../services/order.service';
import { sendOrderConfirmationEmail } from '../utils/mailer';

const svc = new OrderService();

// GET /orders - Fetch orders, optionally scoped by user
export const getOrders: RequestHandler = async (req, res, next) => {
    try {
        const userId = (req as any).user?.id ?? null;
        const orders = await svc.findAll(userId ? { userId } : undefined);
        res.json(orders);
    } catch (err) {
        next(err);
    }
};

// GET /orders/:id - Fetch single order
export const getOrder: RequestHandler = async (req, res, next) => {
    try {
        const order = await svc.findOne(+req.params.id);
        if (!order) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }
        res.json(order);
    } catch (err) {
        next(err);
    }
};

// POST /orders - Create a new order
export const createOrder: RequestHandler = async (req, res, next) => {
    try {
        const dto: CreateOrderDTO = req.body;

        // 🔒 Sanitize unit_price values to ensure they are numbers
        dto.items = dto.items.map(item => ({
            ...item,
            unit_price: Number(item.unit_price)
        }));

        const order = await svc.create(dto);

        // Send order confirmation email
        try {
            if (order) {
                await sendOrderConfirmationEmail(order.shipping_email, order);
            }
        } catch (emailErr) {
            console.error('Failed to send order confirmation email:', emailErr);
            // Don't fail the order creation if email sending fails
        }

        res.status(201).json(order);
    } catch (err: any) {
        res.status(400).json({ error: err.message || 'Failed to create order' });
    }
};

// PUT /orders/:id - Update order status or delivery fee
export const updateOrder: RequestHandler = async (req, res, next) => {
    try {
        const dto: UpdateOrderDTO = req.body;
        await svc.update(+req.params.id, dto);
        res.json({ message: 'Order updated' });
    } catch (err) {
        next(err);
    }
};

// DELETE /orders/:id - Archive order
export const deleteOrder: RequestHandler = async (req, res, next) => {
    try {
        await svc.remove(+req.params.id);
        res.json({ message: 'Order archived' });
    } catch (err) {
        next(err);
    }
};