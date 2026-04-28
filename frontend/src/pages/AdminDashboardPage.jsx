import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import http from "../api/http";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    amount || 0
  );

const formatDate = (isoDate) =>
  new Date(isoDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

const statusOrder = ["pending", "processing", "shipped", "delivered", "cancelled"];

const AdminDashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await http.get("/admin/dashboard");
        setDashboard(data);
      } catch (_error) {
        setError("Failed to load admin dashboard.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const summaryCards = useMemo(() => {
    if (!dashboard) return [];
    const summary = dashboard.summary || {};
    return [
      { label: "Total Revenue", value: formatCurrency(summary.totalRevenue) },
      { label: "Revenue Today", value: formatCurrency(summary.revenueToday) },
      { label: "Orders", value: summary.totalOrders || 0 },
      { label: "Orders Today", value: summary.ordersToday || 0 },
      { label: "Products", value: summary.totalProducts || 0 },
      { label: "Users", value: summary.totalUsers || 0 }
    ];
  }, [dashboard]);

  return (
    <section className="container section">
      <div className="admin-dashboard-heading">
        <div>
          <p className="eyebrow">Admin Panel</p>
          <h1>Dashboard</h1>
        </div>
        <div className="admin-dashboard-links">
          <Link className="btn btn-ghost" to="/orders">
            Manage Orders
          </Link>
          <Link className="btn btn-primary" to="/admin/products">
            Manage Products
          </Link>
        </div>
      </div>

      {loading && <p>Loading dashboard...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && dashboard && (
        <>
          <div className="admin-stats-grid">
            {summaryCards.map((card) => (
              <article key={card.label} className="dashboard-stat-card">
                <p>{card.label}</p>
                <h3>{card.value}</h3>
              </article>
            ))}
          </div>

          <div className="admin-dashboard-grid">
            <article className="dashboard-panel">
              <header>
                <h2>Order Status</h2>
              </header>
              <div className="status-metrics-grid">
                {statusOrder.map((status) => (
                  <div key={status} className="status-metric-item">
                    <span className={`status status-${status}`}>{status}</span>
                    <strong>{dashboard.statusBreakdown?.[status] || 0}</strong>
                  </div>
                ))}
              </div>
              <p className="dashboard-muted">
                Average order value:{" "}
                <strong>{formatCurrency(dashboard.summary?.averageOrderValue || 0)}</strong>
              </p>
            </article>

            <article className="dashboard-panel">
              <header>
                <h2>Low Stock Alerts</h2>
              </header>
              {!dashboard.lowStockProducts?.length && <p>All active products are well stocked.</p>}
              {!!dashboard.lowStockProducts?.length && (
                <div className="dashboard-list">
                  {dashboard.lowStockProducts.map((product) => (
                    <div key={product._id} className="dashboard-list-row">
                      <div>
                        <h3>{product.name}</h3>
                        <p>{formatCurrency(product.price)}</p>
                      </div>
                      <span className="stock-pill">Stock: {product.stock}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="dashboard-muted">
                Showing products with stock at or below {dashboard.lowStockThreshold}.
              </p>
            </article>
          </div>

          <article className="dashboard-panel">
            <header>
              <h2>Recent Orders</h2>
            </header>
            {!dashboard.recentOrders?.length && <p>No recent orders available.</p>}
            {!!dashboard.recentOrders?.length && (
              <div className="dashboard-list">
                {dashboard.recentOrders.map((order) => (
                  <div key={order._id} className="dashboard-list-row">
                    <div>
                      <h3>#{order._id.slice(-6).toUpperCase()}</h3>
                      <p>
                        {order.user?.name || "Unknown"} ({order.user?.email || "N/A"})
                      </p>
                    </div>
                    <div className="dashboard-order-meta">
                      <strong>{formatCurrency(order.totalAmount)}</strong>
                      <span>{formatDate(order.createdAt)}</span>
                      <span className={`status status-${order.status}`}>{order.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>
        </>
      )}
    </section>
  );
};

export default AdminDashboardPage;
