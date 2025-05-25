import { Routes, Route } from 'react-router-dom';

import './App.css';

// Rutas de la vista profesor
import professorRoutes from './routes/professorRoutes';
import ProfessorLogin from './roles/Profesor/pages/Login';

// Rutas de la vista estudiante
import estudianteRoutes from './routes/estudianteRoutes';
import EstudianteLogin from './roles/Estudiante/loginEstudiante/login_estudiante';

// Rutas de la vista admin
import adminRoutes from './routes/adminRoutes';
import AdminLogin from './roles/Admin/pages/LoginAdmin';


function App() {
  return (

    <Routes>
      {/* Login administrador */}
        <Route path="/cedigital-admin" element={<AdminLogin />} />
        {adminRoutes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}


      {/* Rutas de la vista del profesor (ProfessorHome)*/}
      <Route path="/cedigital-profesores" element={<ProfessorLogin />} />
      {professorRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={route.element}
        />
      ))}

      {/* Rutas de la vista del estudiante*/}
      <Route path="/cedigital-login-estudiantes" element={<EstudianteLogin />} />
      {estudianteRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={route.element}
        />
      ))}
        
    </Routes>
  );
}

export default App;