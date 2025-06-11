// server/src/controllers/coupon-usage.controller.ts
import { RequestHandler } from 'express';
import { pool } from '../config/db';

export const getCouponUsage: RequestHandler = async (req, res, next) => {
  try {
    const couponId = +req.params.id;
    const [rows] = await pool.query(`
      SELECT 
        cu.id,
        cu.order_id,
        cu.user_id,
        cu.email,
        o.created_at,
        u.email AS user_email
      FROM coupon_usage cu
      LEFT JOIN \`order\` o ON o.id = cu.order_id
      LEFT JOIN user u ON u.id = cu.user_id
      WHERE cu.coupon_id = ?
      ORDER BY cu.created_at DESC;
    `, [couponId]);

    res.json(rows);
  } catch (err) {
    next(err);
  }
};
