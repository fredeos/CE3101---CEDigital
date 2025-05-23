import { useState, useEffect } from "react"

// Importacion para autenticacion y datos de grupos/cursos
import { useProfessorAuth } from "../hooks/useProfessorAuth"
import { useProfessorGroupsWithCourses } from "../hooks/useProfessorGroupsWithCourses"

// Importa componentes principales del dashboard
import DashboardNav from "../components/Dashboard/DashboardNav"
import DefaultModule from "../components/Dashboard/DefaultModule"

// Importa estilos CSS para los componentes
import "../styles/Dashboard.css"
import "../styles/Noticias/News.css"
import "../styles/Grupo/Group.css"
import "../styles/Modal.css"
import "../styles/Rubros/Items.css"
import "../styles/Evaluaciones/Assignments.css"
import "../styles/Documentos/Documents.css"

// Importa modulos funcionales del dashboard
import NewsModule from "../components/Modules/NewsModule"
import GroupModule from "../components/Modules/GroupModule"
import ItemsModule from "../components/Modules/ItemsModule"
import AssignmentsModule from "../components/Modules/AssignmentsModule"
//import DocumentsModule from "../components/Modules/DocumentModule"
//import RatingsModule from "../components/Modules/RatingsModule" 
//import GradesModule from "../components/Modules/GradesModule" 

// Funcion auxiliar para obtener parámetros de la URL
function useURLParams() {
  const getParam = (name) => {
    const params = new URLSearchParams(window.location.search)
    return params.get(name)
  }
  return { getParam }
}

export default function ProfessorDashboard() {

  // Obtiene datos del profesor y funcion de autenticación
  const { professor, checkAuth } = useProfessorAuth()

  // Obtiene datos de grupos y cursos del profesor
  const { data: groupsData, isLoading, error } = useProfessorGroupsWithCourses()

  // Lee parametros de la URL
  const { getParam } = useURLParams()

  // Establece parametros de curso y grupo de la URL
  const courseId = getParam("courseId")
  const groupId = getParam("groupId")

  // Estados locales para pestaña activa, curso/grupo seleccionado, autenticación y cursos
  const [activeTab, setActiveTab] = useState("news")
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [courses, setCourses] = useState([])

  // Verifica autenticacion del profesor al cargar el componente
  useEffect(() => {
    const verifyAuth = async () => {
      const isLoggedIn = checkAuth()
      if (!isLoggedIn) {
        window.location.href = "/cedigital-profesores" // Redirige si no esta autenticado
      }
      setIsCheckingAuth(false)
    }
    verifyAuth()
  }, [])

  // Procesa los datos de grupos/cursos y los agrupa por curso
  useEffect(() => {
    if (!groupsData || groupsData.length === 0) return

    // Mapeo de los valores
    const coursesMap = {}
    groupsData.forEach(item => {
      if (!coursesMap[item.courseCode]) {
        coursesMap[item.courseCode] = {
          id: item.courseCode,
          code: item.courseCode,
          name: item.courseName,
          credits: item.credits,
          career: item.career,
          groups: []
        }
      }
      // Agrega grupo al curso correspondiente agrupado previamente
      coursesMap[item.courseCode].groups.push({
        id: item.groupId.toString(),
        groupId: item.groupId,
        number: item.groupNumber,
        name: `Grupo ${item.groupNumber}`,
        semesterId: item.semesterId
      })
    })

    setCourses(Object.values(coursesMap)) // Actualiza el estado de cursos
  }, [groupsData])

  // Selecciona curso y grupo segun los parámetros de la URL
  useEffect(() => {
    if (isCheckingAuth || isLoading || courses.length === 0)
      return

    if (!courseId) {
      window.location.href = "/profesor-cursos" // Redirige si no hay curso en la URL
      return
    }

    const course = courses.find(c => c.id === courseId)
    if (!course) {
      window.location.href = "/profesor-cursos" // Redirige si el curso no existe
      return
    }

    setSelectedCourse(course)

    if (groupId) {
      const group = course.groups.find(g => g.id === groupId)
      setSelectedGroup(group || null)
    }
  }, [courseId, groupId, courses, isLoading, isCheckingAuth])

  // Cambia la pestana activa del dashboard
  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
  }

  // Regresa a la seleccion de cursos
  const handleBackToSelection = () => {
    window.location.href = "/profesor-cursos"
  }

  // Muestra mensaje de carga mientras se obtienen datos o autenticacion
  if (isCheckingAuth || isLoading) {
    return <div className="dashboard-loading">Cargando datos del profesor...</div>
  }

  // Muestra mensaje de error si falla la carga de datos
  if (error) {
    return <div className="dashboard-error">Error al cargar los grupos</div>
  }

  // Muestra mensaje de carga si aún no hay curso seleccionado
  if (!selectedCourse) {
    return <div className="dashboard-loading">Cargando...</div>
  }

  // Renderiza el modulo activo segun la pestana seleccionada
  const renderActiveModule = () => {
    switch (activeTab) {
      case "news":
        return <NewsModule course={selectedCourse} group={selectedGroup} professor={professor} />
      case "group":
        return <GroupModule course={selectedCourse} group={selectedGroup} />
      case "items":
        return <ItemsModule course={selectedCourse} group={selectedGroup} />
      case "assessments":
        return <AssignmentsModule course={selectedCourse} group={selectedGroup} />
/*       case "documents":
        return <DocumentsModule /> 
      case "deliverables":
        return <RatingsModule  /> 
      case "grades":
        return <GradesModule  />  */
      default:
        return <DefaultModule course={selectedCourse} group={selectedGroup} />
    }
  }

  // Render principal del dashboard
  return (
    <div className="dashboard-container">
      {/* Barra de navegacion del dashboard */}
      <DashboardNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        professor={professor}
        onBackToSelection={handleBackToSelection}
      />

      <div className="dashboard-main">
        {/* Encabezado con nombre del curso y grupo */}
        <header className="dashboard-header">
          {selectedCourse.name}
          {selectedGroup && <span className="group-indicator"> - {selectedGroup.name}</span>}
        </header>
        {/* Contenido principal del dashboard */}
        <div className="dashboard-content">
          {renderActiveModule()}
        </div>
      </div>
    </div>
  )
}