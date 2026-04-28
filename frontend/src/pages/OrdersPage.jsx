import { useEffect, useState } from "react";
import http from "../api/http";
import useAuth from "../hooks/useAuth";

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

const formatDate = (isoDate) =>
  new Date(isoDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

const OrdersPage = () => {
  const { user } = useAuth();
  const isAdmin = Boolean(user?.isAdmin);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError("");
      try {
        const endpoint = isAdmin ? "/orders" : "/orders/my";
        const { data } = await http.get(endpoint);
        setOrders(data.orders || []);
      } catch (_error) {
        setError(isAdmin ? "Could not load all orders." : "Could not load your orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAdmin]);

  const onStatusChange = async (orderId, nextStatus) => {
    if (!isAdmin) {
      return;
    }

    setError("");
    setUpdatingOrderId(orderId);
    try {
      const { data } = await http.patch(`/orders/${orderId}/status`, { status: nextStatus });
      const updatedStatus = data?.order?.status || nextStatus;
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? { ...order, status: updatedStatus } : order))
      );
    } catch (_error) {
      setError("Could not update order status.");
    } finally {
      setUpdatingOrderId("");
    }
  };

  return (
    <section className="container section">
      <h1>{isAdmin ? "All Orders" : "Order History"}</h1>
      {loading && <p>Loading orders...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !orders.length && <p>{isAdmin ? "No user orders found." : "No orders yet."}</p>}

      {!!orders.length && (
        <div className="orders-list">
          {orders.map((order) => (
            <article key={order._id} className="order-card">
              <header>
                <h3>Order #{order._id.slice(-6).toUpperCase()}</h3>
                <span className={`status status-${order.status}`}>{order.status}</span>
              </header>
              <p>Date: {formatDate(order.createdAt)}</p>
              {isAdmin && <p>Customer: {order.user?.name || "N/A"} ({order.user?.email || "N/A"})</p>}
              <p>Total: Rs {Number(order.totalAmount).toFixed(2)}</p>
              <p>Items: {order.items.length}</p>
              {isAdmin && (
                <div className="order-status-row">
                  <label htmlFor={`status-${order._id}`}>Update Status</label>
                  <select
                    id={`status-${order._id}`}
                    value={order.status}
                    onChange={(event) => onStatusChange(order._id, event.target.value)}
                    disabled={updatingOrderId === order._id}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default OrdersPage;
