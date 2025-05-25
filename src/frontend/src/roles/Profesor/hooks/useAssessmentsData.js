import { useState, useEffect } from "react";

// Adapta la estructura de una tarea recibida del backend
function adaptAssignment(a, rubricId, courseCode, groupId) {
  return {
    id: a.id ?? a.ID,
    title: a.name ?? a.Name,
    itemId: rubricId,
    weight: a.percentage ?? a.Percentage,
    dueDate: (a.turninDate ?? a.TurninDate)?.slice(0, 19),
    description: "",
    isGroupAssessment: (a.individualFlag ?? a.IndividualFlag) === 1,
    courseCode,
    groupId,
    fileUrl: a.specification?.filePath ?? null,
    fileName: a.specification?.fileName ?? null,
    status: "active",
    createdAt: a.createdAt ?? null,
  };
}

// Construye el payload para crear/actualizar una evaluacion
function buildPayload(data, id = 0) {
  return {
    name: data.title,
    percentage: Number(data.weight),
    turninDate: data.dueDate.slice(0, 19),
    individualFlag: data.isGroupAssessment ? 1 : 0,
    rubricID: data.itemId
  };
}

// Funcion principal para manejar evaluaciones (conexiones con la API)
export function useAssessmentsData(courseCode, groupId) {
  const [assessments, setAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadFlag, setReloadFlag] = useState(false);

  // FunciOn para forzar recarga de datos
  const reload = () => setReloadFlag(flag => !flag);

  useEffect(() => {

    // Obtiene las evaluaciones del backend
    const fetchAssessments = async () => {
      if (!groupId) {
        setAssessments([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);

      // Obtiene los rubros del grupo
      try {
        const rubricsRes = await fetch(`http://localhost:5039/api/rubric/${groupId}`);

        if (!rubricsRes.ok)
          throw new Error("No se pudieron obtener los rubros");

        const rubrics = await rubricsRes.json();

        let allAssignments = [];

        // Por cada rubro, obtiene sus tareas
        for (const rubric of rubrics) {
          const rubricId = rubric.id ?? rubric.ID;
          const assignmentsRes = await fetch(`http://localhost:5039/api/assignments/by-rubric/${rubricId}`);

          if (!assignmentsRes.ok)
            continue;

          const assignments = await assignmentsRes.json();

          // Actualiza el estado con todas las tareas
          allAssignments = allAssignments.concat(assignments.map(a => adaptAssignment(a, rubricId, courseCode, groupId)));
        }
        setAssessments(allAssignments);
        setIsLoading(false);
      } catch {
        setError("Failed to load assessments");
        setIsLoading(false);
      }
    };
    fetchAssessments();
  }, [courseCode, groupId, reloadFlag]);

  // Agrega una nueva tarea
  const addAssessment = async (newAssessment) => {
    try {
      const payload = buildPayload(newAssessment);
      const response = await fetch("http://localhost:5039/api/add/assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const msg = await response.text();
        setError(msg);
        return { success: false, error: msg };
      }
      reload();
      return { success: true };
    } catch {
      setError("Failed to add assessment");
      return { success: false, error: "Failed to add assessment" };
    }
  };

  // Actualiza una tarea existente
  const updateAssessment = async (id, updatedData) => {
    try {
      const payload = buildPayload(updatedData, id);
      const response = await fetch(`http://localhost:5039/api/update/assignment/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const msg = await response.text();
        setError(msg);
        return { success: false, error: msg };
      }
      reload();
      return { success: true };
    } catch {
      setError("Failed to update assessment");
      return { success: false, error: "Failed to update assessment" };
    }
  };

  // Elimina una tarea
  const deleteAssessment = async (id) => {
    try {
      const response = await fetch(`http://localhost:5039/api/delete/assignment/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const msg = await response.text();
        setError(msg);
        return { success: false, error: msg };
      }
      reload();
      return { success: true };
    } catch {
      setError("Failed to delete assessment");
      return { success: false, error: "Failed to delete assessment" };
    }
  };

  // Sube un archivo de especificación para una tarea
  const uploadFile = async (file, groupId, assignmentId) => {

    if (!file || !groupId || !assignmentId)
      return { success: false, error: "Faltan datos" };

    const formData = new FormData();
    formData.append("spec_file", file);

    try {
      const response = await fetch(
        `http://localhost:5039/api/specifications/upload/${groupId}/${assignmentId}`,
        { method: "POST", body: formData }
      );
      if (!response.ok) {
        const msg = await response.text();
        return { success: false, error: msg };
      }
      return { success: true };
    } catch {
      return { success: false, error: "Error al subir el archivo" };
    }
  };

  // Devuelve la URL de descarga de la especificación y el nombre sugerido
  const getSpecificationDownloadUrl = (groupId, assignmentId) => {
    if (!groupId || !assignmentId) return null;
    return `http://localhost:5039/api/specifications/download/${groupId}/${assignmentId}/recent`;
  }

  // Retorna los datos y funciones principales del hook
  return {
    assessments,
    isLoading,
    error,
    addAssessment,
    updateAssessment,
    deleteAssessment,
    uploadFile,
    reload,
    getSpecificationDownloadUrl
  };
}