import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getUserRole } from "../../utils/roleUtils";
import {
  getCustomersBySalesRep,
  registerCustomerCompany,
  updateCustomerCompany,
} from "../../api/customers.api";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import {
  Building2,
  Plus,
  Search,
  Edit2,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Filter,
} from "lucide-react";

export default function CustomerCompanyList() {
  const { user } = useAuth();
  const userRole = getUserRole(user);
  const canRegisterCompany = userRole === "ADMIN" || userRole === "SALES_REP";

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    customer_tier: "Bronze",
    currency: "INR",
  });

  // Edit Modal
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editForm, setEditForm] = useState({
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
      setError(err.response?.data?.message || "Failed to load customer list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccessMsg("");
    try {
      await registerCustomerCompany(createForm);
      setSuccessMsg("Customer company registered successfully!");
      setIsCreateOpen(false);
      setCreateForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        customer_tier: "Bronze",
        currency: "INR",
      });
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || "Creation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setEditForm({
      name: customer.name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address: customer.address || "",
      customer_tier: customer.customer_tier || "Bronze",
      currency: customer.currency || "INR",
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingCustomer) return;
    setSubmitting(true);
    setError("");
    setSuccessMsg("");
    try {
      await updateCustomerCompany(editingCustomer.id, editForm);
      setSuccessMsg(`Updated ${editForm.name} successfully!`);
      setEditingCustomer(null);
      fetchCustomers();
    } catch (err) {
      setError(err.response?.data?.message || "Update failed.");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered List
  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.phone && c.phone.includes(search));

    const matchesTier =
      tierFilter === "ALL" || c.customer_tier?.toUpperCase() === tierFilter;

    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "ACTIVE" && c.is_active) ||
      (statusFilter === "INACTIVE" && !c.is_active);

    return matchesSearch && matchesTier && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border shadow-xs">
          <div>
            <h2 className="text-2xl font-black text-text-primary tracking-tight">
              Customer Companies
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              View and manage all registered customer companies under your account.
            </p>
          </div>
          {canRegisterCompany && (
            <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Register Customer Company
            </Button>
          )}
        </div>

        {/* Feedback Notifications */}
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

        {/* Search & Filter Bar */}
        <div className="bg-surface p-4 rounded-2xl border border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-text-muted absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search companies by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-surface text-sm text-text-primary outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Filter className="w-4 h-4 text-text-muted hidden md:block" />
            <Select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              options={[
                { label: "All Tiers", value: "ALL" },
                { label: "Bronze Tier", value: "BRONZE" },
                { label: "Silver Tier", value: "SILVER" },
                { label: "Gold Tier", value: "GOLD" },
              ]}
              className="w-36"
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: "All Status", value: "ALL" },
                { label: "Active Only", value: "ACTIVE" },
                { label: "Inactive Only", value: "INACTIVE" },
              ]}
              className="w-36"
            />
          </div>
        </div>

        {/* Companies Table */}
        <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-text-muted">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary-600" />
              Loading customer companies...
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-text-primary">
                No Customer Companies Found
              </h4>
              <p className="text-xs text-text-muted max-w-sm mx-auto mt-1">
                Try adjusting your search query or filter options.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-neutral-50/50 text-xs font-bold uppercase tracking-wider text-text-muted">
                    <th className="py-3.5 px-6">Company</th>
                    <th className="py-3.5 px-6">Email</th>
                    <th className="py-3.5 px-6">Phone</th>
                    <th className="py-3.5 px-6">Tier</th>
                    <th className="py-3.5 px-6">Currency</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.id}
                      className="hover:bg-neutral-50/80 transition-colors"
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
                      <td className="py-4 px-6 text-right space-x-2">
                        {canRegisterCompany && (
                          <button
                            onClick={() => openEditModal(customer)}
                            title="Edit Company"
                            className="p-1.5 text-text-muted hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors inline-flex items-center"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        <Link
                          to={`/dashboard/companies/${customer.id}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-primary-700 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Details <ArrowRight className="w-3.5 h-3.5" />
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

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Register Customer Company"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Company Name"
            name="name"
            placeholder="Acme Corporation"
            value={createForm.name}
            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
            required
          />
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="contact@acme.com"
            value={createForm.email}
            onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
          />
          <Input
            label="Phone Number"
            name="phone"
            placeholder="+91 98765 43210"
            value={createForm.phone}
            onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
          />
          <Input
            label="Company Address"
            name="address"
            placeholder="123 Business Park, Mumbai"
            value={createForm.address}
            onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Customer Tier"
              name="customer_tier"
              value={createForm.customer_tier}
              onChange={(e) =>
                setCreateForm({ ...createForm, customer_tier: e.target.value })
              }
              options={[
                { label: "Bronze Tier", value: "Bronze" },
                { label: "Silver Tier", value: "Silver" },
                { label: "Gold Tier", value: "Gold" },
              ]}
            />
            <Select
              label="Currency"
              name="currency"
              value={createForm.currency}
              onChange={(e) => setCreateForm({ ...createForm, currency: e.target.value })}
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
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Create Company
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editingCustomer}
        onClose={() => setEditingCustomer(null)}
        title="Edit Customer Company"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Company Name"
            name="name"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            required
          />
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
          />
          <Input
            label="Phone Number"
            name="phone"
            value={editForm.phone}
            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
          />
          <Input
            label="Company Address"
            name="address"
            value={editForm.address}
            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Customer Tier"
              name="customer_tier"
              value={editForm.customer_tier}
              onChange={(e) =>
                setEditForm({ ...editForm, customer_tier: e.target.value })
              }
              options={[
                { label: "Bronze Tier", value: "Bronze" },
                { label: "Silver Tier", value: "Silver" },
                { label: "Gold Tier", value: "Gold" },
              ]}
            />
            <Select
              label="Currency"
              name="currency"
              value={editForm.currency}
              onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })}
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
              onClick={() => setEditingCustomer(null)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
