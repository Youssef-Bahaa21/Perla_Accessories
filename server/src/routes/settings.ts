import { Router } from 'express';
import {
    getShippingFee,
    updateShippingFee,
    getShippingCities,
    getActiveShippingCities,
    getShippingCityById,
    createShippingCity,
    updateShippingCity,
    deleteShippingCity,
    toggleShippingCityStatus
} from '../controllers/settings.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Legacy shipping fee routes
router.get('/shipping-fee', getShippingFee);
router.put('/shipping-fee', authenticate, updateShippingFee);

// ✅ Shipping Cities Routes
router.get('/shipping-cities', getShippingCities);
router.get('/shipping-cities/active', getActiveShippingCities);
router.get('/shipping-cities/:id', getShippingCityById);
router.post('/shipping-cities', authenticate, createShippingCity);
router.put('/shipping-cities/:id', authenticate, updateShippingCity);
router.delete('/shipping-cities/:id', authenticate, deleteShippingCity);
router.put('/shipping-cities/:id/toggle', authenticate, toggleShippingCityStatus);

export default router;
