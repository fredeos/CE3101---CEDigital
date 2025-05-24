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
    const [fileSystem, setFileSystem] = useState([])
    
    // Estado para monitorear el folder actual
    const [currentFolderId, setCurrentFolderId] = useState(-1)
    const [rootFolderID, setRootFolderId] = useState(-1)  // se almacena el id de la carpeta root (que es diferente al id inicial -1)

    // se manejan errores
    const [error, setError] = useState(null);

    // Itera cada objeto en filesSystem y toma el que tiene el id buscado
    const findItemById = (currentFolder_id) => {
        return fileSystem.find((item) => item.fileID === currentFolder_id)   
    }

    // Obtiene el folder actual (el objeto con los datos)
    const [currentFolder,setCurrentFolder] = useState(null);
    
    // Realiza la solicitud al servidor para obtener las carpetas y archivos dentro de una carpeta en un curso
    const fetchDocuments = async () => {
        try {
            const currentCourse = AlmacenarInfo.getItem('currentCourse');
            const encodedCourseId = encodeURIComponent(currentCourse.id);   // se obtiene el id del grupo del curso
            const encodedCurrentFolderId = encodeURIComponent(currentFolderId);  // se obtiene el id del estudiante
            const response = await fetch(`http://localhost:5039/api/folders/${encodedCourseId}/${encodedCurrentFolderId}/files`);
            
            if (!response.ok) {
                // Manejo específico por código de estado
                if (response.status > 301) {
                    throw new Error('Error al cargar el registro de evaluaciones del curso');
                }
            }else{
                const data = await response.json();  // se obtiene la respuesta en  formato Json del servidor
                console.log(data);
                setFileSystem(data);
            }
            
        } catch (err) {
            setError(err.message);
        } finally {
            
        }
    }

    // Maneja la solicitud al servido apenas se despliega la vista
    useEffect(() => {
        setError(null);
        fetchDocuments();
    },[currentFolderId]);

    // Cambia la carpeta actual, para simular la salida o la entrada en una carpeta
    const navigateToFolder = (folderId) => {
        // EL ORDEN EN EL QUE SE EJECUTAN ES IMPORTANTE AQUÍ, SINO DA ERROR
        const currentFolderInfo = findItemById(folderId)
        setCurrentFolder(currentFolderInfo);
        setCurrentFolderId(folderId)  // se establece como folder actual el folder que fue presionado (será el padre de los archivos o carpetas que aparecerán)

        // -1 es un id inicial para solictar el root, al primer cambio de carpeta se sabrá el id como tal de la carpeta root, y se mantendrá
        setRootFolderId(rootFolderID === -1? currentFolderInfo.parentID: rootFolderID); 
    
    }

    // Cambia la carpeta actual, por el padre de la que es actual, para simular la salida de una carpeta (regresarse)
    const navigateToParent = () => {
        setCurrentFolderId(currentFolder.parentID)
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
                        {currentFolderId !== -1 && currentFolderId !== rootFolderID?
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
                        {fileSystem.filter((item) => item.fileType === "folder").length > 0 && (
                        <div className="folders-section-documents">
                            <h3 className="folders-title-documents">Carpetas</h3>
                            <div className="folders-grid-documents">
                                {fileSystem.filter((item) => item.fileType === "folder").map((folder) => (
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
                        {fileSystem.filter((item) => item.fileType !== "folder").length > 0 && (
                        <div className="files-section-documents">
                            <h3 className="files-title-documents">Archivos</h3>
                            <div className="files-list-documents">
                                {fileSystem.filter((item) => item.fileType !== "folder")
                                    .map((file, index) => (
                                    <div
                                        key={file.fileID}
                                        className={`file-item-documents ${index !== fileSystem.filter((item) => item.fileType !== "folder").length - 1 ? "border-b" : ""}`}
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
                        {fileSystem.length === 0 && (
                            <div className="empty-folder-documents">Esta carpeta está vacía.</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default FileExplorer
