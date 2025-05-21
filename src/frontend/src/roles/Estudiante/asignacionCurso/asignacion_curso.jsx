import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowLeft, User, FileText, Download, Upload, X, Check, Calendar, Users, Percent } from "lucide-react"
import "./asignacion_curso.css"

const AssignmentDetailView = ({ onBack }) => {
    // Sample user data
    const user = {
        name: "Alex Johnson",
        email: "alex.johnson@university.edu",
        studentId: "U2023456",
    }

    // Sample assignment data - in a real app, this would come from an API
    const [assignment, setAssignment] = useState({
        id: "project1",
        name: "Project 1: Database Design",
        category: "Projects",
        totalPercentage: 15,
        earnedPercentage: 13,
        maxScore: 100,
        earnedScore: 87,
        dueDate: "2025-02-15 11:59 PM",
        status: "Graded",
        description:
        "Design and implement a relational database for a student management system. The database should include tables for students, courses, enrollments, and grades.",
        attachments: [
        {
            id: "attach1",
            name: "Project_1_Instructions.pdf",
            type: "pdf",
            size: "420 KB",
        },
        {
            id: "attach2",
            name: "Database_Schema_Template.xlsx",
            type: "excel",
            size: "125 KB",
        }
        ],
        groupMembers: [
        {
            id: "student1",
            name: "Alex Johnson",
            email: "alex.johnson@university.edu",
        },
        {
            id: "student2",
            name: "Maria Rodriguez",
            email: "maria.rodriguez@university.edu",
        },
        {
            id: "student3",
            name: "David Kim",
            email: "david.kim@university.edu",
        }
        ],
        submission: {
            id: "submission1",
            fileName: "Group3_Database_Project.zip",
            submittedBy: "Maria Rodriguez",
            submittedOn: "2025-02-14 10:23 AM",
            size: "1.2 MB",
        }
    })

    // State for file upload
    const [dragActive, setDragActive] = useState(false)
    const [uploadedFile, setUploadedFile] = useState(null)

    // Handle drag events
    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    // Maneja si el input de archivo cambia, el drop (cuando se sueltan archivos)
    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0])
        }
    }

    // Maneja si el input de archivo cambia (cuando se hace click y se selecciona)
    const handleChange = (e) => {
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0])
        }
    }

    // Maneja el envio del archivo a la api
    const handleFile = (file) => {
        console.log("File selected:", file.name)
        setUploadedFile({
            name: file.name,
            size: formatFileSize(file.size),
            type: file.type,
        })
        // Se carga el archivo al servidor aqui
    }

    // Formato de tamaño de archivo
    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + " Bytes"
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
        else return (bytes / 1048576).toFixed(1) + " MB"
    }

    // Maneja los archivos adjuntos
    const handleAttachmentClick = (attachment) => {
        console.log(`Opening attachment: ${attachment.name}`)
        // esto abrirá o descargará el archivo
    }

    // Maneja la eliminación de un archivo ya cargado
    const handleRemoveFile = () => {
        setUploadedFile(null)
    }

    return (
        <div className="assignment-detail-container">
            {/* Header */}
            <header className="assignment-header">
                <div className="header-container main-container-size display-flex-center">
                    <div className="header-title">CE-Digital</div>
                    <div className="user-info display-flex-center">
                        <div className="user-details">
                            <span className="text-Weight-500">{user.name}</span>
                            <span className="user-email">{user.email}</span>
                        </div>
                        <div className="user-avatar">
                            <User className="user-icon icon-size1" />
                        </div>
                    </div>
                </div>
            </header>

            <div className="main-container main-container-size">
            {/* Botón para volver*/}
            <Button
                variant="ghost"
                className="back-button display-flex-center"
                onClick={onBack}
            >
                <ArrowLeft className="back-icon icon-size2" />
                Back to Assignments
            </Button>

            <div className="assignment-grid">
                {/* Principales detalles de asignación */}
                <div className="assignment-main">
                    <Card className="assignment-card">
                        <CardHeader className="card-header">
                            <div className="header-content">
                                <CardTitle className="assignment-title">{assignment.name}</CardTitle>                  
                            </div>
                        </CardHeader>

                        <CardContent className="card-content">
                            {/* Información de la asignación */}
                            <div className="grade-grid margin-bottom-1rem5">
                                <div className="grade-item">
                                    <div className="grade-label text-weight-500 display-flex-center">
                                        <span>Valor de asignación</span>
                                    </div>
                                    <div className="grade-value">
                                        {assignment.earnedPercentage}% <span>/ {assignment.totalPercentage}%</span>
                                    </div>
                                </div>

                                <div className="grade-item">
                                    <div className="grade-label text-weight-500 display-flex-center">
                                        <span>Nota obtenida</span>
                                    </div>
                                    <div className="grade-value">
                                        {assignment.earnedScore} <span>/ {assignment.maxScore}</span>
                                    </div>
                                </div>

                                <div className="grade-item">
                                    <div className="grade-label text-weight-500 display-flex-center">
                                        <span>Fecha de entrega:</span>
                                    </div>
                                    <div className="due-date text-weight-500">
                                        {assignment.dueDate}
                                    </div>
                                </div>
                            </div>

                            {/* Descripción de la asignación */}
                            <div className="margin-bottom-1rem5 description-section description-section">
                                <h3 className="text-weight-500">Descripción:</h3>
                                <p>{assignment.description}</p>
                            </div>

                            {/* Archivos adjuntos como especificaciones */}
                            <div className="margin-bottom-1rem5 attachments-section">
                                <h3 className="text-weight-500">Archivo adjunto: </h3>
                                <div className="attachments-list">
                                    {assignment.attachments.map((attachment) => (
                                    <Button
                                        key={attachment.id}
                                        variant="outline"
                                        className="attachment-button"
                                        onClick={() => handleAttachmentClick(attachment)}
                                        >
                                        <div className="display-flex-center">
                                            <span className="text-weight-500">{attachment.name}</span>
                                        </div>
                                        <div className="display-flex-center">
                                            <Download className="download-icon icon-size2" />
                                        </div>
                                    </Button>
                                ))}
                                </div>
                            </div>

                            {/* Carga de archivos */}
                            <div className="margin-bottom-1rem5 upload-section">
                                <h3 className="text-weight-500">Entrega:</h3>
                                <div
                                    className={`upload-area ${dragActive ? "drag-active" : ""}`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    >
                                    <input type="file" id="file-upload" className="file-input" onChange={handleChange} />
                                    <label htmlFor="file-upload" className="upload-label display-flex-center">
                                        <Upload className="upload-icon" />
                                        <p className="upload-text text-weight-500">Arrastrar archivo aquí o click para seleccionar</p>
                                    </label>
                                </div>
                            </div>

                            {/* Sección de archivo cargado*/}
                            {(uploadedFile || assignment.submission) && (
                                <div className="submission-section">
                                    <h3 className="text-weight-500">{uploadedFile ? "Listo para cargar:" : "Entrega actual:"}</h3>
                                    <div className="submission-file">
                                        <div className="file-info display-flex-center">
                                            <div className="file-details">
                                                <div>
                                                    <div className="file-name">{uploadedFile ? uploadedFile.name : assignment.submission.fileName}</div>
                                                    <div className="file-meta">
                                                        {uploadedFile? `Size: ${uploadedFile.size}`
                                                        : `Entregado: ${assignment.submission.submittedOn}`}
                                                    </div>
                                                </div>
                                            </div>
                                            {uploadedFile && (
                                                <Button
                                                variant="ghost"
                                                size="sm"
                                                className="remove-file-button"
                                                onClick={handleRemoveFile}
                                                >
                                                <X className="icon-size2" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    {uploadedFile && <Button className="submit-button">Cargar archivo</Button>}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Tarjeta de miembros del grupo */}
                <div className="assignment-sidebar">
                    <Card className="group-card">
                        <CardHeader className="group-header">
                            <div className="display-flex-center">
                                <CardTitle>Miembros del grupo</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="group-content">
                            <div className="members-list">
                                {assignment.groupMembers.map((member) => (
                                <div key={member.id} className="member-item">
                                    <div>
                                        <div className="text-weight-500">{member.name}</div>
                                    </div>
                                </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            </div>
        </div>
    )
}

export default AssignmentDetailView

