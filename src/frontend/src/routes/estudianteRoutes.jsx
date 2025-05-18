import path from "path";
import { lazy } from "react";

const LoginEstudiante = lazy(() => import("../roles/Estudiante/loginEstudiante/login_estudiante"));
const InicioEstudiante = lazy(() => import("../roles/Estudiante/inicioEstudiante/inicio_estudiante"));
const DashboardCurso = lazy(() => import("../roles/Estudiante/dashboardCurso/dashboard_curso"));

const estudianteRoutes = [
  {
    path: "/inicio-Estudiantes",
    element: <InicioEstudiante />,
  },
  {
    path: "/dashboard-curso-Estudiantes",
    element: <DashboardCurso/>
  }
];

export default estudianteRoutes;