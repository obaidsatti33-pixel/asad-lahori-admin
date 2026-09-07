import { useEffect, useRef, useState } from "react";

import Login from "./Login";
import MenuManagement from "./MenuManagement";
import OrdersManagement from "./OrdersManagement";
import CustomersManagement from "./CustomersManagement";
import SalesManagement from "./SalesManagement";
import StockManagement from "./StockManagement";
import SettingsManagement from "./SettingsManagement";

import "./App.css";

const API_URL = "https://asad-lahori-nashta-backend.vercel.app";

function App() {
  // =========================
  // AUTH STATE
  // =========================

  const [admin, setAdmin] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  // =========================
  // DASHBOARD STATE
  // =========================

  const [activePage, setActivePage] = useState("dashboard");

  const [menuCount, setMenuCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [customerCount, setCustomerCount] = useState(0);
  const [salesTotal, setSalesTotal] = useState(0);

  const [orders, setOrders] = useState([]);

  // =========================
  // NOTIFICATIONS
  // =========================

  const [notifications, setNotifications] = useState([]);

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  const notificationRef = useRef(null);

  const knownOrderIds = useRef(
    JSON.parse(
      localStorage.getItem("knownOrderIds") || "[]"
    )
  );

  // =========================
  // CHECK AUTH SESSION
  // =========================

  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/auth/me`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        if (!response.ok) {
          setAdmin(null);
          return;
        }

        const data = await response.json();

        setAdmin(data.admin);
      } catch (error) {
        console.error(
          "Session check failed:",
          error
        );

        setAdmin(null);
      } finally {
        setAuthChecking(false);
      }
    };

    checkSession();
  }, []);

  // =========================
  // LOGIN SUCCESS
  // =========================

  const handleLogin = (adminData) => {
    setAdmin(adminData);
    setActivePage("dashboard");
  };

  // =========================
  // LOGOUT
  // =========================

  const handleLogout = async () => {
    try {
      await fetch(
        `${API_URL}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    } finally {
      setAdmin(null);
      setActivePage("dashboard");

      setNotifications([]);

      setNotificationOpen(false);

      knownOrderIds.current = [];

      localStorage.removeItem(
        "knownOrderIds"
      );

      localStorage.removeItem(
        "asadAdminNotifications"
      );
    }
  };

  // =========================
  // FETCH DASHBOARD DATA
  // =========================

  const fetchDashboardData = async () => {
    if (!admin) {
      return;
    }

    try {
      // -------------------------
      // PRODUCTS
      // -------------------------

      const productsResponse =
        await fetch(
          `${API_URL}/api/products`
        );

      if (productsResponse.ok) {
        const productsData =
          await productsResponse.json();

        const products =
          productsData.value ||
          productsData ||
          [];

        setMenuCount(products.length);
      }

      // -------------------------
      // ORDERS
      // -------------------------

      const ordersResponse =
        await fetch(
          `${API_URL}/api/orders`,
          {
            method: "GET",
            credentials: "include",
          }
        );

      if (ordersResponse.status === 401) {
        setAdmin(null);
        return;
      }

      if (!ordersResponse.ok) {
        throw new Error(
          "Failed to fetch orders"
        );
      }

      const ordersData =
        await ordersResponse.json();

      const ordersList =
        ordersData.value ||
        ordersData ||
        [];

      setOrders(ordersList);

      setOrderCount(
        ordersList.length
      );

      // -------------------------
      // CUSTOMERS
      // -------------------------

      const uniqueCustomers =
        new Set(
          ordersList
            .map(
              (order) =>
                order.customerPhone
            )
            .filter(Boolean)
        );

      setCustomerCount(
        uniqueCustomers.size
      );

      // -------------------------
      // SALES
      // -------------------------

      const totalSales =
        ordersList
          .filter(
            (order) =>
              order.status !==
              "Cancelled"
          )
          .reduce(
            (total, order) =>
              total +
              Number(
                order.totalAmount || 0
              ),
            0
          );

      setSalesTotal(totalSales);

      // -------------------------
      // NEW ORDER NOTIFICATIONS
      // -------------------------

      const currentOrderIds =
        ordersList.map(
          (order) => order._id
        );

      const previousOrderIds =
        knownOrderIds.current;

      const newOrders =
        ordersList.filter(
          (order) =>
            !previousOrderIds.includes(
              order._id
            )
        );

      /*
        First dashboard load par
        purane orders ko notification
        nahi banayenge.
      */

      if (
        previousOrderIds.length > 0 &&
        newOrders.length > 0
      ) {
        const newNotifications =
          newOrders.map((order) => ({
            id: `${order._id}`,
            type: "order",
            title: "New Order Received",
            message: `New order from ${
              order.customerName ||
              "Customer"
            }`,
            orderId: order._id,
            customerName:
              order.customerName ||
              "Customer",
            customerPhone:
              order.customerPhone ||
              "",
            totalAmount:
              Number(
                order.totalAmount || 0
              ),
            status:
              order.status ||
              "Pending",
            createdAt:
              order.createdAt ||
              new Date().toISOString(),
          }));

        setNotifications(
          (previous) => {
            const existingIds =
              new Set(
                previous.map(
                  (item) =>
                    item.orderId
                )
              );

            const filteredNew =
              newNotifications.filter(
                (item) =>
                  !existingIds.has(
                    item.orderId
                  )
              );

            return [
              ...filteredNew,
              ...previous,
            ];
          }
        );
      }

      knownOrderIds.current =
        currentOrderIds;

      localStorage.setItem(
        "knownOrderIds",
        JSON.stringify(
          currentOrderIds
        )
      );
    } catch (error) {
      console.error(
        "Dashboard data error:",
        error
      );
    }
  };

  // =========================
  // DASHBOARD POLLING
  // =========================

  useEffect(() => {
    if (!admin) {
      return;
    }

    fetchDashboardData();

    const interval = setInterval(
      fetchDashboardData,
      5000
    );

    return () => {
      clearInterval(interval);
    };
  }, [admin]);

  // =========================
  // CLOSE NOTIFICATION
  // WHEN CLICKING OUTSIDE
  // =========================

  useEffect(() => {
    const handleOutsideClick = (
      event
    ) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // =========================
  // OPEN ORDER FROM NOTIFICATION
  // =========================

  const openOrderFromNotification = (
    notification
  ) => {
    setNotificationOpen(false);

    /*
      Notification click par
      Orders page open hogi.
    */

    setActivePage("orders");
  };

  // =========================
  // MARK ALL AS READ
  // =========================

  const markAllNotificationsRead = () => {
    setNotifications([]);
    setNotificationOpen(false);
  };

  // =========================
  // REMOVE SINGLE NOTIFICATION
  // =========================

  const removeNotification = (
    notificationId
  ) => {
    setNotifications(
      (previous) =>
        previous.filter(
          (notification) =>
            notification.id !==
            notificationId
        )
    );
  };

  // =========================
  // AUTH CHECK SCREEN
  // =========================

  if (authChecking) {
    return (
      <div className="admin-auth-loading">
        <div className="admin-auth-loader"></div>

        <p>
          Securing your admin session...
        </p>
      </div>
    );
  }

  // =========================
  // LOGIN SCREEN
  // =========================

  if (!admin) {
    return (
      <Login
        onLogin={handleLogin}
      />
    );
  }

  // =========================
  // PAGE CONTENT
  // =========================

  const renderPage = () => {
    switch (activePage) {
      case "menu":
        return (
          <MenuManagement />
        );

      case "orders":
        return (
          <OrdersManagement />
        );

      case "customers":
        return (
          <CustomersManagement />
        );

      case "sales":
        return (
          <SalesManagement />
        );

      case "availability":
        return (
          <StockManagement />
        );

      case "settings":
        return (
          <SettingsManagement />
        );

      default:
        return (
          <Dashboard
            menuCount={menuCount}
            orderCount={orderCount}
            customerCount={customerCount}
            salesTotal={salesTotal}
            orders={orders}
            notifications={
              notifications
            }
            setActivePage={
              setActivePage
            }
          />
        );
    }
  };

  // =========================
  // ADMIN PANEL
  // =========================

  return (
    <div className="admin-app">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="admin-sidebar">

        <div className="sidebar-brand">

          <div className="sidebar-logo">
            A
          </div>

          <div>
            <h2>
              Asad Lahori
            </h2>

            <span>
              Admin Panel
            </span>
          </div>

        </div>

        <nav className="sidebar-nav">

          <button
            className={
              activePage === "dashboard"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage(
                "dashboard"
              )
            }
          >
            <span>⌂</span>
            Dashboard
          </button>

          <button
            className={
              activePage === "menu"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("menu")
            }
          >
            <span>☷</span>
            Menu
          </button>

          <button
            className={
              activePage === "orders"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("orders")
            }
          >
            <span>▣</span>
            Orders
          </button>

          <button
            className={
              activePage === "customers"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage(
                "customers"
              )
            }
          >
            <span>♙</span>
            Customers
          </button>

          <button
            className={
              activePage === "sales"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage("sales")
            }
          >
            <span>◈</span>
            Sales
          </button>

          <button
            className={
              activePage ===
              "availability"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage(
                "availability"
              )
            }
          >
            <span>◉</span>
            Availability
          </button>

          <button
            className={
              activePage === "settings"
                ? "nav-item active"
                : "nav-item"
            }
            onClick={() =>
              setActivePage(
                "settings"
              )
            }
          >
            <span>⚙</span>
            Settings
          </button>

        </nav>

        <div className="sidebar-bottom">

          <div className="sidebar-admin">

            <div className="admin-avatar">
              {admin.email
                ?.charAt(0)
                ?.toUpperCase() || "A"}
            </div>

            <div className="admin-info">

              <strong>
                Administrator
              </strong>

              <span>
                {admin.email}
              </span>

            </div>

          </div>

          <button
            className="logout-btn"
            onClick={handleLogout}
          >
            ⇥ Logout
          </button>

        </div>

      </aside>

      {/* =========================
          MAIN AREA
      ========================= */}

      <main className="admin-main">

        {/* TOPBAR */}

        <header className="admin-topbar">

          <div className="topbar-left">

            <h1>
              {activePage ===
              "dashboard"
                ? "Dashboard"
                : activePage
                    .charAt(0)
                    .toUpperCase() +
                  activePage.slice(1)}
            </h1>

            <p>
              Manage your restaurant
              operations
            </p>

          </div>

          <div className="topbar-right">

            {/* =========================
                NOTIFICATION CENTER
            ========================= */}

            <div
              className={`notification-wrapper ${
                notificationOpen
                  ? "notification-open"
                  : ""
              }`}
              ref={notificationRef}
            >

              <button
                className="notification-btn"
                onClick={() =>
                  setNotificationOpen(
                    (previous) =>
                      !previous
                  )
                }
                title="Notifications"
                aria-label="Open notifications"
              >
                🔔

                {notifications.length >
                  0 && (
                  <span className="notification-count">
                    {notifications.length >
                    99
                      ? "99+"
                      : notifications.length}
                  </span>
                )}

              </button>

              {/* =========================
                  NOTIFICATION DROPDOWN
              ========================= */}

              {notificationOpen && (

                <div className="notification-dropdown">

                  <div className="notification-dropdown-header">

                    <div>
                      <span>
                        ACTIVITY CENTER
                      </span>

                      <h3>
                        Notifications
                      </h3>
                    </div>

                    {notifications.length >
                      0 && (
                      <button
                        className="mark-all-btn"
                        onClick={
                          markAllNotificationsRead
                        }
                      >
                        Mark all read
                      </button>
                    )}

                  </div>

                  {notifications.length ===
                  0 ? (

                    <div className="notification-empty">

                      <div className="notification-empty-icon">
                        ✓
                      </div>

                      <strong>
                        You're all caught up
                      </strong>

                      <p>
                        No new notifications.
                      </p>

                    </div>

                  ) : (

                    <div className="notification-dropdown-list">

                      {notifications.map(
                        (notification) => (

                          <div
                            className="notification-dropdown-item"
                            key={
                              notification.id
                            }
                            onClick={() =>
                              openOrderFromNotification(
                                notification
                              )
                            }
                          >

                            <div className="notification-dropdown-icon">
                              🔔
                            </div>

                            <div className="notification-dropdown-content">

                              <div className="notification-dropdown-title-row">

                                <strong>
                                  {
                                    notification.title
                                  }
                                </strong>

                                <button
                                  className="notification-remove-btn"
                                  onClick={(
                                    event
                                  ) => {
                                    event.stopPropagation();

                                    removeNotification(
                                      notification.id
                                    );
                                  }}
                                  title="Dismiss"
                                >
                                  ×
                                </button>

                              </div>

                              <p>
                                {
                                  notification.message
                                }
                              </p>

                              <div className="notification-meta">

                                <span>
                                  {notification.customerName}
                                </span>

                                <strong>
                                  Rs.{" "}
                                  {Number(
                                    notification.totalAmount ||
                                      0
                                  ).toLocaleString()}
                                </strong>

                              </div>

                              <small>
                                Click to view order →
                              </small>

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  )}

                </div>

              )}

            </div>

            {/* =========================
                ADMIN PROFILE
            ========================= */}

            <div className="topbar-admin">

              <div className="admin-avatar">
                {admin.email
                  ?.charAt(0)
                  ?.toUpperCase() ||
                  "A"}
              </div>

              <div>

                <strong>
                  Admin
                </strong>

                <span>
                  Online
                </span>

              </div>

            </div>

          </div>

        </header>

        {/* PAGE */}

        <section className="admin-content">
          {renderPage()}
        </section>

      </main>

    </div>
  );
}


// =====================================================
// DASHBOARD COMPONENT
// =====================================================

function Dashboard({
  menuCount,
  orderCount,
  customerCount,
  salesTotal,
  orders,
  notifications,
  setActivePage,
}) {
  const recentOrders =
    orders.slice(0, 5);

  return (
    <div className="dashboard">

      {/* =========================
          WELCOME
      ========================= */}

      <div className="dashboard-welcome">

        <div>
          <span className="dashboard-label">
            RESTAURANT OVERVIEW
          </span>

          <h2>
            Welcome to your
            dashboard.
          </h2>

          <p>
            Monitor orders, sales,
            customers and menu
            operations from one place.
          </p>
        </div>

        <div className="dashboard-welcome-icon">
          A
        </div>

      </div>

      {/* =========================
          STATS
      ========================= */}

      <div className="stats-grid">

        <div className="stat-card">

          <div className="stat-icon">
            ☷
          </div>

          <div>
            <span>
              Menu Items
            </span>

            <strong>
              {menuCount}
            </strong>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon">
            ▣
          </div>

          <div>
            <span>
              Total Orders
            </span>

            <strong>
              {orderCount}
            </strong>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon">
            ♙
          </div>

          <div>
            <span>
              Customers
            </span>

            <strong>
              {customerCount}
            </strong>
          </div>

        </div>

        <div className="stat-card">

          <div className="stat-icon">
            ₨
          </div>

          <div>
            <span>
              Total Sales
            </span>

            <strong>
              Rs.{" "}
              {salesTotal.toLocaleString()}
            </strong>
          </div>

        </div>

      </div>

      {/* =========================
          CONTENT GRID
      ========================= */}

      <div className="dashboard-grid">

        {/* RECENT ORDERS */}

        <div className="dashboard-card">

          <div className="card-header">

            <div>
              <span>
                ORDERS
              </span>

              <h3>
                Recent Orders
              </h3>
            </div>

            <button
              onClick={() =>
                setActivePage(
                  "orders"
                )
              }
            >
              View All →
            </button>

          </div>

          {recentOrders.length ===
          0 ? (
            <div className="empty-state">
              No orders yet.
            </div>
          ) : (
            <div className="recent-orders">

              {recentOrders.map(
                (order) => (
                  <div
                    className="recent-order"
                    key={order._id}
                  >

                    <div className="order-main">

                      <strong>
                        #
                        {order._id
                          ?.slice(-6)
                          .toUpperCase()}
                      </strong>

                      <span>
                        {order.customerName}
                      </span>

                    </div>

                    <div className="order-side">

                      <strong>
                        Rs.{" "}
                        {Number(
                          order.totalAmount ||
                            0
                        ).toLocaleString()}
                      </strong>

                      <span
                        className={`order-status status-${order.status
                          ?.toLowerCase()
                          .replace(
                            /\s+/g,
                            "-"
                          )}`}
                      >
                        {order.status}
                      </span>

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </div>

        {/* NOTIFICATIONS */}

        <div className="dashboard-card">

          <div className="card-header">

            <div>
              <span>
                ACTIVITY
              </span>

              <h3>
                Notifications
              </h3>
            </div>

            <span className="activity-dot">
              ● Live
            </span>

          </div>

          {notifications.length ===
          0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                ✓
              </div>

              <p>
                You're all caught up.
              </p>
            </div>
          ) : (
            <div className="notification-list">

              {notifications
                .slice(0, 5)
                .map(
                  (notification) => (
                    <div
                      className="notification-item"
                      key={
                        notification.id
                      }
                      onClick={() =>
                        setActivePage(
                          "orders"
                        )
                      }
                      role="button"
                      tabIndex={0}
                    >

                      <div className="notification-icon">
                        !
                      </div>

                      <div>
                        <strong>
                          {
                            notification.title
                          }
                        </strong>

                        <p>
                          {
                            notification.message
                          }
                        </p>
                      </div>

                    </div>
                  )
                )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}

export default App;