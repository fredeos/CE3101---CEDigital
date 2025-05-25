import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, Folder, FileText, Download, ExternalLink, Trash2 } from "lucide-react"
import { UploadFileModal } from "../Custom/UploadFileModal"
import Modal from "../Modal"
import "../../styles/Documentos/Docs.css"

const DocumentsModule = ({ course, group }) => {
    // Estado para los archivos y carpetas
    const [fileSystem, setFileSystem] = useState([]);
    const [currentFolderId, setCurrentFolderId] = useState(-1);
    const [rootFolderID, setRootFolderId] = useState(null);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [error, setError] = useState(null);
    const [currentFolderName, setCurrentFolderName] = useState("");
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [selectedFolderId, setSelectedFolderId] = useState(currentFolderId);
    const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [creatingFolder, setCreatingFolder] = useState(false);

    // Carpetas protegidas
    const protectedFolders = ["Presentaciones", "Quices", "Examenes", "Proyectos", "Documentos públicos"];

    // Obtener archivos y carpetas desde el backend
    const fetchDocuments = async () => {
        try {
            setError(null);
            // Ahora usamos group en vez de course
            const groupId = group?.id || "";
            const encodedGroupId = encodeURIComponent(groupId);
            const encodedCurrentFolderId = encodeURIComponent(currentFolderId);
            const response = await fetch(`http://localhost:5039/api/folders/${encodedGroupId}/${encodedCurrentFolderId}/files`);
            if (!response.ok) {
                throw new Error('Error al cargar los documentos del grupo');
            }
            const data = await response.json();
            setFileSystem(data);

            // Establecer rootFolderID solo si es la primera carga (currentFolderId === -1)
            if (currentFolderId === -1 && data.length > 0) {
                setRootFolderId(data[0].parentID);
                setCurrentFolderId(data[0].parentID);
            }
        } catch (err) {
            setError(err.message);
        }
    };

    // Subir un archivo a la carpeta seleccionada
    const handleUploadFile = async (file) => {
        const groupId = group?.id;
        const folderId = selectedFolderId;
        const formData = new FormData();
        formData.append("files", file);

        try {
            const response = await fetch(
                `http://localhost:5039/api/documents/upload/${groupId}/${folderId}`,
                {
                    method: "POST",
                    body: formData,
                }
            );
            if (!response.ok) throw new Error("Error al subir el archivo");
            // Recarga los documentos después de subir
            fetchDocuments();
        } catch (err) {
            alert("No se pudo subir el archivo");
        }
    };

    // Crear un folder a la raiz
    const handleCreateFolder = async () => {
        const groupId = group?.id;
        const parentId = currentFolderId;
        const now = new Date().toISOString();

        const body = { fileID: 0, parentID: parentId, fileName: newFolderName, fileType: "folder", fileSize: 0, uploadDate: now, };

        try {
            const response = await fetch(
                `http://localhost:5039/api/folders/add/${groupId}/${parentId}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                }
            );
            if (!response.ok) throw new Error("Error al crear la carpeta");
            setCreateFolderModalOpen(false);
            setNewFolderName("");
            fetchDocuments();
        } catch (err) {
            alert("No se pudo crear la carpeta");
        }
    };

    // Eliminar una carpeta creada por el profesor
    const handleDeleteFolder = async (folderId) => {
        if (!window.confirm("¿Seguro que deseas eliminar esta carpeta?")) return;
        try {
            const response = await fetch(
                `http://localhost:5039/api/folders/removed/${folderId}`,
                { method: "DELETE" }
            );
            if (!response.ok) throw new Error("Error al eliminar la carpeta");
            fetchDocuments();
        } catch (err) {
            alert("No se pudo eliminar la carpeta");
        }
    };

    const getFileDownloadUrl = (file) => {
        if (!file || !group?.id) return null;
        return `http://localhost:5039/api/documents/download/${group.id}/${file.fileID}`;
    };

    // Actualiza archivos y carpetas al cambiar de carpeta
    useEffect(() => {
        fetchDocuments();
    }, [currentFolderId, group]);

    // Encuentra el objeto de la carpeta actual
    useEffect(() => {
        const folder = fileSystem.find((item) => item.fileID === currentFolderId);
        setCurrentFolder(folder);
        console.log("currentFolder:", folder);
    }, [fileSystem, currentFolderId]);

    // Actualiza el nombre de la carpeta y la almacena
    useEffect(() => {
        if (currentFolderId === rootFolderID) {
            setCurrentFolderName(group?.name || group?.code || "Raíz");
        }
    }, [currentFolderId, rootFolderID, group]);

    // Navegar a una carpeta
    const navigateToFolder = (folderId) => {
        const folder = fileSystem.find(item => item.fileID === folderId);
        setCurrentFolderId(folderId);
        setCurrentFolderName(folder ? folder.fileName : "");
    };

    // Navegar a la carpeta padre
    const navigateToParent = () => {
        if (currentFolder && currentFolder.parentID) {
            setCurrentFolderId(currentFolder.parentID);
        } else {
            setCurrentFolderId(rootFolderID);
        }
    };

    // Formato de tamaño de archivo
    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + " Bytes";
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
        else return (bytes / 1048576).toFixed(1) + " MB";
    };

    // Icono según tipo de archivo
    const getFileIcon = (fileType) => {
        switch (fileType) {
            case "pdf":
                return <FileText color="red" size={18} />;
            case "word":
                return <FileText color="blue" size={18} />;
            case "excel":
                return <FileText color="green" size={18} />;
            case "powerpoint":
                return <FileText color="orange" size={18} />;
            default:
                return <FileText color="gray" size={18} />;
        }
    };

    // Verificar si el archivo es visualizable en el navegador
    const isViewableInBrowser = (fileType) => {
        return ["pdf", "jpg", "jpeg", "png", "gif"].includes(fileType);
    };

    // Abrir o descargar archivo
    const handleFileClick = (file) => {
        // Aquí puedes implementar la lógica real de abrir o descargar
        console.log(`Opening file: ${file.fileName}`);
        // window.open(file.url, '_blank');
    };

    // Filtrar carpetas y archivos hijos de la carpeta actual
    const folderItems = fileSystem.filter((item) => item.parentID === currentFolderId);

    return (
        <div className="dashboard-module">
            {/* Header */}
            <div className="module-header">
                <div>Gestión de documentos</div>


                <div className="header-actions">

                    <div className="header-actions">
                        {/* Selector de carpeta destino */}
                        <div className="header-actions">
                            <label style={{ marginRight: 1 }}>Carpeta destino:</label>
                            <select
                                value={selectedFolderId}
                                onChange={e => setSelectedFolderId(Number(e.target.value))}
                                className="dropdown-toggle"
                            >
                                {fileSystem.filter(f => f.fileType === "folder").map(folder => (
                                    <option key={folder.fileID} value={folder.fileID}>
                                        {folder.fileName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button className="btn-submit" onClick={() => setUploadModalOpen(true)}>
                            Cargar archivo
                        </button>
                    </div>

                    <UploadFileModal
                        isOpen={uploadModalOpen}
                        onClose={() => setUploadModalOpen(false)}
                        onUpload={handleUploadFile}
                    />

                    <span>|</span>

                    {/*Crear carpeta*/}
                    {createFolderModalOpen && (
                        <Modal
                            isOpen={createFolderModalOpen}
                            onClose={() => {
                                setCreateFolderModalOpen(false);
                                setNewFolderName("");
                            }}
                            title="Crear nueva carpeta"
                            actions={
                                <>
                                    <button
                                        className="btn-cancel"
                                        onClick={() => {
                                            setCreateFolderModalOpen(false);
                                            setNewFolderName("");
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        className="btn-submit"
                                        disabled={creatingFolder || !newFolderName.trim()}
                                        onClick={async () => {
                                            setCreatingFolder(true);
                                            await handleCreateFolder();
                                            setCreatingFolder(false);
                                        }}
                                    >
                                        Crear
                                    </button>
                                </>
                            }
                        >
                            <div>
                                <label>Nombre de la carpeta:</label>
                                <input
                                    type="text"
                                    value={newFolderName}
                                    onChange={e => setNewFolderName(e.target.value)}
                                    autoFocus
                                    style={{ width: "100%", marginTop: 8, padding: 6 }}
                                    maxLength={50}
                                    placeholder="Nombre de la carpeta"
                                />
                            </div>
                        </Modal>
                    )}

                    <button className="btn-submit" onClick={() => setCreateFolderModalOpen(true)}>
                        Crear carpeta
                    </button>
                </div>


            </div>

            <Card className="card-cnt">
                <CardContent className="card-content-container">
                    {/* Navegación de carpetas */}
                    {currentFolderId !== rootFolderID && rootFolderID !== null && (
                        <div className="nav-container">
                            <div className="nav-header-prof">
                                <ArrowRight size={16} />
                                <h4>
                                    <h4>{currentFolderName}</h4>
                                </h4>
                            </div>
                            <Button variant="ghost" size="sm" className="up-button" onClick={navigateToParent}>
                                <ArrowLeft size={18} />
                                Anterior
                            </Button>
                        </div>
                    )}

                    {/* Vista de carpetas */}
                    <div className="folders-section">
                        <h3 className="folders-title">Carpetas</h3>
                        {folderItems.filter((item) => item.fileType === "folder").map((folder) => (
                            <div className="grid-grid" key={folder.fileID}>
                                <Button
                                    variant="outline"
                                    className="folder-button"
                                    onClick={() => navigateToFolder(folder.fileID)}
                                >
                                    <Folder color="#FFD04A" fill="#FFD04A" />
                                    <span>{folder.fileName}</span>
                                </Button>
                                {!protectedFolders.includes(folder.fileName) ? (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDeleteFolder(folder.fileID)}
                                        className="btn-icon delete"
                                        title="Eliminar carpeta"
                                    >
                                        <Trash2 size={16} color="red"/>
                                    </Button>
                                ) : (
                                    // Espacio reservado para el botón
                                    <div style={{ minWidth: 32 }} />
                                )}
                            </div>
                        ))}

                    </div>

                    {/* Vista de archivos */}
                    {folderItems.filter((item) => item.fileType !== "folder")
                        .map((file, index) => (
                            <div
                                key={file.fileID}
                                className={`file-item ${index !== folderItems.filter((item) => item.fileType !== "folder").length - 1 ? "border-b" : ""}`}
                            >
                                <div className="file-info">
                                    {getFileIcon(file.fileType)}
                                    <span className="ml-2">{file.fileName}</span>
                                    <span className="file-size">{formatFileSize(file.fileSize)}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="file-date">{new Date(file.uploadDate).toLocaleDateString()}</span>
                                    <span className="file-date">{new Date(file.uploadDate).toLocaleTimeString()}</span>
                                    <a
                                        href={getFileDownloadUrl(file)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="file-action-button"
                                        style={{ display: "inline-flex", alignItems: "center", marginLeft: 8 }}
                                    >
                                        <Download className="h-4 w-4 mr-1" />
                                        Descargar
                                    </a>
                                </div>
                            </div>
                        ))}

                    {/* Cuando la carpeta está vacía */}
                    {folderItems.length === 0 && !error && (
                        <div className="empty-folder">Esta carpeta está vacía</div>
                    )}

                    {/* Mostrar errores */}
                    {error && (
                        <div className="empty-folder" style={{ color: "red" }}>{error}</div>
                    )}
                </CardContent>
            </Card>
        </div >
    )
}

export default DocumentsModule