const Order = require("../models/order.model");

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const dashboard = await Order.aggregate([
      {
        $match: { userId }
      },
      {
        $facet: {
          counts: [
            {
              $group: {
                _id: "$status",
                total: { $sum: 1 }
              }
            }
          ],

          totalOrders: [
            {
              $count: "count"
            }
          ],

          totalAmount: [
            {
              $group: {
                _id: null,
                total: { $sum: "$amount" }
              }
            }
          ],

          latestTransit: [
            {
              $match: { status: "In Transit" }
            },
            {
              $sort: { createdAt: -1 }
            },
            {
              $limit: 1
            }
          ]
        }
      }
    ]);
    const data = dashboard[0];
    let stats = {
      total: data.totalOrders[0]?.count || 0,
      pending: 0,
      booked: 0,
      transit: 0,
      completed: 0,
      cancelled: 0
    };
    data.counts.forEach(item => {
      if (item._id === "Pending") stats.pending = item.total;
      if (item._id === "Booked") stats.booked = item.total;
      if (item._id === "In Transit") stats.transit = item.total;
      if (item._id === "Completed") stats.completed = item.total;
      if (item._id === "Cancelled") stats.cancelled = item.total;
    });
    res.status(200).json({
      ...stats,
      totalAmount: data.totalAmount[0]?.total || 0,
      latestTransit: data.latestTransit[0] || null
    });
  } catch (error) {
    res.status(500).json({
      message: "Dashboard Failed",
      error: error.message
    });
  }
};
