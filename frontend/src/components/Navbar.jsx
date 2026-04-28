import { Link, NavLink, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    const adminSession = Boolean(user?.isAdmin);
    logout();
    navigate(adminSession ? "/admin/login" : "/login");
  };

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Link to="/" className="brand">
          <span className="brand-mark">SC</span>
          <span>StackCart</span>
        </Link>

        <nav className="nav-links">
          {!user?.isAdmin && <NavLink to="/">Shop</NavLink>}
          {user && <NavLink to="/orders">Orders</NavLink>}
          {user?.isAdmin && <NavLink to="/admin/dashboard">Dashboard</NavLink>}
          {user?.isAdmin && <NavLink to="/admin/products">Products</NavLink>}
          {!user?.isAdmin && <NavLink to="/cart">Cart ({totalItems})</NavLink>}
        </nav>

        <div className="nav-auth">
          {!user ? (
            <>
              <Link to="/login" className="btn btn-ghost">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
              <Link to="/admin/login" className="btn btn-ghost">
                Admin Login
              </Link>
            </>
          ) : (
            <>
              <span className="user-pill">Hi, {user.name.split(" ")[0]}</span>
              <button type="button" className="btn btn-ghost" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
