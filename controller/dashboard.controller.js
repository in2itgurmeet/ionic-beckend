
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

          totalOrders: [{ $count: "count" }],

          invoice: [
            {
              $group: {
                _id: null,
                totalAmount: { $sum: "$amount" },
                paidAmount: {
                  $sum: {
                    $cond: [{ $eq: ["$paymentStatus", "Success"] }, "$amount", 0]
                  }
                },
                dueAmount: {
                  $sum: {
                    $cond: [{ $ne: ["$paymentStatus", "Success"] }, "$amount", 0]
                  }
                }
              }
            }
          ],

          latestTransitOrder: [
            { $match: { status: "In Transit" } },
            { $sort: { createdAt: -1 } },
            { $limit: 1 }
          ],

          recentOrders: [
            { $sort: { createdAt: -1 } },
            { $limit: 3 },
            {
              $project: {
                orderId: 1,
                status: 1,
                amount: 1
              }
            }
          ],

          todaySummary: [
            {
              $match: {
                createdAt: {
                  $gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
              }
            },
            {
              $group: {
                _id: null,
                todayOrders: { $sum: 1 },
                todayRevenue: { $sum: "$amount" },
                todayDelivered: {
                  $sum: {
                    $cond: [
                      { $eq: ["$status", "Completed"] },
                      1,
                      0
                    ]
                  }
                }
              }
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
      inTransit: 0,
      completed: 0,
      cancelled: 0
    };

    data.counts.forEach(item => {
      if (item._id === "Pending") stats.pending = item.total;
      if (item._id === "Booked") stats.booked = item.total;
      if (item._id === "In Transit") stats.inTransit = item.total;
      if (item._id === "Completed") stats.completed = item.total;
      if (item._id === "Cancelled") stats.cancelled = item.total;
    });

    res.status(200).json({
      message: "Dashboard Data Fetched Successfully",
      data: {
        orders: stats,
        invoice: data.invoice[0] || {
          totalAmount: 0,
          paidAmount: 0,
          dueAmount: 0
        },
        latestTransitOrder: data.latestTransitOrder[0] || null,
        recentOrders: data.recentOrders || [],
        todaySummary: data.todaySummary[0] || {
          todayOrders: 0,
          todayDelivered: 0,
          todayRevenue: 0
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      message: "Dashboard Failed",
      error: error.message
    });
  }
};
