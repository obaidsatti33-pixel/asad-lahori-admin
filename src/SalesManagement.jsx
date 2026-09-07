
import { useEffect, useState } from "react";

function SalesManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL =
  "https://asad-lahori-nashta-backend.vercel.app/api/orders";

  // =========================
  // FETCH SALES DATA
  // =========================
  const fetchOrders = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 401) {
        window.location.reload();
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch sales data");
      }

      const data = await response.json();

      const ordersList = data.value || data || [];

      // Newest first
      ordersList.sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      );

      setOrders(ordersList);
    } catch (error) {
      console.error(
        "Failed to fetch sales:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // =========================
  // DATE HELPERS
  // =========================

  const now = new Date();

  const isSameDay = (date) => {
    const d = new Date(date);

    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  };

  const isThisWeek = (date) => {
    const d = new Date(date);

    const current = new Date(now);

    const day = current.getDay();

    const diffToMonday =
      day === 0 ? 6 : day - 1;

    const startOfWeek = new Date(current);

    startOfWeek.setDate(
      current.getDate() - diffToMonday
    );

    startOfWeek.setHours(
      0,
      0,
      0,
      0
    );

    const endOfWeek = new Date(
      startOfWeek
    );

    endOfWeek.setDate(
      startOfWeek.getDate() + 7
    );

    return (
      d >= startOfWeek &&
      d < endOfWeek
    );
  };

  const isThisMonth = (date) => {
    const d = new Date(date);

    return (
      d.getMonth() === now.getMonth() &&
      d.getFullYear() ===
        now.getFullYear()
    );
  };

  // =========================
  // VALID SALES
  // CANCELLED ORDERS EXCLUDED
  // =========================

  const salesOrders = orders.filter(
    (order) =>
      order.status !== "Cancelled"
  );

  const cancelledOrders = orders.filter(
    (order) =>
      order.status === "Cancelled"
  );

  // =========================
  // SALES CALCULATIONS
  // =========================

  const totalSales = salesOrders.reduce(
    (total, order) =>
      total +
      Number(order.totalAmount || 0),
    0
  );

  const todayOrders = salesOrders.filter(
    (order) =>
      isSameDay(order.createdAt)
  );

  const todaySales = todayOrders.reduce(
    (total, order) =>
      total +
      Number(order.totalAmount || 0),
    0
  );

  const weekOrders = salesOrders.filter(
    (order) =>
      isThisWeek(order.createdAt)
  );

  const weekSales = weekOrders.reduce(
    (total, order) =>
      total +
      Number(order.totalAmount || 0),
    0
  );

  const monthOrders = salesOrders.filter(
    (order) =>
      isThisMonth(order.createdAt)
  );

  const monthSales = monthOrders.reduce(
    (total, order) =>
      total +
      Number(order.totalAmount || 0),
    0
  );

  const completedOrders =
    orders.filter(
      (order) =>
        order.status === "Completed"
    );

  const completedSales =
    completedOrders.reduce(
      (total, order) =>
        total +
        Number(order.totalAmount || 0),
      0
    );

  const averageOrderValue =
    salesOrders.length > 0
      ? totalSales / salesOrders.length
      : 0;

  // =========================
  // ORDER STATUS COUNTS
  // =========================

  const statusCounts = {
    Pending: orders.filter(
      (order) =>
        order.status === "Pending"
    ).length,

    Confirmed: orders.filter(
      (order) =>
        order.status === "Confirmed"
    ).length,

    Preparing: orders.filter(
      (order) =>
        order.status === "Preparing"
    ).length,

    Ready: orders.filter(
      (order) =>
        order.status === "Ready"
    ).length,

    "Out for Delivery": orders.filter(
      (order) =>
        order.status ===
        "Out for Delivery"
    ).length,

    Completed: completedOrders.length,

    Cancelled: cancelledOrders.length,
  };

  // =========================
  // TOP SELLING ITEMS
  // =========================

  const itemSales = {};

  salesOrders.forEach((order) => {
    order.products?.forEach((item) => {
      if (!itemSales[item.name]) {
        itemSales[item.name] = {
          name: item.name,
          quantity: 0,
          revenue: 0,
        };
      }

      itemSales[item.name].quantity +=
        Number(item.quantity || 0);

      itemSales[item.name].revenue +=
        Number(item.price || 0) *
        Number(item.quantity || 0);
    });
  });

  const topItems = Object.values(
    itemSales
  )
    .sort(
      (a, b) =>
        b.quantity - a.quantity
    )
    .slice(0, 5);

  // =========================
  // DATE FORMAT
  // =========================

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(
      date
    ).toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <section className="sales-management">

      {/* =========================
          PAGE HEADING
      ========================= */}

      <div className="page-heading">

        <div>
          <span className="page-label">
            SALES & ANALYTICS
          </span>

          <h2>
            Sales Overview
          </h2>

          <p>
            Monitor restaurant revenue,
            sales performance and
            popular menu items.
          </p>
        </div>

        <button
          className="sales-refresh-btn"
          onClick={fetchOrders}
        >
          ↻ Refresh
        </button>

      </div>

      {loading ? (

        <div className="sales-loading">
          Loading sales data...
        </div>

      ) : (

        <>

          {/* =========================
              SALES SUMMARY
          ========================= */}

          <div className="sales-summary">

            {/* TODAY */}

            <div className="sales-summary-card primary-sales-card">

              <span>
                Today's Sales
              </span>

              <strong>
                Rs.{" "}
                {todaySales.toLocaleString()}
              </strong>

              <small>
                {todayOrders.length}{" "}
                {todayOrders.length === 1
                  ? "order"
                  : "orders"}{" "}
                today
              </small>

            </div>

            {/* WEEK */}

            <div className="sales-summary-card">

              <span>
                This Week
              </span>

              <strong>
                Rs.{" "}
                {weekSales.toLocaleString()}
              </strong>

              <small>
                {weekOrders.length} orders
                this week
              </small>

            </div>

            {/* MONTH */}

            <div className="sales-summary-card">

              <span>
                This Month
              </span>

              <strong>
                Rs.{" "}
                {monthSales.toLocaleString()}
              </strong>

              <small>
                {monthOrders.length} orders
                this month
              </small>

            </div>

            {/* TOTAL */}

            <div className="sales-summary-card">

              <span>
                Total Sales
              </span>

              <strong>
                Rs.{" "}
                {totalSales.toLocaleString()}
              </strong>

              <small>
                {salesOrders.length} valid
                orders
              </small>

            </div>

          </div>

          {/* =========================
              SECONDARY METRICS
          ========================= */}

          <div className="sales-summary sales-secondary-summary">

            <div className="sales-summary-card">

              <span>
                Completed Sales
              </span>

              <strong>
                Rs.{" "}
                {completedSales.toLocaleString()}
              </strong>

              <small>
                {completedOrders.length} completed
                orders
              </small>

            </div>

            <div className="sales-summary-card">

              <span>
                Average Order Value
              </span>

              <strong>
                Rs.{" "}
                {Math.round(
                  averageOrderValue
                ).toLocaleString()}
              </strong>

              <small>
                Average per valid order
              </small>

            </div>

            <div className="sales-summary-card">

              <span>
                Total Orders
              </span>

              <strong>
                {orders.length.toLocaleString()}
              </strong>

              <small>
                All order records
              </small>

            </div>

            <div className="sales-summary-card">

              <span>
                Cancelled Orders
              </span>

              <strong>
                {cancelledOrders.length}
              </strong>

              <small>
                Excluded from sales
              </small>

            </div>

          </div>

          {/* =========================
              ANALYTICS GRID
          ========================= */}

          <div className="sales-analytics-grid">

            {/* =====================
                ORDER STATUS
            ===================== */}

            <div className="sales-panel">

              <div className="sales-panel-header">

                <div>

                  <h3>
                    Order Status
                  </h3>

                  <p>
                    Current order distribution
                  </p>

                </div>

              </div>

              <div className="sales-status-list">

                <div className="sales-status-item">
                  <span className="status-dot pending-dot"></span>
                  <span>Pending</span>
                  <strong>
                    {statusCounts.Pending}
                  </strong>
                </div>

                <div className="sales-status-item">
                  <span className="status-dot confirmed-dot"></span>
                  <span>Confirmed</span>
                  <strong>
                    {statusCounts.Confirmed}
                  </strong>
                </div>

                <div className="sales-status-item">
                  <span className="status-dot preparing-dot"></span>
                  <span>Preparing</span>
                  <strong>
                    {statusCounts.Preparing}
                  </strong>
                </div>

                <div className="sales-status-item">
                  <span className="status-dot ready-dot"></span>
                  <span>Ready</span>
                  <strong>
                    {statusCounts.Ready}
                  </strong>
                </div>

                <div className="sales-status-item">
                  <span className="status-dot delivery-dot"></span>
                  <span>
                    Out for Delivery
                  </span>
                  <strong>
                    {
                      statusCounts[
                        "Out for Delivery"
                      ]
                    }
                  </strong>
                </div>

                <div className="sales-status-item">
                  <span className="status-dot completed-dot"></span>
                  <span>Completed</span>
                  <strong>
                    {statusCounts.Completed}
                  </strong>
                </div>

                <div className="sales-status-item">
                  <span className="status-dot cancelled-dot"></span>
                  <span>Cancelled</span>
                  <strong>
                    {statusCounts.Cancelled}
                  </strong>
                </div>

              </div>

            </div>

            {/* =====================
                TOP ITEMS
            ===================== */}

            <div className="sales-panel">

              <div className="sales-panel-header">

                <div>

                  <h3>
                    Popular Items
                  </h3>

                  <p>
                    Best selling menu items
                  </p>

                </div>

              </div>

              {topItems.length === 0 ? (

                <div className="sales-mini-empty">
                  No item sales available
                  yet.
                </div>

              ) : (

                <div className="top-items-list">

                  {topItems.map(
                    (item, index) => (

                      <div
                        className="top-item"
                        key={item.name}
                      >

                        <div className="top-item-rank">
                          {index + 1}
                        </div>

                        <div className="top-item-info">

                          <strong>
                            {item.name}
                          </strong>

                          <small>
                            {item.quantity} sold
                          </small>

                        </div>

                        <strong className="top-item-revenue">
                          Rs.{" "}
                          {item.revenue.toLocaleString()}
                        </strong>

                      </div>

                    )
                  )}

                </div>

              )}

            </div>

          </div>




          
{/* =========================
    7 DAY SALES PERFORMANCE
========================= */}

<div className="sales-panel sales-chart-panel">

  <div className="sales-panel-header">

    <div>
      <h3>
        Sales Performance
      </h3>

      <p>
        Daily revenue for the last 7 days
      </p>
    </div>

    <span className="sales-chart-period">
      LAST 7 DAYS
    </span>

  </div>

  {(() => {
    const chartDays = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();

      date.setDate(
        date.getDate() - i
      );

      date.setHours(
        0,
        0,
        0,
        0
      );

      const nextDate = new Date(date);

      nextDate.setDate(
        nextDate.getDate() + 1
      );

      const dayOrders = salesOrders.filter(
        (order) => {
          const orderDate = new Date(
            order.createdAt
          );

          return (
            orderDate >= date &&
            orderDate < nextDate
          );
        }
      );

      const revenue = dayOrders.reduce(
        (total, order) =>
          total +
          Number(
            order.totalAmount || 0
          ),
        0
      );

      chartDays.push({
        date,
        revenue,
        orders: dayOrders.length,
        label: date.toLocaleDateString(
          "en-PK",
          {
            weekday: "short",
          }
        ),
      });
    }

    const maxRevenue = Math.max(
      ...chartDays.map(
        (day) => day.revenue
      ),
      1
    );

    return (
      <div className="sales-chart">

        <div className="sales-chart-summary">

          <div>
            <span>
              7-Day Revenue
            </span>

            <strong>
              Rs.{" "}
              {chartDays
                .reduce(
                  (total, day) =>
                    total +
                    day.revenue,
                  0
                )
                .toLocaleString()}
            </strong>
          </div>

          <div>
            <span>
              Best Day
            </span>

            <strong>
              {[
                ...chartDays,
              ].sort(
                (a, b) =>
                  b.revenue -
                  a.revenue
              )[0]?.label || "—"}
            </strong>
          </div>

        </div>

        <div className="sales-chart-area">

          <div className="sales-chart-y-axis">

            <span>
              Rs.{" "}
              {Math.round(
                maxRevenue
              ).toLocaleString()}
            </span>

            <span>
              Rs.{" "}
              {Math.round(
                maxRevenue * 0.75
              ).toLocaleString()}
            </span>

            <span>
              Rs.{" "}
              {Math.round(
                maxRevenue * 0.5
              ).toLocaleString()}
            </span>

            <span>
              Rs.{" "}
              {Math.round(
                maxRevenue * 0.25
              ).toLocaleString()}
            </span>

            <span>
              Rs. 0
            </span>

          </div>

          <div className="sales-chart-bars">

            {chartDays.map(
              (day) => {

                const height =
                  day.revenue === 0
                    ? 4
                    : Math.max(
                        (day.revenue /
                          maxRevenue) *
                          100,
                        8
                      );

                return (
                  <div
                    className="sales-chart-column"
                    key={
                      day.date
                        .toISOString()
                    }
                  >

                    <div className="sales-chart-value">
                      {day.revenue > 0
                        ? `Rs. ${day.revenue.toLocaleString()}`
                        : "—"}
                    </div>

                    <div className="sales-chart-bar-wrapper">

                      <div
                        className="sales-chart-bar"
                        style={{
                          height: `${height}%`,
                        }}
                        title={`${
                          day.label
                        }: Rs. ${day.revenue.toLocaleString()}`}
                      ></div>

                    </div>

                    <strong>
                      {day.label}
                    </strong>

                    <small>
                      {day.orders}{" "}
                      {day.orders === 1
                        ? "order"
                        : "orders"}
                    </small>

                  </div>
                );
              }
            )}

          </div>

        </div>

      </div>
    );
  })()}

</div>



          {/* =========================
              RECENT SALES
          ========================= */}

          <div className="sales-panel recent-sales-panel">

            <div className="sales-panel-header">

              <div>

                <h3>
                  Recent Sales
                </h3>

                <p>
                  Latest restaurant
                  transactions
                </p>

              </div>

              <span className="sales-live-badge">
                ● LIVE
              </span>

            </div>

            {orders.length === 0 ? (

              <div className="sales-mini-empty">
                No sales recorded yet.
              </div>

            ) : (

              <div className="recent-sales-list">

                {orders
                  .slice(0, 7)
                  .map((order) => (

                    <div
                      className="recent-sale-item"
                      key={order._id}
                    >

                      <div className="recent-sale-customer">

                        <div className="recent-sale-avatar">
                          {order.customerName
                            ?.charAt(0)
                            .toUpperCase() || "C"}
                        </div>

                        <div>

                          <strong>
                            {order.customerName ||
                              "Customer"}
                          </strong>

                          <small>
                            Order #
                            {order._id
                              ?.slice(-6)
                              .toUpperCase()}
                            {" • "}
                            {formatDate(
                              order.createdAt
                            )}
                          </small>

                        </div>

                      </div>

                      <div className="recent-sale-meta">

                        <strong>
                          Rs.{" "}
                          {Number(
                            order.totalAmount || 0
                          ).toLocaleString()}
                        </strong>

                        <span
                          className={`sales-status-badge ${
                            order.status
                              ?.toLowerCase()
                              .replaceAll(
                                " ",
                                "-"
                              )
                          }`}
                        >
                          {order.status}
                        </span>

                      </div>

                    </div>

                  ))}

              </div>

            )}

          </div>

        </>

      )}

    </section>
  );
}

export default SalesManagement;

