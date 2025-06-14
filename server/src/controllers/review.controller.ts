import { RequestHandler } from 'express';
import {
    ReviewService,
    CreateReviewDTO,
    UpdateReviewDTO,
} from '../services/review.service';

const svc = new ReviewService();

export const getReviews: RequestHandler = async (_req, res, next) => {
    try {
        console.log('📝 GET /api/reviews - Attempting to fetch reviews...');
        const reviews = await svc.findAll();
        console.log(`✅ Successfully fetched ${reviews.length} reviews`);
        res.json(reviews);
    }
    catch (error) {
        console.error('❌ Error in getReviews controller:', error);

        // Send a proper error response
        const errorMessage = (error as Error).message || 'Unknown error occurred';

        if (errorMessage.includes('table not found') || errorMessage.includes('ER_NO_SUCH_TABLE')) {
            res.status(500).json({
                message: "Database table 'review' not found. Please run database migrations.",
                error: 'MISSING_TABLE'
            });
        } else if (errorMessage.includes('connection')) {
            res.status(500).json({
                message: "Database connection failed",
                error: 'CONNECTION_ERROR'
            });
        } else {
            res.status(500).json({
                message: "Failed to fetch reviews",
                error: errorMessage
            });
        }
    }
};

export const getReview: RequestHandler = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ message: "Invalid review ID" });
            return;
        }

        const rev = await svc.findOne(id);
        if (!rev) {
            res.status(404).json({ message: "Review not found" });
            return;
        }
        res.json(rev);
    } catch (error) {
        console.error('Error in getReview:', error);
        next(error);
    }
};

export const createReview: RequestHandler = async (req, res, next) => {
    try {
        const dto: CreateReviewDTO = req.body;

        // Validate required fields
        if (!dto.product_id || !dto.user_id || !dto.rating) {
            res.status(400).json({
                message: "Missing required fields: product_id, user_id, rating"
            });
            return;
        }

        if (dto.rating < 1 || dto.rating > 5) {
            res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
            return;
        }

        const newRev = await svc.create(dto);
        res.status(201).json({
            message: "Review added successfully",
            review: newRev
        });
    } catch (error) {
        console.error('Error in createReview:', error);
        next(error);
    }
};

export const updateReview: RequestHandler = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ message: "Invalid review ID" });
            return;
        }

        const dto: UpdateReviewDTO = req.body;

        if (dto.rating !== undefined && (dto.rating < 1 || dto.rating > 5)) {
            res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
            return;
        }

        await svc.update(id, dto);
        res.status(200).json({ message: "Review updated successfully" });
    } catch (error) {
        console.error('Error in updateReview:', error);
        next(error);
    }
};

export const deleteReview: RequestHandler = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ message: "Invalid review ID" });
            return;
        }

        await svc.remove(id);
        res.status(200).json({ message: "Review deleted successfully" });
    } catch (error) {
        console.error('Error in deleteReview:', error);
        next(error);
    }
};
