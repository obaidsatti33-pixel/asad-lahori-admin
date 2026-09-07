import { useEffect, useState } from "react";

function MenuManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "چنے",
    description: "",
    image: "",
  });

  const API_URL =
  "https://asad-lahori-nashta-backend.vercel.app/api/products";

  // =========================
  // FETCH PRODUCTS
  // =========================
  const fetchProducts = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();

      setProducts(data.value || data || []);
    } catch (error) {
      console.error(
        "Failed to fetch products:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // =========================
  // FORM INPUT
  // =========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // OPEN ADD MODAL
  // =========================
  const openAddModal = () => {
    setEditingProduct(null);

    setFormData({
      name: "",
      price: "",
      category: "چنے",
      description: "",
      image: "",
    });

    setShowModal(true);
  };

  // =========================
  // OPEN EDIT MODAL
  // =========================
  const openEditModal = (product) => {
    setEditingProduct(product);

    setFormData({
      name: product.name || "",
      price: product.price || "",
      category: product.category || "چنے",
      description: product.description || "",
      image: product.image || "",
    });

    setShowModal(true);
  };

  // =========================
  // CLOSE MODAL
  // =========================
  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  // =========================
  // ADD / UPDATE PRODUCT
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const productData = {
        ...(editingProduct || {}),
        name: formData.name,
        price: Number(formData.price),
        category: formData.category,
        description: formData.description,
        image: formData.image,
        isAvailable:
          editingProduct?.isAvailable !== false,
      };

      const url = editingProduct
        ? `${API_URL}/${editingProduct._id}`
        : API_URL;

      const method = editingProduct
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(productData),
      });

      if (response.status === 401) {
        alert(
          "Your admin session has expired. Please login again."
        );

        window.location.reload();
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Failed to save product"
        );
      }

      await fetchProducts();

      closeModal();
    } catch (error) {
      console.error(
        "Save product error:",
        error
      );

      alert(
        "Failed to save menu item."
      );
    }
  };

  // =========================
  // DELETE PRODUCT
  // =========================
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this menu item?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}/${id}`,
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
          "Failed to delete product"
        );
      }

      await fetchProducts();
    } catch (error) {
      console.error(
        "Delete product error:",
        error
      );

      alert(
        "Failed to delete menu item."
      );
    }
  };

  // =========================
  // TOGGLE AVAILABILITY
  // =========================
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
        alert(
          "Your admin session has expired. Please login again."
        );

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
      console.error(
        "Availability update error:",
        error
      );

      alert(
        "Failed to update availability."
      );
    }
  };

  // =========================
  // SUMMARY
  // =========================
  const totalItems =
    products.length;

  const availableItems =
    products.filter(
      (product) =>
        product.isAvailable !== false
    ).length;

  const unavailableItems =
    products.filter(
      (product) =>
        product.isAvailable === false
    ).length;

  return (
    <section className="menu-management">

      {/* =========================
          PAGE HEADING
      ========================= */}
      <div className="page-heading">
        <div>
          <span className="page-label">
            MENU CONTROL
          </span>

          <h2>
            Menu Management
          </h2>

          <p>
            Manage your restaurant menu,
            prices and item availability.
          </p>
        </div>

        <div className="menu-heading-actions">

          <button
            className="menu-refresh-btn"
            onClick={fetchProducts}
          >
            ↻ Refresh
          </button>

          <button
            className="add-menu-btn"
            onClick={openAddModal}
          >
            + Add Menu Item
          </button>

        </div>
      </div>

      {/* =========================
          SUMMARY CARDS
      ========================= */}
      <div className="menu-summary">

        <div className="menu-summary-card">
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

        <div className="menu-summary-card available-menu-card">

          <span>
            Available Items
          </span>

          <strong>
            {availableItems}
          </strong>

          <small>
            Currently available
          </small>

        </div>

        <div className="menu-summary-card unavailable-menu-card">

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
          MENU TABLE
      ========================= */}
      <div className="menu-table-panel">

        <div className="menu-table-header">

          <div>
            <h3>
              All Menu Items
            </h3>

            <p>
              Manage prices and
              availability from one place.
            </p>
          </div>

          <span className="menu-live-badge">
            ● LIVE
          </span>

        </div>

        {loading ? (
          <div className="menu-loading">
            Loading menu items...
          </div>
        ) : products.length === 0 ? (
          <div className="menu-empty">

            <div className="menu-empty-icon">
              🍽️
            </div>

            <h3>
              No menu items found
            </h3>

            <p>
              Add your first menu item
              to get started.
            </p>

            <button
              className="add-menu-btn"
              onClick={openAddModal}
            >
              + Add Menu Item
            </button>

          </div>
        ) : (
          <div className="menu-table">

            {/* TABLE HEADER */}
            <div className="menu-table-row menu-table-head">

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

            {/* TABLE ROWS */}
            {products.map(
              (product) => {

                const isAvailable =
                  product.isAvailable !==
                  false;

                return (
                  <div
                    className="menu-table-row"
                    key={product._id}
                  >

                    {/* PRODUCT */}
                    <div className="menu-product">

                      <div className="menu-product-avatar">
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
                    <div className="menu-category">
                      {product.category}
                    </div>

                    {/* PRICE */}
                    <div className="menu-price">
                      Rs.{" "}
                      {Number(
                        product.price || 0
                      ).toLocaleString()}
                    </div>

                    {/* STATUS */}
                    <div>

                      <button
                        className={`inventory-status ${
                          isAvailable
                            ? "available"
                            : "unavailable"
                        }`}
                        onClick={() =>
                          toggleAvailability(
                            product
                          )
                        }
                      >
                        {isAvailable
                          ? "Available"
                          : "Unavailable"}
                      </button>

                    </div>

                    {/* ACTIONS */}
                    <div className="menu-actions">

                      <button
                        className="menu-edit-btn"
                        onClick={() =>
                          openEditModal(
                            product
                          )
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="menu-delete-btn"
                        onClick={() =>
                          handleDelete(
                            product._id
                          )
                        }
                      >
                        Delete
                      </button>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </div>

      {/* =========================
          ADD / EDIT MODAL
      ========================= */}
      {showModal && (
        <div
          className="menu-modal-overlay"
          onClick={closeModal}
        >

          <div
            className="menu-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="menu-modal-header">

              <div>

                <span className="page-label">
                  {editingProduct
                    ? "UPDATE ITEM"
                    : "NEW MENU ITEM"}
                </span>

                <h3>
                  {editingProduct
                    ? "Edit Menu Item"
                    : "Add Menu Item"}
                </h3>

              </div>

              <button
                className="menu-modal-close"
                onClick={closeModal}
              >
                ×
              </button>

            </div>

            <form
              className="menu-form"
              onSubmit={handleSubmit}
            >

              {/* NAME */}
              <div className="form-group">

                <label>
                  Item Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Sada Chana"
                  required
                />

              </div>

              {/* PRICE */}
              <div className="form-group">

                <label>
                  Price
                </label>

                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="e.g. 200"
                  min="0"
                  required
                />

              </div>

              {/* CATEGORY */}
              <div className="form-group">

                <label>
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                >

                  <option value="چنے">
                    چنے
                  </option>

                  <option value="نہاری">
                    نہاری
                  </option>

                  <option value="پائے">
                    پائے
                  </option>

                  <option value="چائے">
                    چائے
                  </option>

                  <option value="روٹی / نان">
                    روٹی / نان
                  </option>

                </select>

              </div>

              {/* DESCRIPTION */}
              <div className="form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    formData.description
                  }
                  onChange={handleChange}
                  placeholder="Short description of the item..."
                  rows="4"
                />

              </div>

              {/* IMAGE */}
              <div className="form-group">

                <label>
                  Image URL
                </label>

                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://..."
                />

              </div>

              {/* FORM ACTIONS */}
              <div className="menu-form-actions">

                <button
                  type="button"
                  className="menu-cancel-btn"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="menu-save-btn"
                >
                  {editingProduct
                    ? "Update Item"
                    : "Add Item"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </section>
  );
}

export default MenuManagement;