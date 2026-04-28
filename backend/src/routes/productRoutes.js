import express from "express";
import { body, param } from "express-validator";
import {
  createProduct,
  deleteProduct,
  getProductById,
  getProducts,
  updateProduct
} from "../controllers/productController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import validate from "../middleware/validationMiddleware.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", [param("id").isMongoId().withMessage("Invalid product id")], validate, getProductById);

router.post(
  "/",
  protect,
  adminOnly,
  upload.array("images", 5),
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Product name is required"),
    body("description").trim().isLength({ min: 10 }).withMessage("Description is too short"),
    body("price").isFloat({ min: 0 }).withMessage("Price must be >= 0"),
    body("stock").isInt({ min: 0 }).withMessage("Stock must be >= 0"),
    body("category").isMongoId().withMessage("Valid category id required")
  ],
  validate,
  createProduct
);

router.put(
  "/:id",
  protect,
  adminOnly,
  upload.array("images", 5),
  [
    param("id").isMongoId().withMessage("Invalid product id"),
    body("name").optional().trim().isLength({ min: 2 }),
    body("description").optional().trim().isLength({ min: 10 }),
    body("price").optional().isFloat({ min: 0 }),
    body("stock").optional().isInt({ min: 0 }),
    body("category").optional().isMongoId()
  ],
  validate,
  updateProduct
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  [param("id").isMongoId().withMessage("Invalid product id")],
  validate,
  deleteProduct
);

export default router;

