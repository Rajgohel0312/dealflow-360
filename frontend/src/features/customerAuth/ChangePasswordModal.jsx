import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { changeCustomerPassword } from "../../api/customers.api";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Card from "../../components/ui/Card";
import Logo from "../../components/ui/Logo";

export default function ChangePasswordModal() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
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

    if (form.new_password !== form.confirm_password) {
      setError("New password and confirm password do not match.");
      return;
    }

    const tempToken = localStorage.getItem("temp_password_token");
    if (!tempToken) {
      setError("Session expired. Please sign in again.");
      navigate("/customer/login");
      return;
    }

    setLoading(true);

    try {
      const response = await changeCustomerPassword(form, tempToken);

      // Clean temporary token
      localStorage.removeItem("temp_password_token");
      const tempUser = JSON.parse(localStorage.getItem("temp_user_data") || "{}");
      localStorage.removeItem("temp_user_data");

      // Log user in with full session token
      login(response.token, response.customerUser || tempUser, "CUSTOMER");

      navigate("/customer/portal");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Password update failed. Please verify your current password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header Icon */}
        <div className="mb-6 text-center flex flex-col items-center">
          <Logo size="lg" subtitle="First-Time Login Security Setup" className="justify-center" />
        </div>

        <Card>
          {error && (
            <div className="mb-5 rounded-xl border border-danger-200 bg-danger-50 px-4 py-3 text-sm font-medium text-danger-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Current Temporary Password"
              name="current_password"
              type="password"
              placeholder="••••••••"
              value={form.current_password}
              onChange={handleChange}
              required
            />

            <Input
              label="New Password"
              name="new_password"
              type="password"
              placeholder="Minimum 8 characters"
              value={form.new_password}
              onChange={handleChange}
              required
            />

            <Input
              label="Confirm New Password"
              name="confirm_password"
              type="password"
              placeholder="••••••••"
              value={form.confirm_password}
              onChange={handleChange}
              required
            />

            <div className="pt-2">
              <Button type="submit" loading={loading}>
                Update Password & Continue
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
