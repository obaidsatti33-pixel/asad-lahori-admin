
import { useEffect, useState } from "react";

function CustomersManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const API_URL =
  "https://asad-lahori-nashta-backend.vercel.app/api/orders";

  // =========================
  // FETCH ORDERS / CUSTOMERS
  // ADMIN AUTHENTICATED
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
        throw new Error("Failed to fetch customers");
      }

      const data = await response.json();

      const ordersData = data.value || data || [];

      setOrders(ordersData);
    } catch (error) {
      console.error(
        "Failed to fetch customers:",
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
  // CREATE UNIQUE CUSTOMERS
  // =========================
  const customersMap = {};

  orders.forEach((order) => {
    const phone = order.customerPhone;

    if (!phone) return;

    if (!customersMap[phone]) {
      customersMap[phone] = {
        name: order.customerName,
        phone: order.customerPhone,
        address: order.customerAddress || "—",
        orders: 0,
        totalSpent: 0,
        lastOrder: order.createdAt,
        orderList: [],
      };
    }

    customersMap[phone].orders += 1;

    customersMap[phone].totalSpent += Number(
      order.totalAmount || 0
    );

    customersMap[phone].orderList.push(order);

    if (
      new Date(order.createdAt) >
      new Date(customersMap[phone].lastOrder)
    ) {
      customersMap[phone].lastOrder =
        order.createdAt;
    }
  });

  const customers = Object.values(customersMap);

  const totalCustomers = customers.length;

  const totalOrders = orders.length;

  const totalRevenue = customers.reduce(
    (total, customer) =>
      total + customer.totalSpent,
    0
  );

  const averageOrderValue =
    totalOrders > 0
      ? totalRevenue / totalOrders
      : 0;

  // =========================
  // FORMAT DATE
  // =========================
  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-PK",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <section className="customers-management">

      {/* =========================
          PAGE HEADING
      ========================= */}

      <div className="page-heading">

        <div>

          <span className="page-label">
            CUSTOMERS
          </span>

          <h2>
            Customer Management
          </h2>

          <p>
            View customer activity,
            orders and spending.
          </p>

        </div>

        <button
          className="customers-refresh-btn"
          onClick={fetchOrders}
        >
          ↻ Refresh
        </button>

      </div>

      {/* =========================
          SUMMARY CARDS
      ========================= */}

      <div className="customers-summary">

        <div className="customers-summary-card">

          <span>
            Total Customers
          </span>

          <strong>
            {totalCustomers}
          </strong>

        </div>

        <div className="customers-summary-card">

          <span>
            Total Orders
          </span>

          <strong>
            {totalOrders}
          </strong>

        </div>

        <div className="customers-summary-card">

          <span>
            Total Revenue
          </span>

          <strong>
            Rs.{" "}
            {totalRevenue.toLocaleString()}
          </strong>

        </div>

        <div className="customers-summary-card">

          <span>
            Average Order
          </span>

          <strong>
            Rs.{" "}
            {Math.round(
              averageOrderValue
            ).toLocaleString()}
          </strong>

        </div>

      </div>

      {/* =========================
          CUSTOMERS TABLE
      ========================= */}

      <div className="customers-table-panel">

        <div className="customers-table-header">

          <div>

            <h3>
              All Customers
            </h3>

            <p>
              Customers are automatically
              collected from orders.
            </p>

          </div>

          <span className="customers-live-badge">
            ● LIVE
          </span>

        </div>

        {loading ? (

          <div className="customers-loading">
            Loading customers...
          </div>

        ) : customers.length === 0 ? (

          <div className="customers-empty">

            <div className="customers-empty-icon">
              👥
            </div>

            <h3>
              No customers yet
            </h3>

            <p>
              Customer information will
              appear after orders are
              placed.
            </p>

          </div>

        ) : (

          <div className="customers-table">

            {/* =========================
                TABLE HEADER
            ========================= */}

            <div className="customers-table-row customers-table-head">

              <div>
                Customer
              </div>

              <div>
                Phone
              </div>

              <div>
                Orders
              </div>

              <div>
                Total Spent
              </div>

              <div>
                Last Order
              </div>

              <div>
                Action
              </div>

            </div>

            {/* =========================
                CUSTOMERS
            ========================= */}

            {customers.map(
              (customer) => (

                <div
                  className="customers-table-row"
                  key={customer.phone}
                >

                  {/* CUSTOMER */}

                  <div className="customer-profile">

                    <div className="customer-large-avatar">
                      {customer.name
                        ?.charAt(0)
                        .toUpperCase()}
                    </div>

                    <div>
                      <strong>
                        {customer.name}
                      </strong>
                    </div>

                  </div>

                  {/* PHONE */}

                  <div className="customer-phone">
                    {customer.phone}
                  </div>

                  {/* ORDERS */}

                  <div className="customer-orders-count">
                    {customer.orders}
                  </div>

                  {/* TOTAL SPENT */}

                  <div className="customer-total-spent">
                    Rs.{" "}
                    {customer.totalSpent.toLocaleString()}
                  </div>

                  {/* LAST ORDER */}

                  <div className="customer-last-order">
                    {formatDate(
                      customer.lastOrder
                    )}
                  </div>

                  {/* ACTION */}

                  <div>

                    <button
                      className="view-customer-btn"
                      onClick={() =>
                        setSelectedCustomer(
                          customer
                        )
                      }
                    >
                      View
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

      {/* =========================
          CUSTOMER DETAILS MODAL
      ========================= */}

      {selectedCustomer && (

        <div
          className="customer-modal-overlay"
          onClick={() =>
            setSelectedCustomer(null)
          }
        >

          <div
            className="customer-details-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="customer-modal-header">

              <div className="customer-modal-profile">

                <div className="customer-modal-avatar">
                  {selectedCustomer.name
                    ?.charAt(0)
                    .toUpperCase()}
                </div>

                <div>

                  <h3>
                    {selectedCustomer.name}
                  </h3>

                  <p>
                    Customer Profile
                  </p>

                </div>

              </div>

              <button
                className="customer-modal-close"
                onClick={() =>
                  setSelectedCustomer(
                    null
                  )
                }
              >
                ×
              </button>

            </div>

            {/* CUSTOMER INFO */}

            <div className="customer-info-grid">

              <div>

                <span>
                  Phone
                </span>

                <strong>
                  {selectedCustomer.phone}
                </strong>

              </div>

              <div>

                <span>
                  Address
                </span>

                <strong>
                  {selectedCustomer.address}
                </strong>

              </div>

              <div>

                <span>
                  Total Orders
                </span>

                <strong>
                  {selectedCustomer.orders}
                </strong>

              </div>

              <div>

                <span>
                  Total Spent
                </span>

                <strong className="gold-text">
                  Rs.{" "}
                  {selectedCustomer.totalSpent.toLocaleString()}
                </strong>

              </div>

            </div>

            {/* =========================
                ORDER HISTORY
            ========================= */}

            <div className="customer-order-history">

              <h4>
                Order History
              </h4>

              {selectedCustomer.orderList
                .slice()
                .sort(
                  (a, b) =>
                    new Date(
                      b.createdAt
                    ) -
                    new Date(
                      a.createdAt
                    )
                )
                .map(
                  (order) => (

                    <div
                      className="customer-history-item"
                      key={order._id}
                    >

                      <div>

                        <strong>
                          Order #
                          {order._id
                            ?.slice(-6)
                            .toUpperCase()}
                        </strong>

                        <small>
                          {formatDate(
                            order.createdAt
                          )}
                        </small>

                      </div>

                      <div className="customer-history-right">

                        <strong>
                          Rs.{" "}
                          {Number(
                            order.totalAmount
                          ).toLocaleString()}
                        </strong>

                        <span
                          className={`customer-order-status ${
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

                  )
                )}

            </div>

          </div>

        </div>

      )}

    </section>
  );
}

export default CustomersManagement;


