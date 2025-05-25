import { useState, useEffect } from "react";
import { useProfessorAuth } from "../hooks/useProfessorAuth";
import Notification from "../components/Notification";
import "../styles/Login.css";

function ProfessorLogin() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [notification, setNotification] = useState(null);
  const { login, checkAuth } = useProfessorAuth();

  // Si el inicio de sesion es correcto lo redirige
  useEffect(() => {
    if (checkAuth()) {
      window.location.href = "/profesor-cursos";
    }
  }, []);

  // Gestiona los cambios en las entradas de datos
  const handleChange = (e) => {
    setCredentials((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    console.log()
  };

  //  Gestiona el envio del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(credentials); // Obtiene la respuesta del backend
    if (result.success) {
      setNotification({ type: "success", message: "¡Inicio de sesión exitoso!" });
      setTimeout(() => { window.location.href = "/profesor-cursos";}, 1000);
    } else {
      setNotification({ type: "error", message: result.error || "Credenciales no válidas." });
    }
  };

  // Render principal del log in
  return (
    <div className="login-container-profesor">

      {/* Notificacion de inicio de sesion */}
      {notification && (
        <Notification type={notification.type} message={notification.message} onClose={() => setNotification(null)} />
      )}

      <div className="login-card-profesor">

        {/* Encabezado del inicio de sesion */}
        <div className="login-header-profesor">
          <h1 className="login-title-profesor">CE Digital</h1>
        </div>

        {/* Formulario del inicio de sesion */}
        <form className="login-form-profesor" onSubmit={handleSubmit}>
          <div className="form-group-profesor">
            <label htmlFor="email"> Correo institucional </label>
            <input
              id="email"
              type="email"
              name="email"
              className="form-input-profesor"
              value={credentials.email}
              onChange={handleChange}
              placeholder="example@itcr.ac.cr"
              required
            />
          </div>

          <div className="form-group-profesor">
            <label htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              name="password"
              className="form-input-profesor"
              value={credentials.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="login-button-profesor">
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfessorLogin;