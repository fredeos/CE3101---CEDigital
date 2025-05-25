import { useState, useEffect } from "react";

export function useSubmissionsData(assessmentId) {

  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadFlag, setReloadFlag] = useState(false);

  // Permite recargar los datos manualmente
  const reload = () => setReloadFlag(flag => !flag);

  // Obtiene las entregas de una asignacion específica
  useEffect(() => {
    if (!assessmentId) {
      setSubmissions([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);

    fetch(`http://localhost:5039/api/AssignmentSubmission/${assessmentId}`)
      .then(res => {
        if (!res.ok)
          throw new Error("No se pudieron obtener las entregas");
        return res.json();
      })
      .then(data => setSubmissions(data))
      .catch(err => {
        setError(err.message);
        setSubmissions([]);
      })
      .finally(() => setIsLoading(false));
  }, [assessmentId, reloadFlag]);

  // Actualiza una entrega específica
  const updateSubmission = async (submissionId, { grade, commentary }) => {
    try {
      const response = await fetch(
        `http://localhost:5039/api/AssignmentSubmission/${submissionId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ grade, commentary }),
        }
      );
      if (!response.ok) {
        const msg = await response.text();
        setError(msg);
        return { success: false, error: msg };
      }
      reload();
      return { success: true };
    } catch {
      setError("Error al actualizar la entrega");
      return { success: false, error: "Error al actualizar la entrega" };
    }
  };

  // Cambia el estado de publicación de una entrega
  const updatePublishedFlag = async (submissionId, publishedFlag) => {
    try {
      const response = await fetch(
        `http://localhost:5039/api/AssignmentSubmission/${submissionId}/publish`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publishedFlag }),
        }
      );
      if (!response.ok) {
        const msg = await response.text();
        setError(msg);
        return { success: false, error: msg };
      }
      reload();
      return { success: true };
    } catch {
      setError("Error al actualizar publicación");
      return { success: false, error: "Error al actualizar publicación" };
    }
  };

  // Sube un archivo de retroalimentación
  const uploadFeedbackFile = async ({ file, groupId, assignmentId, submissionId }) => {
    if (!groupId || !assignmentId || !submissionId) {
      setError("Faltan datos para subir el archivo.");
      return { success: false, error: "Faltan datos para subir el archivo." };
    }
    const formData = new FormData();
    formData.append("feedback_file", file);

    try {
      const response = await fetch(
        `http://localhost:5039/api/feedbacks/upload/${groupId}/${assignmentId}/${submissionId}`,
        {
          method: "POST",
          body: formData,
        }
      );
      if (!response.ok) {
        const msg = await response.text();
        setError(msg);
        return { success: false, error: msg || "Error al subir el archivo." };
      }
      reload();
      return { success: true };
    } catch {
      setError("Error al subir el archivo.");
      return { success: false, error: "Error al subir el archivo." };
    }
  };

  // Devuelve el enlace de descarga de la solución
  const getSolutionDownloadUrl = (submittedFileId) => {
    if (!submittedFileId) return null;
    return `http://localhost:5039/api/submissions/download/${submittedFileId}`;
  };

  return {
    submissions,
    isLoading,
    error,
    reload,
    updateSubmission,
    updatePublishedFlag,
    uploadFeedbackFile,
    getSolutionDownloadUrl,
  };
}