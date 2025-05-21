import { useState, useEffect } from "react";
import { useProfessorAuth } from "../hooks/useProfessorAuth";
import Notification from "../components/Notification";
import "../styles/Login.css";

function ProfessorLogin() {
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [notification, setNotification] = useState(null);
  const { login, isLoading, checkAuth } = useProfessorAuth();

  useEffect(() => {
    if (checkAuth()) {
      window.location.href = "/profesor-cursos";
    }
  }, []);

  const handleChange = (e) => {
    setCredentials((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(credentials);
    if (result.success) {
      setNotification({ type: "success", message: "¡Inicio de sesión exitoso!" });
      setTimeout(() => {
        window.location.href = "/profesor-cursos";
      }, 1200);
    } else {
      setNotification({ type: "error", message: result.error || "Credenciales no válidas." });
    }
  };

  return (
    <div className="login-container-profesor">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="login-card-profesor">
        <div className="login-header-profesor">
          <h1 className="login-title-profesor">CE Digital</h1>
        </div>

        <form className="login-form-profesor" onSubmit={handleSubmit}>
          <div className="form-group-profesor">
            <label htmlFor="email" className="form-label-profesor">
              Correo institucional
            </label>
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
            <label htmlFor="password" className="form-label-profesor">
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

          <div className="form-footer-profesor">
            <button type="submit" className="login-button-profesor" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
            <a className="forgot-password-profesor">¿Olvidó su contraseña?</a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProfessorLogin;