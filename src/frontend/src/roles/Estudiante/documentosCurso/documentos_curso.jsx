import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, ArrowRight, User, Folder, FileText, ChevronRight, Download, ExternalLink, ArrowUp } from "lucide-react"
import "./documentos_curso.css"

const FileExplorer = ({ onBack }) => {
    // Sample user data
    const user = {
        name: "Alex Johnson",
        email: "alex.johnson@university.edu",
        studentId: "U2023456",
    }

    // Sample file structure data as an array - in a real app, this would come from an API
    const fileSystem = [
        {
            id: "root",
            type: "folder",
            name: "Course Materials",
            items: ["folder1", "folder2", "file1", "file2"],
            parent: null,
        },
        {
            id: "folder1",
            type: "folder",
            name: "Assignments",
            parent: "root",
            items: ["folder3", "file3", "file4"],
        },
        {
            id: "folder2",
            type: "folder",
            name: "Lecture Notes",
            parent: "root",
            items: ["file5", "file6", "file7"],
        },
        {
            id: "folder3",
            type: "folder",
            name: "Assignment 1 Resources",
            parent: "folder1",
            items: ["file8", "file9"],
        },
        {
            id: "file1",
            type: "file",
            name: "Course Syllabus.pdf",
            fileType: "pdf",
            size: "245 KB",
            uploadDate: "2025-01-15",
            parent: "root",
        },
        {
            id: "file2",
            type: "file",
            name: "Schedule.xlsx",
            fileType: "excel",
            size: "132 KB",
            uploadDate: "2025-01-15",
            parent: "root",
        },
        {
            id: "file3",
            type: "file",
            name: "Assignment 1.pdf",
            fileType: "pdf",
            size: "320 KB",
            uploadDate: "2025-01-20",
            parent: "folder1",
        },
        {
            id: "file4",
            type: "file",
            name: "Assignment 2.pdf",
            fileType: "pdf",
            size: "290 KB",
            uploadDate: "2025-02-05",
            parent: "folder1",
        },
        {
            id: "file5",
            type: "file",
            name: "Lecture 1 - Introduction.pptx",
            fileType: "powerpoint",
            size: "1.2 MB",
            uploadDate: "2025-01-18",
            parent: "folder2",
        },
        {
            id: "file6",
            type: "file",
            name: "Lecture 2 - Fundamentals.pptx",
            fileType: "powerpoint",
            size: "1.5 MB",
            uploadDate: "2025-01-25",
            parent: "folder2",
        },
        {
            id: "file7",
            type: "file",
            name: "Lecture Notes - Week 1.pdf",
            fileType: "pdf",
            size: "450 KB",
            uploadDate: "2025-01-19",
            parent: "folder2",
        },
        {
            id: "file8",
            type: "file",
            name: "Assignment 1 Template.docx",
            fileType: "word",
            size: "125 KB",
            uploadDate: "2025-01-20",
            parent: "folder3",
        },
        {
            id: "file9",
            type: "file",
            name: "Dataset for Assignment 1.csv",
            fileType: "csv",
            size: "540 KB",
            uploadDate: "2025-01-20",
            parent: "folder3",
        },
    ]

    // State to track current folder
    const [currentFolderId, setCurrentFolderId] = useState("root")

    // Helper function to find an item by ID
    const findItemById = (id) => {
        return fileSystem.find((item) => item.id === id)
    }

    // Get current folder data
    const currentFolder = findItemById(currentFolderId)

    // Get items in current folder
    const folderItems = currentFolder.items.map((id) => findItemById(id))

    // Function to build breadcrumb path
    const getBreadcrumbPath = () => {
        const path = []
        let current = currentFolder
        path.unshift({ id: current.id, name: current.name })

        while (current.parent) {
            current = findItemById(current.parent)
            path.unshift({ id: current.id, name: current.name })
        }

        return path
    }

    // Get breadcrumb path
    const breadcrumbPath = getBreadcrumbPath()

    // Navigate to folder
    const navigateToFolder = (folderId) => {
        setCurrentFolderId(folderId)
    }

    // Navigate to parent folder
    const navigateToParent = () => {
        if (currentFolder.parent) {
            setCurrentFolderId(currentFolder.parent)
        }
    }

    // Handle file click
    const handleFileClick = (file) => {
    console.log(`Opening file: ${file.name}`)
    // In a real app, this would open the file in the browser or download it
    // For browser-compatible files like PDFs, you might use:
    // window.open(fileUrl, '_blank')
    }

    // Get icon for file type
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

    // Check if file is viewable in browser
    const isViewableInBrowser = (fileType) => {
        return ["pdf", "jpg", "jpeg", "png", "gif"].includes(fileType)
    }

    return (
        <div className="file-explorer-container">
            {/* Header */}
            <header className="header">
                <div className="header-content">
                    <div className="header-title">CE-Digital</div>
                    <div className="flex items-center gap-2">
                        <div className="user-info">
                            <span className="user-name">{user.name}</span>
                            <span className="user-email">{user.email}</span>
                        </div>
                        <div className="user-avatar">
                            <User className="h-5 w-5 text-slate-600" />
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto py-8 px-4">
                {/* Back button */}
                <Button
                    variant="ghost"
                    className="back-button"
                    
                    >{/*onClick={onBack}*/}
                    <ArrowLeft className="h-4 w-4" />
                    Volver
                </Button>

                <Card className="card">
                    <CardHeader className="card-header">
                        <CardTitle className="card-title">Nombre del curso</CardTitle>
                    </CardHeader>

                    <CardContent className="card-content-container">
                        {/* Breadcrumb navigation - Fixed to avoid nested li elements */}
                        <div className="nav-container">
                            <ArrowRight className="h-3 w-6" />
                            <u className="user-name">{currentFolder.name}</u>

                            {currentFolder.parent && (
                                <Button variant="ghost" size="sm" className="up-button" onClick={navigateToParent}>
                                    <ArrowUp className="h-4 w-4 mr-1" />
                                    Anterior
                                </Button>
                            )}
                        </div>

                        {/* Folders */}
                        {folderItems.filter((item) => item.type === "folder").length > 0 && (
                        <div className="folders-section">
                            <h3 className="folders-title">Folders</h3>
                            <div className="folders-grid">
                                {folderItems.filter((item) => item.type === "folder").map((folder) => (
                                    <Button
                                        key={folder.id}
                                        variant="outline"
                                        className="folder-button"
                                        onClick={() => navigateToFolder(folder.id)}
                                    >
                                        <Folder className="h-5 w-5 mr-2 text-blue-500" />
                                        <span>{folder.name}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                        )}

                        {/* Files */}
                        {folderItems.filter((item) => item.type === "file").length > 0 && (
                        <div className="files-section">
                            <h3 className="files-title">Files</h3>
                            <div className="files-list">
                            {folderItems
                                .filter((item) => item.type === "file")
                                .map((file, index) => (
                                <div
                                    key={file.id}
                                    className={`file-item ${
                                    index !== folderItems.filter((item) => item.type === "file").length - 1 ? "border-b" : ""
                                    }`}
                                >
                                    <div className="file-info">
                                        {getFileIcon(file.fileType)}
                                        <span className="ml-2">{file.name}</span>
                                        <span className="file-size">{file.size}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="file-date">{file.uploadDate}</span>
                                        {isViewableInBrowser(file.fileType) ? (
                                            <Button
                                            variant="ghost"
                                            size="sm"
                                            className="file-action-button"
                                            onClick={() => handleFileClick(file)}
                                            >
                                            <ExternalLink className="h-4 w-4 mr-1" />
                                            Open
                                            </Button>
                                        ) : (
                                            <Button
                                            variant="ghost"
                                            size="sm"
                                            className="file-action-button"
                                            onClick={() => handleFileClick(file)}
                                            >
                                            <Download className="h-4 w-4 mr-1" />
                                            Download
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                ))}
                            </div>
                        </div>
                        )}

                        {/* Empty folder message */}
                        {folderItems.length === 0 && (
                        <div className="empty-folder">This folder is empty.</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default FileExplorer