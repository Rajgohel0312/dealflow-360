import { useEffect, useState } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import Card from "../../components/ui/Card";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import { getSystemUsers, getSystemRoles, updateUserRole } from "../../api/admin.api";
import { useAuth } from "../../context/AuthContext";
import { getUserRole } from "../../utils/roleUtils";
import { Users, Shield, RefreshCw } from "lucide-react";

export default function UserManagement() {
  const { user } = useAuth();
  const userRole = getUserRole(user);
  const isAdmin = userRole === "ADMIN";

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState(null);

  const fetchUsersAndRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const [uRes, rRes] = await Promise.all([getSystemUsers(), getSystemRoles()]);
      setUsers(uRes.data || []);
      setRoles(rRes.data || []);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load system users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  const handleRoleChange = async (userId, newRoleId) => {
    try {
      setUpdatingId(userId);
      setError(null);
      await updateUserRole(userId, newRoleId);
      await fetchUsersAndRoles();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user role");
    } finally {
      setUpdatingId(null);
    }
  };


  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-3">
              <Users className="w-7 h-7 text-primary-600" />
              System Users Management
            </h1>
            <p className="text-sm text-text-secondary mt-1">
              View and manage portal user accounts and assigned roles across the organization.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchUsersAndRoles} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-danger-50 text-danger-700 text-sm font-medium">
            {error}
          </div>
        )}

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-secondary">
              <thead className="bg-neutral-50 text-text-primary font-semibold border-b border-border text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Assigned Role</th>
                  <th className="px-6 py-4">Joined Date</th>
                  {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="px-6 py-12 text-center text-text-muted">
                      Loading system users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="px-6 py-12 text-center text-text-muted">
                      No system users found.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-text-primary flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                          {u.name ? u.name[0].toUpperCase() : "U"}
                        </div>
                        {u.name}
                      </td>
                      <td className="px-6 py-4">{u.email}</td>
                      <td className="px-6 py-4">
                        <Badge variant="primary" className="font-semibold">
                          <Shield className="w-3 h-3 mr-1 inline" />
                          {u.role_name || "Employee"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-text-muted">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : "N/A"}
                      </td>
                      {isAdmin && (
                        <td className="px-6 py-4 text-right">
                          <select
                            value={u.role_id || ""}
                            disabled={updatingId === u.id}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border bg-surface text-text-primary shadow-xs focus:ring-2 focus:ring-primary-500"
                          >
                            <option value="" disabled>Change Role...</option>
                            {roles.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}
                              </option>
                            ))}
                          </select>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
