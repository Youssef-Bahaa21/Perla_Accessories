// server/src/controllers/settings.controller.ts
import { RequestHandler } from 'express';
import { SettingsService } from '../services/settings.service';

const svc = new SettingsService();

// GET /api/settings/shipping-fee
export const getShippingFee: RequestHandler = async (_req, res, next) => {
    try {
        const val = await svc.get('shipping_fee');
        const parsed = val !== null ? parseFloat(val) : 0;
        res.json({ shipping_fee: isNaN(parsed) ? 0 : parsed });
    } catch (e) {
        next(e);
    }
};

// PUT /api/settings/shipping-fee
export const updateShippingFee: RequestHandler = async (req, res, next) => {
    try {
        const fee = req.body.shipping_fee;
        if (typeof fee !== 'number' || isNaN(fee) || fee < 0) {
            res.status(400).json({ error: 'Invalid shipping fee' });
            return;
        }

        await svc.set('shipping_fee', fee.toString());
        res.json({ shipping_fee: fee });
    } catch (e) {
        next(e);
    }
};

// ✅ Shipping Cities Controllers

// GET /api/settings/shipping-cities
export const getShippingCities: RequestHandler = async (_req, res, next) => {
    try {
        const cities = await svc.getAllShippingCities();
        res.json(cities);
    } catch (e) {
        next(e);
    }
};

// GET /api/settings/shipping-cities/active
export const getActiveShippingCities: RequestHandler = async (_req, res, next) => {
    try {
        const cities = await svc.getActiveShippingCities();
        res.json(cities);
    } catch (e) {
        next(e);
    }
};

// GET /api/settings/shipping-cities/:id
export const getShippingCityById: RequestHandler = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid city ID' });
            return;
        }

        const city = await svc.getShippingCityById(id);
        if (!city) {
            res.status(404).json({ error: 'City not found' });
            return;
        }

        res.json(city);
    } catch (e) {
        next(e);
    }
};

// POST /api/settings/shipping-cities
export const createShippingCity: RequestHandler = async (req, res, next) => {
    try {
        const { city_name, shipping_fee } = req.body;

        if (!city_name || typeof city_name !== 'string' || city_name.trim().length === 0) {
            res.status(400).json({ error: 'City name is required' });
            return;
        }

        if (typeof shipping_fee !== 'number' || isNaN(shipping_fee) || shipping_fee < 0) {
            res.status(400).json({ error: 'Invalid shipping fee' });
            return;
        }

        // Check if city already exists
        const existingCity = await svc.getShippingCityByName(city_name.trim());
        if (existingCity) {
            res.status(400).json({ error: 'City already exists' });
            return;
        }

        const newCity = await svc.createShippingCity(city_name.trim(), shipping_fee);
        res.status(201).json(newCity);
    } catch (e) {
        next(e);
    }
};

// PUT /api/settings/shipping-cities/:id
export const updateShippingCity: RequestHandler = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid city ID' });
            return;
        }

        const { city_name, shipping_fee, is_active } = req.body;

        if (!city_name || typeof city_name !== 'string' || city_name.trim().length === 0) {
            res.status(400).json({ error: 'City name is required' });
            return;
        }

        if (typeof shipping_fee !== 'number' || isNaN(shipping_fee) || shipping_fee < 0) {
            res.status(400).json({ error: 'Invalid shipping fee' });
            return;
        }

        // Check if city exists
        const existingCity = await svc.getShippingCityById(id);
        if (!existingCity) {
            res.status(404).json({ error: 'City not found' });
            return;
        }

        // Check if new name conflicts with another city
        if (city_name.trim() !== existingCity.city_name) {
            const conflictingCity = await svc.getShippingCityByName(city_name.trim());
            if (conflictingCity && conflictingCity.id !== id) {
                res.status(400).json({ error: 'City name already exists' });
                return;
            }
        }

        await svc.updateShippingCity(id, city_name.trim(), shipping_fee, is_active ?? true);
        res.json({ message: 'City updated successfully' });
    } catch (e) {
        next(e);
    }
};

// DELETE /api/settings/shipping-cities/:id
export const deleteShippingCity: RequestHandler = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid city ID' });
            return;
        }

        const existingCity = await svc.getShippingCityById(id);
        if (!existingCity) {
            res.status(404).json({ error: 'City not found' });
            return;
        }

        await svc.deleteShippingCity(id);
        res.json({ message: 'City deleted successfully' });
    } catch (e) {
        next(e);
    }
};

// PUT /api/settings/shipping-cities/:id/toggle
export const toggleShippingCityStatus: RequestHandler = async (req, res, next) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            res.status(400).json({ error: 'Invalid city ID' });
            return;
        }

        const existingCity = await svc.getShippingCityById(id);
        if (!existingCity) {
            res.status(404).json({ error: 'City not found' });
            return;
        }

        await svc.toggleShippingCityStatus(id);
        res.json({ message: 'City status updated successfully' });
    } catch (e) {
        next(e);
    }
};
