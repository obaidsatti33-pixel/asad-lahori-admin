import { useEffect, useState } from "react";

function StockManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL =
  "https://asad-lahori-nashta-backend.vercel.app/api/products";

  // =========================
  // FETCH PRODUCTS
  // ADMIN AUTHENTICATED
  // =========================
  const fetchProducts = async () => {
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
        throw new Error(
          "Failed to fetch menu availability"
        );
      }

      const data = await response.json();

      setProducts(data.value || data || []);
    } catch (error) {
      console.error(
        "Failed to fetch menu availability:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  /* =========================
     AVAILABILITY COUNTS
  ========================= */

  const totalItems = products.length;

  const availableItems = products.filter(
    (product) =>
      product.isAvailable !== false
  ).length;

  const unavailableItems = products.filter(
    (product) =>
      product.isAvailable === false
  ).length;

  /* =========================
     TOGGLE AVAILABILITY
  ========================= */

  const toggleAvailability = async (
    product
  ) => {
    try {
      const response = await fetch(
        `${API_URL}/${product._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            ...product,
            isAvailable:
              !product.isAvailable,
          }),
        }
      );

      if (response.status === 401) {
        window.location.reload();
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Failed to update availability"
        );
      }

      await fetchProducts();
    } catch (error) {
      console.error(error);

      alert(
        "Failed to update availability."
      );
    }
  };

  return (
    <section className="stock-management">

      {/* =========================
          PAGE HEADING
      ========================= */}

      <div className="page-heading">

        <div>

          <span className="page-label">
            MENU AVAILABILITY
          </span>

          <h2>
            Availability Management
          </h2>

          <p>
            Quickly control which menu
            items are currently available.
          </p>

        </div>

        <button
          className="stock-refresh-btn"
          onClick={fetchProducts}
        >
          ↻ Refresh
        </button>

      </div>

      {loading ? (

        <div className="stock-loading">
          Loading menu availability...
        </div>

      ) : (

        <>

          {/* =========================
              SUMMARY CARDS
          ========================= */}

          <div className="stock-summary">

            <div className="stock-summary-card">

              <span>
                Total Menu Items
              </span>

              <strong>
                {totalItems}
              </strong>

              <small>
                Items in your menu
              </small>

            </div>

            <div className="stock-summary-card available-stock-card">

              <span>
                Available Items
              </span>

              <strong>
                {availableItems}
              </strong>

              <small>
                Ready to order
              </small>

            </div>

            <div className="stock-summary-card unavailable-stock-card">

              <span>
                Unavailable Items
              </span>

              <strong>
                {unavailableItems}
              </strong>

              <small>
                Temporarily disabled
              </small>

            </div>

          </div>

          {/* =========================
              AVAILABILITY PANEL
          ========================= */}

          <div className="stock-table-panel">

            <div className="stock-table-header">

              <div>

                <h3>
                  Menu Availability
                </h3>

                <p>
                  Enable or disable items
                  according to today's
                  availability.
                </p>

              </div>

              <span className="stock-live-badge">
                ● LIVE
              </span>

            </div>

            {products.length === 0 ? (

              <div className="stock-empty">

                <div className="stock-empty-icon">
                  🍽️
                </div>

                <h3>
                  No menu items found
                </h3>

                <p>
                  Add menu items from
                  Menu Management.
                </p>

              </div>

            ) : (

              <div className="stock-table">

                {/* =========================
                    TABLE HEADER
                ========================= */}

                <div className="stock-table-row stock-table-head">

                  <div>
                    Menu Item
                  </div>

                  <div>
                    Category
                  </div>

                  <div>
                    Price
                  </div>

                  <div>
                    Status
                  </div>

                  <div>
                    Action
                  </div>

                </div>

                {/* =========================
                    MENU ITEMS
                ========================= */}

                {products.map(
                  (product) => {

                    const isAvailable =
                      product.isAvailable !==
                      false;

                    return (
                      <div
                        className="stock-table-row"
                        key={product._id}
                      >

                        {/* MENU ITEM */}

                        <div className="stock-product">

                          <div className="stock-product-avatar">
                            {product.name
                              ?.charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>

                            <strong>
                              {product.name}
                            </strong>

                            <small>
                              Menu Item
                            </small>

                          </div>

                        </div>

                        {/* CATEGORY */}

                        <div className="stock-category">
                          {product.category}
                        </div>

                        {/* PRICE */}

                        <div className="stock-price">

                          Rs.{" "}

                          {Number(
                            product.price || 0
                          ).toLocaleString()}

                        </div>

                        {/* STATUS */}

                        <div>

                          <span
                            className={`inventory-status ${
                              isAvailable
                                ? "available"
                                : "unavailable"
                            }`}
                          >
                            {isAvailable
                              ? "Available"
                              : "Unavailable"}
                          </span>

                        </div>

                        {/* ACTION */}

                        <div>

                          <button
                            className={`availability-toggle ${
                              isAvailable
                                ? "on"
                                : "off"
                            }`}
                            onClick={() =>
                              toggleAvailability(
                                product
                              )
                            }
                          >

                            <span></span>

                            {isAvailable
                              ? "Disable"
                              : "Enable"}

                          </button>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            )}

          </div>

        </>

      )}

    </section>
  );
}

export default StockManagement;