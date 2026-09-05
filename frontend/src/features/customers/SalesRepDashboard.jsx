import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUserRole } from "../../utils/roleUtils";
import { getDashboardData } from "../../api/dashboard.api";
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
import {
  Building2,
  Users,
  Plus,
  ArrowRight,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileText,
  ShoppingBag,
  TrendingUp,
  ShieldAlert,
  Clock,
} from "lucide-react";

export default function SalesRepDashboard() {
  const { user } = useAuth();
  const userRole = getUserRole(user);
  const canRegisterCompany = userRole === "ADMIN" || userRole === "SALES_REP";

  const [data, setData] = useState(null);
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

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const [dashRes, custRes] = await Promise.all([
        getDashboardData(),
        getCustomersBySalesRep(),
      ]);
      setData(dashRes.dashboard);
      setCustomers(custRes.customers || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load Sales Rep Dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
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
      fetchDashboard();
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <RefreshCw className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  const kpis = data?.kpis || {};
  const pipeline = data?.pipeline || {};
  const actionRequired = data?.action_required || [];
  const health = data?.deal_health || { deals: [] };
  const custSummary = data?.customer_summary || { top_customers: [] };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border shadow-xs">
          <div>
            <h2 className="text-2xl font-black text-text-primary tracking-tight">
              Sales Representative Workspace
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Track quotation pipeline, deal health, pending approvals, and customer accounts.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboard}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface hover:bg-neutral-50 text-sm font-semibold text-text-secondary transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            {canRegisterCompany && (
              <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
                <Plus className="w-4 h-4" /> Register Customer Company
              </Button>
            )}
          </div>
        </div>

        {/* Success/Error Notifications */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-success-50 border border-success-200 text-success-800 text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-success-600" /> {successMsg}
          </div>
        )}
        {error && (
          <div className="p-4 rounded-xl bg-danger-50 border border-danger-200 text-danger-800 text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-danger-600" /> {error}
          </div>
        )}

        {/* Top KPI Cards (Point 10) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <StatsCard
            title="My Customers"
            value={kpis.my_customers}
            icon={Building2}
            color="primary"
            description="Assigned portfolio"
          />
          <StatsCard
            title="Active Quotations"
            value={kpis.active_quotations}
            icon={FileText}
            color="info"
            description="In progress"
          />
          <StatsCard
            title="Pending Approvals"
            value={kpis.pending_approvals}
            icon={Clock}
            color="warning"
            description="Under review"
          />
          <StatsCard
            title="Open Orders"
            value={kpis.open_orders}
            icon={ShoppingBag}
            color="success"
            description="Operational orders"
          />
          <StatsCard
            title="Quotation Value"
            value={`₹${(kpis.quotation_value / 100000).toFixed(1)}L`}
            icon={TrendingUp}
            color="primary"
            description="Total quotes val"
          />
          <StatsCard
            title="Expected Revenue"
            value={`₹${(kpis.expected_revenue / 100000).toFixed(1)}L`}
            icon={TrendingUp}
            color="success"
            description="Pipeline expected"
          />
        </div>

        {/* VISUAL SALES PIPELINE (Point 11) */}
        <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-text-primary flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-700" /> Quotation Sales Pipeline Stage Breakdown
            </h3>
            <Link to="/dashboard/quotations" className="text-xs font-bold text-primary-700 hover:text-primary-800 flex items-center gap-1">
              View All Quotations <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
              <p className="text-xs font-bold text-text-muted">DRAFT</p>
              <p className="text-2xl font-black text-text-primary mt-1">{pipeline.draft_deals || 0}</p>
              <p className="text-xs font-mono text-text-secondary mt-1">₹{(pipeline.draft_val / 100000).toFixed(1)}L</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <p className="text-xs font-bold text-amber-800">APPROVAL PENDING</p>
              <p className="text-2xl font-black text-amber-900 mt-1">{pipeline.approval_deals || 0}</p>
              <p className="text-xs font-mono text-amber-800 mt-1">₹{(pipeline.approval_val / 100000).toFixed(1)}L</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <p className="text-xs font-bold text-emerald-800">APPROVED</p>
              <p className="text-2xl font-black text-emerald-900 mt-1">{pipeline.approved_deals || 0}</p>
              <p className="text-xs font-mono text-emerald-800 mt-1">₹{(pipeline.approved_val / 100000).toFixed(1)}L</p>
            </div>
            <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200">
              <p className="text-xs font-bold text-indigo-800">CONVERTED ORDER</p>
              <p className="text-2xl font-black text-indigo-900 mt-1">{pipeline.converted_deals || 0}</p>
              <p className="text-xs font-mono text-indigo-800 mt-1">₹{(pipeline.converted_val / 100000).toFixed(1)}L</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <p className="text-xs font-bold text-blue-800">SUBMITTED</p>
              <p className="text-2xl font-black text-blue-900 mt-1">{pipeline.submitted_deals || 0}</p>
              <p className="text-xs font-mono text-blue-800 mt-1">₹{(pipeline.submitted_val / 100000).toFixed(1)}L</p>
            </div>
          </div>
        </div>

        {/* Action Required & Deal Health Grid (Points 12 & 13) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Action Required Section */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-4">
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" /> Action Required Alerts
            </h3>
            {actionRequired.length === 0 ? (
              <div className="p-8 text-center text-text-muted">
                <CheckCircle2 className="w-10 h-10 text-success-500 mx-auto mb-2" />
                <p className="font-bold text-text-primary">No Urgent Actions</p>
                <p className="text-xs text-text-muted mt-1">All quotations and orders are running smoothly.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {actionRequired.map((item, idx) => (
                  <Link
                    key={idx}
                    to={item.link}
                    className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-neutral-50 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      {item.type === "SUCCESS" ? (
                        <CheckCircle2 className="w-5 h-5 text-success-600 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-bold text-text-primary group-hover:text-primary-700 transition-colors">
                          {item.title}
                        </p>
                        <p className="text-xs text-text-secondary">{item.message}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary-700 transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Deal Health Section */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-4">
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-primary-600" /> Deal Health Status
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-success-50 border border-success-200">
                <p className="text-lg font-black text-success-700">{health.healthy}</p>
                <p className="text-xs font-bold text-success-800">HEALTHY</p>
              </div>
              <div className="p-3 rounded-xl bg-warning-50 border border-warning-200">
                <p className="text-lg font-black text-warning-700">{health.at_risk}</p>
                <p className="text-xs font-bold text-warning-800">AT RISK</p>
              </div>
              <div className="p-3 rounded-xl bg-danger-50 border border-danger-200">
                <p className="text-lg font-black text-danger-700">{health.critical}</p>
                <p className="text-xs font-bold text-danger-800">CRITICAL</p>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              {health.deals.map((d, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-border text-sm">
                  <div>
                    <span className="font-bold text-text-primary">{d.quote_number}</span>
                    <span className="text-text-muted text-xs ml-2">({d.customer_name})</span>
                  </div>
                  <Badge variant={d.status === "CRITICAL" ? "danger" : d.status === "AT RISK" ? "warning" : "success"}>
                    {d.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Summary & List (Point 14) */}
        <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                Assigned Customers Overview
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Total: {custSummary.total} | Gold: {custSummary.gold} | Silver: {custSummary.silver} | Bronze: {custSummary.bronze}
              </p>
            </div>
            <Link to="/dashboard/companies" className="text-xs font-bold text-primary-700 hover:text-primary-800 flex items-center gap-1">
              View All Customers <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-neutral-50/50 text-xs font-bold uppercase tracking-wider text-text-muted">
                  <th className="py-3.5 px-6">Company Name</th>
                  <th className="py-3.5 px-6">Email</th>
                  <th className="py-3.5 px-6">Tier</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {customers.slice(0, 5).map((customer) => (
                  <tr key={customer.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-text-primary">
                      <Link to={`/dashboard/companies/${customer.id}`} className="hover:text-primary-700">
                        {customer.name}
                      </Link>
                    </td>
                    <td className="py-4 px-6 text-text-secondary">{customer.email || "—"}</td>
                    <td className="py-4 px-6">
                      <Badge variant={customer.customer_tier?.toLowerCase() === "gold" ? "gold" : customer.customer_tier?.toLowerCase() === "silver" ? "silver" : "bronze"}>
                        {customer.customer_tier || "Bronze"}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={customer.is_active ? "success" : "danger"}>
                        {customer.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/dashboard/companies/${customer.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary-700 hover:text-primary-800 bg-primary-50 px-3 py-1.5 rounded-lg"
                      >
                        Manage <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register Customer Company">
        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <Input label="Company Name" name="name" placeholder="Acme Corporation" value={form.name} onChange={handleChange} required />
          <Input label="Email Address" name="email" type="email" placeholder="contact@acme.com" value={form.email} onChange={handleChange} />
          <Input label="Phone Number" name="phone" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} />
          <Input label="Company Address" name="address" placeholder="123 Business Park, Mumbai" value={form.address} onChange={handleChange} />
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
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={submitting}>Create Company</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
