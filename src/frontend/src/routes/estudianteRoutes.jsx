import path from "path";
import { lazy } from "react";

const LoginEstudiante = lazy(() => import("../roles/Estudiante/loginEstudiante/login_estudiante"));
const InicioEstudiante = lazy(() => import("../roles/Estudiante/inicioEstudiante/inicio_estudiante"));
const DashboardCurso = lazy(() => import("../roles/Estudiante/dashboardCurso/dashboard_curso"));
const DocumentosCurso = lazy(() => import("../roles/Estudiante/documentosCurso/documentos_curso"));

const estudianteRoutes = [
  {
    path: "/inicio-estudiantes",
    element: <InicioEstudiante />,
  },
  {
    path: "/dashboard-curso-estudiantes",
    element: <DashboardCurso/>
  },
  {
    path: "/documentos-curso-estudiantes",
    element: <DocumentosCurso/>
  }
];

export default estudianteRoutes;