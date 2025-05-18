import { lazy } from "react";

const LoginEstudiante = lazy(() => import("../roles/Estudiante/loginEstudiante/login_estudiante"));
const InicioEstudiante = lazy(() => import("../roles/Estudiante/inicioEstudiante/inicio_estudiante"));

const estudianteRoutes = [
  {
    path: "/inicio-Estudiantes",
    element: <InicioEstudiante />,
  }
];

export default estudianteRoutes;