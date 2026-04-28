import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import http from "../api/http";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await http.get(`/products/${id}`);
        setProduct(data.product);
      } catch (_error) {
        setError("Product not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const image = useMemo(() => {
    if (!product?.images?.[0]) {
      return "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1000&auto=format&fit=crop";
    }
    return `${import.meta.env.VITE_API_HOST || "http://localhost:5000"}${product.images[0]}`;
  }, [product]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.isAdmin) {
      setActionMessage("Admin accounts cannot add products to cart.");
      return;
    }

    try {
      await addItem(product._id, Number(quantity));
      setActionMessage("Added to cart.");
    } catch (errorResponse) {
      setActionMessage(errorResponse?.response?.data?.message || "Could not add to cart.");
    }
  };

  if (loading) {
    return (
      <section className="container section">
        <p>Loading product...</p>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="container section">
        <p className="error-text">{error || "Product unavailable."}</p>
      </section>
    );
  }

  return (
    <section className="container section product-detail">
      <img src={image} alt={product.name} />

      <article>
        <p className="product-category">{product.category?.name}</p>
        <h1>{product.name}</h1>
        <p className="product-price">Rs {Number(product.price).toFixed(2)}</p>
        <p>{product.description}</p>
        <p>
          <strong>Stock:</strong> {product.stock}
        </p>

        <div className="purchase-row">
          <input
            type="number"
            min={1}
            max={product.stock}
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            disabled={Boolean(user?.isAdmin)}
          />
          {user?.isAdmin ? (
            <button type="button" className="btn btn-ghost" disabled>
              Admin cannot shop
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={handleAddToCart}>
              Add to Cart
            </button>
          )}
        </div>
        {actionMessage && <p>{actionMessage}</p>}
      </article>
    </section>
  );
};

export default ProductDetailPage;
