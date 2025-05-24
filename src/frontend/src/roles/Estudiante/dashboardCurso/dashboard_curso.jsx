import { useState } from "react";
import { FolderClosed , NotepadTextDashed , ClipboardList, User, ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import './dashboard_curso.css'; // Archivo CSS para estilos
import { Navigate, NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom"
import {AlmacenarInfo} from '../sessionStorage/sessionStorage.js'


const CursoDashboard = () => {
    
    const navigate = useNavigate()

    const goToDocuments = () => navigate("/documentos-curso-estudiantes")
    const goToAssigments = () => navigate("/evaluaciones-curso-estudiantes")
    const goToReportsGrade = () => navigate("/dashboard-curso-estudiantes")

    const curso = {
        name: "Base de datos"
    }

    // Admin options for the dashboard
    const opcionesCurso = [
        {
            title: "Documentos",
            icon: FolderClosed ,
            colorClass: "icon-container-blue",
            NavLink: goToDocuments
        },
        {
            title: "Evaluaciones",
            icon: ClipboardList ,
            colorClass: "Reporte de notas",
            NavLink: goToAssigments
        },
        {
            title: "Reporte de Notas",
            icon: NotepadTextDashed ,
            colorClass: "icon-container-purple",
            NavLink: goToReportsGrade

        }
    ]

  
  return (
    <div className="curso-dashboard">
        {/* Header */}
        <header className="curso-header">
            <div className="dashboard-header-curso-content">
                <div className="header-logo">
                    <span className="header-title">CEdigital</span>
                </div>
                {/* Información del usuario arriba a la derecha*/}
                <div className="user-info-container-dashboard">
                    <div className="user-info-dashboard">
                        <span className="user-name-dashboard">{AlmacenarInfo.getItem('studentInfo').firstName} {AlmacenarInfo.getItem('studentInfo').firstLastName}</span>
                        <span className="user-email-dashboard">{AlmacenarInfo.getItem('studentInfo').email}</span>
                    </div>
                    <div className="dashboard-user-avatar">
                        <User className="h-5 w-5 text-slate-600" />
                    </div>
                </div>
            </div>    
        </header>
        <div className="dashboard-back-button-container">
            <Button variant="ghost" className="dashboard-back-button" onClick = {() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
                Volver
            </Button>
        </div>
        
        {/* Main Content */}
        <main className="curso-main">
            <div className="main-container">
                <h1 className="dashboard-title">{AlmacenarInfo.getItem('currentCourse').courseName}</h1>

                <div className="options-grid">
                    {opcionesCurso.map((option) => (
                        <Card
                            key={option.title}
                            className="option-card"
                            onClick={option.NavLink}
                            >
                            {/* onClick={() => console.log(`Clicked on ${option.title}`)} */}
                            <CardContent className="card-content">
                                <div className={`icon-container ${option.colorClass}`}>
                                    <option.icon className="option-icon" />
                                </div>
                                <h3 className="option-title">{option.title}</h3>
                                {/*<p className="option-description">{option.description}</p>*/}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </main>
    </div>
  )
}

export default CursoDashboard