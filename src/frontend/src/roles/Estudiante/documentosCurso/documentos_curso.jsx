import { useState, useEffect } from "react"
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, User, Folder, FileText, Download, ExternalLink, ArrowUp } from "lucide-react"
import "./documentos_curso.css"
import {AlmacenarInfo} from '../sessionStorage/sessionStorage.js'

const FileExplorer = ({ onBack }) => {

    const navigate = useNavigate();

    // Ejemplo de como estará los datos estructurados enviados por la api
    const fileSystem = [
        
        {
            "fileID": 25,
            "parentID": 21,
            "fileName": "Apuntes",
            "fileType": "folder",
            "fileSize": 0,
            "uploadDate": "2025-05-19T22:19:52.557"
        },
        {
            "fileID": 21,
            "parentID": -1,
            "fileName": "Documentos públicos",
            "fileType": "folder",
            "fileSize": 0,
            "uploadDate": "2025-05-19T22:19:52.557"
        },
        {
            "fileID": 22,
            "parentID": -1,
            "fileName": "Examenes",
            "fileType": "folder",
            "fileSize": 0,
            "uploadDate": "2025-05-19T22:19:52.557"
        },
        {
            "fileID": 23,
            "parentID": -1,
            "fileName": "Proyectos",
            "fileType": "folder",
            "fileSize": 0,
            "uploadDate": "2025-05-19T22:19:52.557"
        },
        {
            "fileID": 24,
            "parentID": -1,
            "fileName": "Tareas",
            "fileType": "folder",
            "fileSize": 0,
            "uploadDate": "2025-05-19T22:19:52.557"
        },
        {
            "fileID": 4,
            "parentID": 21,
            "fileName": "quiz",
            "fileType": "pdf",
            "fileSize": 194352,
            "uploadDate": "2025-05-20T18:23:27.267"
        }
    ]
        
    // Estado para monitorear el folder actual
    const [currentFolderId, setCurrentFolderId] = useState(-1)

    
    // Itera cada objeto en filesSystem y toma el que tiene el id buscado
    const findItemById = (currentFolder_id) => {
        return fileSystem.find((item) => item.fileID === currentFolder_id)
        
    }

    // Obtiene el folder actual (el objeto con los datos)
    const currentFolder = findItemById(currentFolderId)

    // Se obtiene los hijos (objetos) de la carpeta actual (carpetas y archivos)
    const folderItems = fileSystem.filter((archivoCarpeta) => archivoCarpeta.parentID === currentFolderId)
    

    // Cambia la carpeta actual, para simular la salida o la entrada en una carpeta
    const navigateToFolder = (folderId) => {
        setCurrentFolderId(folderId)
    }

    // Cambia la carpeta actual, por el padre de la que es actual, para simular la salida de una carpeta (regresarse)
    const navigateToParent = () => {
        if (currentFolder.parentID) {
            setCurrentFolderId(currentFolder.parentID)
        }
    }

    // Converso de Formato de tamaño de archivo
    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + " Bytes"
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
        else return (bytes / 1048576).toFixed(1) + " MB"
    }

    // Para abrir archivos enviados por el api
    const handleFileClick = (file) => {
    console.log(`Opening file: ${file.fileName}`)
    // In a real app, this would open the file in the browser or download it
    // For browser-compatible files like PDFs, you might use:
    // window.open(fileUrl, '_blank')
    }

    // Se obtiene el tipo de icono según el tipo de archivo
    const getFileIcon = (fileType) => {
        switch (fileType) {
            case "pdf":
                return <FileText className="h-5 w-5 text-red-500" />
            case "word":
                return <FileText className="h-5 w-5 text-blue-500" />
            case "excel":
                return <FileText className="h-5 w-5 text-green-500" />
            case "powerpoint":
                return <FileText className="h-5 w-5 text-orange-500" />
            default:
                return <FileText className="h-5 w-5 text-gray-500" />
        }
    }

    // Verificar si el archivo es posible verlo con el browser (si está en la lista = true, si no = false)
    const isViewableInBrowser = (fileType) => {
        return ["pdf", "jpg", "jpeg", "png", "gif"].includes(fileType)
    }

    return (
        <div className="file-explorer-container">
            {/* Header */}
            <header className="header-documents">
                <div className="header-content-documents">
                    <div className="header-title-documents">CE-Digital</div>
                    <div className="flex items-center gap-2">
                        <div className="user-info-documents">
                            <span className="user-name-documents">{AlmacenarInfo.getItem('studentInfo').firstName} {AlmacenarInfo.getItem('studentInfo').firstLastName}</span>
                            <span className="user-email-documents">{AlmacenarInfo.getItem('studentInfo').email}</span>
                        </div>
                        <div className="user-avatar-documents">
                            <User className="h-5 w-5 text-slate-600" />
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto py-8 px-15">
                {/* Boton para volver */}
                <Button
                    variant="ghost"
                    className="back-button-documents"
                    onClick = {() => navigate(-1)}
                    >
                    <ArrowLeft className="h-4 w-4" />
                    Volver
                </Button>

                <Card className="card-documents">
                    <CardHeader className="card-header-documents">
                        <CardTitle className="card-title-documents">Documentos - {AlmacenarInfo.getItem('currentCourse').courseName}</CardTitle>
                    </CardHeader>

                    <CardContent className="card-content-container-documents">
                        {/* Encabezado que muestra la carpeta actual y el boton para salir de una carpeta*/}
                        {currentFolderId !== -1?
                        <div className="nav-container-documents">
                            <ArrowRight className="h-3 w-6" />
                            <u className="user-name-documents">{currentFolder.fileName}</u>

                            {(currentFolderId !== -1) && (
                                <Button variant="ghost" size="sm" className="up-button-documents" onClick={navigateToParent}>
                                    <ArrowUp className="h-4 w-4 mr-1" />
                                    Anterior
                                </Button>
                            )}
                        </div>
                        : ""
                        }

                        {/* Manejo de vista de carpetas */}
                        {folderItems.filter((item) => item.fileType === "folder").length > 0 && (
                        <div className="folders-section-documents">
                            <h3 className="folders-title-documents">Carpetas</h3>
                            <div className="folders-grid-documents">
                                {folderItems.filter((item) => item.fileType === "folder").map((folder) => (
                                    <Button
                                        key={folder.fileID}
                                        variant="outline"
                                        className="folder-button-documents"
                                        onClick={() => navigateToFolder(folder.fileID)}
                                    >
                                        <Folder className="h-5 w-5 mr-2 text-blue-500" />
                                        <span>{folder.fileName}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                        )}

                        {/* Manejo de vista de archivos */}
                        {folderItems.filter((item) => item.fileType !== "folder").length > 0 && (
                        <div className="files-section-documents">
                            <h3 className="files-title-documents">Archivos</h3>
                            <div className="files-list-documents">
                                {folderItems.filter((item) => item.fileType !== "folder")
                                    .map((file, index) => (
                                    <div
                                        key={file.fileID}
                                        className={`file-item-documents ${index !== folderItems.filter((item) => item.fileType !== "folder").length - 1 ? "border-b" : ""}`}
                                    >
                                        <div className="file-info-documents">
                                            {getFileIcon(file.fileType)}
                                            <span className="ml-2">{file.fileName}</span>
                                            <span className="file-size-documents">{formatFileSize(file.fileSize)}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="file-date-documents"> Subido: {new Date(file.uploadDate).toLocaleDateString()} {new Date(file.uploadDate).toLocaleTimeString()}</span>
                                            {isViewableInBrowser(file.fileType) ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="file-action-button-documents"
                                                    onClick={() => handleFileClick(file)}
                                                    >
                                                    <ExternalLink className="h-4 w-4 mr-1" />
                                                    Abrir
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="file-action-button-documents"
                                                    onClick={() => handleFileClick(file)}
                                                    >
                                                    <Download className="h-4 w-4 mr-1" />
                                                    Descargar
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        )}

                        {/* Cuando la carpeta está vacía */}
                        {folderItems.length === 0 && (
                            <div className="empty-folder-documents">Esta carpeta está vacía.</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default FileExplorer