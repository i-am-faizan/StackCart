import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { fetchCart } = useCart();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password });
      await fetchCart();
      navigate("/");
    } catch (errorResponse) {
      setError(errorResponse?.response?.data?.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container section auth-wrap">
      <form className="auth-form" onSubmit={onSubmit}>
        <h1>Register</h1>
        <label htmlFor="name">Name</label>
        <input id="name" name="name" value={form.name} onChange={onChange} required minLength={2} />

        <label htmlFor="email">Email</label>
        <input id="email" type="email" name="email" value={form.email} onChange={onChange} required />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          value={form.password}
          onChange={onChange}
          required
          minLength={6}
        />

        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={onChange}
          required
          minLength={6}
        />

        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="btn btn-primary full" disabled={submitting}>
          {submitting ? "Creating account..." : "Create Account"}
        </button>

        <p>
          Already registered? <Link to="/login">Login</Link>
        </p>
      </form>
    </section>
  );
};

export default RegisterPage;

