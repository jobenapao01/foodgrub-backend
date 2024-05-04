import { Router } from 'express';
import { jwtCheck, jwtParse } from '../middleware/auth';
import { createCheckoutSession, stripeWebhookHandler } from '../controllers/OrderController';

const router = Router();

router.post('/checkout/create-checkout-session', jwtCheck, jwtParse, createCheckoutSession);
router.post('/checkout/webhook', stripeWebhookHandler);

export default router;
