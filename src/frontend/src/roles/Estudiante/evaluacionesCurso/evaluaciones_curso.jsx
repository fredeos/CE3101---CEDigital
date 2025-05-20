import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, User, FileText } from "lucide-react"
import "./evaluaciones_curso.css"

const AssignmentsView = ({ onBack }) => {
    // Ejemplo de datos del usuario
    const user = {
        name: "Alex Johnson",
        email: "alex.johnson@university.edu",
        studentId: "U2023456",
    }

    // Ejemplo de estructura de datos que será enviada por el api
    const [assignmentCategories, setAssignmentCategories] = useState([
        {
        id: "proyectos",
        name: "Proyectos",
        totalPercentage: 35,
        earnedPercentage: 27,
        showPercentage: true,
        assignments: [
            {
                id: "Projecto 1",
                name: "Projecto 1: Diseño de base de datos",
                dueDate: "2025-02-15",
                totalPercentage: 15,
                earnedPercentage: 13,
                showPercentage: true
            },
            {
                id: "projecto2",
                name: "Projecto 2: Implementación de API",
                dueDate: "2025-03-20",
                totalPercentage: 20,
                earnedPercentage: 14,
                showPercentage: true
            }
        ]},
        {
        id: "quices",
        name: "Quices",
        totalPercentage: 15,
        earnedPercentage: 12,
        showPercentage: true,
        assignments: [
            {
                id: "quiz1",
                name: "Quiz 1: Diagrama conceptual",
                dueDate: "2025-01-25",
                totalPercentage: 5,
                earnedPercentage: 4,
                showPercentage: true
            },
            {
                id: "quiz2",
                name: "Quiz 2: Mapeo al diagrama relacional",
                dueDate: "2025-02-25",
                totalPercentage: 5,
                earnedPercentage: 4,
                showPercentage: true
            },
            {
                id: "quiz3",
                name: "Quiz 3:  Diagrama relacional",
                dueDate: "2025-03-25",
                totalPercentage: 5,
                earnedPercentage: 4,
                showPercentage: false
            }
        ]},
        {
        id: "examenes",
        name: "Exámenes",
        totalPercentage: 30,
        earnedPercentage: 24,
        showPorcentage: false,
        assignments: [
            {
                id: "examen1",
                name: "Examen 1",
                dueDate: "2025-03-01",
                totalPercentage: 15,
                earnedPercentage: 12,
                showPercentage: false
            },
            {
                id: "examen2",
                name: "Examen 2",
                dueDate: "2025-05-15",
                totalPercentage: 15,
                earnedPercentage: 12,
                showPercentage: false
            }
        ]},
        {
        id: "tareas",
        name: "Tareas",
        totalPercentage: 20,
        earnedPercentage: 18,
        showPercentage: false,
        assignments: [
            {
                id: "tarea1",
                name: "Tarea 1",
                dueDate: "2025-01-20",
                totalPercentage: 5,
                earnedPercentage: 5,
                showPercentage: false
            },
            {
                id: "tarea2",
                name: "Tarea 2",
                dueDate: "2025-02-10",
                totalPercentage: 5,
                earnedPercentage: 4.5,
                showPercentage: true
            },
            {
                id: "tarea3",
                name: "Tarea 3",
                dueDate: "2025-03-10",
                totalPercentage: 5,
                earnedPercentage: 4.5,
                showPercentage: false
            },
            {
                id: "tarea4",
                name: "Tarea 4",
                dueDate: "2025-04-10",
                totalPercentage: 5,
                earnedPercentage: 4,
                showPercentage: false
            }
        ]}
    ])

    // Calculate total grade
    const totalCoursePercentage = assignmentCategories.reduce((total, category) => total + category.totalPercentage, 0)
    const totalEarnedPercentage = assignmentCategories.reduce((total, category) => total + category.earnedPercentage, 0)

    // Función para manejar las evaluaciones dentro de los rubros
    const handleAssignmentClick = (assignmentId) => {
        console.log(`Navigating to assignment: ${assignmentId}`)
    }

    return (
        <div className="assignments-view-container">
        {/* Header */}
        <header className="assignments-view-header">
            <div className="header-container">
            <div className="header-title">CE-Digital</div>
            <div className="user-info">
                <div className="user-details">
                    <span className="user-name">{user.name}</span>
                    <span className="user-email">{user.email}</span>
                </div>
                <div className="user-icon">
                    <User className="icon" />
                </div>
            </div>
            </div>
        </header>
        
        <div className="main-content">
            {/* Botón para volver */}
            <Button
                variant="ghost"
                className="back-button"
                onClick={onBack}
            >
                <ArrowLeft className="button-icon" />
                Volver
            </Button>

            <Card className="assignments-card">
                <CardHeader className="card-header">
                    <CardTitle className="card-title">Evaluaciones</CardTitle>
                </CardHeader>
                <CardContent className="card-content">
                    <Accordion type="multiple" className="accordion">
                        {assignmentCategories.map((category) => (
                        <AccordionItem key={category.id} value={category.id}>
                            <AccordionTrigger className="accordion-trigger">
                                <div className="category-header">
                                    <div className="category-name">{category.name}</div>
                                    <div className="category-percentage">
                                        <span className="earned">{category.showPercentage ? category.earnedPercentage : "--"}</span>
                                        <span className="total"> / {category.totalPercentage}</span>
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="accordion-content">
                                <div className="assignments-list">
                                    {category.assignments.map((assignment) => (
                                        <Button
                                            key={assignment.id}
                                            variant="outline"
                                            className="assignment-button"
                                            onClick={() => handleAssignmentClick(assignment.id)}
                                        >
                                            <div className="assignment-info">
                                                <div className="assignment-title">
                                                    <FileText className="assignment-icon" />
                                                    <span className="name">{assignment.name}</span>
                                                </div>
                                                <span className="limit-date">Fecha límite: {assignment.dueDate}</span>
                                            </div>
                                            <div className="assignment-grade">
                                                <span className="earned">{assignment.showPercentage ? assignment.earnedPercentage : "--"}</span>
                                                <span className="total"> / {assignment.totalPercentage}</span>
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                        ))}
                    </Accordion>

                    {/* Nota final */}
                    <div className="final-grade-header">
                        <div className="grade-title">Nota final</div>
                        <div className="grade-display">
                            <span className="earned">{totalEarnedPercentage}</span>
                            <span className="total"> / {totalCoursePercentage}</span>
                        </div>
                    </div>
                    
                </CardContent>
            </Card>
        </div>
        </div>
    )
}

export default AssignmentsView