import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Badge } from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";
import { ROLE_NAMES } from "../../constants/roles";
import {
  getDiscountRules,
  getCategories,
  createDiscountRule,
  updateDiscountRule,
} from "../../api/catalog.api";
import { getUserRole } from "../../utils/roleUtils";
import { Percent, Plus, Filter, Edit3, ShieldAlert } from "lucide-react";

export default function DiscountRuleList() {
  const { user } = useAuth();
  const userRole = getUserRole(user);
  const isAdmin = userRole === "ADMIN";

  const [rules, setRules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedTier, setSelectedTier] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    customer_tier: "Bronze",
    category_id: "",
    max_discount_percent: "",
    risk_level: "NORMAL",
    is_active: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [catsRes, rulesRes] = await Promise.all([
        getCategories(),
        getDiscountRules(),
      ]);
      setCategories(catsRes.categories || []);
      setRules(rulesRes.discount_rules || []);
    } catch (err) {
      setErrorMsg("Failed to load discount matrix");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchRules = async () => {
    try {
      const params = {};
      if (selectedTier) params.customer_tier = selectedTier;
      if (selectedCategory) params.category_id = selectedCategory;

      const res = await getDiscountRules(params);
      setRules(res.discount_rules || []);
    } catch (err) {
      setErrorMsg("Failed to refresh rules");
    }
  };

  useEffect(() => {
    handleFetchRules();
  }, [selectedTier, selectedCategory]);

  const handleOpenCreateModal = () => {
    setEditingRule(null);
    setFormData({
      customer_tier: "Bronze",
      category_id: categories[0]?.id || "",
      max_discount_percent: "",
      risk_level: "NORMAL",
      is_active: true,
    });
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleOpenEditModal = (rule) => {
    setEditingRule(rule);
    setFormData({
      customer_tier: rule.customer_tier || "Bronze",
      category_id: rule.category_id || "",
      max_discount_percent: rule.max_discount_percent || "",
      risk_level: rule.risk_level || "NORMAL",
      is_active: rule.is_active ?? true,
    });
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    const payload = {
      ...formData,
      max_discount_percent: parseFloat(formData.max_discount_percent),
    };

    try {
      if (editingRule) {
        await updateDiscountRule(editingRule.id, payload);
        setSuccessMsg("Discount rule updated successfully");
      } else {
        await createDiscountRule(payload);
        setSuccessMsg("Discount rule created successfully");
      }
      setModalOpen(false);
      handleFetchRules();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Failed to save discount rule"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getTierBadgeVariant = (tier) => {
    switch (tier) {
      case "Gold":
        return "warning"; // golden style
      case "Silver":
        return "neutral";
      default:
        return "primary";
    }
  };

  const getRiskBadgeVariant = (risk) => {
    switch (risk) {
      case "FINANCE":
        return "danger";
      case "MANAGER":
        return "warning";
      default:
        return "success";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Success Banner */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-medium animate-in fade-in">
            {successMsg}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
              <Percent className="w-6 h-6 text-primary-600" />
              Discount Matrix & Risk Rules
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Tier-based maximum allowed discount percentages and escalation approval risk triggers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {!isAdmin && (
              <Badge variant="neutral" className="py-1 px-3">
                <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                Read-Only Access
              </Badge>
            )}
            {isAdmin && (
              <Button onClick={handleOpenCreateModal} className="gap-2">
                <Plus className="w-4 h-4" /> Add Discount Rule
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface p-4 rounded-2xl border border-border">
          <div>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="w-full px-4 py-2 bg-neutral-50 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-text-primary"
            >
              <option value="">All Customer Tiers</option>
              <option value="Bronze">Bronze Tier</option>
              <option value="Silver">Silver Tier</option>
              <option value="Gold">Gold Tier</option>
            </select>
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 bg-neutral-50 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-text-primary"
            >
              <option value="">All Product Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Rules Table */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-text-muted">
              Loading discount rules...
            </div>
          ) : rules.length === 0 ? (
            <div className="p-12 text-center text-text-muted">
              No discount rules found matching filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-neutral-50/50 text-xs font-semibold text-text-muted uppercase">
                    <th className="py-3.5 px-6">Customer Tier</th>
                    <th className="py-3.5 px-6">Product Category</th>
                    <th className="py-3.5 px-6">Max Discount</th>
                    <th className="py-3.5 px-6">Risk Level Trigger</th>
                    <th className="py-3.5 px-6">Status</th>
                    {isAdmin && <th className="py-3.5 px-6 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {rules.map((rule) => (
                    <tr
                      key={rule.id}
                      className="hover:bg-neutral-50/50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <Badge variant={getTierBadgeVariant(rule.customer_tier)}>
                          {rule.customer_tier} Tier
                        </Badge>
                      </td>
                      <td className="py-4 px-6 font-bold text-text-primary">
                        {rule.category_name}
                      </td>
                      <td className="py-4 px-6 font-bold text-emerald-700">
                        {rule.max_discount_percent}%
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={getRiskBadgeVariant(rule.risk_level)}>
                          {rule.risk_level}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <Badge
                          variant={rule.is_active ? "success" : "neutral"}
                        >
                          {rule.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      {isAdmin && (
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleOpenEditModal(rule)}
                            className="p-1.5 text-text-muted hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Edit Discount Rule"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Admin Create/Edit Rule Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRule ? "Edit Discount Rule" : "Add Discount Rule"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-danger-50 text-danger-700 text-sm font-medium border border-danger-200">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-primary uppercase mb-1">
                Customer Tier *
              </label>
              <select
                required
                value={formData.customer_tier}
                onChange={(e) =>
                  setFormData({ ...formData, customer_tier: e.target.value })
                }
                className="w-full p-3 bg-neutral-50 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="Bronze">Bronze Tier</option>
                <option value="Silver">Silver Tier</option>
                <option value="Gold">Gold Tier</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary uppercase mb-1">
                Product Category *
              </label>
              <select
                required
                value={formData.category_id}
                onChange={(e) =>
                  setFormData({ ...formData, category_id: e.target.value })
                }
                className="w-full p-3 bg-neutral-50 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-primary uppercase mb-1">
                Max Discount Percent (%) *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                required
                placeholder="e.g. 25.00"
                value={formData.max_discount_percent}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_discount_percent: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary uppercase mb-1">
                Risk Escalation Trigger *
              </label>
              <select
                value={formData.risk_level}
                onChange={(e) =>
                  setFormData({ ...formData, risk_level: e.target.value })
                }
                className="w-full p-3 bg-neutral-50 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="NORMAL">NORMAL (Auto Approve)</option>
                <option value="MANAGER">MANAGER (Manager Review)</option>
                <option value="FINANCE">FINANCE (Finance Escalation)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="rule_active_check"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
              className="w-4 h-4 text-primary-600 rounded-md border-border"
            />
            <label htmlFor="rule_active_check" className="text-sm font-semibold text-text-primary">
              Active Discount Rule
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Saving..."
                : editingRule
                ? "Update Rule"
                : "Create Rule"}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
