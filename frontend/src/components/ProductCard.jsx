import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const image = product.images?.[0]
    ? `${import.meta.env.VITE_API_HOST || "http://localhost:5000"}${product.images[0]}`
    : "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&auto=format&fit=crop";

  return (
    <article className="product-card">
      <div className="product-image-container">
        <img src={image} alt={product.name} className="product-image" />
      </div>
      <div className="product-body">
        <p className="product-category">{product.category?.name || "General"}</p>
        <h3>{product.name}</h3>
        <p className="product-price">Rs {Number(product.price).toFixed(2)}</p>
        <Link className="btn btn-primary full" to={`/products/${product._id}`}>
          View Details
        </Link>
      </div>
    </article>
  );
};

export default ProductCard;

