import { lazy } from "react";

const LoginProfessor = lazy(() => import("../roles/Profesor/pages/Login"));
const DashboardProfessor = lazy(() => import("../roles/Profesor/pages/Dashboard"));

const professorRoutes = [
  {
    path: "/dashboard",
    element: <DashboardProfessor />,
  }
];

export default professorRoutes;