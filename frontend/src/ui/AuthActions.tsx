import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { clearStoredUser, getStoredUser } from "../auth/session";

export function AuthActions() {
  const navigate = useNavigate();
  const user = getStoredUser();

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <div className="rounded-full border border-steel-200 bg-white/70 px-4 py-2 text-sm shadow-panel">
        <span className="font-semibold text-steel-900">{user.name}</span>
        <span className="ml-2 uppercase tracking-[0.2em] text-steel-500">{user.role}</span>
      </div>
      <button
        type="button"
        onClick={() => {
          clearStoredUser();
          navigate("/login");
        }}
        className="inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-sm font-semibold text-steel-900 shadow-panel transition hover:bg-white"
      >
        <LogOut className="h-4 w-4" />
        Sign Out
      </button>
    </div>
  );
}

