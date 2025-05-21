import { useState, useEffect } from "react"
import { useProfessorAuth } from "./useProfessorAuth"

export function useProfessorGroupsWithCourses() {
  const { professor } = useProfessorAuth()
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!professor) return

    // Funcion para obtener los grupos de un curso asignado a profesor por medio del idCard
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(
          `http://localhost:5039/api/professors/groups-with-courses/${professor.idCard}`
        )
        if (!response.ok) throw new Error("No se pudieron obtener los cursos y grupos")
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [professor])

  return { data, isLoading, error }
}