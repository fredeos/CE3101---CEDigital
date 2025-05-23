import { lazy } from "react";

const CourseSelection = lazy(() => import("../roles/Profesor/pages/Courses"));
const ProfessorDashboard = lazy(() => import("../roles/Profesor/pages/Dashboard"))

const professorRoutes = [
  {
    path: "/profesor-cursos",
    element: <CourseSelection />,
  },
  {
    path: "/gestion-grupo",
    element: <ProfessorDashboard />
  }
];

export default professorRoutes;