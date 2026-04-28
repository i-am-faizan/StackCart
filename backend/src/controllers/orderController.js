import CartItem from "../models/CartItem.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";

export const createOrderFromCart = async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;
  const cartItems = await CartItem.find({ user: req.user._id }).populate("product");

  if (!cartItems.length) {
    return res.status(400).json({ message: "Cart is empty" });
  }

  const unavailable = cartItems.find(
    (item) => !item.product.isActive || item.quantity > item.product.stock
  );

  if (unavailable) {
    return res.status(400).json({ message: "One or more cart items are unavailable" });
  }

  const totalAmount = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  const order = await Order.create({
    user: req.user._id,
    items: [],
    shippingAddress,
    paymentMethod,
    totalAmount,
    status: "pending"
  });

  const orderItems = await Promise.all(
    cartItems.map(async (item) => {
      const product = item.product;
      product.stock -= item.quantity;
      await product.save();

      return OrderItem.create({
        order: order._id,
        product: product._id,
        name: product.name,
        image: product.images?.[0] || "",
        price: product.price,
        quantity: item.quantity
      });
    })
  );

  order.items = orderItems.map((item) => item._id);
  await order.save();
  await CartItem.deleteMany({ user: req.user._id });

  const createdOrder = await Order.findById(order._id).populate("items");
  return res.status(201).json({ message: "Order placed", order: createdOrder });
};

export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).populate("items").sort({ createdAt: -1 });
  return res.json({ orders });
};

export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id).populate("items").populate("user", "name email");
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (!req.user.isAdmin && String(order.user._id) !== String(req.user._id)) {
    return res.status(403).json({ message: "Forbidden" });
  }

  return res.json({ order });
};

export const getAllOrders = async (_req, res) => {
  const orders = await Order.find().populate("items").populate("user", "name email").sort({ createdAt: -1 });
  return res.json({ orders });
};

export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.status = status;
  await order.save();
  return res.json({ message: "Order status updated", order });
};

