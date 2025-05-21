export default function DashboardHeader({selectedCourse, selectedGroup }) {
  return (
    <header className="dashboard-header">

      <div className="header-center">
        <h1 className="dashboard-title">
          {selectedCourse.name}
          {selectedGroup && <span className="group-indicator"> - {selectedGroup.name}</span>}
        </h1>
      </div>
      
    </header>
  )
}
