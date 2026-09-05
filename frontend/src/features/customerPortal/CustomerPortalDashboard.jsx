import { useAuth } from "../../context/AuthContext";
import { Badge } from "../../components/ui/Badge";
import {
  Building2,
  User,
  ShieldCheck,
  LogOut,
  Mail,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CustomerPortalDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/customer/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 border-b border-border bg-surface px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-700 font-extrabold text-white shadow-md">
            D
          </div>
          <div>
            <h1 className="text-base font-extrabold text-text-primary">
              DealFlow360 Customer Portal
            </h1>
            <p className="text-xs text-text-muted">Customer Employee Account</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-success-50 text-success-700 border border-success-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Authenticated Session
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-surface hover:bg-danger-50 hover:text-danger-700 text-xs font-semibold text-text-secondary transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Log out
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full space-y-8">
        {/* Welcome Banner */}
        <div className="bg-surface p-8 rounded-2xl border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-text-primary tracking-tight">
                Welcome back, {user?.name || "Customer User"}!
              </h2>
              <Badge variant="primary">Customer Account</Badge>
            </div>
            <p className="text-sm text-text-secondary mt-2">
              Your account is active and verified. View your company profile details below.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-700 font-bold text-xl border border-primary-100">
              {user?.name ? user.name[0].toUpperCase() : "C"}
            </div>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employee Details Card */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="p-2.5 rounded-xl bg-primary-50 text-primary-600">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary">
                  Employee Account Info
                </h3>
                <p className="text-xs text-text-muted">Personal credentials</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-text-muted">Full Name</span>
                <span className="font-semibold text-text-primary">
                  {user?.name || "—"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border/60">
                <span className="text-text-muted">Email Address</span>
                <span className="font-semibold text-text-primary">
                  {user?.email || "—"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-text-muted">Security Status</span>
                <span className="inline-flex items-center gap-1 font-semibold text-success-700">
                  <ShieldCheck className="w-4 h-4" /> Password Verified
                </span>
              </div>
            </div>
          </div>

          {/* Account Security Card */}
          <div className="bg-surface p-6 rounded-2xl border border-border shadow-xs space-y-4">
            <div className="flex items-center gap-3 border-b border-border pb-4">
              <div className="p-2.5 rounded-xl bg-info-50 text-info-600">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary">
                  Account Support & Contact
                </h3>
                <p className="text-xs text-text-muted">
                  Sales representative assistance
                </p>
              </div>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              If you require account updates or permission modifications for your company profile, please get in touch with your assigned Sales Representative.
            </p>

            <div className="pt-2">
              <div className="p-4 rounded-xl bg-neutral-50 border border-border flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-700 flex-shrink-0" />
                <div>
                  <p className="text-xs font-bold text-text-primary">
                    Need Help?
                  </p>
                  <p className="text-xs text-text-muted">
                    Contact sales support for company modifications
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
