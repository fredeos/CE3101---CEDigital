"use client"

import { useState, useEffect } from "react"
import { useProfessorAuth } from "../hooks/useProfessorAuth"
import Notification from "../components/Notification"
import "../styles/Login.css"

/* Vista de login del profesor */
function ProfessorLogin() {
  
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  })
  
  const [notification, setNotification] = useState(null)
  const { login, isLoading, isAuthenticated, checkAuth } = useProfessorAuth()

  // Verifica si el usuario esta logueado para casos donde se refresca la página
  useEffect(() => {
    const isLoggedIn = checkAuth()
    if (isLoggedIn) {
      window.location.href = "/profesor-cursos" // Redireccionamiento al dashboard
    }
  }, [])

  // ...
  const handleChange = (e) => {
    const { name, value } = e.target
    setCredentials((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Manejo del envio de formulario
  const handleSubmit = async (e) => {
    e.preventDefault()

    const result = await login(credentials) // Llamada al hook de autenticacion del login

    console.log(result)

    if (result.success) {
      setNotification({type: "success", message: "¡Inicio de sesión exitoso!"}) // Login éxitoso

      // Redireccionamiento a dashboard después de iniciar sesión correctamente
      setTimeout(() => {
        window.location.href = "/profesor-cursos"   // Redireccionamiento al dashboard
      }, 1500)
    } else {
      setNotification({type: "error", message: result.error || "Credenciales no válidas. Inténtelo de nuevo."}) // Login érroneo
    }
  }

  // Manejo de notificación
  const closeNotification = () => {
    setNotification(null) // Cierra la notificación
  }

  return (
    <div className="login-container">
      {notification && (
        <Notification type={notification.type} message={notification.message} onClose={closeNotification} />
      )}

      {/* Login */}
      <div className="login-card">
        
        {/* Encabezado */}
        <div className="login-header">
          <h1 className="login-title">CE Digital</h1>
          <p className="login-subtitle">Ingrese sus credenciales para continuar</p>
        </div>
        
        {/* Emilinar este div - es para testear */}
        <div className="demo-info">
          <div className="demo-credentials">
            <p>
              <strong>Email:</strong> example@profes.ce
            </p>
            <p>
              <strong>Password:</strong> 1234
            </p>
          </div>
        </div>

        {/* Formula */}
        <form className="login-form" onSubmit={handleSubmit}>
          
          {/* Correo */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Correo institucional
            </label>
            <input
              id="email"
              type="email"
              name="email"
              className="form-input"
              value={credentials.email}
              onChange={handleChange}
              placeholder="example@profes.ce"
              required
            />
          </div>

          {/* Contraseña */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              name="password"
              className="form-input"
              value={credentials.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          {/* Botón de envío de formulario */}
          <div className="form-footer">
            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>

            <a href="#" className="forgot-password">
              ¿Olvidó su contraseña?
            </a>
          </div>
          
        </form>
      </div>
    </div>
  )
}

export default ProfessorLogin;