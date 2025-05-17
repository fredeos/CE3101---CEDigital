import { useState, useEffect } from "react"
import { useProfessorAuth } from "../hooks/useProfessorAuth"
import { useCoursesData } from "../hooks/useCoursesData"
import { useGroupsData } from "../hooks/useGroupsData"
import { LogOut, BookOpen, Users, ChevronRight } from "lucide-react"
import "../styles/CourseSelection.css"

export default function CourseSelection() {
    const { professor, logout, checkAuth } = useProfessorAuth()
    const { courses, isLoading: coursesLoading } = useCoursesData()
    const { getGroupsByCourse, isLoading: groupsLoading } = useGroupsData()

    const [selectedCourse, setSelectedCourse] = useState(null)
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [courseGroups, setCourseGroups] = useState([])

    // Verificación de autenticación de usuario
    useEffect(() => {
        const isLoggedIn = checkAuth()
        if (!isLoggedIn) {
            // Redireccionamiento al inicio de sesión sino está autenticado
            window.location.href = "/cedigital-profesores"
        }
    }, [])

    // Actualizar los grupos disponibles cuando cambia el curso
    useEffect(() => {
        if (selectedCourse) {
            const groups = getGroupsByCourse(selectedCourse.id)
            setCourseGroups(groups)
            setSelectedGroup(null) // Restablecer la selección de grupo cuando cambia el curso
        } else {
            setCourseGroups([])
            setSelectedGroup(null)
        }
    }, [selectedCourse, getGroupsByCourse])

    // Maneja el estado de la selección del curso
    const handleCourseSelect = (course) => {
        setSelectedCourse(course)
    }

    // Maneja el estado de la selección del grupo
    const handleGroupSelect = (group) => {
        setSelectedGroup(group)
    }

    // Maneja la acción de cerrar sesión
    const handleLogout = () => {
        logout()
        window.location.href = "/cedigital-profesores"
    }

    // Maneja la acción de continuar al seleccionar el curso y grupo
    const handleSelectGroup = (course, group) => {
        // Navigate to dashboard with course and group IDs
        window.location.href = `/gestion-grupo?courseId=${course.id}&groupId=${group.id}`
    }

    //En caso de estar presente la información, no mostrar la vista
    if (!professor || coursesLoading || groupsLoading) {
        return <div className="loading">Cargando...</div>
    }

    return (
        <div className="course-selection-container">

            {/* Encabezado */}
            <div className="selection-header">

                {/* Perfil del profesor */}
                <div className="professor-profile">
                    <div className="avatar">
                        <div className="avatar-initials">
                            {professor.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                        </div>
                        <div className="professor-info">
                            <h1 className="professor-name">{professor.name}</h1>
                        </div>
                    </div>
                </div>

                {/* Cerrar sesión */}
                <button className="btn-logout" onClick={handleLogout}>
                    <LogOut size={16} />
                    Cerrar sesión
                </button>

            </div>

            {/* Contenido principal */}
            <div className="selection-content">

                {/* Encabezado */}
                <div className="selection-head">
                    <p className="selection-description">
                        Eliga el grupo que desea gestionar.
                    </p>
                </div>

                {/* Parrilla de selección */}
                <div className="direct-selection-grid">
                    {courses.map((course) => (
                        <div key={course.id} className="course-card">
                            <div className="course-card-header">
                                <h3 className="course-name">{course.name} </h3>
                                <p className="course-code">[{course.code}]</p>
                            </div>

                            <div className="course-groups">
                                {getGroupsByCourse(course.id).map((group) => (
                                    <div key={group.id} className="group-item">
                                        <div className="group-info">
                                            <div className="group-icon">
                                                <Users size={16} />
                                            </div>
                                            <div className="group-details">
                                                <div className="group-name">{group.name}</div>
                                            </div>
                                        </div>
                                        <button className="btn-select-group" onClick={() => handleSelectGroup(course, group)}>
                                            Select
                                        </button>
                                    </div>
                                ))}
                                {getGroupsByCourse(course.id).length === 0 && (
                                    <div className="no-groups">No hay grupos disponibles para este curso</div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
