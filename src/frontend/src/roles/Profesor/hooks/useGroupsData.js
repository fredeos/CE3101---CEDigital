import { useState, useEffect, useCallback } from "react"

export function useGroupsData() {
  const [groups, setGroups] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        // Simulate API call with timeout
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Demo groups data with course associations
        const demoGroups = [
          { id: "group1", name: "Morning Class A", courseId: "course1", students: 15 },
          { id: "group2", name: "Afternoon Class B", courseId: "course1", students: 13 },
          { id: "group3", name: "Evening Class", courseId: "course1", students: 10 },
          { id: "group4", name: "Lab Group 1", courseId: "course2", students: 12 },
          { id: "group5", name: "Lab Group 2", courseId: "course2", students: 12 },
          { id: "group6", name: "Advanced Group", courseId: "course3", students: 8 },
          { id: "group7", name: "Beginner Group", courseId: "course3", students: 10 },
          { id: "group8", name: "Programming Team A", courseId: "course4", students: 16 },
          { id: "group9", name: "Programming Team B", courseId: "course4", students: 16 },
          { id: "group10", name: "Research Group", courseId: "course5", students: 13 },
          { id: "group11", name: "Field Study Group", courseId: "course5", students: 13 },
        ]

        setGroups(demoGroups)
        setIsLoading(false)
      } catch (err) {
        setError("Failed to load groups")
        setIsLoading(false)
      }
    }

    fetchGroups()
  }, [])

  // Helper function to get groups for a specific course
  const getGroupsByCourse = useCallback(
    (courseId) => {
      if (!courseId) return []
      return groups.filter((group) => group.courseId === courseId)
    },
    [groups],
  )

  return {
    groups,
    getGroupsByCourse,
    isLoading,
    error,
  }
}
