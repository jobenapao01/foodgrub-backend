import { Request, Response } from 'express';
import Stripe from 'stripe';
import Restaurant, { MenuItemType } from '../models/restaurant';
import Order from '../models/order';

// Stripe config
const STRIPE = new Stripe(process.env.STRIPE_API_KEY as string);
const FRONTEND_URL = process.env.FRONTEND_URL;
const STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

type CheckoutSessionRequest = {
	cartItems: {
		menuItemId: string;
		name: string;
		quantity: string;
	}[];
	deliveryDetails: {
		email: string;
		name: string;
		addressLine1: string;
		city: string;
	};
	restaurantId: string;
};

export const getMyOrders = async (req: Request, res: Response) => {
	try {
		const orders = await Order.find({ user: req.userId }).populate('restaurant').populate('user');

		res.json(orders);
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Something went wrong' });
	}
};

export const createCheckoutSession = async (req: Request, res: Response) => {
	try {
		const checkoutSessionRequest: CheckoutSessionRequest = req.body;

		const restaurant = await Restaurant.findById(checkoutSessionRequest.restaurantId);

		if (!restaurant) {
			throw new Error('Restaurant not found');
		}

		//initialized order value upon placing order
		const newOrder = new Order({
			restaurant: restaurant,
			user: req.userId,
			status: 'placed',
			deliveryDetails: checkoutSessionRequest.deliveryDetails,
			cartItems: checkoutSessionRequest.cartItems,
			createdAt: new Date(),
		});

		const lineItems = createLineItems(checkoutSessionRequest, restaurant.menuItems);

		//create stripe session
		const session = await createSession(
			lineItems,
			newOrder._id.toString(),
			restaurant.deliveryPrice,
			restaurant._id.toString()
		);

		if (!session.url) {
			return res.status(500).json({ message: 'Error creating stripe session' });
		}

		await newOrder.save();

		res.json({ url: session.url });
	} catch (error: any) {
		console.log(error);
		res.status(500).json({ message: error.raw.message });
	}
};

const createLineItems = (checkoutSessionRequest: CheckoutSessionRequest, menuItems: MenuItemType[]) => {
	//1. for each cart item, get the menuItem object from restaurant to get the price
	const lineItems = checkoutSessionRequest.cartItems.map((cartItem) => {
		//2. for each cartItem, convert it to a stripe line item
		const menuItem = menuItems.find((item) => item._id.toString() === cartItem.menuItemId.toString());

		if (!menuItem) {
			throw new Error(`Menu item not found: ${cartItem.menuItemId}`);
		}

		const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
			price_data: {
				currency: 'php',
				unit_amount: menuItem.price / 0.01,
				product_data: {
					name: menuItem.name,
				},
			},
			quantity: parseInt(cartItem.quantity),
		};
		//3.return line item array
		return line_item;
	});

	return lineItems;
};

const createSession = async (
	lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
	orderId: string,
	deliveryPrice: number,
	restaurantId: string
) => {
	const sessionData = await STRIPE.checkout.sessions.create({
		line_items: lineItems,
		shipping_options: [
			{
				shipping_rate_data: {
					display_name: 'Delivery',
					type: 'fixed_amount',
					fixed_amount: {
						amount: deliveryPrice / 0.01,
						currency: 'php',
					},
				},
			},
		],
		mode: 'payment',
		metadata: {
			orderId,
			restaurantId,
		},
		success_url: `${FRONTEND_URL}/order-status?success=true`,
		cancel_url: `${FRONTEND_URL}/detail/${restaurantId}?cancelled=true`,
	});

	return sessionData;
};

export const stripeWebhookHandler = async (req: Request, res: Response) => {
	let event;
	try {
		const sig = req.headers['stripe-signature'];

		event = STRIPE.webhooks.constructEvent(req.body, sig as string, STRIPE_ENDPOINT_SECRET as string);
	} catch (error: any) {
		console.log(error);
		return res.status(400).send(`Webhook error: ${error.message}`);
	}

	if (event?.type === 'checkout.session.completed') {
		const order = await Order.findById(event.data.object.metadata?.orderId);

		if (!order) {
			return res.status(404).json({ message: 'Order not found' });
		}

		order.totalAmount = event.data.object.amount_total;
		order.status = 'paid';

		await order.save();
	}
	res.status(200).send();
};
