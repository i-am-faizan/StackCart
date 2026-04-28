import { useState } from "react";
import { useNavigate } from "react-router-dom";
import http from "../api/http";
import useCart from "../hooks/useCart";

const initialForm = {
  fullName: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
  country: "",
  paymentMethod: "cod"
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!items.length) {
      setError("Your cart is empty.");
      return;
    }

    setSubmitting(true);
    try {
      await http.post("/orders", {
        shippingAddress: {
          fullName: form.fullName,
          phone: form.phone,
          address: form.address,
          city: form.city,
          postalCode: form.postalCode,
          country: form.country
        },
        paymentMethod: form.paymentMethod
      });
      await clearCart();
      navigate("/orders");
    } catch (errorResponse) {
      setError(errorResponse?.response?.data?.message || "Checkout failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container section">
      <h1>Checkout</h1>
      <div className="checkout-layout">
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="fullName">Full Name</label>
          <input id="fullName" name="fullName" value={form.fullName} onChange={onChange} required />

          <label htmlFor="phone">Phone</label>
          <input id="phone" name="phone" value={form.phone} onChange={onChange} required />

          <label htmlFor="address">Address</label>
          <input id="address" name="address" value={form.address} onChange={onChange} required />

          <label htmlFor="city">City</label>
          <input id="city" name="city" value={form.city} onChange={onChange} required />

          <label htmlFor="postalCode">Postal Code</label>
          <input
            id="postalCode"
            name="postalCode"
            value={form.postalCode}
            onChange={onChange}
            required
          />

          <label htmlFor="country">Country</label>
          <input id="country" name="country" value={form.country} onChange={onChange} required />

          <label htmlFor="paymentMethod">Payment Method</label>
          <select id="paymentMethod" name="paymentMethod" value={form.paymentMethod} onChange={onChange}>
            <option value="cod">Cash on delivery</option>
            <option value="card">Card</option>
            <option value="upi">UPI</option>
          </select>

          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn btn-primary full" disabled={submitting}>
            {submitting ? "Placing Order..." : "Place Order"}
          </button>
        </form>

        <aside className="checkout-card">
          <h2>Order Summary</h2>
          <p>Items: {items.length}</p>
          <p>Total: Rs {subtotal.toFixed(2)}</p>
        </aside>
      </div>
    </section>
  );
};

export default CheckoutPage;

