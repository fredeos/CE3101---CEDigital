import { lazy } from "react";
import MiCuenta from "../roles/Admin/pages/MiCuenta";

const DashboardAdmin = lazy(() => import("../roles/Admin/pages/Dashboard"));
const GestionCursos = lazy(() => import("../roles/Admin/pages/GestionCursos"));
const IniciarSemestre = lazy(() => import("../roles/Admin/pages/IniciarSemestre"));
const VerSemestres = lazy(() => import("../roles/Admin/pages/VerSemestres"));
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
  {
    path: "/cedigital-admin/semestres",
    element: <VerSemestres />,
  },
  {
    path: "/cedigital-admin/micuenta",
    element: <MiCuenta />,
  },
];

export default adminRoutes;
