import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Badge } from "../../components/ui/Badge";
import { Select } from "../../components/ui/Select";
import { useAuth } from "../../context/AuthContext";
import { ROLE_NAMES } from "../../constants/roles";

import {
  getProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../api/catalog.api";
import { Package, Plus, Search, Filter, Edit3, Trash2, ShieldAlert } from "lucide-react";

import { getUserRole } from "../../utils/roleUtils";

export default function ProductList() {
  const { user } = useAuth();
  const userRole = getUserRole(user);
  const isAdmin = userRole === "ADMIN";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'active', 'inactive'

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [deleteErrorMsg, setDeleteErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    category_id: "",
    name: "",
    sku: "",
    description: "",
    base_price: "",
    cost_price: "",
    unit: "unit",
    tax_rate: "0",
    product_type: "ONE_TIME",
    is_active: true,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [catsRes, prodsRes] = await Promise.all([
        getCategories(),
        getProducts(),
      ]);
      setCategories(catsRes.categories || []);
      setProducts(prodsRes.products || []);
    } catch (err) {
      setErrorMsg("Failed to load catalog data");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchProducts = async () => {
    try {
      const params = {};
      if (selectedCategory) params.category_id = selectedCategory;
      if (search) params.search = search;
      if (activeFilter !== "all") params.is_active = activeFilter === "active";

      const res = await getProducts(params);
      setProducts(res.products || []);
    } catch (err) {
      setErrorMsg("Failed to refresh product list");
    }
  };

  useEffect(() => {
    handleFetchProducts();
  }, [selectedCategory, activeFilter]);

  const handlePromptDelete = (prod) => {
    setDeleteConfirmItem(prod);
    setDeleteErrorMsg("");
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmItem) return;
    setDeleting(true);
    setDeleteErrorMsg("");
    try {
      await deleteProduct(deleteConfirmItem.id);
      setSuccessMsg(`Product '${deleteConfirmItem.name}' deleted successfully`);
      setDeleteConfirmItem(null);
      handleFetchProducts();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setDeleteErrorMsg(err.response?.data?.message || "Failed to delete product");
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      category_id: categories[0]?.id || "",
      name: "",
      sku: "",
      description: "",
      base_price: "",
      cost_price: "",
      unit: "unit",
      tax_rate: "0",
      product_type: "ONE_TIME",
      is_active: true,
    });
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleOpenEditModal = (prod) => {
    setEditingProduct(prod);
    setFormData({
      category_id: prod.category_id || "",
      name: prod.name || "",
      sku: prod.sku || "",
      description: prod.description || "",
      base_price: prod.base_price || "",
      cost_price: prod.cost_price || "",
      unit: prod.unit || "unit",
      tax_rate: prod.tax_rate || "0",
      product_type: prod.product_type || "ONE_TIME",
      is_active: prod.is_active ?? true,
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
      base_price: parseFloat(formData.base_price),
      cost_price: parseFloat(formData.cost_price),
      tax_rate: parseFloat(formData.tax_rate || 0),
    };

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
        setSuccessMsg("Product updated successfully");
      } else {
        await createProduct(payload);
        setSuccessMsg("Product created successfully");
      }
      setModalOpen(false);
      handleFetchProducts();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Failed to save product record"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

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
              <Package className="w-6 h-6 text-primary-600" />
              Products Catalog
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Master catalog items, base pricing, tax rates, and specifications.
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
                <Plus className="w-4 h-4" /> Add Product
              </Button>
            )}
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-surface p-4 rounded-2xl border border-border">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search product or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 bg-neutral-50 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-text-primary"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="w-full px-4 py-2 bg-neutral-50 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-text-primary"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Product Table */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-text-muted">
              Loading product catalog...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center text-text-muted">
              No products found matching filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-neutral-50/50 text-xs font-semibold text-text-muted uppercase">
                    <th className="py-3.5 px-6">SKU / Product</th>
                    <th className="py-3.5 px-6">Category</th>
                    <th className="py-3.5 px-6">Base Price</th>
                    <th className="py-3.5 px-6">Cost Price</th>
                    <th className="py-3.5 px-6">Type & Tax</th>
                    <th className="py-3.5 px-6">Status</th>
                    {isAdmin && <th className="py-3.5 px-6 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {filteredProducts.map((prod) => (
                    <tr
                      key={prod.id}
                      className="hover:bg-neutral-50/50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="font-bold text-text-primary">
                          {prod.name}
                        </div>
                        <div className="text-xs font-mono text-text-muted">
                          SKU: {prod.sku}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-text-secondary">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-neutral-100 text-text-secondary">
                          {prod.category_name || "Uncategorized"}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-emerald-700">
                        ₹{Number(prod.base_price).toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-6 text-text-muted">
                        ₹{Number(prod.cost_price).toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-6 text-xs text-text-secondary">
                        <div className="font-semibold">{prod.product_type}</div>
                        <div className="text-text-muted">Tax: {prod.tax_rate}%</div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge
                          variant={prod.is_active ? "success" : "neutral"}
                        >
                          {prod.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      {isAdmin && (
                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEditModal(prod)}
                            className="p-1.5 text-text-muted hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePromptDelete(prod)}
                            className="p-1.5 text-text-muted hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Modal for Admin Delete Confirmation */}
      <Modal
        isOpen={!!deleteConfirmItem}
        onClose={() => setDeleteConfirmItem(null)}
        title="Confirm Product Deletion"
      >
        <div className="space-y-4">
          {deleteErrorMsg && (
            <div className="p-4 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-sm font-semibold flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{deleteErrorMsg}</span>
            </div>
          )}

          <p className="text-sm text-text-secondary">
            Are you sure you want to permanently delete product{" "}
            <strong className="text-text-primary">{deleteConfirmItem?.name}</strong> (SKU: {deleteConfirmItem?.sku})?
          </p>
          <p className="text-xs text-text-muted">
            Note: Products referenced in existing quotations or active sales orders cannot be deleted due to relational database integrity rules.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmItem(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={deleting}
              onClick={handleConfirmDelete}
            >
              {deleting ? "Deleting..." : "Delete Product"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Admin Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? "Edit Catalog Product" : "Add Catalog Product"}
        maxWidth="max-w-2xl"
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
                Category *
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

            <div>
              <label className="block text-xs font-bold text-text-primary uppercase mb-1">
                SKU *
              </label>
              <Input
                type="text"
                required
                placeholder="e.g. LAP-DELL-XPS15"
                value={formData.sku}
                onChange={(e) =>
                  setFormData({ ...formData, sku: e.target.value })
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary uppercase mb-1">
              Product Name *
            </label>
            <Input
              type="text"
              required
              placeholder="e.g. Dell XPS 15 Workstation"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-primary uppercase mb-1">
                Base Price (₹) *
              </label>
              <Input
                type="number"
                step="0.01"
                required
                placeholder="120000"
                value={formData.base_price}
                onChange={(e) =>
                  setFormData({ ...formData, base_price: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary uppercase mb-1">
                Cost Price (₹) *
              </label>
              <Input
                type="number"
                step="0.01"
                required
                placeholder="90000"
                value={formData.cost_price}
                onChange={(e) =>
                  setFormData({ ...formData, cost_price: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-primary uppercase mb-1">
                Unit
              </label>
              <Input
                type="text"
                placeholder="unit / license"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary uppercase mb-1">
                Tax Rate (%)
              </label>
              <Input
                type="number"
                step="0.1"
                placeholder="18"
                value={formData.tax_rate}
                onChange={(e) =>
                  setFormData({ ...formData, tax_rate: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary uppercase mb-1">
                Product Type
              </label>
              <select
                value={formData.product_type}
                onChange={(e) =>
                  setFormData({ ...formData, product_type: e.target.value })
                }
                className="w-full p-3 bg-neutral-50 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="ONE_TIME">ONE_TIME</option>
                <option value="SUBSCRIPTION">SUBSCRIPTION</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary uppercase mb-1">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Product details & technical specifications..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-3 bg-neutral-50 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active_check"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData({ ...formData, is_active: e.target.checked })
              }
              className="w-4 h-4 text-primary-600 rounded-md border-border"
            />
            <label htmlFor="is_active_check" className="text-sm font-semibold text-text-primary">
              Active Catalog Product
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
                : editingProduct
                ? "Update Product"
                : "Create Product"}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
