import slugify from "slugify";
import Product from "../models/Product.js";

const buildImages = (files = [], existingImages = []) => {
  const newImages = files.map((file) => `/uploads/${file.filename}`);
  return [...existingImages, ...newImages];
};

export const createProduct = async (req, res) => {
  const { name, description, price, stock, category, brand, isActive } = req.body;
  const slug = slugify(name, { lower: true, strict: true });

  const existing = await Product.findOne({ slug });
  if (existing) {
    return res.status(409).json({ message: "Product name already exists" });
  }

  const product = await Product.create({
    name,
    slug,
    description,
    price,
    stock,
    category,
    brand: brand || "",
    isActive: isActive === "false" ? false : true,
    images: buildImages(req.files)
  });

  const createdProduct = await product.populate("category", "name");
  return res.status(201).json({ message: "Product created", product: createdProduct });
};

export const getProducts = async (req, res) => {
  const { category, q } = req.query;
  const filter = {};

  if (category) filter.category = category;
  if (q) filter.name = { $regex: q, $options: "i" };

  const products = await Product.find(filter).populate("category", "name").sort({ createdAt: -1 });
  return res.json({ products });
};

export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category", "name");
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  return res.json({ product });
};

export const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const { name, description, price, stock, category, brand, isActive } = req.body;
  const existingImages = req.body.existingImages
    ? Array.isArray(req.body.existingImages)
      ? req.body.existingImages
      : [req.body.existingImages]
    : product.images;

  if (name && name !== product.name) {
    const slug = slugify(name, { lower: true, strict: true });
    const slugExists = await Product.findOne({ slug, _id: { $ne: product._id } });
    if (slugExists) {
      return res.status(409).json({ message: "Product name already exists" });
    }
    product.name = name;
    product.slug = slug;
  }

  product.description = description ?? product.description;
  product.price = price ?? product.price;
  product.stock = stock ?? product.stock;
  product.category = category ?? product.category;
  product.brand = brand ?? product.brand;
  if (typeof isActive !== "undefined") {
    product.isActive = isActive === "false" ? false : Boolean(isActive);
  }
  product.images = buildImages(req.files, existingImages);

  await product.save();
  const updated = await product.populate("category", "name");

  return res.json({ message: "Product updated", product: updated });
};

export const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }
  return res.json({ message: "Product deleted" });
};

