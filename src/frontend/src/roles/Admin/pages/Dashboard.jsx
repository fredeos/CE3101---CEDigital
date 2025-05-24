import { useNavigate } from "react-router-dom";
import "../styles/DashboardAdmin.css";
import { useState } from "react";

function DashboardAdmin() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(true);

  const handleLogout = () => {
    
    navigate("/cedigital-admin");
  };

  return (
    <div className="dashboard-container">
      <aside className={`sidebar ${menuOpen ? "open" : "collapsed"}`}>
        <button className="toggle-btn" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
        <h2>CEDigital</h2>
        <ul>
          <li onClick={() => navigate("/cedigital-admin/micuenta")}>👤 Mi Cuenta</li>
          <li onClick={() => navigate("/cedigital-admin/cursos")}>📘 Gestión de Cursos</li>
          <li onClick={() => navigate("/cedigital-admin/semestre")}>🧮 Inicializar Semestre</li>
          <li onClick={() => navigate("/cedigital-admin/semestres")}>📆 Ver Semestres</li>
          <li className="logout" onClick={handleLogout}>🚪 Cerrar Sesión</li>
        </ul>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Bienvenido/a al panel del administrador</h1>
        </header>
        <p>Selecciona una opción del menú para comenzar.</p>
      </main>
    </div>
  );
}

export default DashboardAdmin;

