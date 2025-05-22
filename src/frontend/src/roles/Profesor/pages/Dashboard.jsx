import { useState, useEffect } from "react"

// Importaciones de las funcinalidades
import { useProfessorAuth } from "../hooks/useProfessorAuth"
import { useProfessorGroupsWithCourses } from "../hooks/useProfessorGroupsWithCourses"

// Componentes de la página del dashboard
import DashboardNav from "../components/Dashboard/DashboardNav"
import DefaultModule from "../components/Dashboard/DefaultModule"

// Importaciones de los estilos de los componentes
import "../styles/Dashboard.css"
import "../styles/Noticias/News.css"
import "../styles/Grupo/Group.css"
import "../styles/Modal.css"
import "../styles/Rubros/Items.css"
import "../styles/Evaluaciones/Assignments.css"
import "../styles/Documentos/Documents.css"

// Importaciones de los módulos de la página (componentes)
import NewsModule from "../components/Modules/NewsModule"
import GroupModule from "../components/Modules/GroupModule"
import ItemsModule from "../components/Modules/ItemsModule"
import AssignmentsModule from "../components/Modules/AssignmentsModule"
//import DocumentsModule from "../components/Modules/DocumentModule" 

// Funcion auxiliar para el ActiveTable
function useURLParams() {
  const getParam = (name) => {
    const params = new URLSearchParams(window.location.search)
    return params.get(name)
  }
  return { getParam }
}

export default function ProfessorDashboard() {

  // Datos obtenidos de la API
  const { professor, checkAuth } = useProfessorAuth()
  const { data: groupsData, isLoading, error } = useProfessorGroupsWithCourses()
  const { getParam } = useURLParams()

  // Obtener los parámetros de la ULR
  const courseId = getParam("courseId")
  const groupId = getParam("groupId")

  // Estados
  const [activeTab, setActiveTab] = useState("news")
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [courses, setCourses] = useState([])

  // Verifica autenticacion
  useEffect(() => {
    const verifyAuth = async () => {
      const isLoggedIn = checkAuth()
      if (!isLoggedIn) {
        window.location.href = "/cedigital-profesores"
      }
      setIsCheckingAuth(false)
    }
    verifyAuth()
  }, [])

  // Procesa los datos y agrupa por curso
  useEffect(() => {
    if (!groupsData || groupsData.length === 0) return

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
      coursesMap[item.courseCode].groups.push({
        id: item.groupId.toString(),
        groupId: item.groupId,
        number: item.groupNumber,
        name: `Grupo ${item.groupNumber}`,
        semesterId: item.semesterId
      })
    })

    setCourses(Object.values(coursesMap))
  }, [groupsData])

  // Selecciona curso y grupo basado en los parametros de URL
  useEffect(() => {
    if (isCheckingAuth || isLoading || courses.length === 0) return

    if (!courseId) {
      window.location.href = "/profesor-cursos"
      return
    }

    const course = courses.find(c => c.id === courseId)
    if (!course) {
      window.location.href = "/profesor-cursos"
      return
    }

    setSelectedCourse(course)

    if (groupId) {
      const group = course.groups.find(g => g.id === groupId)
      setSelectedGroup(group || null)
    }
  }, [courseId, groupId, courses, isLoading, isCheckingAuth])

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
  }

  const handleBackToSelection = () => {
    window.location.href = "/profesor-cursos"
  }

  if (isCheckingAuth || isLoading) {
    return <div className="dashboard-loading">Cargando datos del profesor...</div>
  }

  if (error) {
    return <div className="dashboard-error">Error al cargar los grupos</div>
  }

  if (!selectedCourse) {
    return <div className="dashboard-loading">Cargando...</div>
  }

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
      /*case "documents":
        return <DocumentsModule course={selectedCourse} group={selectedGroup} /> */
      default:
        return <DefaultModule course={selectedCourse} group={selectedGroup} />
    }
  }

  return (
    <div className="dashboard-container">
      <DashboardNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        professor={professor}
        onBackToSelection={handleBackToSelection}
      />

      <div className="dashboard-main">
        <header className="dashboard-header">
          {selectedCourse.name}
          {selectedGroup && <span className="group-indicator"> - {selectedGroup.name}</span>}
        </header>
        <div className="dashboard-content">
          {renderActiveModule()}
        </div>
      </div>
    </div>
  )
}