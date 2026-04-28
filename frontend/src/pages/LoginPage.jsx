import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/";
  const { login } = useAuth();
  const { fetchCart } = useCart();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      await login(form);
      await fetchCart();
      navigate(redirectTo);
    } catch (errorResponse) {
      setError(errorResponse?.response?.data?.message || "Login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container section auth-wrap">
      <form className="auth-form" onSubmit={onSubmit}>
        <h1>Login</h1>
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
        />

        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="btn btn-primary full" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign In"}
        </button>

        <p>
          No account? <Link to="/register">Create one</Link>
        </p>
        <p>
          Admin? <Link to="/admin/login">Use admin login</Link>
        </p>
      </form>
    </section>
  );
};

export default LoginPage;
