import mongoose, { InferSchemaType } from 'mongoose';

const menuItemsSchema = new mongoose.Schema({
	_id: { type: mongoose.Schema.Types.ObjectId, required: true, default: () => new mongoose.Types.ObjectId() },
	name: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
});

export type MenuItemType = InferSchemaType<typeof menuItemsSchema>;

const restaurantSchema = new mongoose.Schema({
	//add relation to user schema
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
	restaurantName: {
		type: String,
		required: true,
	},
	city: {
		type: String,
		required: true,
	},
	country: {
		type: String,
		required: true,
	},
	deliveryPrice: {
		type: Number,
		required: true,
	},
	estimatedDeliveryTime: {
		type: Number,
		required: true,
	},
	cuisines: [
		{
			type: String,
			required: true,
		},
	],
	menuItems: [menuItemsSchema],
	imageUrl: {
		type: String,
		required: true,
	},
	lastUpdated: {
		type: Date,
		required: true,
	},
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

export default Restaurant;
