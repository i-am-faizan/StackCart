import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const PASSWORD_RULE = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

const AdminRegisterPage = () => {
  const navigate = useNavigate();
  const { registerAdmin } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    adminKey: ""
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!PASSWORD_RULE.test(form.password)) {
      setError("Password must be at least 6 characters and include letters and numbers.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await registerAdmin({
        name: form.name,
        email: form.email,
        password: form.password,
        adminKey: form.adminKey
      });
      navigate("/admin/products");
    } catch (errorResponse) {
      const apiErrors = errorResponse?.response?.data?.errors;
      if (Array.isArray(apiErrors) && apiErrors.length) {
        setError(apiErrors.map((item) => item.msg).join(" | "));
      } else {
        setError(errorResponse?.response?.data?.message || "Admin registration failed.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="container section auth-wrap">
      <form className="auth-form" onSubmit={onSubmit}>
        <h1>Admin Register</h1>
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
        <small>Password must be at least 6 characters and include letters and numbers.</small>

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

        <label htmlFor="adminKey">Admin Access Key</label>
        <input
          id="adminKey"
          type="password"
          name="adminKey"
          value={form.adminKey}
          onChange={onChange}
          required
        />

        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="btn btn-primary full" disabled={submitting}>
          {submitting ? "Creating admin..." : "Create Admin Account"}
        </button>

        <p>
          Already have admin access? <Link to="/admin/login">Admin login</Link>
        </p>
      </form>
    </section>
  );
};

export default AdminRegisterPage;
