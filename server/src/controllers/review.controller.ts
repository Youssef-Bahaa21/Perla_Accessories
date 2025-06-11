import { RequestHandler } from 'express';
import {
    ReviewService,
    CreateReviewDTO,
    UpdateReviewDTO,
} from '../services/review.service';

const svc = new ReviewService();

export const getReviews: RequestHandler = async (_req, res, next) => {
    try {
        res.json(await svc.findAll()); // List: no message needed
    }
    catch (e) { next(e); }
};

export const getReview: RequestHandler = async (req, res, next) => {
    try {
        const rev = await svc.findOne(+req.params.id);
        if (!rev) {
            res.status(404).json({ message: "Review not found" });
            return;
        }
        res.json(rev);
    } catch (e) { next(e); }
};

export const createReview: RequestHandler = async (req, res, next) => {
    try {
        const dto: CreateReviewDTO = req.body;
        const newRev = await svc.create(dto);
        res.status(201).json({
            message: "Review added successfully", // ✅
            review: newRev
        });
    } catch (e) { next(e); }
};

export const updateReview: RequestHandler = async (req, res, next) => {
    try {
        const dto: UpdateReviewDTO = req.body;
        await svc.update(+req.params.id, dto);
        res.status(200).json({ message: "Review updated successfully" }); // ✅
    } catch (e) { next(e); }
};

export const deleteReview: RequestHandler = async (req, res, next) => {
    try {
        await svc.remove(+req.params.id);
        res.status(200).json({ message: "Review deleted successfully" }); // ✅
    } catch (e) { next(e); }
};
