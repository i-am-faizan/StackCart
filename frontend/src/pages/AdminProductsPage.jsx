import { useEffect, useMemo, useState } from "react";
import http from "../api/http";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  brand: "",
  category: ""
};

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [editingCategoryId, setEditingCategoryId] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [imageFiles, setImageFiles] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const currentButton = useMemo(
    () => (editingProduct ? "Update Product" : "Create Product"),
    [editingProduct]
  );

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        http.get("/products"),
        http.get("/categories")
      ]);
      setProducts(productsRes.data.products || []);
      setCategories(categoriesRes.data.categories || []);
    } catch (_error) {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setImageFiles([]);
    setEditingProduct(null);
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: "", description: "" });
    setEditingCategoryId("");
  };

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onFileChange = (event) => {
    setImageFiles(Array.from(event.target.files || []));
  };

  const onCategoryChange = (event) => {
    setCategoryForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const startEdit = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      brand: product.brand || "",
      category: product.category?._id || ""
    });
    setMessage("");
    setError("");
  };

  const startCategoryEdit = (category) => {
    setEditingCategoryId(category._id);
    setCategoryForm({ name: category.name, description: category.description || "" });
  };

  const buildFormData = () => {
    const data = new FormData();
    data.append("name", form.name);
    data.append("description", form.description);
    data.append("price", form.price);
    data.append("stock", form.stock);
    data.append("brand", form.brand);
    data.append("category", form.category);

    if (editingProduct?.images?.length) {
      editingProduct.images.forEach((image) => data.append("existingImages", image));
    }
    imageFiles.forEach((file) => data.append("images", file));

    return data;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const payload = buildFormData();
      if (editingProduct) {
        await http.put(`/products/${editingProduct._id}`, payload, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setMessage("Product updated successfully.");
      } else {
        await http.post("/products", payload, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setMessage("Product created successfully.");
      }
      resetForm();
      await loadData();
    } catch (errorResponse) {
      setError(errorResponse?.response?.data?.message || "Failed to save product.");
    }
  };

  const deleteProduct = async (id) => {
    const confirmed = window.confirm("Delete this product?");
    if (!confirmed) return;

    try {
      await http.delete(`/products/${id}`);
      setMessage("Product deleted.");
      setProducts((prev) => prev.filter((product) => product._id !== id));
    } catch (_error) {
      setError("Failed to delete product.");
    }
  };

  const handleCategorySubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      if (editingCategoryId) {
        await http.put(`/categories/${editingCategoryId}`, categoryForm);
        setMessage("Category updated.");
      } else {
        await http.post("/categories", categoryForm);
        setMessage("Category created.");
      }
      resetCategoryForm();
      await loadData();
    } catch (errorResponse) {
      setError(errorResponse?.response?.data?.message || "Failed to save category.");
    }
  };

  const deleteCategory = async (categoryId) => {
    const confirmed = window.confirm("Delete this category?");
    if (!confirmed) return;
    try {
      await http.delete(`/categories/${categoryId}`);
      setMessage("Category deleted.");
      setCategories((prev) => prev.filter((category) => category._id !== categoryId));
      if (form.category === categoryId) {
        setForm((prev) => ({ ...prev, category: "" }));
      }
    } catch (errorResponse) {
      setError(errorResponse?.response?.data?.message || "Failed to delete category.");
    }
  };

  return (
    <section className="container section admin-grid">
      <div className="admin-form-card">
        <h1>{editingProduct ? "Edit Product" : "Add Product"}</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Product Name</label>
          <input id="name" name="name" value={form.name} onChange={onChange} required />

          <label htmlFor="description">Description</label>
          <textarea id="description" name="description" value={form.description} onChange={onChange} required />

          <label htmlFor="price">Price</label>
          <input id="price" name="price" type="number" min={0} value={form.price} onChange={onChange} required />

          <label htmlFor="stock">Stock</label>
          <input id="stock" name="stock" type="number" min={0} value={form.stock} onChange={onChange} required />

          <label htmlFor="brand">Brand</label>
          <input id="brand" name="brand" value={form.brand} onChange={onChange} />

          <label htmlFor="category">Category</label>
          <select id="category" name="category" value={form.category} onChange={onChange} required>
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>

          <label htmlFor="images">Upload Images</label>
          <input id="images" name="images" type="file" multiple accept="image/*" onChange={onFileChange} />

          {error && <p className="error-text">{error}</p>}
          {message && <p className="success-text">{message}</p>}

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary full">
              {currentButton}
            </button>
            {editingProduct && (
              <button type="button" className="btn btn-ghost full" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <h2>Categories</h2>
        <form className="auth-form" onSubmit={handleCategorySubmit}>
          <label htmlFor="categoryName">Category Name</label>
          <input
            id="categoryName"
            name="name"
            value={categoryForm.name}
            onChange={onCategoryChange}
            required
          />

          <label htmlFor="categoryDescription">Description</label>
          <input
            id="categoryDescription"
            name="description"
            value={categoryForm.description}
            onChange={onCategoryChange}
          />

          <div className="admin-form-actions">
            <button type="submit" className="btn btn-primary full">
              {editingCategoryId ? "Update Category" : "Create Category"}
            </button>
            {editingCategoryId && (
              <button type="button" className="btn btn-ghost full" onClick={resetCategoryForm}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div>
        <h2>Products</h2>
        {loading && <p>Loading products...</p>}
        {!loading && (
          <>
            <div className="admin-products-list">
              {products.map((product) => (
                <article className="admin-product-card" key={product._id}>
                  <div>
                    <h3>{product.name}</h3>
                    <p>
                      Rs {Number(product.price).toFixed(2)} | Stock: {product.stock}
                    </p>
                    <p>{product.category?.name}</p>
                  </div>
                  <div className="admin-product-actions">
                    <button type="button" className="btn btn-ghost" onClick={() => startEdit(product)}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => deleteProduct(product._id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
              {!products.length && <p>No products yet.</p>}
            </div>

            <h2>Category List</h2>
            <div className="admin-products-list">
              {categories.map((category) => (
                <article className="admin-product-card" key={category._id}>
                  <div>
                    <h3>{category.name}</h3>
                    <p>{category.description || "No description"}</p>
                  </div>
                  <div className="admin-product-actions">
                    <button type="button" className="btn btn-ghost" onClick={() => startCategoryEdit(category)}>
                      Edit
                    </button>
                    <button type="button" className="btn btn-danger" onClick={() => deleteCategory(category._id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default AdminProductsPage;
