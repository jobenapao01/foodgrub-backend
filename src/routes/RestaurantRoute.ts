import express from 'express';
import { param } from 'express-validator';
import { getRestaurant, searchRestaurant } from '../controllers/RestaurantController';

const router = express.Router();

router.get(
	'/:restaurantId',
	param('restaurantId').isString().trim().notEmpty().withMessage('Restaurant ID must be a valid string'),
	getRestaurant
);

// /api/restaurant/search/manila
router.get(
	'/search/:city',
	param('city').isString().trim().notEmpty().withMessage('City must be a valid string'),
	searchRestaurant
);

export default router;
