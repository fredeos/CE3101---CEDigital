import { useNavigate } from "react-router-dom";
import "../styles/DashboardAdmin.css";  // Asegurate de crear este CSS

function DashboardAdmin() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-admin">
      <header className="dashboard-header">
        <h1>CEDigital</h1>
        <p>Bienvenido/a al panel del administrador</p>
      </header>

      <div className="dashboard-cards">
        <div className="dashboard-card" onClick={() => navigate("/cedigital-admin/cursos")}>
          <h3>📘 Gestión de Cursos</h3>
          <p>Visualiza, crea o deshabilita cursos del sistema.</p>
        </div>

        <div className="dashboard-card" onClick={() => navigate("/cedigital-admin/semestre")}>
          <h3>🧮 Inicializar Semestre</h3>
          <p>Configura los grupos, profesores y evaluaciones del semestre.</p>
        </div>
      </div>
    </div>
  );
}

export default DashboardAdmin;

