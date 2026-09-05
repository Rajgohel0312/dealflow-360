import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { getInvoices } from "../../api/invoices.api";
import {
  Receipt,
  Search,
  Eye,
  CreditCard,
  Building,
  Calendar,
  AlertCircle,
} from "lucide-react";

export default function InvoiceList() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await getInvoices();
      setInvoices(res.invoices || res || []);
    } catch (err) {
      setErrorMsg("Failed to load invoices queue");
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? inv.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "PAID":
        return <Badge variant="success">PAID</Badge>;
      case "PARTIALLY_PAID":
        return <Badge variant="primary">PARTIALLY PAID</Badge>;
      case "ISSUED":
        return <Badge variant="warning">ISSUED (UNPAID)</Badge>;
      case "OVERDUE":
        return <Badge variant="danger">OVERDUE</Badge>;
      default:
        return <Badge variant="neutral">DRAFT</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
              <Receipt className="w-7 h-7 text-primary-600" />
              Commercial Billing & Invoices
            </h1>
            <p className="text-text-muted text-sm mt-1">
              Manage financial invoices generated from fulfilled sales orders and track customer payment settlements.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-xl bg-danger-50 text-danger-800 border border-danger-200 text-sm font-medium">
            {errorMsg}
          </div>
        )}

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              type="text"
              placeholder="Search invoice #, order # or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-3 bg-surface rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">All Invoice Statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="ISSUED">ISSUED</option>
            <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
            <option value="PAID">PAID</option>
            <option value="OVERDUE">OVERDUE</option>
          </select>
        </div>

        {/* Invoice Table */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-text-muted">
              Loading commercial invoices...
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="p-12 text-center text-text-muted">
              No commercial invoices found. Generate invoices directly from Sales Orders!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50/50 text-xs font-semibold text-text-muted uppercase">
                    <th className="py-3.5 px-6">Invoice #</th>
                    <th className="py-3.5 px-6">Customer</th>
                    <th className="py-3.5 px-6">Order Ref</th>
                    <th className="py-3.5 px-6">Total Amount</th>
                    <th className="py-3.5 px-6">Paid / Outstanding</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-neutral-50/50">
                      <td className="py-4 px-6 font-bold text-text-primary font-mono">
                        {inv.invoice_number}
                      </td>
                      <td className="py-4 px-6 font-semibold text-text-primary">
                        {inv.customer_name}
                      </td>
                      <td className="py-4 px-6 font-mono text-primary-700 font-bold">
                        {inv.order_number}
                      </td>
                      <td className="py-4 px-6 font-bold text-emerald-700 font-mono">
                        ₹{Number(inv.total_amount).toLocaleString("en-IN")}
                      </td>
                      <td className="py-4 px-6 text-xs">
                        <span className="text-emerald-700 font-bold">
                          Paid: ₹{Number(inv.amount_paid).toLocaleString("en-IN")}
                        </span>
                        <span className="block text-amber-700 font-semibold">
                          Due: ₹{Number(inv.amount_due).toLocaleString("en-IN")}
                        </span>
                      </td>
                      <td className="py-4 px-6">{getStatusBadge(inv.status)}</td>
                      <td className="py-4 px-6 text-right">
                        <Link to={`/dashboard/invoices/${inv.id}`}>
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <Eye className="w-4 h-4" /> View Invoice
                          </Button>
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
    </DashboardLayout>
  );
}
