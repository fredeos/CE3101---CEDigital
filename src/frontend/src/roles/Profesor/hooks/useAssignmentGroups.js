import { useState, useCallback } from "react";

const API_URL = "http://localhost:5039/api/add/assignment-groups"; // Cambia el puerto si es necesario

export default function useAssignmentGroups(assignmentId) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Obtener grupos por asignación
  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5039/api/add/assignment-groups/by-assignment/${assignmentId}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al obtener grupos");
      }
      const data = await res.json();
      setGroups(data);
    } catch (err) {
      setError(err.message);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  // Crear grupo
  const createGroup = useCallback(async ({ number, studentIDs }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5039/api/add/assignment-groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignmentID: assignmentId,
          number,
          studentIDs,
        }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al crear grupo");
      }
      const data = await res.json();
      await fetchGroups();
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [assignmentId, fetchGroups]);

  // Eliminar grupo
  const deleteGroup = useCallback(async (groupId) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:5039/api/add/assignment-groups/${groupId}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) {
        const errData = await res.json();
        throw new Error(errData.message || "Error al eliminar grupo");
      }
      await fetchGroups();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchGroups]);

  return {
    groups,
    loading,
    error,
    fetchGroups,
    createGroup,
    deleteGroup,
    setGroups,
  };
}