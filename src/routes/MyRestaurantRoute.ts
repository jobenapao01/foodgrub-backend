import express from 'express';
import multer from 'multer';
import {
	createMyRestaurant,
	getMyRestaurant,
	updateMyRestaurant,
} from '../controllers/MyRestaurantController';
import { jwtCheck, jwtParse } from '../middleware/auth';
import { validateMyRestaurantRequest } from '../middleware/validation';

const router = express.Router();

//multer middleware for image upload
const storage = multer.memoryStorage();
const upload = multer({
	storage: storage,
	limits: {
		fileSize: 5 * 1024 * 1024, //5mb
	},
});

// /api/my/restaurant
router.post(
	'/',
	upload.single('imageFile'),
	validateMyRestaurantRequest,
	jwtCheck,
	jwtParse,
	createMyRestaurant
);
router.get('/', jwtCheck, jwtParse, getMyRestaurant);
router.put(
	'/',
	upload.single('imageFile'),
	validateMyRestaurantRequest,
	jwtCheck,
	jwtParse,
	updateMyRestaurant
);

export default router;
