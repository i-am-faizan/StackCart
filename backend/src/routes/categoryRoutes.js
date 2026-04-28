import express from "express";
import { body, param } from "express-validator";
import {
  createCategory,
  deleteCategory,
  getCategories,
  getCategoryById,
  updateCategory
} from "../controllers/categoryController.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import validate from "../middleware/validationMiddleware.js";

const router = express.Router();

router.get("/", getCategories);
router.get("/:id", [param("id").isMongoId().withMessage("Invalid category id")], validate, getCategoryById);

router.post(
  "/",
  protect,
  adminOnly,
  [body("name").trim().isLength({ min: 2 }).withMessage("Category name is required")],
  validate,
  createCategory
);

router.put(
  "/:id",
  protect,
  adminOnly,
  [
    param("id").isMongoId().withMessage("Invalid category id"),
    body("name").optional().trim().isLength({ min: 2 }),
    body("description").optional().trim().isLength({ max: 500 })
  ],
  validate,
  updateCategory
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  [param("id").isMongoId().withMessage("Invalid category id")],
  validate,
  deleteCategory
);

export default router;

