import { useState, useEffect } from "react";

export function useProfessorAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [professor, setProfessor] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  // Funcion para verificar la autenticación del profesor
  const login = async (credentials) => {
    setIsLoading(true);
    setError(null);
    try {

      // Realiza la consulta a la API para autenticar al profesor
      const response = await fetch(
        `http://localhost:5039/api/login/professors/${encodeURIComponent(credentials.email)}/${encodeURIComponent(credentials.password)}`,
        {
          method: "GET",
          mode: "cors",
          headers: { "Content-Type": "application/json" },
        }
      );

      // Verifica si la respuesta es OK (exito)
      if (response.ok) {
        // Si la respuesta es OK, obtiene los datos del profesor
        const professorData = await response.json();
        setProfessor(professorData); 
        setIsAuthenticated(true); 
        localStorage.setItem("professorAuth", JSON.stringify({token: "demo-token-xyz", professor: professorData })); // Guarda los datos del profesor en el localStorage

        return { success: true, professor: professorData }; 

      } else {
        return { success: false, error: "Credenciales no válidas" };
      }

    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Funcion para limpiar los datos del profesor en el localStorage y simular cerrar sesion
  const logout = () => {
    localStorage.removeItem("professorAuth");
    setProfessor(null);
    setIsAuthenticated(false);
    setError(null);
    return true;
  };

  /* Verifica si el usuario ya está autenticado
  
  Flujo de verificación:

    1. Recupera datos de localStorage
    2. Si existen: Intenta parsear JSON
        Si es válido: 
          Actualiza estados
          Retorna true
      
        Si falla:
          Ejecuta logout (limpieza)
          Retorna false
    3. Si no existen datos, retorna false
  */
  const checkAuth = () => {
    const storedAuth = localStorage.getItem("professorAuth");
    if (storedAuth) {
      try {
        const { professor: storedprofessor } = JSON.parse(storedAuth);
        setProfessor(storedprofessor);
        setIsAuthenticated(true);
        return true;
      } catch {
        logout();
        return false;
      }
    }
    return false;
  };

  return {
    login,
    logout,
    checkAuth,
    isLoading,
    error,
    isAuthenticated,
    professor,
  };
}