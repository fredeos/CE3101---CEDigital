import { useState, useEffect } from "react";
import api from "../Services/api";

function IniciarSemestre() {
  const [year, setYear] = useState("");
  const [period, setPeriod] = useState("");
  const [semestreCreado, setSemestreCreado] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const [cursos, setCursos] = useState([]);
  const [profesores, setProfesores] = useState([]);

  const [cursoSeleccionado, setCursoSeleccionado] = useState("");
  const [numeroGrupo, setNumeroGrupo] = useState("");
  const [profesoresSeleccionados, setProfesoresSeleccionados] = useState([]);

  // 1. Cargar cursos y profesores desde el backend
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const cursosRes = await api.get("/courses");
        setCursos(cursosRes.data);

        const profsRes = await api.get("/professors");
        setProfesores(profsRes.data);
      } catch (err) {
        console.error("❌ Error cargando datos:", err);
      }
    };
    cargarDatos();
  }, []);

  // 2. Crear Semestre
  const crearSemestre = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/semesters", {
        year: parseInt(year),
        period,
      });

      if (res.data && res.data.id) {
        setSemestreCreado(res.data);
        setMensaje("✅ Semestre creado con éxito.");
        console.log("Semestre creado:", res.data);
      } else {
        throw new Error("Respuesta inválida del backend.");
      }
    } catch (err) {
      console.error("❌ Error al crear semestre:", err);
      setMensaje("❌ Error al crear el semestre.");
    }
  };

  // 3. Crear grupo y asociar profesores
  const crearGrupo = async (e) => {
    e.preventDefault();

    if (!semestreCreado) {
      alert("⚠️ Primero debés crear un semestre.");
      return;
    }

    try {
  console.log("📦 Enviando al backend:", {
    CourseCode: cursoSeleccionado,
    Semester_ID: semestreCreado.id,
    Number: parseInt(numeroGrupo, 10),
  });

  const grupoRes = await api.post("/add/group", {
    ID:0,
    CourseCode: cursoSeleccionado,
    Semester_ID: semestreCreado.id,
    Number: parseInt(numeroGrupo, 10),
  });

      const grupoId = grupoRes.data.id;

      await Promise.all(
        profesoresSeleccionados.map((profId) =>
          api.post("/add/professor_to_a_group", {
            GroupID: grupoId,
            ProfessorIDCard: parseInt(profId),
          })
        )
      );

      alert("✅ Grupo y profesores asignados correctamente.");
      // Limpiar formulario
      setCursoSeleccionado("");
      setNumeroGrupo("");
      setProfesoresSeleccionados([]);
    } catch (err) {
      console.error("❌ Error al crear grupo:", err);
      alert("❌ Error al crear el grupo o asignar profesores.");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
      <h2>Inicializar Semestre</h2>

      {/* Formulario para crear semestre */}
      <form onSubmit={crearSemestre}>
        <h3>📅 Crear nuevo semestre</h3>

        <label>Año:</label>
        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          required
        />

        <label>Periodo:</label>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          required
        >
          <option value="">Seleccione</option>
          <option value="1">1 (Primer semestre)</option>
          <option value="2">2 (Segundo semestre)</option>
          <option value="V">V (Verano)</option>
        </select>

        <button type="submit">Crear Semestre</button>
        {mensaje && <p>{mensaje}</p>}
      </form>

      {/* Formulario para crear grupo */}
      {semestreCreado && (
        <form onSubmit={crearGrupo} style={{ marginTop: "2rem" }}>
          <h3>👥 Agregar grupo al semestre</h3>

          <label>Curso:</label>
          <select
            value={cursoSeleccionado}
            onChange={(e) => {
            setCursoSeleccionado(e.target.value);
            console.log("Curso seleccionado:", e.target.value);
          }}
          >
            <option value="">Seleccione un curso</option>
            {cursos.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>

          <label>Número de grupo:</label>
          <input
            type="text"
            value={numeroGrupo}
            onChange={(e) => setNumeroGrupo(e.target.value)}
            required
          />

          <label>Profesores asignados:</label>
          <select
            multiple
            size="5"
            value={profesoresSeleccionados}
            onChange={(e) =>
              setProfesoresSeleccionados(
                Array.from(e.target.selectedOptions, (opt) => opt.value)
              )
            }
            required
          >
            {profesores.map((p) => (
              <option key={p.idCard} value={p.idCard}>
                {p.firstName} {p.firstLastName}
              </option>
            ))}
          </select>

          <button type="submit">Agregar grupo</button>
        </form>
      )}
    </div>
  );
}

export default IniciarSemestre;
