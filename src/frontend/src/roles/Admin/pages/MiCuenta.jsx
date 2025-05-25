import { useEffect, useState } from "react";
import "../styles/MiCuenta.css"; 
import { useNavigate } from "react-router-dom";

function MiCuenta() {
  const [admin, setAdmin] = useState(null);

  const navigate = useNavigate();

const handleVolver = () => {
  navigate("/cedigital-admin/dashboard");
};

  useEffect(() => {
    const storedAdmin = JSON.parse(localStorage.getItem("admin"));
    if (storedAdmin) setAdmin(storedAdmin);
  }, []);

  if (!admin) return <p>Cargando información...</p>;

  return (
    <div className="mi-cuenta-container">

      <h2>👤 Mi Cuenta</h2>
      <p><strong>Nombre:</strong> {admin.firstName} {admin.firstLastName} {admin.secondLastName}</p>
      <p><strong>Correo:</strong> {admin.email}</p>
      <p><strong>Cédula:</strong> {admin.idCard}</p>

      <button className="volver" onClick={handleVolver}>
      ← Volver al Dashboard
      </button>

    </div>
  );
}

export default MiCuenta;
