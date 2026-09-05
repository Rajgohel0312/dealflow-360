import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginCustomerUser } from "../../api/customers.api";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import { KeyRound, ShieldCheck } from "lucide-react";

export default function CustomerLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await loginCustomerUser(form);

      if (response.must_change_password) {
        // First time login -> save temporary password token & redirect to password change screen
        localStorage.setItem(
          "temp_password_token",
          response.change_password_token
        );
        localStorage.setItem(
          "temp_user_data",
          JSON.stringify(response.customerUser)
        );
        navigate("/customer/change-password");
      } else {
        // Regular customer login
        login(response.token, response.customerUser, "CUSTOMER");
        navigate("/customer/portal");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-700 text-2xl font-extrabold text-white shadow-lg shadow-primary-700/20">
            D
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            DealFlow360 Customer Portal
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Sign in to access your company dashboard
          </p>
        </div>

        {/* Card */}
        <Card>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-text-primary">
              Customer Sign In
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              Enter your employee email and password
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="employee@company.com"
              value={form.email}
              onChange={handleChange}
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />

            <Button type="submit" loading={loading}>
              Sign In to Portal
            </Button>
          </form>

          {/* Navigation to Employee Login */}
          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-xs text-text-muted">
              Are you a Sales Representative?{" "}
              <Link
                to="/login"
                className="font-semibold text-primary-700 hover:text-primary-800"
              >
                Sales Rep Sign In
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
