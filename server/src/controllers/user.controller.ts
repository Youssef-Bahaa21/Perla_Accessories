import { RequestHandler } from 'express';
import { UserService } from '../services/user.service';
import { CreateUserDTO, UpdateUserDTO } from '../services/types';

const svc = new UserService();

export const getUsers: RequestHandler = async (_req, res, next) => {
    try {
        const users = await svc.findAll();
        res.json(users);  // It's OK, because "list" usually no message
    } catch (err) {
        next(err);
    }
};

export const getUser: RequestHandler = async (req, res, next) => {
    try {
        const user = await svc.findOne(+req.params.id);
        if (!user) {
            res.status(404).json({ message: "User not found" });  // 👈 Fix: Add message
            return;
        }
        res.json(user);
    } catch (err) {
        next(err);
    }
};

export const createUser: RequestHandler = async (req, res, next) => {
    try {
        const dto: CreateUserDTO = req.body;
        const newUser = await svc.create(dto.email, dto.password);
        res.status(201).json({
            message: "User created successfully",
            user: newUser
        });
    } catch (err) {
        next(err);
    }
};

export const updateUser: RequestHandler = async (req, res, next) => {
    try {
        const dto: UpdateUserDTO = req.body;
        await svc.update(+req.params.id, dto);
        res.status(200).json({ message: "User updated successfully" }); // 👈 ADD MESSAGE
    } catch (err) {
        next(err);
    }
};

export const deleteUser: RequestHandler = async (req, res, next) => {
    try {
        await svc.remove(+req.params.id);
        res.status(200).json({ message: "User deleted successfully" }); // 👈 ADD MESSAGE
    } catch (err) {
        next(err);
    }
};