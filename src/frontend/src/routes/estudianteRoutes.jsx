import path from "path";
import { lazy } from "react";

const LoginEstudiante = lazy(() => import("../roles/Estudiante/loginEstudiante/login_estudiante"));
const InicioEstudiante = lazy(() => import("../roles/Estudiante/inicioEstudiante/inicio_estudiante"));
const DashboardCurso = lazy(() => import("../roles/Estudiante/dashboardCurso/dashboard_curso"));
const DocumentosCurso = lazy(() => import("../roles/Estudiante/documentosCurso/documentos_curso"));
const EvaluacionesCurso = lazy(() => import("../roles/Estudiante/evaluacionesCurso/evaluaciones_curso"))
const AsignacionCurso = lazy(() => import("../roles/Estudiante/asignacionCurso/asignacion_curso"))

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
  },
  {
    path: "/evaluaciones-curso-estudiantes",
    element: <EvaluacionesCurso/>
  },
  {
    path: "/asignacion-curso-estudiantes",
    element: <AsignacionCurso/>
  }
];

export default estudianteRoutes;