import { useState, useEffect } from "react"

// Funcion principal para manejar la lista de estudiantes del grupo (conexiones con la API)
export function useStudentsData(courseId, groupId) {
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStudents = async () => {
      if (!groupId) {
        setStudents([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {

        // Obtiene la lista de estudiantes por medio del ID del grupo
        const response = await fetch(
          `http://localhost:5039/api/group/students/${groupId}`
        )
        if (!response.ok) throw new Error("No se pudieron obtener los estudiantes")
        const data = await response.json()
        
        // Adapta los datos al formato esperado por el componente
        const adapted = data.map((student) => ({
          id: String(student.studentID),
          name: student.fullName,
          email: student.email,
          phone: student.phoneNumber,
        }))
        setStudents(adapted)
        setIsLoading(false)
      } catch (err) {
        setError("Failed to load students")
        setIsLoading(false)
      }
    }

    fetchStudents()
  }, [groupId])

  return {
    students,
    isLoading,
    error,
  }
}