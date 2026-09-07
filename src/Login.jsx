
import { useState } from "react";
import "./Login.css";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://asad-lahori-nashta-backend.vercel.app/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Login failed."
        );
      }

      onLogin(data.admin);
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.message ||
          "Unable to login. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-background-glow glow-one"></div>
      <div className="login-background-glow glow-two"></div>

      <div className="login-card">

        <div className="login-brand">

          <div className="login-logo">
            A
          </div>

          <div>
            <h1>
              Asad Lahori
            </h1>

            <span>
              Admin Panel
            </span>
          </div>

        </div>

        <div className="login-heading">

          <span className="login-label">
            SECURE ACCESS
          </span>

          <h2>
            Welcome Back
          </h2>

          <p>
            Sign in to manage your restaurant.
          </p>

        </div>

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >

          <div className="form-group">

            <label>
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter admin email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              autoComplete="username"
              disabled={loading}
            />

          </div>

          <div className="form-group">

            <label>
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              autoComplete="current-password"
              disabled={loading}
            />

          </div>

          {error && (
            <div className="login-error">
              <span>!</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="login-spinner"></span>
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <span>→</span>
              </>
            )}
          </button>

        </form>

        <div className="login-security">

          <span className="security-icon">
            🔒
          </span>

          <div>
            <strong>
              Secure Admin Access
            </strong>

            <p>
              Your session is protected.
            </p>
          </div>

        </div>

        <div className="login-footer">
          © {new Date().getFullYear()} Asad Lahori Nashta Centre
        </div>

      </div>

    </div>
  );
}

export default Login;


