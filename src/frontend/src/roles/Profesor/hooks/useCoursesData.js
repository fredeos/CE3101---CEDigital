import { useState, useEffect } from "react"

export function useCoursesData() {
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Simulate API call with timeout
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Demo courses data
        const demoCourses = [
          { id: "course1", name: "Mathematics 101", code: "MATH101", students: 28 },
          { id: "course2", name: "Introduction to Physics", code: "PHYS101", students: 24 },
          { id: "course3", name: "Advanced Chemistry", code: "CHEM201", students: 18 },
          { id: "course4", name: "Computer Science Fundamentals", code: "CS101", students: 32 },
          { id: "course5", name: "Biology and Life Sciences", code: "BIO101", students: 26 },
        ]

        setCourses(demoCourses)
        setIsLoading(false)
      } catch (err) {
        setError("Failed to load courses")
        setIsLoading(false)
      }
    }

    fetchCourses()
  }, [])

  return {
    courses,
    isLoading,
    error,
  }
}
