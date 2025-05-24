import { useEffect, useState } from "react";
import api from "../Services/api";
import "../styles/VerSemestres.css"; 
import { useNavigate } from "react-router-dom";

function VerSemestres() {
  const [semestres, setSemestres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

const handleVolver = () => {
  navigate("/cedigital-admin/dashboard");
};

  useEffect(() => {
    const obtenerSemestres = async () => {
      try {
        const response = await api.get("/semesters");
        setSemestres(response.data);
      } catch (err) {
        console.error("❌ Error al obtener semestres:", err);
        setError("Error al cargar los semestres.");
      } finally {
        setLoading(false);
      }
    };

    obtenerSemestres();
  }, []);

  if (loading) return <p>Cargando semestres...</p>;
  if (error) return <p>{error}</p>;

  

  return (
    <div className="ver-semestres-container">
      <h2>📅 Lista de Semestres Registrados</h2>
      {semestres.length === 0 ? (
        <p>No hay semestres registrados.</p>
      ) : (
        <table className="semestres-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Año</th>
              <th>Periodo</th>
            </tr>
          </thead>
          <tbody>
            {semestres.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.year}</td>
                <td>{s.period}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button className="boton-volver" onClick={handleVolver}>
      ← Volver al Dashboard
      </button>

    </div>
  );
}

export default VerSemestres;
