import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getCustomerById,
  getCustomerUsers,
  createCustomerEmp,
  updateCustomerUser,
} from "../../api/customers.api";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import {
  Building2,
  Users,
  UserPlus,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  KeyRound,
} from "lucide-react";

export default function CustomerCompanyDetails() {
  const { customerId } = useParams();

  const [customer, setCustomer] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Create Employee Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [custRes, empRes] = await Promise.all([
        getCustomerById(customerId),
        getCustomerUsers(customerId),
      ]);
      setCustomer(custRes.customer);
      setEmployees(empRes.customerUsers || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load company details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) fetchData();
  }, [customerId]);

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccessMsg("");
    try {
      await createCustomerEmp(customerId, userForm);
      setSuccessMsg(`Customer employee ${userForm.name} created successfully!`);
      setIsAddUserOpen(false);
      setUserForm({ name: "", email: "", password: "" });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create customer user.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (employee) => {
    setError("");
    setSuccessMsg("");
    try {
      await updateCustomerUser(customerId, employee.id, {
        is_active: !employee.is_active,
      });
      setSuccessMsg(
        `Updated ${employee.name} status to ${!employee.is_active ? "Active" : "Inactive"}.`
      );
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Status update failed.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center text-text-muted">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-primary-600" />
          Loading company details...
        </div>
      </DashboardLayout>
    );
  }

  if (!customer) {
    return (
      <DashboardLayout>
        <div className="p-12 text-center">
          <Building2 className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-text-primary">
            Customer Company Not Found
          </h3>
          <p className="text-xs text-text-muted mt-1 mb-4">
            The requested customer company does not exist or is not assigned to you.
          </p>
          <Link
            to="/dashboard/companies"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-700 text-white font-semibold text-sm hover:bg-primary-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Companies
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Back Button & Header Banner */}
        <div className="space-y-4">
          <Link
            to="/dashboard/companies"
            className="inline-flex items-center gap-2 text-xs font-bold text-text-muted hover:text-primary-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Customer Companies
          </Link>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-6 rounded-2xl border border-border shadow-xs">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 text-primary-700 font-extrabold text-2xl border border-primary-200">
                {customer.name ? customer.name[0].toUpperCase() : "C"}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black text-text-primary tracking-tight">
                    {customer.name}
                  </h2>
                  <Badge
                    variant={
                      customer.customer_tier?.toLowerCase() === "gold"
                        ? "gold"
                        : customer.customer_tier?.toLowerCase() === "silver"
                        ? "silver"
                        : "bronze"
                    }
                  >
                    {customer.customer_tier || "Bronze"} Tier
                  </Badge>
                  <Badge variant={customer.is_active ? "success" : "danger"}>
                    {customer.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-text-secondary mt-2">
                  {customer.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3.5 h-3.5 text-text-muted" />
                      {customer.email}
                    </span>
                  )}
                  {customer.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-text-muted" />
                      {customer.phone}
                    </span>
                  )}
                  {customer.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-text-muted" />
                      {customer.address}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Button
              onClick={() => setIsAddUserOpen(true)}
              className="flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add Customer Employee
            </Button>
          </div>
        </div>

        {/* Feedback Messages */}
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

        {/* Customer Employees Section */}
        <div className="bg-surface rounded-2xl border border-border shadow-xs overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-text-primary">
                Customer Employee Accounts
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Employees of {customer.name} with portal access credentials
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-neutral-100 text-text-secondary border border-border">
              {employees.length} Employees Registered
            </span>
          </div>

          {employees.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <h4 className="text-base font-bold text-text-primary">
                No Employees Added Yet
              </h4>
              <p className="text-xs text-text-muted max-w-sm mx-auto mt-1 mb-4">
                Add customer employee accounts to grant them login access to their customer portal.
              </p>
              <Button onClick={() => setIsAddUserOpen(true)}>
                <UserPlus className="w-4 h-4 mr-2" /> Add Customer Employee
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-neutral-50/50 text-xs font-bold uppercase tracking-wider text-text-muted">
                    <th className="py-3.5 px-6">Employee Name</th>
                    <th className="py-3.5 px-6">Email Address</th>
                    <th className="py-3.5 px-6">First Login Password Status</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {employees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="hover:bg-neutral-50/80 transition-colors"
                    >
                      <td className="py-4 px-6 font-bold text-text-primary">
                        {emp.name}
                      </td>
                      <td className="py-4 px-6 text-text-secondary">
                        {emp.email}
                      </td>
                      <td className="py-4 px-6">
                        {emp.must_change_password ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-warning-50 text-warning-800 border border-warning-200">
                            <KeyRound className="w-3 h-3 text-warning-600" /> Password Change Required
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-50 text-success-800 border border-success-200">
                            <CheckCircle2 className="w-3 h-3 text-success-600" /> Password Set
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={emp.is_active ? "success" : "danger"}>
                          {emp.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleToggleStatus(emp)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            emp.is_active
                              ? "bg-danger-50 text-danger-700 hover:bg-danger-100"
                              : "bg-success-50 text-success-700 hover:bg-success-100"
                          }`}
                        >
                          {emp.is_active ? (
                            <>
                              <ToggleLeft className="w-4 h-4" /> Deactivate
                            </>
                          ) : (
                            <>
                              <ToggleRight className="w-4 h-4" /> Activate
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Customer Employee Modal */}
      <Modal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title={`Add Employee for ${customer.name}`}
      >
        <form onSubmit={handleAddUserSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            placeholder="John Doe"
            value={userForm.name}
            onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
            required
          />
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="john@customercompany.com"
            value={userForm.email}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            required
          />
          <Input
            label="Initial Temporary Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={userForm.password}
            onChange={(e) =>
              setUserForm({ ...userForm, password: e.target.value })
            }
            required
          />
          <p className="text-xs text-text-muted">
            The employee will be required to change this temporary password upon their first login to the Customer Portal.
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsAddUserOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={submitting}>
              Create Employee Account
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
