"use client"

import { useState, useEffect } from "react"

export function useProfessorAuth() {
  const [isLoading, setIsLoading] = useState(false)               // Estado para indicar si se está cargando
  const [error, setError] = useState(null)                        // Estado para manejar errores
  const [isAuthenticated, setIsAuthenticated] = useState(false)   // Estado para verificar si el usuario está autenticado
  const [professor, setProfessor] = useState(null)                // Estado para almacenar los datos del profesor autenticado

  /* Verifica si hay una sesión existente */
  useEffect(() => {

    checkAuth()

  }, [])

  /* Validacion de credenciales

  Se debe conectar a un servicio de autenticación en la API
  */
  const login = async (credentials) => {

    setIsLoading(true)    // Inicia el estado de carga
    setError(null)        // Resetea cualquier error previo

    try {

      // Aquí deberá ir la llamada a la funcion correspondiente de consulta a la API de services
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Aquí deberá ir la llamada a la funcion correspondiente de consulta a la API de services
      if (credentials.email === "example@profes.ce" && credentials.password === "1234") {

        // Datos para testear
        const professorData = {
          id: "t123",
          name: "Ms. Johnson",
          email: credentials.email,
          department: "Mathematics",
          role: "professor",
        }

        setProfessor(professorData)   // Almacena los datos del profesor
        setIsAuthenticated(true)      // Marca al usuario como autenticado

        // Almacena el token de autenticación o información de sesión en localStorage
        localStorage.setItem("professorAuth", JSON.stringify({
          token: "demo-token-xyz",
          professor: professorData,
        }))

        return { success: true, professor: professorData } // Retorna éxito y datos del profesor
      }

    } catch (err) {
      
      setError(err.message) // Maneja errores
      return { success: false, error: err.message } // Retorna el error

    } finally {

      setIsLoading(false) // Finaliza el estado de carga

    }
  }

  /* Limpieza de almacenamiento local
  */
  const logout = () => {

    localStorage.removeItem("professorAuth")  // Limpia todos los datos de autenticación de localStorage

    // Resetea todos los estados relacionados con la autenticación
    setProfessor(null)
    setIsAuthenticated(false)
    setError(null)

    // Mensaje de depuración
    console.log("El usuario cerró sesión exitosamente")

    return true

  }

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

    const storedAuth = localStorage.getItem("professorAuth")

    if (storedAuth) {

      try {

        const { professor: storedprofessor } = JSON.parse(storedAuth)     // Intenta parsear los datos almacenados
        setProfessor(storedprofessor)                                     // Establece los datos del profesor
        setIsAuthenticated(true)                                          // Marca al usuario como autenticado

        return true

      } catch (err) {

        logout() // Si hay un error al parsear los datos almacenados, los limpia
        return false

      }
    }

    return false

  }

  return {
    login,            // Función para iniciar sesión
    logout,           // Función para cerrar sesión
    checkAuth,        // Función para verificar autenticación
    isLoading,        // Estado de carga
    error,            // Estado de error
    isAuthenticated,  // Estado de autenticación
    professor,        // Datos del profesor autenticado
  }
}
