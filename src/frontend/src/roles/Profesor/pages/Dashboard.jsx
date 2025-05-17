// Imports
import { useState, useEffect } from "react"
import { useProfessorAuth } from "../hooks/useProfessorAuth"
import { useCoursesData } from "../hooks/useCoursesData"
import { useGroupsData } from "../hooks/useGroupsData"

// Import de los diferentes modulos de la vista
import DashboardHeader from "../components/Dashboard/DashboardHeader"
import DashboardNav from "../components/Dashboard/DashboardNav"

// Import de los estilos de los diferentes modulos de la vista
import "../styles/Dashboard.css"
import "../styles/Group.css"

// Import dashboard module components
import DefaultModule from "../components/Dashboard/DefaultModule"
import NewsModule from "../components/Dashboard/NewsModule"
import GroupModule from "../components/Dashboard/GroupModule"

// Función auxiliar para obtener parámetros de la URL
function useURLParams() {
  const getParam = (name) => {
    const params = new URLSearchParams(window.location.search)
    return params.get(name)
  }
  return { getParam }
}

export default function ProfessorDashboard() {
  const { professor, checkAuth } = useProfessorAuth()
  const { courses, isLoading: coursesLoading } = useCoursesData()
  const { groups, isLoading: groupsLoading } = useGroupsData()
  const { getParam } = useURLParams()

  // Obtener courseId y groupId de los parámetros de la URL
  const courseId = getParam("courseId")
  const groupId = getParam("groupId")

  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = useState("default") // pestaña por defecto

  // Estado para el curso y grupo seleccionados
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(null)

  // Verificar autenticación y cargar datos de curso/grupo
  useEffect(() => {
    // Verificar autenticación solo una vez al montar el componente
    const isLoggedIn = checkAuth()
    if (!isLoggedIn) {
      window.location.href = "/cedigital-profesores"
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Manejar la selección de curso y grupo desde los parámetros de la URL
  useEffect(() => {
    // Si no se proporciona courseId, redirigir a la selección de curso
    if (!courseId) {
      window.location.href = "/profesor-cursos"
      return
    }

    // Buscar el curso y grupo seleccionados
    if (!coursesLoading && courses.length > 0) {
      const course = courses.find((c) => c.id === courseId)
      if (course) {
        setSelectedCourse(course)
      } else {
        // Curso no encontrado, redirigir a la selección de curso
        window.location.href = "/profesor-cursos"
      }
    }

    if (!groupsLoading && groups.length > 0 && groupId) {
      const group = groups.find((g) => g.id === groupId)
      if (group) {
        setSelectedGroup(group)
      }
    }
  }, [courseId, groupId, courses, groups, coursesLoading, groupsLoading])

  // Manejar el cambio de pestaña
  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
  }

  // Manejar regreso a la selección
  const handleBackToSelection = () => {
    window.location.href = "/profesor-cursos"
  }

  // Mostrar estado de carga
  if (coursesLoading || groupsLoading || !selectedCourse || !professor) {
    return (
      <div className="dashboard-loading">
        <p>Cargando...</p>
      </div>
    )
  }

  // Renderizar el módulo apropiado según la pestaña activa
  const renderActiveModule = () => {
    switch (activeTab) {
      case "news":
        return <NewsModule course={selectedCourse} group={selectedGroup} professor={professor}/>
      case "group":
        return <GroupModule course={selectedCourse} group={selectedGroup} />

      default:
        return <DefaultModule course={selectedCourse} group={selectedGroup} />
    }
  }

  return (
    <div className="dashboard-container">
      <DashboardNav activeTab={activeTab} onTabChange={handleTabChange} professor={professor} onBackToSelection={handleBackToSelection}/>

      <div className="dashboard-main">

        <DashboardHeader
          selectedCourse={selectedCourse}
          selectedGroup={selectedGroup}
        />
        <div className="dashboard-content">{renderActiveModule()}</div>
      </div>
    </div>
  )
}
