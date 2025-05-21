import { useState, useEffect } from "react"

export function useAssessmentsData(courseCode, groupId) {
  const [assessments, setAssessments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reloadFlag, setReloadFlag] = useState(false)

  const reload = () => {
    setReloadFlag(flag => !flag)
  }
  // Obtener evaluaciones por rubro
  useEffect(() => {

    const fetchAssessments = async () => {
      if (!groupId) {
        setAssessments([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        // Obtener todos los rubros del grupo
        const rubricsRes = await fetch(`http://localhost:5039/api/rubric/${groupId}`)
        if (!rubricsRes.ok) throw new Error("No se pudieron obtener los rubros")
        const rubrics = await rubricsRes.json()

        // Obtener todas las asignaciones de cada rubro
        let allAssignments = []
        for (const rubric of rubrics) {
          const rubricId = rubric.id ?? rubric.ID
          const assignmentsRes = await fetch(`http://localhost:5039/api/assignments/by-rubric/${rubricId}`)
          if (!assignmentsRes.ok) continue
          const assignments = await assignmentsRes.json()
          // Adaptar cada asignación al formato esperado
          const adapted = assignments.map((a) => ({
            id: a.id ?? a.ID,
            title: a.name ?? a.Name,
            itemId: rubricId,
            weight: a.percentage ?? a.Percentage,
            dueDate: (a.turninDate ?? a.TurninDate)?.slice(0, 19), // "YYYY-MM-DDTHH:mm:ss"
            description: "",
            isGroupAssessment: (a.individualFlag ?? a.IndividualFlag) === 1, // 1 = grupal, 0 = individual
            courseCode,
            groupId,
            fileUrl: a.specification?.filePath ?? null,
            fileName: a.specification?.fileName ?? null,
            status: "active",
            createdAt: a.createdAt ?? null,
          }))
          allAssignments = allAssignments.concat(adapted)
        }
        setAssessments(allAssignments)
        setIsLoading(false)
      } catch (err) {
        setError("Failed to load assessments")
        setIsLoading(false)
      }
    }

    fetchAssessments()
  }, [courseCode, groupId, reloadFlag])

  // Crear evaluación
  const addAssessment = async (newAssessment) => {
    try {
      const payload = {
        name: newAssessment.title,
        percentage: Number(newAssessment.weight),
        turninDate: newAssessment.dueDate.slice(0, 19), // "YYYY-MM-DDTHH:mm:ss"
        individualFlag: newAssessment.isGroupAssessment ? 1 : 0, // 1 = grupal, 0 = individual
        rubricID: newAssessment.itemId,
        specification: newAssessment.fileName
          ? {
            id: 0,
            assignmentId: 0,
            fileName: newAssessment.fileName,
            fileType: "application/octet-stream",
            size: 0,
            filePath: newAssessment.fileUrl,
            uploadDate: new Date().toISOString(),
          }
          : null,
      }

      const response = await fetch("http://localhost:5039/api/add/assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const msg = await response.text()
        setError(msg)
        return { success: false, error: msg }
      }

      // Recargar evaluaciones
      // Llamar fetchAssessments() aquí si es necesario
      setAssessments((prev) => [...prev, { ...payload, id: response.id }]) // Agregar la nueva evaluación a la lista
      return { success: true }
    } catch (err) {
      setError("Failed to add assessment")
      return { success: false, error: "Failed to add assessment" }
    }
  }

  // Actualizar evaluación
  const updateAssessment = async (id, updatedData) => {
    try {
      const payload = {
        name: updatedData.title,
        percentage: Number(updatedData.weight),
        turninDate: updatedData.dueDate.slice(0, 19), // "YYYY-MM-DDTHH:mm:ss"
        individualFlag: updatedData.isGroupAssessment ? 1 : 0, // 1 = grupal, 0 = individual
        specification: updatedData.fileName
          ? {
            id: 0,
            assignmentId: id,
            fileName: updatedData.fileName,
            fileType: "application/octet-stream",
            size: 0,
            filePath: updatedData.fileUrl,
            uploadDate: new Date().toISOString(),
          }
          : null,
      }

      const response = await fetch(`http://localhost:5039/api/update/assignment/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const msg = await response.text()
        setError(msg)
        return { success: false, error: msg }
      }

      return { success: true }
    } catch (err) {
      setError("Failed to update assessment")
      return { success: false, error: "Failed to update assessment" }
    }
  }

  // Eliminar evaluación
  const deleteAssessment = async (id) => {
    try {
      const response = await fetch(`http://localhost:5039/api/delete/assignment/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const msg = await response.text()
        setError(msg)
        return { success: false, error: msg }
      }
      return { success: true }
    } catch (err) {
      setError("Failed to delete assessment")
      return { success: false, error: "Failed to delete assessment" }
    }
  }

  // Simulación de subida de archivo (puedes reemplazar por tu lógica real)
  const uploadFile = async (file) => {
    // Aquí deberías implementar la subida real y devolver la URL y nombre
    return {
      success: true,
      fileUrl: "https://example.com/files/" + file.name,
      fileName: file.name,
    }
  }

  return {
    assessments,
    isLoading,
    error,
    addAssessment,
    updateAssessment,
    deleteAssessment,
    uploadFile,
    reload,
  }
}