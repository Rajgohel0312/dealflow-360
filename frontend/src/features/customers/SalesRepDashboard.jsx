import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getCustomersBySalesRep,
  registerCustomerCompany,
} from "../../api/customers.api";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { StatsCard } from "../../components/ui/StatsCard";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import {
  Building2,
  Users,
  Plus,
  ArrowRight,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function SalesRepDashboard() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    customer_tier: "Bronze",
    currency: "INR",
  });

  const fetchCustomers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCustomersBySalesRep();
      setCustomers(data.customers || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load customers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccessMsg("");

    try {
      await registerCustomerCompany(form);
      setSuccessMsg("Customer company registered successfully!");
      setIsModalOpen(false);
      setForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        customer_tier: "Bronze",
        currency: "INR",
      });
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // Metrics calculation
  const totalCompanies = customers.length;
  const activeCompanies = customers.filter((c) => c.is_active).length;
  const goldTierCount = customers.filter((c) => c.customer_tier === "Gold").length;
  const silverTierCount = customers.filter((c) => c.customer_tier === "Silver").length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border shadow-xs">
          <div>
            <h2 className="text-2xl font-black text-text-primary tracking-tight">
              Customer Companies & Accounts
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Manage your assigned customer portfolio and employee credentials.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchCustomers}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-neutral-50 text-sm font-semibold text-text-secondary transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Register Customer Company
            </Button>
          </div>
        </div>

        {/* Alert Notifications */}
        {successMsg && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-success-50 border border-success-200 text-success-800 text-sm font-medium animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-success-600 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-danger-50 border border-danger-200 text-danger-800 text-sm font-medium animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-danger-600 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Companies"
            value={totalCompanies}
            icon={Building2}
            color="primary"
            description="Assigned portfolio accounts"
          />
          <StatsCard
            title="Active Companies"
            value={activeCompanies}
            icon={CheckCircle2}
            color="success"
            description="Operational accounts"
          />
          <StatsCard
            title="Gold Tier Accounts"
            value={goldTierCount}
            icon={Building2}
            color="warning"
            description="High value enterprise accounts"
          />
          <StatsCard
            title="Silver Tier Accounts"
            value={silverTierCount}
            icon={Building2}
            color="info"
            description="Growth accounts"
          />
        </div>

        {/* Recent Customer Companies Table */}
        <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                Assigned Customer Companies
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Showing latest registered customer companies
              </p>
            </div>
            <Link
              to="/dashboard/companies"
              className="flex items-center gap-1.5 text-xs font-bold text-primary-700 hover:text-primary-800 transition-colors"
            >
              View All Companies <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="p-12 text-center text-text-muted">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-600" />
              Loading customer companies...
            </div>
          ) : customers.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-text-primary">
                No Customer Companies Registered
              </h4>
              <p className="text-xs text-text-muted max-w-sm mx-auto mt-1 mb-4">
                Click below to register your first customer company.
              </p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Register Company
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-neutral-50/50 text-xs font-bold uppercase tracking-wider text-text-muted">
                    <th className="py-3.5 px-6">Company Name</th>
                    <th className="py-3.5 px-6">Email</th>
                    <th className="py-3.5 px-6">Phone</th>
                    <th className="py-3.5 px-6">Tier</th>
                    <th className="py-3.5 px-6">Currency</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {customers.slice(0, 5).map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-neutral-50/80 transition-colors group"
                    >
                      <td className="py-4 px-6 font-bold text-text-primary">
                        <Link
                          to={`/dashboard/companies/${customer.id}`}
                          className="hover:text-primary-700 transition-colors"
                        >
                          {customer.name}
                        </Link>
                      </td>
                      <td className="py-4 px-6 text-text-secondary">
                        {customer.email || "—"}
                      </td>
                      <td className="py-4 px-6 text-text-secondary">
                        {customer.phone || "—"}
                      </td>
                      <td className="py-4 px-6">
                        <Badge
                          variant={
                            customer.customer_tier?.toLowerCase() === "gold"
                              ? "gold"
                              : customer.customer_tier?.toLowerCase() === "silver"
                              ? "silver"
                              : "bronze"
                          }
                        >
                          {customer.customer_tier || "Bronze"}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-text-secondary">
                        {customer.currency}
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={customer.is_active ? "success" : "danger"}>
                          {customer.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/dashboard/companies/${customer.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary-700 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Manage <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Registration Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Customer Company"
      >
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <Input
            label="Company Name"
            name="name"
            placeholder="Acme Corporation"
            value={form.name}
            onChange={handleChange}
            required
          />
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="contact@acme.com"
            value={form.email}
            onChange={handleChange}
          />
          <Input
            label="Phone Number"
            name="phone"
            placeholder="+91 98765 43210"
            value={form.phone}
            onChange={handleChange}
          />
          <Input
            label="Company Address"
            name="address"
            placeholder="123 Business Park, Mumbai"
            value={form.address}
            onChange={handleChange}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Customer Tier"
              name="customer_tier"
              value={form.customer_tier}
              onChange={handleChange}
              options={[
                { label: "Bronze Tier", value: "Bronze" },
                { label: "Silver Tier", value: "Silver" },
                { label: "Gold Tier", value: "Gold" },
              ]}
            />
            <Select
              label="Currency"
              name="currency"
              value={form.currency}
              onChange={handleChange}
              options={[
                { label: "INR (₹)", value: "INR" },
                { label: "USD ($)", value: "USD" },
                { label: "EUR (€)", value: "EUR" },
              ]}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Create Company
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
