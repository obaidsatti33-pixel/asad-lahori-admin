
import { useEffect, useState } from "react";

function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const API_URL =
    "https://asad-lahori-nashta-backend.vercel.app/api/orders";

  // =========================
  // FETCH ORDERS
  // ADMIN AUTHENTICATED
  // =========================
  const fetchOrders = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }

      const response = await fetch(API_URL, {
        method: "GET",
        credentials: "include",
      });

      if (response.status === 401) {
        window.location.reload();
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }

      const data = await response.json();

      const items = data.value || data || [];

      setOrders(items);
    } catch (error) {
      console.error(
        "Orders fetch error:",
        error
      );
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  };

  // =========================
  // INITIAL FETCH + LIVE POLLING
  // =========================
  useEffect(() => {
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders(false);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // =========================
  // UPDATE STATUS
  // ADMIN AUTHENTICATED
  // =========================
  const updateStatus = async (
    orderId,
    status
  ) => {
    const previousOrders = orders;

    // ⚡ Immediately update UI
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order._id === orderId
          ? {
              ...order,
              status,
            }
          : order
      )
    );

    // ⚡ Immediately update selected order
    if (
      selectedOrder?._id === orderId
    ) {
      setSelectedOrder((prev) => ({
        ...prev,
        status,
      }));
    }

    try {
      const response = await fetch(
        `${API_URL}/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            status,
          }),
        }
      );

      if (response.status === 401) {
        alert(
          "Your admin session has expired. Please login again."
        );

        window.location.reload();
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Status update failed"
        );
      }

      // Background sync
      fetchOrders(false);
    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      // 🔙 Rollback UI if backend update fails
      setOrders(previousOrders);

      if (
        selectedOrder?._id === orderId
      ) {
        const previousOrder =
          previousOrders.find(
            (order) =>
              order._id === orderId
          );

        if (previousOrder) {
          setSelectedOrder(
            previousOrder
          );
        }
      }

      alert(
        "Order status update nahi ho saka."
      );
    }
  };

  // =========================
  // DELETE ORDER
  // ADMIN AUTHENTICATED
  // =========================
  const deleteOrder = async (
    orderId
  ) => {
    const confirmDelete =
      window.confirm(
        "Kya aap waqai is order ko delete karna chahte hain?"
      );

    if (!confirmDelete) return;

    // ⚡ Remove immediately from UI
    const previousOrders = orders;

    setOrders((prevOrders) =>
      prevOrders.filter(
        (order) =>
          order._id !== orderId
      )
    );

    setSelectedOrder(null);

    try {
      const response = await fetch(
        `${API_URL}/${orderId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.status === 401) {
        alert(
          "Your admin session has expired. Please login again."
        );

        window.location.reload();
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Delete failed"
        );
      }

      // Background sync
      fetchOrders(false);
    } catch (error) {
      console.error(
        "Delete order error:",
        error
      );

      // 🔙 Restore deleted order if delete failed
      setOrders(previousOrders);

      alert(
        "Order delete nahi ho saka."
      );
    }
  };

  // =========================
  // STATUS CLASS
  // =========================
  const getStatusClass = (
    status
  ) => {
    return status
      ?.toLowerCase()
      .replaceAll(" ", "-");
  };

  // =========================
  // SHORT ADDRESS
  // =========================
  const getShortAddress = (
    address
  ) => {
    if (!address) {
      return "Address not provided";
    }

    if (address.length <= 32) {
      return address;
    }

    return `${address.substring(
      0,
      32
    )}...`;
  };

  return (
    <section className="orders-management">

      {/* =========================
          PAGE HEADING
      ========================= */}

      <div className="page-heading">

        <div>

          <span className="page-label">
            ORDER CONTROL
          </span>

          <h2>
            Orders Management
          </h2>

          <p>
            Track, manage and update
            customer orders.
          </p>

        </div>

        <button
          className="orders-refresh-btn"
          onClick={() =>
            fetchOrders(true)
          }
        >
          ↻ Refresh Orders
        </button>

      </div>

      {/* =========================
          SUMMARY
      ========================= */}

      <div className="orders-summary">

        <div className="orders-summary-card">

          <span>
            Total Orders
          </span>

          <strong>
            {orders.length}
          </strong>

        </div>

        <div className="orders-summary-card pending-card">

          <span>
            Pending
          </span>

          <strong>
            {
              orders.filter(
                (order) =>
                  order.status ===
                  "Pending"
              ).length
            }
          </strong>

        </div>

        <div className="orders-summary-card preparing-card">

          <span>
            Preparing
          </span>

          <strong>
            {
              orders.filter(
                (order) =>
                  order.status ===
                  "Preparing"
              ).length
            }
          </strong>

        </div>

        <div className="orders-summary-card completed-card">

          <span>
            Completed
          </span>

          <strong>
            {
              orders.filter(
                (order) =>
                  order.status ===
                  "Completed"
              ).length
            }
          </strong>

        </div>

      </div>

      {/* =========================
          ORDERS PANEL
      ========================= */}

      <div className="orders-table-panel">

        <div className="orders-table-header">

          <div>

            <h3>
              All Customer Orders
            </h3>

            <p>
              Live orders from MongoDB
            </p>

          </div>

          <span className="orders-live-badge">
            ● LIVE
          </span>

        </div>

        {loading ? (

          <div className="orders-loading">
            Loading orders...
          </div>

        ) : orders.length === 0 ? (

          <div className="orders-empty">

            <div className="orders-empty-icon">
              🧾
            </div>

            <h3>
              No Orders Yet
            </h3>

            <p>
              Customer orders will
              appear here.
            </p>

          </div>

        ) : (

          <div className="orders-table">

            {/* HEADER */}

            <div className="orders-table-row orders-table-head">

              <span>
                Customer
              </span>

              <span>
                Order Type
              </span>

              <span>
                Items
              </span>

              <span>
                Total
              </span>

              <span>
                Status
              </span>

              <span>
                Action
              </span>

            </div>

            {/* ORDERS */}

            {orders.map((order) => (

              <div
                className="orders-table-row"
                key={order._id}
              >

                {/* CUSTOMER */}

                <div className="customer-info">

                  <div className="customer-avatar">
                    {order.customerName
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>

                  <div>

                    <strong>
                      {order.customerName}
                    </strong>

                    <small>
                      {order.customerPhone}
                    </small>

                    {order.orderType ===
                      "Delivery" && (
                      <small
                        className="customer-address"
                        title={
                          order.customerAddress ||
                          "Address not provided"
                        }
                      >
                        📍{" "}
                        {getShortAddress(
                          order.customerAddress
                        )}
                      </small>
                    )}

                  </div>

                </div>

                {/* ORDER TYPE */}

                <span className="order-type-badge">

                  {order.orderType ===
                  "Delivery"
                    ? "🚚 Delivery"
                    : "🏪 Pickup"}

                </span>

                {/* ITEMS */}

                <span className="order-items-count">

                  {order.products?.reduce(
                    (total, item) =>
                      total +
                      Number(
                        item.quantity || 0
                      ),
                    0
                  ) || 0}{" "}
                  items

                </span>

                {/* TOTAL */}

                <strong className="order-total-price">

                  Rs.{" "}
                  {Number(
                    order.totalAmount || 0
                  ).toLocaleString()}

                </strong>

                {/* STATUS */}

                <select
                  className={`order-status-select ${getStatusClass(
                    order.status
                  )}`}
                  value={
                    order.status
                  }
                  onChange={(e) =>
                    updateStatus(
                      order._id,
                      e.target.value
                    )
                  }
                >

                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Confirmed">
                    Confirmed
                  </option>

                  <option value="Preparing">
                    Preparing
                  </option>

                  <option value="Ready">
                    Ready
                  </option>

                  <option value="Out for Delivery">
                    Out for Delivery
                  </option>

                  <option value="Completed">
                    Completed
                  </option>

                  <option value="Cancelled">
                    Cancelled
                  </option>

                </select>

                {/* ACTION */}

                <div className="order-actions">

                  <button
                    className="view-order-btn"
                    onClick={() =>
                      setSelectedOrder(
                        order
                      )
                    }
                  >
                    View
                  </button>

                  <button
                    className="delete-order-btn"
                    onClick={() =>
                      deleteOrder(
                        order._id
                      )
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      {/* =========================
          ORDER DETAILS MODAL
      ========================= */}

      {selectedOrder && (

        <div
          className="order-modal-overlay"
          onClick={() =>
            setSelectedOrder(null)
          }
        >

          <div
            className="order-details-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            {/* HEADER */}

            <div className="order-modal-header">

              <div>

                <span className="modal-label">
                  ORDER DETAILS
                </span>

                <h3>
                  {
                    selectedOrder.customerName
                  }
                </h3>

                <p>
                  Order #
                  {selectedOrder._id?.slice(
                    -6
                  )}
                </p>

              </div>

              <button
                className="modal-close-btn"
                onClick={() =>
                  setSelectedOrder(
                    null
                  )
                }
              >
                ×
              </button>

            </div>

            {/* CUSTOMER DETAILS */}

            <div className="order-customer-details">

              <div>

                <span>
                  Phone
                </span>

                <strong>
                  {selectedOrder.customerPhone ||
                    "Not provided"}
                </strong>

              </div>

              <div>

                <span>
                  Order Type
                </span>

                <strong>
                  {selectedOrder.orderType ||
                    "Not provided"}
                </strong>

              </div>

              <div className="order-address-detail">

                <span>
                  Delivery Address
                </span>

                <strong>
                  {selectedOrder.customerAddress ||
                    "Not provided"}
                </strong>

              </div>

              <div>

                <span>
                  Status
                </span>

                <strong
                  className={`detail-status ${getStatusClass(
                    selectedOrder.status
                  )}`}
                >
                  {selectedOrder.status}
                </strong>

              </div>

            </div>

            {/* ORDER ITEMS */}

            <div className="order-items-section">

              <h4>
                Ordered Items
              </h4>

              {selectedOrder.products?.map(
                (item, index) => (

                  <div
                    className="order-detail-item"
                    key={
                      item.productId?._id ||
                      item._id ||
                      index
                    }
                  >

                    <div>

                      <strong>
                        {item.name}
                      </strong>

                      <small>
                        Rs.{" "}
                        {Number(
                          item.price
                        ).toLocaleString()}{" "}
                        ×{" "}
                        {item.quantity}
                      </small>

                    </div>

                    <strong>
                      Rs.{" "}
                      {(
                        Number(
                          item.price
                        ) *
                        Number(
                          item.quantity
                        )
                      ).toLocaleString()}
                    </strong>

                  </div>

                )
              )}

            </div>

            {/* NOTES */}

            {selectedOrder.notes && (

              <div className="order-notes">

                <span>
                  Customer Note
                </span>

                <p>
                  {selectedOrder.notes}
                </p>

              </div>

            )}

            {/* TOTAL */}

            <div className="order-detail-total">

              <span>
                Order Total
              </span>

              <strong>
                Rs.{" "}
                {Number(
                  selectedOrder.totalAmount
                ).toLocaleString()}
              </strong>

            </div>

            {/* STATUS ACTIONS */}

            <div className="order-status-actions">

              <span>
                Update Status
              </span>

              <div>

                <button
                  onClick={() =>
                    updateStatus(
                      selectedOrder._id,
                      "Confirmed"
                    )
                  }
                >
                  Confirm
                </button>

                <button
                  onClick={() =>
                    updateStatus(
                      selectedOrder._id,
                      "Preparing"
                    )
                  }
                >
                  Preparing
                </button>

                <button
                  onClick={() =>
                    updateStatus(
                      selectedOrder._id,
                      "Ready"
                    )
                  }
                >
                  Ready
                </button>

                <button
                  onClick={() =>
                    updateStatus(
                      selectedOrder._id,
                      "Completed"
                    )
                  }
                >
                  Complete
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </section>
  );
}

export default OrdersManagement;

