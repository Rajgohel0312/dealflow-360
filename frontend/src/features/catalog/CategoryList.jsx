import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Badge } from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";
import { ROLE_NAMES } from "../../constants/roles";
import {
  getCategories,
  createCategory,
  updateCategory,
} from "../../api/catalog.api";
import { getUserRole } from "../../utils/roleUtils";
import { Plus, Search, Tag, Edit3, ShieldAlert } from "lucide-react";

export default function CategoryList() {
  const { user } = useAuth();
  const userRole = getUserRole(user);
  const isAdmin = userRole === "ADMIN";

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data.categories || []);
    } catch (err) {
      setErrorMsg("Failed to load product categories");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "" });
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || "",
      description: cat.description || "",
    });
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, formData);
        setSuccessMsg("Category updated successfully");
      } else {
        await createCategory(formData);
        setSuccessMsg("Category created successfully");
      }
      setModalOpen(false);
      fetchCategories();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Failed to save category record"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Banner Alert */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-medium flex items-center justify-between animate-in fade-in">
            <span>{successMsg}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
              <Tag className="w-6 h-6 text-primary-600" />
              Product Categories
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Master catalog hierarchy and product classification categories.
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
                <Plus className="w-4 h-4" /> Add Category
              </Button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-4 bg-surface p-4 rounded-2xl border border-border">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search category by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        {/* Categories Table */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-text-muted">
              Loading categories...
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-12 text-center text-text-muted">
              No categories found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-neutral-50/50 text-xs font-semibold text-text-muted uppercase">
                    <th className="py-3.5 px-6">Category Name</th>
                    <th className="py-3.5 px-6">Description</th>
                    <th className="py-3.5 px-6">Created Date</th>
                    {isAdmin && <th className="py-3.5 px-6 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {filteredCategories.map((cat) => (
                    <tr
                      key={cat.id}
                      className="hover:bg-neutral-50/50 transition-colors"
                    >
                      <td className="py-4 px-6 font-semibold text-text-primary">
                        {cat.name}
                      </td>
                      <td className="py-4 px-6 text-text-secondary max-w-md truncate">
                        {cat.description || "—"}
                      </td>
                      <td className="py-4 px-6 text-text-muted">
                        {new Date(cat.created_at).toLocaleDateString()}
                      </td>
                      {isAdmin && (
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleOpenEditModal(cat)}
                            className="p-1.5 text-text-muted hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Edit Category"
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

      {/* Modal for Admin Create/Edit */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? "Edit Product Category" : "Add Product Category"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-danger-50 text-danger-700 text-sm font-medium border border-danger-200">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-text-primary uppercase mb-1">
              Category Name *
            </label>
            <Input
              type="text"
              required
              placeholder="e.g. Hardware, Cloud Software"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary uppercase mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Enter category description..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full p-3 bg-neutral-50 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
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
                : editingCategory
                ? "Update Category"
                : "Create Category"}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
