import CartItem from "../models/CartItem.js";
import Product from "../models/Product.js";

export const getMyCart = async (req, res) => {
  const cartItems = await CartItem.find({ user: req.user._id }).populate(
    "product",
    "name price stock images"
  );

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return res.json({ cartItems, subtotal });
};

export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return res.status(404).json({ message: "Product not available" });
  }

  if (quantity > product.stock) {
    return res.status(400).json({ message: "Requested quantity exceeds stock" });
  }

  const existing = await CartItem.findOne({ user: req.user._id, product: productId });

  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, product.stock);
    await existing.save();
  } else {
    await CartItem.create({ user: req.user._id, product: productId, quantity });
  }

  return getMyCart(req, res);
};

export const updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const item = await CartItem.findOne({ _id: req.params.itemId, user: req.user._id }).populate("product");

  if (!item) {
    return res.status(404).json({ message: "Cart item not found" });
  }

  if (quantity > item.product.stock) {
    return res.status(400).json({ message: "Requested quantity exceeds stock" });
  }

  item.quantity = quantity;
  await item.save();
  return getMyCart(req, res);
};

export const removeCartItem = async (req, res) => {
  const item = await CartItem.findOneAndDelete({ _id: req.params.itemId, user: req.user._id });
  if (!item) {
    return res.status(404).json({ message: "Cart item not found" });
  }
  return getMyCart(req, res);
};

export const clearCart = async (req, res) => {
  await CartItem.deleteMany({ user: req.user._id });
  return res.json({ message: "Cart cleared", cartItems: [], subtotal: 0 });
};

