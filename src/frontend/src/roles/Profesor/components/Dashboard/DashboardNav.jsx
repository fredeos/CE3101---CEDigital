import { Newspaper, Users, FileText, List, ClipboardCheck, FileCheck, BarChart3, ChevronLeft } from "lucide-react"

export default function DashboardNav({ activeTab, onTabChange, onBackToSelection, professor }) {
  const navItems = [
    { id: "news", label: "Noticias", icon: Newspaper },
    { id: "group", label: "Grupo", icon: Users },
    { id: "documents", label: "Documentos", icon: FileText },
    { id: "items", label: "Rubros", icon: List },
    { id: "assessments", label: "Asignaciones", icon: ClipboardCheck },
    { id: "deliverables", label: "Entregables", icon: FileCheck },
    { id: "grades", label: "Notas", icon: BarChart3 },
  ]

  return (
    <nav className="dashboard-nav">

      <div className="btn-back-container">
        <button className="btn-back" onClick={onBackToSelection}>
          <ChevronLeft size={18} />
          <span>Volver</span>
        </button>
      </div>

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

      <div className="header-right">
        <div className="avatar">
          <div className="avatar-initials">
            {professor.firstName
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>
          <div className="professor-info">
            <span className="professor-name">{professor.firstName} {professor.firstLastName}</span>
          </div>
        </div>
      </div>

    </nav>
  )
}
