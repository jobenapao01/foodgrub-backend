import { Router } from 'express';
import { jwtCheck, jwtParse } from '../middleware/auth';
import { createCheckoutSession, getMyOrders, stripeWebhookHandler } from '../controllers/OrderController';

const router = Router();

router.post('/checkout/create-checkout-session', jwtCheck, jwtParse, createCheckoutSession);
router.post('/checkout/webhook', stripeWebhookHandler);
router.get('/', jwtCheck, jwtParse, getMyOrders);

export default router;
