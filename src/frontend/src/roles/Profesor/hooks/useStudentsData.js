import { useState, useEffect } from "react"

export function useStudentsData(courseId, groupId) {
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStudents = async () => {
      if (!courseId || !groupId) {
        setStudents([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        // Simulate API call with timeout
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Demo students data
        const demoStudents = [
          {
            id: "S1001",
            name: "Alice Johnson",
            email: "alice.j@student.edu",
            phone: "555-123-4567",
            courseId: "course1",
            groupId: "group1",
          },
          {
            id: "S1002",
            name: "Bob Smith",
            email: "bob.s@student.edu",
            phone: "555-234-5678",
            courseId: "course1",
            groupId: "group1",
          },
          {
            id: "S1003",
            name: "Charlie Brown",
            email: "charlie.b@student.edu",
            phone: "555-345-6789",
            courseId: "course1",
            groupId: "group2",
          },
          {
            id: "S1004",
            name: "Diana Prince",
            email: "diana.p@student.edu",
            phone: "555-456-7890",
            courseId: "course1",
            groupId: "group2",
          },
          {
            id: "S1005",
            name: "Edward Norton",
            email: "edward.n@student.edu",
            phone: "555-567-8901",
            courseId: "course2",
            groupId: "group4",
          },
          {
            id: "S1006",
            name: "Fiona Gallagher",
            email: "fiona.g@student.edu",
            phone: "555-678-9012",
            courseId: "course2",
            groupId: "group4",
          },
          {
            id: "S1007",
            name: "George Lucas",
            email: "george.l@student.edu",
            phone: "555-789-0123",
            courseId: "course2",
            groupId: "group5",
          },
          {
            id: "S1008",
            name: "Hannah Montana",
            email: "hannah.m@student.edu",
            phone: "555-890-1234",
            courseId: "course2",
            groupId: "group5",
          },
          {
            id: "S1009",
            name: "Ian Malcolm",
            email: "ian.m@student.edu",
            phone: "555-901-2345",
            courseId: "course3",
            groupId: "group6",
          },
          {
            id: "S1010",
            name: "Julia Roberts",
            email: "julia.r@student.edu",
            phone: "555-012-3456",
            courseId: "course3",
            groupId: "group6",
          },
        ]

        // Filter students based on course and group
        const filteredStudents = demoStudents.filter(
          (student) => student.courseId === courseId && student.groupId === groupId,
        )

        setStudents(filteredStudents)
        setIsLoading(false)
      } catch (err) {
        setError("Failed to load students")
        setIsLoading(false)
      }
    }

    fetchStudents()
  }, [courseId, groupId])

  return {
    students,
    isLoading,
    error,
  }
}
