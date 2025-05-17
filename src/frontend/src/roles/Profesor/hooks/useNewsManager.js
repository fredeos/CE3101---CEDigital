"use client"

import { useState, useEffect } from "react"
import { useCoursesData } from "./useCoursesData"

export function useNewsManager(courseId = null) {
  const [news, setNews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const { courses } = useCoursesData()

  useEffect(() => {
    const fetchNews = async () => {
      try {
        // Simulate API call with timeout
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Demo news data
        const demoNews = [
          {
            id: "news1",
            title: "Midterm Exam Schedule",
            message:
              "The midterm exam for Mathematics 101 will be held on October 15th from 10:00 AM to 12:00 PM in Room 302. Please bring your calculator and student ID.",
            author: "Ms. Johnson",
            publicationDate: "2023-10-01T10:30:00Z",
            groupId: "group1",
          },
          {
            id: "news2",
            title: "Homework Assignment #3",
            message:
              "Homework Assignment #3 has been posted. Please complete exercises 4.1-4.15 by next Tuesday. You can find the assignment details on the course website.",
            author: "Ms. Johnson",
            publicationDate: "2023-09-28T14:15:00Z",
            groupId: "group2",
          },
          {
            id: "news3",
            title: "Office Hours Change",
            message:
              "Please note that my office hours will change starting next week. The new hours will be Mondays and Wednesdays from 2:00 PM to 4:00 PM in Room 210.",
            author: "Ms. Johnson",
            publicationDate: "2023-09-25T09:45:00Z",
            groupId: "group3",
          },
          {
            id: "news4",
            title: "Lab Session Cancelled",
            message:
              "The lab session scheduled for this Friday (October 6th) has been cancelled due to maintenance in the lab. We will reschedule the session for next week.",
            author: "Dr. Smith",
            publicationDate: "2023-10-02T11:20:00Z",
            groupId: "group4",
          },
          {
            id: "news5",
            title: "Guest Lecture Announcement",
            message:
              "We will have a guest lecture by Dr. Jane Wilson from Stanford University on 'Advanced Topics in Quantum Physics' on October 20th. Attendance is mandatory for all students.",
            author: "Dr. Smith",
            publicationDate: "2023-09-30T16:00:00Z",
            groupId: "group5",
          },
        ]

        // Filter by courseId if provided
        let filteredNews = demoNews
        if (courseId) {
          // We need to find all groups for this course
          // This is a bit complex since our demo data doesn't directly link news to courses
          // In a real app, this would be handled by the API
          filteredNews = demoNews.filter((item) => {
            const group = item.groupId
            // Check if this group belongs to the specified course
            // This is a simplified approach for the demo
            return group && group.startsWith(courseId)
          })
        }

        setNews(filteredNews)
        setIsLoading(false)
      } catch (err) {
        setError("Failed to load news")
        setIsLoading(false)
      }
    }

    fetchNews()
  }, [courseId])

  // Add a new news item
  const addNews = async (newsData) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300))

      const newNews = {
        id: `news-${Date.now()}`,
        ...newsData,
        publicationDate: new Date().toISOString(),
      }

      setNews((prevNews) => [newNews, ...prevNews])
      return newNews
    } catch (error) {
      throw new Error("Failed to add news")
    }
  }

  // Update an existing news item
  const updateNews = async (newsId, newsData) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300))

      setNews((prevNews) =>
        prevNews.map((item) =>
          item.id === newsId
            ? {
                ...item,
                ...newsData,
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      )

      return true
    } catch (error) {
      throw new Error("Failed to update news")
    }
  }

  // Delete a news item
  const deleteNews = async (newsId) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300))

      setNews((prevNews) => prevNews.filter((item) => item.id !== newsId))
      return true
    } catch (error) {
      throw new Error("Failed to delete news")
    }
  }

  return {
    news,
    courses,
    isLoading,
    error,
    addNews,
    updateNews,
    deleteNews,
  }
}
