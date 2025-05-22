import { useState, useEffect } from "react";
import api from "../Services/api";
import "../styles/IniciarSemestre.css"; 

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

  const [estudiantes, setEstudiantes] = useState([]);
  const [grupoIdSeleccionado, setGrupoIdSeleccionado] = useState(null);
  const [estudiantesSeleccionados, setEstudiantesSeleccionados] = useState([]);


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
        alert("✅ Semestre creado con éxito.");
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
      alert("⚠️ Primero se debe crear un semestre.");
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
      setGrupoIdSeleccionado(grupoId);


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

  useEffect(() => {
  const cargarEstudiantes = async () => {
    try {
      const res = await api.get("/students"); 
      setEstudiantes(res.data);
    } catch (err) {
      console.error("Error cargando estudiantes", err);
    }
  };
  cargarEstudiantes();
}, []);

  const handleMatricularEstudiantes = async (e) => {
  e.preventDefault();
  try {
    await Promise.all(
      estudiantesSeleccionados.map((id) =>
        api.post("/add/student_to_a_group", {
          GroupID: grupoIdSeleccionado,
          StudentID: parseInt(id),
        })
      )
    );
    alert("✅ Estudiantes matriculados correctamente");
    setEstudiantesSeleccionados([]);
  } catch (err) {
    console.error("❌ Error al matricular estudiantes", err);
    alert("❌ Error al matricular estudiantes");
  }
};



  return (
    <div className="iniciar-semestre-container">
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
          <option value="3">V (Verano)</option>
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

    {grupoIdSeleccionado && (
      <form onSubmit={handleMatricularEstudiantes}>
        <h3>Matricular Estudiantes al Grupo #{grupoIdSeleccionado}</h3>

        <label>Estudiantes:</label>
        <select
          multiple
          value={estudiantesSeleccionados}
          onChange={(e) =>
            setEstudiantesSeleccionados(
              Array.from(e.target.selectedOptions, (opt) => opt.value)
            )
          }
      >
          {estudiantes.map((est) => (
            <option key={est.studentID} value={est.studentID}>
              {est.firstLastName} {est.secondLastName} {est.firstName}
            </option>
          ))}
        </select>

        <button type="submit">Matricular</button>
      </form>
    )}

    </div>
  );
}

export default IniciarSemestre;
