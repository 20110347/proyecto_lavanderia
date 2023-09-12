import express from 'express';
import {
    getOrders,
    getOrdersById,
    getOrdersByIdClient,
    getOrdersByIdEmployee,
    createOrder,
    updateOrder,
    deleteOrder
} from "../controllers/OrderController.js";

const router = express.Router();

router.get('/orders', getOrders);
router.get('/orders/:id', getOrdersById);
router.get('/orders/:fk_client', getOrdersByIdClient);
router.get('/orders/:fk_employee', getOrdersByIdEmployee);
router.post('/orders', createOrder);
router.patch('/orders/:id', updateOrder);
router.delete('/orders/:id', deleteOrder);

export default router;