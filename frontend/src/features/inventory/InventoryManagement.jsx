import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { Badge } from "../../components/ui/Badge";
import {
  getWarehouses,
  createWarehouse,
  getInventory,
  addStock,
  getMovements,
} from "../../api/inventory.api";
import { getProducts } from "../../api/catalog.api";
import {
  Boxes,
  Building,
  Plus,
  ArrowRightLeft,
  Search,
  Package,
  Layers,
  History,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

export default function InventoryManagement() {
  const [activeTab, setActiveTab] = useState("stock"); // 'stock' | 'warehouses' | 'movements'

  // Data States
  const [warehouses, setWarehouses] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [movements, setMovements] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState("");

  // Modal States
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false);
  const [whFormData, setWhFormData] = useState({ name: "", code: "", location: "" });

  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockFormData, setStockFormData] = useState({
    product_id: "",
    warehouse_id: "",
    quantity: 10,
    reference_reason: "RESTOCK_RECEIPT",
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const [whRes, invRes, movRes, prodRes] = await Promise.all([
        getWarehouses(),
        getInventory(),
        getMovements(),
        getProducts({ is_active: true }),
      ]);

      const whList = whRes.warehouses || whRes || [];
      setWarehouses(whList);
      setInventory(invRes.inventory || invRes || []);
      setMovements(movRes.movements || movRes || []);
      const prodList = prodRes.products || prodRes || [];
      setProducts(prodList);

      if (whList.length > 0 && !stockFormData.warehouse_id) {
        setStockFormData((prev) => ({ ...prev, warehouse_id: whList[0].id }));
      }
      if (prodList.length > 0 && !stockFormData.product_id) {
        setStockFormData((prev) => ({ ...prev, product_id: prodList[0].id }));
      }
    } catch (err) {
      setErrorMsg("Failed to load inventory data");
    } finally {
      setLoading(false);
    }
  };

  // Add Warehouse Handler
  const handleCreateWarehouse = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    try {
      await createWarehouse(whFormData);
      setSuccessMsg("Warehouse location created successfully");
      setWarehouseModalOpen(false);
      setWhFormData({ name: "", code: "", location: "" });
      fetchData();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to create warehouse");
    } finally {
      setSubmitting(false);
    }
  };

  // Add Stock Handler
  const handleAddStock = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    try {
      await addStock({
        product_id: stockFormData.product_id,
        warehouse_id: stockFormData.warehouse_id,
        quantity: parseFloat(stockFormData.quantity),
        reference_reason: stockFormData.reference_reason,
      });
      setSuccessMsg("Stock receipt recorded successfully");
      setStockModalOpen(false);
      fetchData();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to receive stock");
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered Stock Items
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product_sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.warehouse_name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesWh = selectedWarehouseFilter
      ? item.warehouse_id === selectedWarehouseFilter
      : true;

    return matchesSearch && matchesWh;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
              <Boxes className="w-7 h-7 text-primary-600" />
              Inventory & Warehouse Management
            </h1>
            <p className="text-text-muted text-sm mt-1">
              Monitor physical stock balances, warehouse storage locations, and automated audit movements.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setWhFormData({ name: "", code: "", location: "" });
                setWarehouseModalOpen(true);
              }}
              className="gap-2"
            >
              <Building className="w-4 h-4" /> Add Warehouse
            </Button>
            <Button
              onClick={() => {
                setStockModalOpen(true);
              }}
              className="gap-2 bg-emerald-700 hover:bg-emerald-800"
            >
              <Plus className="w-4 h-4" /> Receive Stock
            </Button>
          </div>
        </div>

        {/* Banners */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-sm font-medium animate-in fade-in">
            {successMsg}
          </div>
        )}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-danger-50 text-danger-800 border border-danger-200 text-sm font-medium animate-in fade-in">
            {errorMsg}
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-border">
          <button
            onClick={() => setActiveTab("stock")}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "stock"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            <Package className="w-4 h-4" /> Stock Balances ({inventory.length})
          </button>
          <button
            onClick={() => setActiveTab("warehouses")}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "warehouses"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            <Building className="w-4 h-4" /> Warehouses ({warehouses.length})
          </button>
          <button
            onClick={() => setActiveTab("movements")}
            className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === "movements"
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            <History className="w-4 h-4" /> Movement Audit Trail ({movements.length})
          </button>
        </div>

        {/* TAB 1: STOCK BALANCES */}
        {activeTab === "stock" && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <Input
                  type="text"
                  placeholder="Search product, SKU or warehouse..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <select
                value={selectedWarehouseFilter}
                onChange={(e) => setSelectedWarehouseFilter(e.target.value)}
                className="p-3 bg-surface rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">All Warehouses</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Table */}
            <div className="bg-surface rounded-2xl border border-border overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-text-muted">
                  Loading physical inventory levels...
                </div>
              ) : filteredInventory.length === 0 ? (
                <div className="p-12 text-center text-text-muted">
                  No stock records match your query. Click "+ Receive Stock" to record inventory arrival.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-border bg-neutral-50/50 text-xs font-semibold text-text-muted uppercase">
                        <th className="py-3.5 px-6">Product / SKU</th>
                        <th className="py-3.5 px-6">Warehouse</th>
                        <th className="py-3.5 px-6">On Hand</th>
                        <th className="py-3.5 px-6">Reserved</th>
                        <th className="py-3.5 px-6 font-bold">Available Balance</th>
                        <th className="py-3.5 px-6">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredInventory.map((item) => {
                        const available = Number(item.quantity_available);
                        const isLow = available <= 5;
                        return (
                          <tr key={item.id} className="hover:bg-neutral-50/50">
                            <td className="py-4 px-6">
                              <div className="font-bold text-text-primary">
                                {item.product_name}
                              </div>
                              <div className="text-xs font-mono text-text-muted">
                                SKU: {item.product_sku}
                              </div>
                            </td>
                            <td className="py-4 px-6 text-text-secondary text-xs">
                              <span className="font-semibold text-text-primary">
                                {item.warehouse_name}
                              </span>
                              <span className="block text-text-muted font-mono">
                                ({item.warehouse_code})
                              </span>
                            </td>
                            <td className="py-4 px-6 font-bold text-text-primary">
                              {item.quantity_on_hand}
                            </td>
                            <td className="py-4 px-6 text-amber-700 font-semibold">
                              {item.quantity_reserved}
                            </td>
                            <td className="py-4 px-6 font-extrabold text-emerald-700 text-base">
                              {available}
                            </td>
                            <td className="py-4 px-6">
                              {isLow ? (
                                <Badge variant="warning" className="gap-1">
                                  <AlertTriangle className="w-3 h-3" /> Low Stock
                                </Badge>
                              ) : (
                                <Badge variant="success">In Stock</Badge>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: WAREHOUSES */}
        {activeTab === "warehouses" && (
          <div className="bg-surface rounded-2xl border border-border overflow-hidden">
            {warehouses.length === 0 ? (
              <div className="p-12 text-center text-text-muted">
                No warehouses configured yet. Click "Add Warehouse" above to setup your primary location.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-neutral-50/50 text-xs font-semibold text-text-muted uppercase">
                      <th className="py-3.5 px-6">Warehouse Name</th>
                      <th className="py-3.5 px-6">Code</th>
                      <th className="py-3.5 px-6">Location</th>
                      <th className="py-3.5 px-6">Created At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {warehouses.map((wh) => (
                      <tr key={wh.id} className="hover:bg-neutral-50/50">
                        <td className="py-4 px-6 font-bold text-text-primary flex items-center gap-2">
                          <Building className="w-4 h-4 text-primary-600" />
                          {wh.name}
                        </td>
                        <td className="py-4 px-6 font-mono font-bold text-primary-700">
                          {wh.code}
                        </td>
                        <td className="py-4 px-6 text-text-secondary">
                          {wh.location || "N/A"}
                        </td>
                        <td className="py-4 px-6 text-text-muted text-xs">
                          {new Date(wh.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MOVEMENT AUDIT TRAIL */}
        {activeTab === "movements" && (
          <div className="bg-surface rounded-2xl border border-border overflow-hidden">
            {movements.length === 0 ? (
              <div className="p-12 text-center text-text-muted">
                No stock movement events logged yet. Movements automatically log when stock is received, reserved, or issued.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-neutral-50/50 text-xs font-semibold text-text-muted uppercase">
                      <th className="py-3.5 px-6">Timestamp</th>
                      <th className="py-3.5 px-6">Movement Type</th>
                      <th className="py-3.5 px-6">Product / SKU</th>
                      <th className="py-3.5 px-6">Warehouse</th>
                      <th className="py-3.5 px-6">Quantity</th>
                      <th className="py-3.5 px-6">Reference / Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {movements.map((mov) => (
                      <tr key={mov.id} className="hover:bg-neutral-50/50">
                        <td className="py-4 px-6 text-xs font-mono text-text-muted">
                          {new Date(mov.created_at).toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <Badge
                            variant={
                              mov.movement_type === "RECEIPT"
                                ? "success"
                                : mov.movement_type === "RESERVATION"
                                ? "warning"
                                : "danger"
                            }
                          >
                            {mov.movement_type}
                          </Badge>
                        </td>
                        <td className="py-4 px-6 font-bold text-text-primary">
                          {mov.product_name || "Product"}
                        </td>
                        <td className="py-4 px-6 text-text-secondary text-xs">
                          {mov.warehouse_name || "Main Warehouse"}
                        </td>
                        <td className="py-4 px-6 font-mono font-extrabold text-text-primary">
                          {mov.movement_type === "RECEIPT" ? `+${mov.quantity}` : `-${mov.quantity}`}
                        </td>
                        <td className="py-4 px-6 text-text-muted text-xs font-mono">
                          {mov.reference_reason || "System Transaction"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Warehouse Modal */}
      <Modal
        isOpen={warehouseModalOpen}
        onClose={() => setWarehouseModalOpen(false)}
        title="Add Warehouse Location"
      >
        <form onSubmit={handleCreateWarehouse} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-primary uppercase mb-1">
              Warehouse Name *
            </label>
            <Input
              required
              placeholder="e.g. Central Logistics Hub"
              value={whFormData.name}
              onChange={(e) => setWhFormData({ ...whFormData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-primary uppercase mb-1">
                Warehouse Code *
              </label>
              <Input
                required
                placeholder="e.g. WH-MAIN"
                value={whFormData.code}
                onChange={(e) =>
                  setWhFormData({ ...whFormData, code: e.target.value.toUpperCase() })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-text-primary uppercase mb-1">
                City / Location
              </label>
              <Input
                placeholder="e.g. Mumbai"
                value={whFormData.location}
                onChange={(e) => setWhFormData({ ...whFormData, location: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setWarehouseModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Create Warehouse"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Receive Stock Modal */}
      <Modal
        isOpen={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        title="Record Stock Receipt (Restock)"
      >
        <form onSubmit={handleAddStock} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-text-primary uppercase mb-1">
              Target Warehouse *
            </label>
            <select
              required
              value={stockFormData.warehouse_id}
              onChange={(e) =>
                setStockFormData({ ...stockFormData, warehouse_id: e.target.value })
              }
              className="w-full p-3 bg-neutral-50 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">Select Warehouse</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-primary uppercase mb-1">
              Select Product *
            </label>
            <select
              required
              value={stockFormData.product_id}
              onChange={(e) =>
                setStockFormData({ ...stockFormData, product_id: e.target.value })
              }
              className="w-full p-3 bg-neutral-50 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (SKU: {p.sku})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-primary uppercase mb-1">
                Units Received *
              </label>
              <Input
                type="number"
                min="1"
                required
                value={stockFormData.quantity}
                onChange={(e) =>
                  setStockFormData({ ...stockFormData, quantity: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text-primary uppercase mb-1">
                Reference / PO #
              </label>
              <Input
                placeholder="e.g. PO-88392"
                value={stockFormData.reference_reason}
                onChange={(e) =>
                  setStockFormData({ ...stockFormData, reference_reason: e.target.value })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStockModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="bg-emerald-700 hover:bg-emerald-800">
              {submitting ? "Processing..." : "Add Stock to Inventory"}
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
