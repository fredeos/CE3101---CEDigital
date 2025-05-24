import { useState, useEffect } from "react"
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, User, Download, Upload, X} from "lucide-react"
import "./asignacion_curso.css"
import {AlmacenarInfo} from '../sessionStorage/sessionStorage.js'

const AssignmentDetailView = ({ onBack }) => {

    const navigate = useNavigate();

    // Se coloca un estado default para evitar que la página no cargue, en caso de que no se obtenga respuesta
    const [assignment, setAssignment] = useState(
        {
            "id": 0,
            "name": "",
            "category": "",
            "totalPercentage": 0,
            "earnedPercentage": null,
            "earnedScore": null,
            "commentary": null,
            "dueDate": "",
            "groupMembers": null,
            "attachments": [],
            "submission": null,
            "feedback": null
        }
    )

    // se manejan errores
    const [error, setError] = useState(null);

    // Maneja la solicitud de la información apenas se despliega la vista
    useEffect(() => {
        setError(null);
        const fetchAssigmentCategories = async () => {
            try {
                const currentAssignmentId = AlmacenarInfo.getItem('currentAssignmentID');  // se obtiene el id directamente
                const studentInfo = AlmacenarInfo.getItem('studentInfo');
                const encodedAssignmentId = encodeURIComponent(currentAssignmentId);   // se obtiene el id de la asignación encodificado
                const encodedStudentId = encodeURIComponent(studentInfo.studentID);  // se obtiene el id del estudiante

                const response = await fetch(`http://localhost:5039/api/assigments/${encodedAssignmentId}/forstudent/${encodedStudentId}`);
                
                if (!response.ok) {
                    // Manejo específico por código de estado
                    if (response.status === 404) {
                    throw new Error('Error al cargar el registro de evaluaciones del curso');
                    }
                }else{
                    const data = await response.json();
                    setAssignment(data);
                }
                
            } catch (err) {
                setError(err.message);
            } finally {
                
            }
        }
    
        fetchAssigmentCategories();
    },[]);

    // Estado para subir archivo
    const [dragActive, setDragActive] = useState(false)
    const [uploadedFile, setUploadedFile] = useState(null)

    // Manejador de los eventos del drag
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
   
    // Maneja los archivos de feedback
    const handleAttachmentClick = (attachment) => {
        console.log(`Opening attachment: ${attachment.name}`)
        // esto abrirá o descargará el archivo
    }

    // Maneja los archivos adjuntos
    const handleFeedbackClick = (feedback) => {
        console.log(`Opening feedback: ${feedback.name}`)
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
                <div className="header-assignment-container main-container-size display-flex-center">
                    <div className="header-assignment-title">CE-Digital</div>
                    <div className="user-info-assignment display-flex-center">
                        <div className="user-details-assignment">
                            <span className="text-Weight-500">{AlmacenarInfo.getItem('studentInfo').firstName} {AlmacenarInfo.getItem('studentInfo').firstLastName}</span>
                            <span className="user-email-assignment">{AlmacenarInfo.getItem('studentInfo').email}</span>
                        </div>
                        <div className="user-avatar-assignment">
                            <User className="user-icon-assignment icon-size1" />
                        </div>
                    </div>
                </div>
            </header>

            <div className="main-container-assignment main-container-size">
            {/* Botón para volver*/}
            <Button
                variant="ghost"
                className="back-button-assignment display-flex-center"
                onClick = {() => navigate(-1)}
            >
                <ArrowLeft className="icon-size2" />
                Volver
            </Button>

            <div className="assignment-grid">
                {/* Principales detalles de asignación */}
                <div className="assignment-main">
                    <Card className="assignment-card">
                        <CardHeader className="card-header-assignment">
                            <div className="header-content-assignment">
                                <CardTitle className="assignment-title-assignment">{assignment.name}</CardTitle>                  
                            </div>
                        </CardHeader>

                        <CardContent className="card-content-assignment">
                            {/* Información de la asignación */}
                            <div className="grade-grid-assignment margin-bottom-1rem5">
                                <div className="grade-item-assignment">
                                    <div className="grade-label-assignment text-weight-500 display-flex-center">
                                        <span>Valor de asignación</span>
                                    </div>
                                    <div className="grade-value-assignment">
                                        {assignment.earnedPercentage? `${assignment.earnedPercentage}%` : "--"} <span>/ {assignment.totalPercentage}%</span>
                                    </div>
                                </div>

                                <div className="grade-item-assignment">
                                    <div className="grade-label-assignment text-weight-500 display-flex-center">
                                        <span>Nota obtenida</span>
                                    </div>
                                    <div className="grade-value-assignment">
                                        {assignment.earnedScore? assignment.earnedScore: "--"} <span>/ 100</span>
                                    </div>
                                </div>

                                <div className="grade-item-assignment">
                                    <div className="grade-label-assignment text-weight-500 display-flex-center">
                                        <span>Fecha de entrega:</span>
                                    </div>
                                    <div className="due-date-assignment text-weight-500">
                                        {new Date(assignment.dueDate).toLocaleDateString()} {new Date(assignment.dueDate).toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>

                            {/* Archivos adjuntos como especificaciones */}
                            <div className="margin-bottom-1rem5 attachments-section-assignment">
                                <h3 className="text-weight-500">Especificación: </h3>
                                <div className="attachments-list-assignment">
                                    {assignment.attachments.map((attachment) => (
                                    <Button
                                        key={attachment.id}
                                        variant="outline"
                                        className="attachment-button-assignment"
                                        onClick={() => handleAttachmentClick(attachment)}
                                        >
                                        <div className="display-flex-center">
                                            <span className="text-weight-500">{attachment.name}.{attachment.extension}</span>
                                        </div>
                                        <div className="display-flex-center">
                                            <Download className="download-icon-assignment icon-size2" />
                                        </div>
                                    </Button>
                                ))}
                                </div>
                            </div>

                            {/* Carga de archivos */}
                            <div className="margin-bottom-1rem5 upload-section-assignment">
                                <h3 className="text-weight-500">Entrega:</h3>
                                <div
                                    className={`upload-area-assignment ${dragActive ? "drag-active" : ""}`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    >
                                    <input type="file" id="file-upload" className="file-input-assignment" onChange={handleChange} />
                                    <label htmlFor="file-upload" className="upload-label-assignment display-flex-center">
                                        <Upload className="upload-icon-assignment" />
                                        <p className="upload-text-assignment text-weight-500">Arrastrar archivo aquí o click para seleccionar</p>
                                    </label>
                                </div>
                            </div>

                            {/* Sección de archivo cargado*/}
                            {(uploadedFile || assignment.submission) && (
                                <div className="submission-section-assignment">
                                    <h3 className="text-weight-500">{uploadedFile ? "Listo para cargar:" : "Entrega actual:"}</h3>
                                    <div className="submission-file-assignment">
                                        <div className="file-info-assignment display-flex-center">
                                            <div className="file-details-assignment">
                                                <div>
                                                    <div className="file-name-assignment">{uploadedFile ? uploadedFile.name : `${assignment.submission.name}.${assignment.submission.extension}`}</div>
                                                    <div className="file-meta-assignment">
                                                        {uploadedFile? `Size: ${(uploadedFile.size / 1024).toFixed(1)} KB}`
                                                        : `Entregado: ${new Date(assignment.dueDate).toLocaleDateString()} ${new Date(assignment.dueDate).toLocaleTimeString()}`}
                                                    </div>
                                                </div>
                                            </div>
                                            {uploadedFile && (
                                                <Button
                                                variant="ghost"
                                                size="sm"
                                                className="remove-file-button-assignment"
                                                onClick={handleRemoveFile}
                                                >
                                                <X className="icon-size2" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    {uploadedFile && <Button className="submit-button-assignment">Cargar archivo</Button>}
                                </div>
                            )}
                            <div className="margin-bottom-1rem5 description-section-assignment">
                                <h3 className="text-weight-500">Observaciones:</h3>
                                <p>{assignment.commentary? assignment.commentary: ""}</p>
                            </div>

                            {/* Archivos adjuntos como feedback */}
                            {assignment.feedback && (
                                <div className="margin-bottom-1rem5 attachments-section-assignment">
                                    <h3 className="text-weight-500">Retroalimentación: </h3>
                                    <div className="attachments-list-assignment">
                                        {assignment.feedback.map((feedback) => (
                                            <Button
                                                key={feedback.id}
                                                variant="outline"
                                                className="attachment-button-assignment"
                                                onClick={() => handleFeedbackClick(attachment)}
                                                >
                                                <div className="display-flex-center">
                                                    <span className="text-weight-500">{feedback.name}.{feedback.extension}</span>
                                                </div>
                                                <div className="display-flex-center">
                                                    <Download className="download-icon-assignment icon-size2" />
                                                </div>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Tarjeta de miembros del grupo */}
                <div className="assignment-sidebar">
                    <Card className="group-card-assignment">
                        <CardHeader className="group-header-assignment">
                            <div className="display-flex-center">
                                <CardTitle>Miembros del grupo</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="group-content-assignment">
                            <div className="members-list-assignment">
                                {assignment.groupMembers? assignment.groupMembers.map((member) => (
                                    <div key={member.id} className="member-item-assignment">
                                        <div>
                                            <div className="text-weight-500">{member.firstName} {member.firstLastName} {member.secondLastName}</div>
                                        </div>
                                    </div>
                                )): (
                                    <div key={AlmacenarInfo.getItem('studentInfo').id} className="member-item-assignment">
                                        <div className="text-weight-500">
                                            {AlmacenarInfo.getItem('studentInfo').firstName} {AlmacenarInfo.getItem('studentInfo').firstLastName} {AlmacenarInfo.getItem('studentInfo').secondLastName}
                                        </div>
                                    </div>
                                )}
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

/* 
{
    "id": 3,
    "name": "Tarea 1",
    "category": "Tareas",
    "totalPercentage": 2,
    "earnedPercentage": null,
    "earnedScore": null,
    "commentary": null,
    "dueDate": "2025-05-23T23:50:00.5",
    "groupMembers": [
        {
            "studentID": 2021032537,
            "idCard": 50657,
            "firstName": "Ludwin",
            "firstLastName": "Ramos",
            "secondLastName": "Briceño",
            "email": "lujorabri@estudiantec.cr",
            "phoneNumber": "506",
            "password": "1234"
        },
        {
            "studentID": 2021032538,
            "idCard": 50657,
            "firstName": "Mario",
            "firstLastName": "Calvo",
            "secondLastName": "Will",
            "email": "lujorabri@estudiantec.cr",
            "phoneNumber": "506",
            "password": "1234"
        },
        {
            "studentID": 2021032539,
            "idCard": 50657,
            "firstName": "Pepe",
            "firstLastName": "Ferri",
            "secondLastName": "Meneses",
            "email": "lujorabri@estudiantec.cr",
            "phoneNumber": "506",
            "password": "1234"
        }
    ],
    "attachments": [
        {
            "id": 1,
            "name": "Modelo Conceptual",
            "extension": "pdf",
            "size": 68817
        }
    ],
    "submission": {
        "id": 8,
        "name": "quiz9",
        "extension": "pdf",
        "size": 194352,
        "uploadDate": "2025-05-22T00:39:49.643"
    },
    "feedback": null
}
*/