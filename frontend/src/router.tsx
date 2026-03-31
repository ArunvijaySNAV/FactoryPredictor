import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "./ui/ProtectedRoute";
import { AppLayout } from "./ui/AppLayout";
import { BossDashboardPage } from "./views/BossDashboardPage";
import { LandingPage } from "./views/LandingPage";
import { LoginPage } from "./views/LoginPage";
import { OperatorDashboardPage } from "./views/OperatorDashboardPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "login", element: <LoginPage /> },
      {
        path: "operator",
        element: (
          <ProtectedRoute role="operator">
            <OperatorDashboardPage />
          </ProtectedRoute>
        )
      },
      {
        path: "boss",
        element: (
          <ProtectedRoute role="boss">
            <BossDashboardPage />
          </ProtectedRoute>
        )
      }
    ]
  }
]);
