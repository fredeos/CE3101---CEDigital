import { useState, useEffect } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, User } from "lucide-react"
import "./inicio_estudiante.css"
import {AlmacenarInfo} from '../sessionStorage/sessionStorage.js'

const StudentRecord = ({ onBack }) => {

  // Se guarda la información de semestres y cursos del estudiante temporalmente
  const [academicRecord, setAcademicRecord] = useState([])
  
  // se manejan errores
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
    
    const fetchAcademicRecord = async () => {
      try {
        const studentInfo = AlmacenarInfo.getItem('studentInfo');
        const encodedStudentId = encodeURIComponent(studentInfo.studentID);
        
        const response = await fetch(`http://localhost:5039/api/groups/student/${encodedStudentId}`);
        
        if (!response.ok) {
            // Manejo específico por código de estado
            if (response.status === 404) {
              throw new Error('Error al cargar el registro de semestres');
            }
        }else{
            const data = await response.json();
            changeFormatStudentRecord(data);
        }
        
      } catch (err) {
          showNotification("Ha ocurrido un error en el servidor. Por favor intente de nuevo más tarde.", true)
          setError(err.message);
      } finally {
          
      }
    }

    fetchAcademicRecord();
  },[]);


  // cambia el formato del Json dado por la api para mostrar los datos
  const changeFormatStudentRecord = (courses) => { 
    const groupedBySemester = courses.reduce((acc, course) => {
      const semesterKey = `${course.semesterID}-${course.semesterYear}-${course.semesterPeriod}`;
      
      if (!acc[semesterKey]) {
        acc[semesterKey] = {
          semesterID: course.semesterID,
          semesterYear: course.semesterYear,
          semesterPeriod: course.semesterPeriod,
          courses: []
        };
      }
      
      acc[semesterKey].courses.push({
        id: course.id,
        groupNum: course.groupNum,
        courseName: course.courseName
      });
      
      return acc; // ¡Importante! Retornar el acumulador en cada iteración.
    }, {});

    // Convertir el objeto a array y actualizar el estado
    setAcademicRecord(Object.values(groupedBySemester));
    AlmacenarInfo.setItem('semestreCursos',groupedBySemester); // guarda la información de los curso por semestres en un localStorage
  };


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
              <span className="student-record-user-name">{AlmacenarInfo.getItem('studentInfo').firstName} {AlmacenarInfo.getItem('studentInfo').firstLastName}</span>
              <span className="student-record-user-email">{AlmacenarInfo.getItem('studentInfo').email}</span>
            </div>
            <div className="student-record-user-avatar">
              <User className="h-5 w-5 text-slate-600" />
            </div>
          </div>
        </div>
      </header>

      <div className="student-record-main">
        {/* Back button */}
        <Button variant="ghost" className="student-record-back-button"
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
                <AccordionItem key={semester.semesterID} value={semester.semesterID}>
                  <AccordionTrigger className="student-record-accordion-item">
                    <div className="flex items-center">
                      Semestre {semester.semesterPeriod} {semester.semesterYear}
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
                            <span className="student-record-course-name">{course.courseName}</span>
                            <span className="student-record-course-meta">
                              Grupo {course.groupNum}
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