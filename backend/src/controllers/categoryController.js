import slugify from "slugify";
import Category from "../models/Category.js";

export const createCategory = async (req, res) => {
  const { name, description } = req.body;
  const slug = slugify(name, { lower: true, strict: true });

  const existing = await Category.findOne({ $or: [{ name }, { slug }] });
  if (existing) {
    return res.status(409).json({ message: "Category already exists" });
  }

  const category = await Category.create({ name, slug, description });
  return res.status(201).json({ message: "Category created", category });
};

export const getCategories = async (_req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
  return res.json({ categories });
};

export const getCategoryById = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  return res.json({ category });
};

export const updateCategory = async (req, res) => {
  const { name, description } = req.body;
  const updates = { description };

  if (name) {
    updates.name = name;
    updates.slug = slugify(name, { lower: true, strict: true });
  }

  const category = await Category.findByIdAndUpdate(req.params.id, updates, {
    new: true,
    runValidators: true
  });

  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  return res.json({ message: "Category updated", category });
};

export const deleteCategory = async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }
  return res.json({ message: "Category deleted" });
};

