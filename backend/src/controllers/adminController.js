import Category from "../models/Category.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
const LOW_STOCK_THRESHOLD = 5;

export const getAdminDashboard = async (_req, res) => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    totalProducts,
    totalCategories,
    totalUsers,
    totalOrders,
    orderStatusRows,
    revenueRows,
    todayRevenueRows,
    todayOrders,
    recentOrders,
    lowStockProducts
  ] = await Promise.all([
    Product.countDocuments(),
    Category.countDocuments(),
    User.countDocuments(),
    Order.countDocuments(),
    Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]),
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
    ]),
    Order.aggregate([
      {
        $match: {
          status: { $ne: "cancelled" },
          createdAt: { $gte: startOfToday }
        }
      },
      { $group: { _id: null, todayRevenue: { $sum: "$totalAmount" } } }
    ]),
    Order.countDocuments({ createdAt: { $gte: startOfToday } }),
    Order.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("user", "name email")
      .select("status totalAmount createdAt user"),
    Product.find({ isActive: true, stock: { $lte: LOW_STOCK_THRESHOLD } })
      .sort({ stock: 1, createdAt: -1 })
      .limit(8)
      .select("name stock price")
  ]);

  const statusBreakdown = ORDER_STATUSES.reduce((acc, status) => {
    acc[status] = 0;
    return acc;
  }, {});

  orderStatusRows.forEach((row) => {
    statusBreakdown[row._id] = row.count;
  });

  const totalRevenue = revenueRows[0]?.totalRevenue || 0;
  const revenueToday = todayRevenueRows[0]?.todayRevenue || 0;
  const averageOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

  return res.json({
    summary: {
      totalProducts,
      totalCategories,
      totalUsers,
      totalOrders,
      totalRevenue,
      revenueToday,
      ordersToday: todayOrders,
      averageOrderValue
    },
    statusBreakdown,
    recentOrders,
    lowStockProducts,
    lowStockThreshold: LOW_STOCK_THRESHOLD
  });
};
