import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import Button from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { getQuotations } from "../../api/quotations.api";
import { getNegotiationsByQuotation } from "../../api/negotiations.api";
import { MessageSquare, Eye, Search, AlertTriangle, ShieldCheck, ArrowRight } from "lucide-react";

export default function NegotiationList() {
  const [negotiations, setNegotiations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchNegotiationLogs();
  }, []);

  const fetchNegotiationLogs = async () => {
    setLoading(true);
    try {
      // Fetch quotations first
      const qRes = await getQuotations();
      const quotationList = qRes.quotations || qRes || [];

      // Fetch negotiation audit history for each quotation
      const allNegs = [];
      await Promise.all(
        quotationList.map(async (q) => {
          try {
            const negRes = await getNegotiationsByQuotation(q.id);
            const list = negRes.negotiations || negRes || [];
            if (Array.isArray(list)) {
              list.forEach((n) => {
                allNegs.push({
                  ...n,
                  quotation_number: q.quotation_number,
                  customer_name: q.customer_name,
                  customer_tier: q.customer_tier,
                  sales_rep_name: q.sales_rep_name,
                  total_amount: q.total_amount,
                });
              });
            }
          } catch (e) {
            // Ignore if no negotiations for quotation
          }
        })
      );

      // Sort by created_at DESC
      allNegs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setNegotiations(allNegs);
    } catch (err) {
      console.error("Failed to load negotiation audit history", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return <Badge variant="success">APPROVED</Badge>;
      case "REJECTED":
        return <Badge variant="danger">REJECTED</Badge>;
      case "UNDER_REVIEW":
        return <Badge variant="warning">UNDER REVIEW</Badge>;
      default:
        return <Badge variant="primary">{status || "SUBMITTED"}</Badge>;
    }
  };

  const filtered = negotiations.filter((n) => {
    const term = search.toLowerCase();
    const matchesTerm =
      n.quotation_number?.toLowerCase().includes(term) ||
      n.customer_name?.toLowerCase().includes(term) ||
      n.reason?.toLowerCase().includes(term);
    const matchesStatus = statusFilter ? n.status === statusFilter : true;
    return matchesTerm && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-amber-600" />
              Commercial Deal Negotiations
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Audit log of customer discount re-negotiations, custom terms, and risk engine evaluations.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface p-4 rounded-2xl border border-border">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search by QTN #, customer or negotiation reason..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 bg-neutral-50 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 text-text-primary"
            >
              <option value="">All Negotiation Statuses</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="UNDER_REVIEW">UNDER REVIEW</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>
        </div>

        {/* Negotiations Table */}
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-text-muted">
              Loading deal negotiation records...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-text-muted">
              No negotiation audit records found. Click "Re-Negotiate Deal" on any quotation proposal to initiate custom pricing terms!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border bg-neutral-50/50 text-xs font-semibold text-text-muted uppercase">
                    <th className="py-3.5 px-6">Proposal #</th>
                    <th className="py-3.5 px-6">Customer & Tier</th>
                    <th className="py-3.5 px-6">Negotiation Reason / Note</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((neg) => (
                    <tr key={neg.id} className="hover:bg-neutral-50/50">
                      <td className="py-4 px-6 font-mono font-bold text-primary-700">
                        {neg.quotation_number}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-text-primary">
                          {neg.customer_name}
                        </div>
                        <div className="text-xs text-text-muted">
                          Tier: {neg.customer_tier || "Bronze"}
                        </div>
                      </td>
                      <td className="py-4 px-6 max-w-xs text-xs text-text-secondary italic">
                        "{neg.reason}"
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(neg.status)}
                      </td>
                      <td className="py-4 px-6 text-xs text-text-muted">
                        {new Date(neg.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link to={`/dashboard/quotations/${neg.quotation_id}`}>
                          <Button variant="outline" size="sm" className="gap-1.5">
                            <Eye className="w-3.5 h-3.5" /> View Proposal
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
