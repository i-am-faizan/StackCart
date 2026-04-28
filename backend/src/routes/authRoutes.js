import express from "express";
import { body } from "express-validator";
import {
  getMyProfile,
  loginAdmin,
  loginUser,
  registerAdmin,
  registerUser
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import validate from "../middleware/validationMiddleware.js";

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
      .matches(/[A-Za-z]/)
      .matches(/\d/)
      .withMessage("Password must contain letters and numbers")
  ],
  validate,
  registerUser
);

router.post(
  "/admin/register",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters")
      .matches(/[A-Za-z]/)
      .matches(/\d/)
      .withMessage("Password must contain letters and numbers"),
    body("adminKey").notEmpty().withMessage("Admin registration key is required")
  ],
  validate,
  registerAdmin
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required")
  ],
  validate,
  loginUser
);

router.post(
  "/admin/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required")
  ],
  validate,
  loginAdmin
);

router.get("/me", protect, getMyProfile);

export default router;
