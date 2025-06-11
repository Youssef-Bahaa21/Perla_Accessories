// server/src/controllers/category.controller.ts
import { RequestHandler } from 'express';
import { CategoryService, CreateCategoryDTO, UpdateCategoryDTO } from '../services/category.service';

const svc = new CategoryService();

export const getCategories: RequestHandler = async (_req, res, next) => {
    try {
        res.json(await svc.findAll());
    } catch (err) {
        next(err);
    }
};

export const getCategory: RequestHandler = async (req, res, next) => {
    try {
        const cat = await svc.findOne(+req.params.id);
        if (!cat) {
            res.sendStatus(404);
            return;
        }
        res.json(cat);
    } catch (err) {
        next(err);
    }
};

export const createCategory: RequestHandler = async (req, res, next) => {
    try {
        const dto: CreateCategoryDTO = req.body;
        const newCat = await svc.create(dto);
        res.status(201).json(newCat);
    } catch (err) {
        next(err);
    }
};

export const updateCategory: RequestHandler = async (req, res, next) => {
    try {
        const dto: UpdateCategoryDTO = req.body;
        await svc.update(+req.params.id, dto);
        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
};

export const deleteCategory: RequestHandler = async (req, res, next) => {
    try {
        await svc.remove(+req.params.id);
        res.sendStatus(204);
    } catch (err) {
        next(err);
    }
};
