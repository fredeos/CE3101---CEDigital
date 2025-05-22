import { useEffect, useState } from "react";
import api from "../Services/api"
import "../styles/GestionCursos.css"; 

function GestionCursos() {
  const [cursos, setCursos] = useState([]);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    credits: "",
    career: "",
  });
  const [modoEdicion, setModoEdicion] = useState(false);

  useEffect(() => {
    cargarCursos();
  }, []);

  const cargarCursos = async () => {
    try {
      const res = await api.get("/courses");
      console.log("Cursos desde API:", res.data);
      setCursos(res.data);
    } catch (err) {
      console.error("Error al cargar cursos", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modoEdicion) {
        await api.put(`/modify/course/${formData.code}`, formData);
      } else {
        await api.post("/add/course", formData);
        console.log("Enviando:", formData);

      }
      setFormData({ Code: "", Name: "", Credits: "", Career: "" });
      setModoEdicion(false);
      cargarCursos();
    } catch (err) {
      alert("Hubo un error al guardar el curso.");
      console.error(err);
    }
  };

  const manejarEditar = (curso) => {
    setFormData(curso);
    setModoEdicion(true);
  };

  return (
    <div className="cursos-container">
      <h2>Gestión de Cursos</h2>

      <form className="curso-form" onSubmit={manejarSubmit}>
        <input
          name="code"
          placeholder="Código"
          value={formData.Code}
          onChange={handleChange}
          required
          disabled={modoEdicion}
        />
        <input
          name="name"
          placeholder="Nombre"
          value={formData.Name}
          onChange={handleChange}
          required
        />
        <input
          name="credits"
          placeholder="Créditos"
          type="number"
          value={formData.Credits}
          onChange={handleChange}
          required
        />
        <input
          name="career"
          placeholder="Carrera"
          value={formData.Career}
          onChange={handleChange}
          required
        />
        <button type="submit">
          {modoEdicion ? "Guardar cambios" : "Agregar curso"}
        </button>
      </form>

      <table className="tabla-cursos">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nombre</th>
            <th>Créditos</th>
            <th>Carrera</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cursos.map((curso) => (
            <tr key={curso.code}>
              <td>{curso.code}</td>
              <td>{curso.name}</td>
              <td>{curso.credits}</td>
              <td>{curso.career}</td>
              <td>
                <button onClick={() => manejarEditar(curso)}>✏️ Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default GestionCursos;
