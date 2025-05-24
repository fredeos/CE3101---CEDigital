import { useState, useEffect } from "react"
import { Navigate, useNavigate } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, User, FileText } from "lucide-react"
import "./evaluaciones_curso.css"
import {AlmacenarInfo} from '../sessionStorage/sessionStorage.js'

const AssignmentsView = ({ onBack }) => {

    const navigate = useNavigate();

    // Ejemplo de estructura de datos que será enviada por el api
    const [assignmentCategories, setAssignmentCategories] = useState([])

    // se manejan errores
    const [error, setError] = useState(null);
        
    // Maneja la solicitud de la información apenas se despliega la vista
    useEffect(() => {
        setError(null);
        const fetchAssigmentCategories = async () => {
            try {
                const currentCourse = AlmacenarInfo.getItem('currentCourse');
                const studentInfo = AlmacenarInfo.getItem('studentInfo');
                const encodedCourseId = encodeURIComponent(currentCourse.id);   // se obtiene el id del grupo del curso
                const encodedStudentId = encodeURIComponent(studentInfo.studentID);  // se obtiene el id del estudiante

                const response = await fetch(`http://localhost:5039/api/assignments/group/${encodedCourseId}/student/${encodedStudentId}`);
                
                if (!response.ok) {
                    // Manejo específico por código de estado
                    if (response.status === 404) {
                    throw new Error('Error al cargar el registro de evaluaciones del curso');
                    }
                }else{
                    const data = await response.json();
                    setAssignmentCategories(data);
                }
                
            } catch (err) {
                setError(err.message);
            } finally {
                
          }
        }
    
        fetchAssigmentCategories();
    },[]);


    // Calcular la nota final del curso para mostrarla
    const totalEarnedPercentage = assignmentCategories.reduce((total, category) => total + category.earnedPercentage, 0)

    // Función para manejar el click sobre alguna evaluación en específico y navegar a la siguiente vista (información de la evaluación)
    const handleAssignmentClick = (assignmentId) => {
        AlmacenarInfo.setItem('currentAssignmentID', assignmentId); // se almacena la información del curso que el usuario presionó
        console.log(AlmacenarInfo.getItem('currentAssignmentID'));  // Se almacena el ID nada mas, que es solo lo necesario
        navigate("/asignacion-curso-estudiantes");
    }
    
    return (
        <div className="assignments-view-container">
            {/* Headers */}
            <header className="assignments-view-header">
                <div className="header-container-categories">
                    <div className="header-title-categories">CE-Digital</div>
                    <div className="user-info-categories">
                        <div className="user-details-categories">
                            <span className="user-name-categories">{AlmacenarInfo.getItem('studentInfo').firstName} {AlmacenarInfo.getItem('studentInfo').firstLastName}</span>
                            <span className="user-email-categories">{AlmacenarInfo.getItem('studentInfo').email}</span>
                        </div>
                        <div className="user-icon-categories">
                            <User className="icon-categories" />
                        </div>
                    </div>
                </div>
            </header>
            
            <div className="main-content-categories">
                {/* Botón para volver */}
                <Button
                    variant="ghost"
                    className="back-button-categories"
                    onClick = {() => navigate(-1)}
                >
                    <ArrowLeft className="button-icon-categories" />
                    Volver
                </Button>

                <Card className="assignments-card-categories">
                    <CardHeader className="card-header-categories">
                        <CardTitle className="card-title-categories"> Evaluaciones - {AlmacenarInfo.getItem('currentCourse').courseName} </CardTitle>
                    </CardHeader>
                    <CardContent className="card-content-categories">
                        <Accordion type="multiple" className="accordion-categories">
                            {/* Se intera sobre los rubros de evaluación (Assignment Categories)*/}
                            {assignmentCategories.map((category) => (
                                <AccordionItem key={category.id} value={category.id}>
                                    <AccordionTrigger className="accordion-trigger-categories">
                                        <div className="category-header">
                                            <div className="category-name">{category.name}</div>
                                            <div className="category-percentage">
                                                <span className="earned-percentage-categories">{category.earnedPercentage ? category.earnedPercentage : "--"}</span>
                                                <span className="total-percentage-categories"> / {category.totalPercentage}</span>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="accordion-content-categories">
                                        <div className="assignments-list-categories">
                                            {category.assignments.map((assignment) => (
                                                <Button
                                                    key={assignment.id}
                                                    variant="outline"
                                                    className="assignment-button-categories"
                                                    onClick={() => handleAssignmentClick(assignment.id)}
                                                >
                                                    <div className="assignment-info-categories">
                                                        <div className="assignment-title-categories">
                                                            <FileText className="assignment-icon-categories" />
                                                            <span className="name-assigment-categories">{assignment.name}</span>
                                                        </div>
                                                        <span className="limit-date-assigment-categories">Fecha límite: {new Date(assignment.dueDate).toLocaleDateString()} {new Date(assignment.dueDate).toLocaleTimeString()}</span>
                                                    </div>
                                                    <div className="assignment-grade-categories">
                                                        <span className="earned-percentage-categories">{assignment.showPercentage ? assignment.earnedPercentage : "--"}</span>
                                                        <span className="total-percentage-categories"> / {assignment.totalPercentage}</span>
                                                    </div>
                                                </Button>
                                            ))}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                                ))}
                            </Accordion>

                        {/* Nota final */}
                        <div className="final-grade-header-categories">
                            <div className="grade-title-categories">Nota final</div>
                            <div className="grade-display-categories">
                                <span className="earned-percentage-categories">{totalEarnedPercentage}</span>
                                <span className="total-percentage-categories"> / 100</span>
                            </div>
                        </div>
                        
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default AssignmentsView
