import { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, User } from "lucide-react"
import "./inicio_estudiante.css"
import {AlmacenarInfo} from '../sessionStorage/sessionStorage.js'

const StudentRecord = ({ onBack }) => {

  const navigate = useNavigate();

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

    // Convertir el objeto a array para mostrarlo y almacenar la información en localStorage
    setAcademicRecord(Object.values(groupedBySemester));
    //AlmacenarInfo.setItem('semesterCourses',Object.values(groupedBySemester)); // guarda la información de los curso por semestres en un localStorage

  };
 
  // Función para manejar el click sobre algun curso en específico y navegar a la siguiente vista
  const handleCourseClick = (semesterID_in, courseId_in) => {
    const semester = academicRecord.find(sem => sem.semesterID === semesterID_in);  // se halla el semestre concreto y sus cursos
    const course = semester.courses.find(course_t => course_t.id === courseId_in);  // se halla el curso concreto buscado de ese semestre buscado
    AlmacenarInfo.setItem('currentCourse', course); // se almacena la información del curso que el usuario presionó
    navigate('/dashboard-curso-estudiantes');
  }

  // Function to handle back button click
  const handleBackClick = () => {
    navigate(-1);
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
          Cerrar sesión
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
                          onClick={() => handleCourseClick(semester.semesterID, course.id)}
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