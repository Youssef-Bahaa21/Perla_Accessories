import { Request, Response, NextFunction } from 'express';

export function isAdmin(req: Request, res: Response, next: NextFunction): void {
    const user = (req as any).user;
    if (user?.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Admins only' });
    }
}
