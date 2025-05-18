import { useState } from "react";
import { FolderClosed , NotepadTextDashed , ClipboardList, Shield, ArrowLeft } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import './dashboard_curso.css'; // Archivo CSS para estilos
//import { Navigate, NavLink } from "react-router-dom";
//import { useNavigate } from "react-router-dom"


const CursoDashboard = () => {
  // Admin user info
  const studentUser = {
    name: "Ludwin",
    email: "Ludwin@gmail.com",
  }
  /*
  const navigate = useNavigate()

  const goToGestionRoles = () => navigate("/gestion-roles")
  const goToGestionClientes = () => navigate("/gestion-clientes")
  const goToGestionCuentas = () => navigate("/gestion-cuentas-admin")
  const goToGestionTarjetas = () => navigate("/gestion-tarjetas-admin")
  const goToGestionEmpleados = () => navigate("/gestion-empleados-admin")
  const goToGestionPrestamos = () => navigate("/adminDashboard")
  const goToGestionMora = () => navigate("/adminDashboard")
  */
    const curso = {
        name: "Base de datos"
    }

    // Admin options for the dashboard
    const opcionesCurso = [
        {
            title: "Documentos",
            icon: FolderClosed ,
            colorClass: "icon-container-blue",
            //NavLink: goToGestionRoles
        },
        {
            title: "Evaluaciones",
            icon: ClipboardList ,
            colorClass: "Reporte de notas",

        },
        {
            title: "Reporte de Notas",
            icon: NotepadTextDashed ,
            colorClass: "icon-container-purple",

        }
    ]

  
  return (
    <div className="curso-dashboard">
        {/* Header */}
        <header className="curso-header">
            <div className="header-logo">
                <Shield className="header-logo-icon" />
                <span className="header-title">CEdigital</span>
            </div>

            {/* Información del usuario arriba a la derecha*/}
            <div className="user-info">
                <p className="user-name">{studentUser.name}</p>
                <p className="user-email">{studentUser.email}</p>
            </div>
        </header>
        <div className="dashboard-back-button-container">
            <Button variant="ghost" className="dashboard-back-button">
                <ArrowLeft className="h-4 w-4" />
                Back
            </Button>
        </div>
        
        {/* Main Content */}
        <main className="curso-main">
            <div className="main-container">
                <h1 className="dashboard-title">{curso.name}</h1>

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