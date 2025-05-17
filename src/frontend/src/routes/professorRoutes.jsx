import { lazy } from "react";

const LoginProfessor = lazy(() => import("../roles/Profesor/pages/Login"));
const CourseSelection = lazy(() => import("../roles/Profesor/pages/Courses"));
const ProfessorDashboard = lazy(() => import("../roles/Profesor/pages/Dashboard"))
const ProfessorHome = lazy(() => import("../roles/Profesor/pages/Home"));

const professorRoutes = [
  {
    path: "/profesor-cursos",
    element: <CourseSelection />,
  },
  {
    path: "/gestion-grupo",
    element: <ProfessorDashboard />
  },
  {
    path: "/cedigital-estudiantes",
    element: <ProfessorHome />,
  }
];

export default professorRoutes;