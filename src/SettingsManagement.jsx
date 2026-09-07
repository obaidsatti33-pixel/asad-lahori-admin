
import { useEffect, useState } from "react";

const API_URL =
  "https://asad-lahori-nashta-backend.vercel.app";

const defaultSettings = {
  restaurantName: "Asad Lahori Nashta Centre",
  phone: "",
  address: "Kalar Chowk, Kahuta",
  openingTime: "06:00",
  closingTime: "12:00",
  currency: "PKR",
  deliveryEnabled: true,
  pickupEnabled: true,
  whatsappOrders: true,
  orderNotifications: true,
};

function SettingsManagement() {
  // ==================================================
  // RESTAURANT SETTINGS
  // ==================================================

  const [settings, setSettings] = useState(defaultSettings);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [saved, setSaved] = useState(false);
  const [settingsError, setSettingsError] = useState("");

  // ==================================================
  // PASSWORD SETTINGS
  // ==================================================

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // ==================================================
  // LOAD SETTINGS
  // ==================================================

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setSettingsError("");

      const response = await fetch(
        `${API_URL}/api/settings`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load settings"
        );
      }

      setSettings({
        ...defaultSettings,
        ...data,
      });
    } catch (error) {
      console.error(
        "Settings loading error:",
        error
      );

      setSettingsError(
        error.message ||
          "Failed to load restaurant settings."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // SETTINGS INPUT
  // ==================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));

    setSaved(false);
    setSettingsError("");
  };

  // ==================================================
  // SETTINGS TOGGLE
  // ==================================================

  const handleToggle = (name) => {
    setSettings((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));

    setSaved(false);
    setSettingsError("");
  };

  // ==================================================
  // SAVE SETTINGS
  // ==================================================

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      setSaved(false);
      setSettingsError("");

      const response = await fetch(
        `${API_URL}/api/settings`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify(settings),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to save settings"
        );
      }

      setSettings({
        ...defaultSettings,
        ...data.settings,
      });

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (error) {
      console.error(
        "Settings save error:",
        error
      );

      setSettingsError(
        error.message ||
          "Failed to save settings. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // PASSWORD INPUT
  // ==================================================

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setPasswordMessage("");
    setPasswordError("");
  };

  // ==================================================
  // SHOW / HIDE PASSWORD
  // ==================================================

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // ==================================================
  // CHANGE ADMIN PASSWORD
  // ==================================================

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = passwordData;

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setPasswordError(
        "Please fill in all password fields."
      );

      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "New password must be at least 8 characters."
      );

      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(
        "New passwords do not match."
      );

      return;
    }

    try {
      setPasswordLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/change-password`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to change password."
        );
      }

      setPasswordMessage(
        data.message ||
          "Password changed successfully. Please login again."
      );

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        window.location.reload();
      }, 1800);
    } catch (error) {
      console.error(
        "Password change error:",
        error
      );

      setPasswordError(
        error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // ==================================================
  // LOADING SCREEN
  // ==================================================

  if (loading) {
    return (
      <section className="settings-management">
        <div className="settings-page-heading">
          <div>
            <span className="settings-page-label">
              CONFIGURATION
            </span>

            <h2>Restaurant Settings</h2>

            <p>
              Loading your restaurant configuration...
            </p>
          </div>
        </div>

        <div className="settings-card">
          <div className="settings-loading-state">
            <div className="settings-loading-spinner"></div>

            <span>
              Loading settings...
            </span>
          </div>
        </div>
      </section>
    );
  }

  // ==================================================
  // MAIN UI
  // ==================================================

  return (
    <section className="settings-management">

      {/* PAGE HEADER */}

      <div className="settings-page-heading">
        <div>
          <span className="settings-page-label">
            CONFIGURATION
          </span>

          <h2>
            Restaurant Settings
          </h2>

          <p>
            Manage restaurant information, ordering preferences
            and administrator security.
          </p>
        </div>

        {saved && (
          <div className="settings-saved-message">
            ✓ Settings saved successfully
          </div>
        )}
      </div>

      {/* ERROR */}

      {settingsError && (
        <div className="settings-global-error">
          ✕ {settingsError}
        </div>
      )}

      {/* RESTAURANT SETTINGS */}

      <form onSubmit={handleSave}>

        {/* RESTAURANT INFORMATION */}

        <div className="settings-card">
          <div className="settings-card-header">

            <div className="settings-card-icon">
              🏪
            </div>

            <div>
              <h3>
                Restaurant Information
              </h3>

              <p>
                Basic information displayed across your restaurant system.
              </p>
            </div>

          </div>

          <div className="settings-form-grid">

            <div className="settings-field">
              <label>
                Restaurant Name
              </label>

              <input
                type="text"
                name="restaurantName"
                value={settings.restaurantName}
                onChange={handleChange}
                placeholder="Restaurant name"
              />
            </div>

            <div className="settings-field">
              <label>
                Contact Phone
              </label>

              <input
                type="text"
                name="phone"
                value={settings.phone}
                onChange={handleChange}
                placeholder="Enter restaurant phone"
              />
            </div>

            <div className="settings-field settings-full-width">
              <label>
                Restaurant Address
              </label>

              <input
                type="text"
                name="address"
                value={settings.address}
                onChange={handleChange}
                placeholder="Restaurant address"
              />
            </div>

          </div>
        </div>

        {/* BUSINESS HOURS */}

        <div className="settings-card">

          <div className="settings-card-header">

            <div className="settings-card-icon">
              🕐
            </div>

            <div>
              <h3>
                Business Hours
              </h3>

              <p>
                Set the opening and closing time of your restaurant.
              </p>
            </div>

          </div>

          <div className="settings-form-grid">

            <div className="settings-field">
              <label>
                Opening Time
              </label>

              <input
                type="time"
                name="openingTime"
                value={settings.openingTime}
                onChange={handleChange}
              />
            </div>

            <div className="settings-field">
              <label>
                Closing Time
              </label>

              <input
                type="time"
                name="closingTime"
                value={settings.closingTime}
                onChange={handleChange}
              />
            </div>

            <div className="settings-field">
              <label>
                Currency
              </label>

              <select
                name="currency"
                value={settings.currency}
                onChange={handleChange}
              >
                <option value="PKR">
                  PKR — Pakistani Rupee
                </option>

                <option value="USD">
                  USD — US Dollar
                </option>
              </select>
            </div>

          </div>
        </div>

        {/* ORDER SETTINGS */}

        <div className="settings-card">

          <div className="settings-card-header">

            <div className="settings-card-icon">
              🧾
            </div>

            <div>
              <h3>
                Order Settings
              </h3>

              <p>
                Control how customers can place their orders.
              </p>
            </div>

          </div>

          <div className="settings-options">

            {/* DELIVERY */}

            <div className="settings-option">

              <div className="settings-option-info">

                <div className="settings-option-icon">
                  🛵
                </div>

                <div>
                  <strong>
                    Delivery Orders
                  </strong>

                  <p>
                    Allow customers to place delivery orders.
                  </p>
                </div>

              </div>

              <button
                type="button"
                className={`settings-toggle ${
                  settings.deliveryEnabled
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleToggle("deliveryEnabled")
                }
                aria-label="Toggle delivery orders"
              >
                <span></span>
              </button>

            </div>

            {/* PICKUP */}

            <div className="settings-option">

              <div className="settings-option-info">

                <div className="settings-option-icon">
                  🛍️
                </div>

                <div>
                  <strong>
                    Pickup Orders
                  </strong>

                  <p>
                    Allow customers to collect orders from the restaurant.
                  </p>
                </div>

              </div>

              <button
                type="button"
                className={`settings-toggle ${
                  settings.pickupEnabled
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleToggle("pickupEnabled")
                }
                aria-label="Toggle pickup orders"
              >
                <span></span>
              </button>

            </div>

            {/* WHATSAPP */}

            <div className="settings-option">

              <div className="settings-option-info">

                <div className="settings-option-icon">
                  💬
                </div>

                <div>
                  <strong>
                    WhatsApp Ordering
                  </strong>

                  <p>
                    Enable WhatsApp based customer ordering.
                  </p>
                </div>

              </div>

              <button
                type="button"
                className={`settings-toggle ${
                  settings.whatsappOrders
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleToggle("whatsappOrders")
                }
                aria-label="Toggle WhatsApp ordering"
              >
                <span></span>
              </button>

            </div>

            {/* NOTIFICATIONS */}

            <div className="settings-option">

              <div className="settings-option-info">

                <div className="settings-option-icon">
                  🔔
                </div>

                <div>
                  <strong>
                    Order Notifications
                  </strong>

                  <p>
                    Show notifications for new customer orders.
                  </p>
                </div>

              </div>

              <button
                type="button"
                className={`settings-toggle ${
                  settings.orderNotifications
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  handleToggle("orderNotifications")
                }
                aria-label="Toggle order notifications"
              >
                <span></span>
              </button>

            </div>

          </div>
        </div>

        {/* SAVE SETTINGS */}

        <div className="settings-save-area">

          <div>
            <strong>
              Save your changes
            </strong>

            <p>
              Changes are securely stored in your restaurant database.
            </p>
          </div>

          <button
            type="submit"
            className="settings-save-btn"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Settings"}
          </button>

        </div>

      </form>

      {/* ADMIN SECURITY */}

      <div className="settings-security-card">

        <div className="settings-card-header">

          <div className="settings-card-icon">
            🔐
          </div>

          <div>
            <h3>
              Admin Security
            </h3>

            <p>
              Change your administrator password and keep your dashboard secure.
            </p>
          </div>

        </div>

        <form
          className="settings-security-form"
          onSubmit={handlePasswordSubmit}
        >

          {/* CURRENT PASSWORD */}

          <div className="settings-field">

            <label>
              Current Password
            </label>

            <div className="settings-password-input">

              <input
                type={
                  showPasswords.current
                    ? "text"
                    : "password"
                }
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
                autoComplete="current-password"
              />

              <button
                type="button"
                className="settings-password-toggle"
                onClick={() =>
                  togglePasswordVisibility("current")
                }
              >
                {showPasswords.current
                  ? "Hide"
                  : "Show"}
              </button>

            </div>

          </div>

          {/* NEW PASSWORD */}

          <div className="settings-field">

            <label>
              New Password
            </label>

            <div className="settings-password-input">

              <input
                type={
                  showPasswords.new
                    ? "text"
                    : "password"
                }
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter new password"
                autoComplete="new-password"
              />

              <button
                type="button"
                className="settings-password-toggle"
                onClick={() =>
                  togglePasswordVisibility("new")
                }
              >
                {showPasswords.new
                  ? "Hide"
                  : "Show"}
              </button>

            </div>

            <small className="settings-password-hint">
              Minimum 8 characters.
            </small>

          </div>

          {/* CONFIRM PASSWORD */}

          <div className="settings-field">

            <label>
              Confirm New Password
            </label>

            <div className="settings-password-input">

              <input
                type={
                  showPasswords.confirm
                    ? "text"
                    : "password"
                }
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm new password"
                autoComplete="new-password"
              />

              <button
                type="button"
                className="settings-password-toggle"
                onClick={() =>
                  togglePasswordVisibility("confirm")
                }
              >
                {showPasswords.confirm
                  ? "Hide"
                  : "Show"}
              </button>

            </div>

          </div>

          {/* PASSWORD ERROR */}

          {passwordError && (
            <div className="settings-password-message error">
              ✕ {passwordError}
            </div>
          )}

          {/* PASSWORD SUCCESS */}

          {passwordMessage && (
            <div className="settings-password-message success">
              ✓ {passwordMessage}
            </div>
          )}

          {/* SECURITY ACTIONS */}

          <div className="settings-security-actions">

            <div className="settings-security-note">

              <strong>
                🔒 Secure administrator account
              </strong>

              <p>
                After changing your password, your current
                session will be closed and you will need to login again.
              </p>

            </div>

            <button
              type="submit"
              className="settings-change-password-btn"
              disabled={passwordLoading}
            >
              {passwordLoading
                ? "Changing Password..."
                : "Change Password"}
            </button>

          </div>

        </form>

      </div>

    </section>
  );
}

export default SettingsManagement;

