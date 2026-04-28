import express from "express";
import { body, param } from "express-validator";
import {
  createOrderFromCart,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus
} from "../controllers/orderController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import validate from "../middleware/validationMiddleware.js";

const router = express.Router();

router.use(protect);

router.post(
  "/",
  [
    body("shippingAddress.fullName").trim().notEmpty().withMessage("Full name is required"),
    body("shippingAddress.phone").trim().notEmpty().withMessage("Phone is required"),
    body("shippingAddress.address").trim().notEmpty().withMessage("Address is required"),
    body("shippingAddress.city").trim().notEmpty().withMessage("City is required"),
    body("shippingAddress.postalCode").trim().notEmpty().withMessage("Postal code is required"),
    body("shippingAddress.country").trim().notEmpty().withMessage("Country is required"),
    body("paymentMethod").isIn(["cod", "card", "upi"]).withMessage("Invalid payment method")
  ],
  validate,
  createOrderFromCart
);

router.get("/my", getMyOrders);
router.get("/:id", [param("id").isMongoId().withMessage("Invalid order id")], validate, getOrderById);

router.get("/", adminOnly, getAllOrders);
router.patch(
  "/:id/status",
  adminOnly,
  [
    param("id").isMongoId().withMessage("Invalid order id"),
    body("status")
      .isIn(["pending", "processing", "shipped", "delivered", "cancelled"])
      .withMessage("Invalid status")
  ],
  validate,
  updateOrderStatus
);

export default router;

