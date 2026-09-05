import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { ConfirmModal } from "../../components/ui/ConfirmModal";
import { Badge } from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";
import { ROLE_NAMES } from "../../constants/roles";
import {
  getPriceLists,
  getPriceListById,
  createPriceList,
  updatePriceList,
  addPriceListItem,
  deletePriceListItem,
  getProducts,
} from "../../api/catalog.api";
import {
  Receipt,
  Plus,
  Search,
  Edit3,
  Layers,
  Trash2,
  ShieldAlert,
} from "lucide-react";

import { getUserRole } from "../../utils/roleUtils";

export default function PriceListManagement() {
  const { user } = useAuth();
  const userRole = getUserRole(user);
  const isAdmin = userRole === "ADMIN";

  const [priceLists, setPriceLists] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modals
  const [listModalOpen, setListModalOpen] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [listFormData, setListFormData] = useState({
    name: "",
    currency: "INR",
    description: "",
    is_active: true,
  });

  // Items Drawer / Modal
  const [selectedList, setSelectedList] = useState(null);
  const [itemsModalOpen, setItemsModalOpen] = useState(false);
  const [itemAddModalOpen, setItemAddModalOpen] = useState(false);
  const [deleteItemConfirm, setDeleteItemConfirm] = useState({
    isOpen: false,
    itemId: null,
    loading: false,
  });
  const [itemFormData, setItemFormData] = useState({
    product_id: "",
    price: "",
    minimum_quantity: 1,
    maximum_quantity: "",
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
      const [listRes, prodRes] = await Promise.all([
        getPriceLists(),
        getProducts({ is_active: true }),
      ]);
      setPriceLists(listRes.price_lists || []);
      setProducts(prodRes.products || []);
    } catch (err) {
      setErrorMsg("Failed to load price lists");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenListModal = (list = null) => {
    setEditingList(list);
    setListFormData({
      name: list?.name || "",
      currency: list?.currency || "INR",
      description: list?.description || "",
      is_active: list?.is_active ?? true,
    });
    setErrorMsg("");
    setListModalOpen(true);
  };

  const handleSaveList = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");

    try {
      if (editingList) {
        await updatePriceList(editingList.id, listFormData);
        setSuccessMsg("Price list updated successfully");
      } else {
        await createPriceList(listFormData);
        setSuccessMsg("Price list created successfully");
      }
      setListModalOpen(false);
      fetchInitialData();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Failed to save price list"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Inspect / View Items
  const handleOpenItemsModal = async (list) => {
    try {
      const fullList = await getPriceListById(list.id);
      setSelectedList(fullList.price_list || fullList);
      setItemsModalOpen(true);
    } catch (err) {
      setErrorMsg("Failed to load price list items");
    }
  };

  const handleOpenAddItemModal = () => {
    setItemFormData({
      product_id: products[0]?.id || "",
      price: "",
      minimum_quantity: 1,
      maximum_quantity: "",
    });
    setErrorMsg("");
    setItemAddModalOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!selectedList) return;
    setSubmitting(true);
    setErrorMsg("");

    const payload = {
      product_id: itemFormData.product_id,
      price: parseFloat(itemFormData.price),
      minimum_quantity: parseFloat(itemFormData.minimum_quantity || 1),
      maximum_quantity: itemFormData.maximum_quantity
        ? parseFloat(itemFormData.maximum_quantity)
        : null,
    };

    try {
      await addPriceListItem(selectedList.id, payload);
      setSuccessMsg("Price item added successfully");
      setItemAddModalOpen(false);

      // Refresh items list
      const updatedList = await getPriceListById(selectedList.id);
      setSelectedList(updatedList.price_list || updatedList);
      fetchInitialData();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(
        err.response?.data?.message || "Failed to add price list item"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const promptDeleteItem = (itemId) => {
    setDeleteItemConfirm({
      isOpen: true,
      itemId,
      loading: false,
    });
  };

  const executeDeleteItem = async () => {
    if (!selectedList || !deleteItemConfirm.itemId) return;
    setDeleteItemConfirm((prev) => ({ ...prev, loading: true }));

    try {
      await deletePriceListItem(selectedList.id, deleteItemConfirm.itemId);
      setSuccessMsg("Item removed successfully");
      setDeleteItemConfirm({ isOpen: false, itemId: null, loading: false });
      const updatedList = await getPriceListById(selectedList.id);
      setSelectedList(updatedList.price_list || updatedList);
      fetchInitialData();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg("Failed to delete price item");
      setDeleteItemConfirm((prev) => ({ ...prev, loading: false }));
    }
  };

  const filteredLists = priceLists.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

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
              <Receipt className="w-6 h-6 text-primary-600" />
              Price Lists & Quantity Tiers
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Wholesale pricing, standard price lists, and volume discount tiers.
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
              <Button onClick={() => handleOpenListModal()} className="gap-2">
                <Plus className="w-4 h-4" /> Create Price List
              </Button>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="bg-surface p-4 rounded-2xl border border-border">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search price list name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        {/* Price Lists Table */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-text-muted">
              Loading price lists...
            </div>
          ) : filteredLists.length === 0 ? (
            <div className="p-12 text-center text-text-muted">
              No price lists found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-neutral-50/50 text-xs font-semibold text-text-muted uppercase">
                    <th className="py-3.5 px-6">Price List Name</th>
                    <th className="py-3.5 px-6">Currency</th>
                    <th className="py-3.5 px-6">Description</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {filteredLists.map((list) => (
                    <tr
                      key={list.id}
                      className="hover:bg-neutral-50/50 transition-colors"
                    >
                      <td className="py-4 px-6 font-bold text-text-primary">
                        {list.name}
                      </td>
                      <td className="py-4 px-6 font-mono text-text-secondary">
                        {list.currency}
                      </td>
                      <td className="py-4 px-6 text-text-secondary max-w-md truncate">
                        {list.description || "Standard wholesale price list"}
                      </td>
                      <td className="py-4 px-6">
                        <Badge
                          variant={list.is_active ? "success" : "neutral"}
                        >
                          {list.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenItemsModal(list)}
                          className="gap-1.5"
                        >
                          <Layers className="w-3.5 h-3.5 text-primary-600" />
                          View Items
                        </Button>

                        {isAdmin && (
                          <button
                            onClick={() => handleOpenListModal(list)}
                            className="p-1.5 text-text-muted hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors inline-flex items-center"
                            title="Edit Price List Header"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Admin Create/Edit Price List Modal */}
      <Modal
        isOpen={listModalOpen}
        onClose={() => setListModalOpen(false)}
        title={editingList ? "Edit Price List" : "Create Price List"}
      >
        <form onSubmit={handleSaveList} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-danger-50 text-danger-700 text-sm font-medium border border-danger-200">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-text-primary uppercase mb-1">
              Price List Name *
            </label>
            <Input
              type="text"
              required
              placeholder="e.g. Enterprise Wholesale 2026"
              value={listFormData.name}
              onChange={(e) =>
                setListFormData({ ...listFormData, name: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary uppercase mb-1">
              Currency
            </label>
            <Input
              type="text"
              required
              placeholder="INR"
              value={listFormData.currency}
              onChange={(e) =>
                setListFormData({
                  ...listFormData,
                  currency: e.target.value.toUpperCase(),
                })
              }
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary uppercase mb-1">
              Description
            </label>
            <textarea
              rows={3}
              placeholder="Price list details and target customer tiers..."
              value={listFormData.description}
              onChange={(e) =>
                setListFormData({
                  ...listFormData,
                  description: e.target.value,
                })
              }
              className="w-full p-3 bg-neutral-50 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="list_active_check"
              checked={listFormData.is_active}
              onChange={(e) =>
                setListFormData({
                  ...listFormData,
                  is_active: e.target.checked,
                })
              }
              className="w-4 h-4 text-primary-600 rounded-md border-border"
            />
            <label htmlFor="list_active_check" className="text-sm font-semibold text-text-primary">
              Active Price List
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setListModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting
                ? "Saving..."
                : editingList
                ? "Update Price List"
                : "Create Price List"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Inspect Items Modal */}
      {selectedList && (
        <Modal
          isOpen={itemsModalOpen}
          onClose={() => setItemsModalOpen(false)}
          title={`Items in ${selectedList.name}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-text-muted">
                Quantity-tiered unit prices for products under this price list.
              </p>
              {isAdmin && (
                <Button onClick={handleOpenAddItemModal} size="sm" className="gap-1.5">
                  <Plus className="w-4 h-4" /> Add Item Tier
                </Button>
              )}
            </div>

            {(!selectedList.items || selectedList.items.length === 0) ? (
              <div className="p-8 text-center text-text-muted bg-neutral-50 rounded-xl border border-border">
                No pricing items configured for this list yet.
              </div>
            ) : (
              <div className="overflow-x-auto border border-border rounded-xl">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-neutral-50 text-xs font-semibold text-text-muted border-b border-border uppercase">
                      <th className="py-3 px-4">Product</th>
                      <th className="py-3 px-4">SKU</th>
                      <th className="py-3 px-4">Min Qty</th>
                      <th className="py-3 px-4">Max Qty</th>
                      <th className="py-3 px-4">Tier Price (₹)</th>
                      {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedList.items.map((item) => (
                      <tr key={item.id} className="hover:bg-neutral-50/50">
                        <td className="py-3 px-4 font-bold text-text-primary">
                          {item.product_name}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-text-muted">
                          {item.product_sku}
                        </td>
                        <td className="py-3 px-4 font-semibold text-text-secondary">
                          {item.minimum_quantity}
                        </td>
                        <td className="py-3 px-4 text-text-muted">
                          {item.maximum_quantity ? item.maximum_quantity : "Unlimited"}
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-700">
                          ₹{Number(item.price).toLocaleString("en-IN")}
                        </td>
                        {isAdmin && (
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => promptDeleteItem(item.id)}
                              title="Remove Item"
                              className="p-1.5 text-text-muted hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
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

            <div className="flex justify-end pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setItemsModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Admin Add Price Item Tier Modal */}
      <Modal
        isOpen={itemAddModalOpen}
        onClose={() => setItemAddModalOpen(false)}
        title="Add Price Item Tier"
      >
        <form onSubmit={handleSaveItem} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-danger-50 text-danger-700 text-sm font-medium border border-danger-200">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-text-primary uppercase mb-1">
              Select Product *
            </label>
            <select
              required
              value={itemFormData.product_id}
              onChange={(e) =>
                setItemFormData({ ...itemFormData, product_id: e.target.value })
              }
              className="w-full p-3 bg-neutral-50 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (SKU: {p.sku}) — Base ₹{p.base_price}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary uppercase mb-1">
              Tier Unit Price (₹) *
            </label>
            <Input
              type="number"
              step="0.01"
              required
              placeholder="110000"
              value={itemFormData.price}
              onChange={(e) =>
                setItemFormData({ ...itemFormData, price: e.target.value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-primary uppercase mb-1">
                Minimum Qty *
              </label>
              <Input
                type="number"
                min="1"
                required
                value={itemFormData.minimum_quantity}
                onChange={(e) =>
                  setItemFormData({
                    ...itemFormData,
                    minimum_quantity: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary uppercase mb-1">
                Max Qty (Optional)
              </label>
              <Input
                type="number"
                min="1"
                placeholder="Leave blank for unlimited"
                value={itemFormData.maximum_quantity}
                onChange={(e) =>
                  setItemFormData({
                    ...itemFormData,
                    maximum_quantity: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setItemAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Add Tier Item"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Price Item Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteItemConfirm.isOpen}
        onClose={() => setDeleteItemConfirm({ isOpen: false, itemId: null, loading: false })}
        onConfirm={executeDeleteItem}
        title="Remove Price Tier Item"
        message="Are you sure you want to remove this product price tier from the price list?"
        confirmText="Remove Price Tier"
        variant="danger"
        loading={deleteItemConfirm.loading}
      />
    </DashboardLayout>
  );
}
