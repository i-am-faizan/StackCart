import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/admin/products";
  const { loginAdmin } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await loginAdmin(form);
      navigate(redirectTo);
    } catch (errorResponse) {
      setError(errorResponse?.response?.data?.message || "Admin login failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container section auth-wrap">
      <form className="auth-form" onSubmit={onSubmit}>
        <h1>Admin Login</h1>
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
          {submitting ? "Signing in..." : "Sign In as Admin"}
        </button>

        <p>
          Normal user? <Link to="/login">Go to user login</Link>
        </p>
        <p>
          Need admin account? <Link to="/admin/register">Register admin</Link>
        </p>
      </form>
    </section>
  );
};

export default AdminLoginPage;
