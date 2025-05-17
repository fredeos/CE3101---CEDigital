import { lazy } from "react";

const DashboardAdmin = lazy(() => import("../roles/Admin/pages/Dashboard"));
const GestionCursos = lazy(() => import("../roles/Admin/pages/GestionCursos"));
const IniciarSemestre = lazy(() => import("../roles/Admin/pages/IniciarSemestre"));

const adminRoutes = [
  {
    path: "/cedigital-admin/dashboard",
    element: <DashboardAdmin />,
  },
  {
    path: "/cedigital-admin/cursos",
    element: <GestionCursos />,
  },
  {
    path: "/cedigital-admin/semestre",
    element: <IniciarSemestre />,
  },
];

export default adminRoutes;
