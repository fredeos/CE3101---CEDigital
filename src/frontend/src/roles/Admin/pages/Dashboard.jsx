import { useNavigate } from "react-router-dom";

function DashboardAdmin() {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Panel del Administrador</h2>
      <button onClick={() => navigate("/cedigital-admin/cursos")}>Gestión de Cursos</button>
      <button onClick={() => navigate("/cedigital-admin/semestre")}>Inicializar Semestre</button>
    </div>
  );
}

export default DashboardAdmin;
