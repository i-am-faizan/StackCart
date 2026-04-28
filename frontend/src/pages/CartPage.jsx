import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, subtotal, loading, updateItem, removeItem } = useCart();

  const onCheckout = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate("/checkout");
  };

  return (
    <section className="container section">
      <h1>Cart</h1>
      {loading && <p>Loading cart...</p>}

      {!loading && !items.length && (
        <p>
          Cart is empty. <Link to="/">Go shopping</Link>
        </p>
      )}

      {!!items.length && (
        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <div className="cart-item" key={item._id}>
                <div>
                  <h3>{item.product.name}</h3>
                  <p>Rs {Number(item.product.price).toFixed(2)}</p>
                </div>
                <div className="cart-actions">
                  <input
                    type="number"
                    min={1}
                    max={item.product.stock}
                    value={item.quantity}
                    onChange={(event) => updateItem(item._id, Number(event.target.value))}
                  />
                  <button type="button" className="btn btn-ghost" onClick={() => removeItem(item._id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <aside className="checkout-card">
            <h2>Summary</h2>
            <p>Subtotal: Rs {subtotal.toFixed(2)}</p>
            <button type="button" className="btn btn-primary full" onClick={onCheckout}>
              Proceed to Checkout
            </button>
          </aside>
        </div>
      )}
    </section>
  );
};

export default CartPage;

