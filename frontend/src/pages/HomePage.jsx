import { useEffect, useMemo, useState } from "react";
import http from "../api/http";
import ProductCard from "../components/ProductCard";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        http.get("/products"),
        http.get("/categories")
      ]);
      setProducts(productsRes.data.products || []);
      setCategories(categoriesRes.data.categories || []);
      setError("");
    } catch (_error) {
      setError("Unable to load products right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const byCategory = selectedCategory ? product.category?._id === selectedCategory : true;
        const byQuery = query
          ? product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.description.toLowerCase().includes(query.toLowerCase())
          : true;
        return byCategory && byQuery;
      }),
    [products, selectedCategory, query]
  );

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="eyebrow">Spring drop 2026</p>
            <h1>Intentional shopping, built on a solid MERN stack.</h1>
            <p>
              Browse curated products, add to cart, checkout securely, and manage orders with a full
              production-style architecture.
            </p>
          </div>
          <div className="hero-card">
            <p>Catalog Size</p>
            <h2>{products.length}</h2>
            <small>Products currently listed</small>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="filters">
          <input
            type="search"
            placeholder="Search products..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {loading && <p>Loading products...</p>}
        {error && <p className="error-text">{error}</p>}
        {!loading && !error && (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
            {!filteredProducts.length && <p>No products match your filters.</p>}
          </div>
        )}
      </section>
    </>
  );
};

export default HomePage;

