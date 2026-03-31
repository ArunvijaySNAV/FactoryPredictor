import { Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-mesh-industrial font-body text-steel-900">
      <Outlet />
    </div>
  );
}
