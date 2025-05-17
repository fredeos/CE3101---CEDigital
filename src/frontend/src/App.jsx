import { Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import LoadingFallback from './roles/Profesor/components/Fallback';
import './App.css';

import professorRoutes from './routes/professorRoutes';
import ProfessorHome from './roles/Profesor/pages/Home';
import ProfessorLogin from './roles/Profesor/pages/Login';

import adminRoutes from './routes/adminRoutes';
import AdminLogin from './roles/Admin/pages/LoginAdmin';


function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
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
        
        
      </Routes>
    </Suspense>
  );
}

export default App;