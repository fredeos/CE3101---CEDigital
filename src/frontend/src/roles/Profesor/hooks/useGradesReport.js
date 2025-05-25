import { useState } from "react";

// Manejar reportes de todos los estudiantes de un grupo
export function useStudentReports(groupId) {
  const [reports, setReports] = useState({});

  const fetchReport = async (studentId) => {
    setReports((old) => ({
      ...old,
      [studentId]: { rubrics: [], isLoading: true, error: null }
    }));
    try {
      const res = await fetch(`http://localhost:5039/api/assignments/group/${groupId}/student/${studentId}`);
      if (!res.ok) throw new Error("No se pudo obtener el reporte de notas");
      const data = await res.json();
      setReports((old) => ({
        ...old,
        [studentId]: { rubrics: data, isLoading: false, error: null }
      }));
    } catch (err) {
      setReports((old) => ({
        ...old,
        [studentId]: { rubrics: [], isLoading: false, error: err.message }
      }));
    }
  };

  return { reports, fetchReport };
}