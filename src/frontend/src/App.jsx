import { Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';

import './App.css';

// Rutas de la vista profesor
import professorRoutes from './routes/professorRoutes';
import ProfessorLogin from './roles/Profesor/pages/Login';

// Rutas de la vista estudiante
import estudianteRoutes from './routes/estudianteRoutes';
import EstudianteLogin from './roles/Estudiante/loginEstudiante/login_estudiante';


function App() {
  return (

    <Routes>
      {/* Rutas de la vista del administrador*/}


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
      <Route path="/cedigital-estudiantes" element={<EstudianteLogin />} />
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