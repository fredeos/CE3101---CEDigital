import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, User } from "lucide-react"
import "./inicio_estudiante.css"

const StudentRecord = ({ onBack }) => {
  // Sample user data - in a real app, this would come from authentication context
  const user = {
    name: "Alex Will",
    email: "alex.johnson@university.edu",
    id: "U2023456",
  }

  // Sample data - in a real app, this would come from an API
  const [academicRecord, setAcademicRecord] = useState([
    {
      id: "sem-2025-1",
      name: "Semester 1 2025",
      current: true,
      courses: [
        {
          id: "course-101",
          name: "Fundamentals of Microelectronics",
          group: "Group 1",
          credits: 4,
          status: "In Progress",
          grade: null,
        },
        {
          id: "course-102",
          name: "Introduction to Computer Science",
          group: "Group 3",
          credits: 3,
          status: "In Progress",
          grade: null,
        },
        {
          id: "course-103",
          name: "Calculus I",
          group: "Group 2",
          credits: 4,
          status: "In Progress",
          grade: null,
        },
      ],
    },
    {
      id: "sem-2024-2",
      name: "Semester 2 2024",
      current: false,
      courses: [
        {
          id: "course-095",
          name: "Physics II",
          group: "Group 1",
          credits: 4,
          status: "Completed",
          grade: "A",
        },
        {
          id: "course-096",
          name: "Data Structures",
          group: "Group 2",
          credits: 3,
          status: "Completed",
          grade: "B+",
        },
        {
          id: "course-097",
          name: "Digital Logic Design",
          group: "Group 1",
          credits: 4,
          status: "Completed",
          grade: "A-",
        },
      ],
    },
    {
      id: "sem-2024-1",
      name: "Semester 1 2024",
      current: false,
      courses: [
        {
          id: "course-091",
          name: "Physics I",
          group: "Group 2",
          credits: 4,
          status: "Completed",
          grade: "B+",
        },
        {
          id: "course-092",
          name: "Introduction to Programming",
          group: "Group 1",
          credits: 3,
          status: "Completed",
          grade: "A",
        },
        {
          id: "course-093",
          name: "College Algebra",
          group: "Group 3",
          credits: 3,
          status: "Completed",
          grade: "A-",
        },
      ],
    },
  ])

  // Function to handle course click - in a real app, this would navigate to the course page
  const handleCourseClick = (courseId) => {
    console.log(`Navigating to course: ${courseId}`)
    // In a real app: navigate(`/courses/${courseId}`) or similar
  }

  // Function to handle back button click
  const handleBackClick = () => {
    console.log("Going back to previous view")
    if (onBack) onBack()
  }

  return (
    <div className="student-record-container">
      {/* Header */}
      <header className="student-record-header">
        <div className="student-record-header-content">
          <div className="student-record-title">CE-Digital</div>
          <div className="student-record-user-info">
            <div className="student-record-user-details">
              <span className="student-record-user-name">{user.name}</span>
              <span className="student-record-user-email">{user.email}</span>
            </div>
            <div className="student-record-user-avatar">
              <User className="h-5 w-5 text-slate-600" />
            </div>
          </div>
        </div>
      </header>

      <div className="student-record-main">
        {/* Back button */}
        <Button
          variant="ghost"
          className="student-record-back-button"
          onClick={handleBackClick}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <CardHeader className="student-record-card-header">
          <CardTitle className="student-record-card-title">Cursos</CardTitle>
        </CardHeader>
        <Card className="student-record-card">
          
          
          <CardContent className="student-record-card-content">
            <Accordion type="single" collapsible className="w-full">
              {academicRecord.map((semester) => (
                <AccordionItem key={semester.id} value={semester.id}>
                  <AccordionTrigger className="student-record-accordion-item">
                    <div className="flex items-center">
                      {semester.name}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4 px-1">
                    <div className="space-y-3">
                      {semester.courses.map((course) => (
                        <Button
                          key={course.id}
                          variant="outline"
                          className="student-record-course-button"
                          onClick={() => handleCourseClick(course.id)}
                        >
                          <div className="student-record-course-info">
                            <span className="student-record-course-name">{course.name}</span>
                            <span className="student-record-course-meta">
                              {course.group}
                            </span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default StudentRecord