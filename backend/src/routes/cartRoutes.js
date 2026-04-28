import express from "express";
import { body, param } from "express-validator";
import {
  addToCart,
  clearCart,
  getMyCart,
  removeCartItem,
  updateCartItem
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";
import validate from "../middleware/validationMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getMyCart);
router.delete("/", clearCart);

router.post(
  "/items",
  [
    body("productId").isMongoId().withMessage("Invalid product id"),
    body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1")
  ],
  validate,
  addToCart
);

router.put(
  "/items/:itemId",
  [
    param("itemId").isMongoId().withMessage("Invalid cart item id"),
    body("quantity").isInt({ min: 1 }).withMessage("Quantity must be at least 1")
  ],
  validate,
  updateCartItem
);

router.delete(
  "/items/:itemId",
  [param("itemId").isMongoId().withMessage("Invalid cart item id")],
  validate,
  removeCartItem
);

export default router;

