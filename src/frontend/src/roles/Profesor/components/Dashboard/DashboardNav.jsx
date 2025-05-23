import { Newspaper, User, Users, FileText, List, ClipboardCheck, FileCheck, BarChart3, ChevronLeft } from "lucide-react"

export default function DashboardNav({ activeTab, onTabChange, onBackToSelection, professor }) {
  
  // Modulos a usar dentro del activeTab del dashboard
  const navItems = [
    { id: "news", label: "Noticias", icon: Newspaper },
    { id: "group", label: "Grupo", icon: Users },
    { id: "documents", label: "Documentos", icon: FileText },
    { id: "items", label: "Rubros", icon: List },
    { id: "assessments", label: "Asignaciones", icon: ClipboardCheck },
    { id: "deliverables", label: "Entregables", icon: FileCheck },
    { id: "grades", label: "Notas", icon: BarChart3 },
  ]

  // Componente de barra de navegacion del dashboard
  return (
    <nav className="dashboard-nav">
      
      {/* Boton para volver */}
      <div className="btn-back-container">
        <button className="btn-back" onClick={onBackToSelection}>
          <ChevronLeft size={18} />
          <span>Volver</span>
        </button>
      </div>

      {/* Opciones del activeTab */}
      <ul className="nav-list">
        {navItems.map((item) => (
          <li key={item.id} className="nav-item">
            <button
              className={`nav-button ${activeTab === item.id ? "active" : ""}`}
              onClick={() => onTabChange(item.id)}
            >
              <item.icon size={20} className="nav-icon" />
              <span className="nav-label">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>

      {/* Informacion del profesor */}
      <div className="professor-info">
        <User size={20} />
        <span>{professor.firstName} {professor.firstLastName}</span>
      </div>

    </nav>
  )
}
