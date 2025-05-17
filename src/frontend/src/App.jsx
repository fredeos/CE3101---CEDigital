import { Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';

import './App.css';

import professorRoutes from './routes/professorRoutes';
import ProfessorHome from './roles/Profesor/pages/Home';
import ProfessorLogin from './roles/Profesor/pages/Login';

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
      

    </Routes>

  );
}

export default App;