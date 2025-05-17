import { lazy } from "react";

const LoginEstudiante = lazy(() => import("../roles/Estudiante/loginEstudiante/login_estudiante"));
//const DashboardProfessor = lazy(() => import("../roles/Profesor/pages/Dashboard"));

const estudianteRoutes = [
  {
    //path: "/dashboard",
    //element: <DashboardProfessor />,
  }
];

export default estudianteRoutes;