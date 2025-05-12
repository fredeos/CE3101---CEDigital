import { useState } from "react"
import { ArrowRight } from "lucide-react"
import "../styles/Home.css"

/* Vista raiz (About this page) */
function ProfessorHome() {
  const [isHovering, setIsHovering] = useState(false)

  // Manejo de redireccionamiento al Login del profesor
  const handleLoginRedirect = () => {
    window.location.href = "/login"
  }

  return (
    <div className="home-container">
      <div className="home-content">
        
        {/* Logotipo */}
        <div className="logo-container">
          <div className="logo-icon">CE</div>
          <h1 className="home-title">CE Digital</h1>
        </div>

        {/* Descripción */}
        <p className="home-description">
          Esta plataforma le permitirá a los profesores poder gestionar todos los aspetos relacionados a sus cursos
        </p>

        {/* Botón de redireccionamiento */}
        <button className="login-redirect-button" onClick={handleLoginRedirect} onMouseEnter={() => setIsHovering(true)} onMouseLeave={() => setIsHovering(false)}>
          Ir a login
          <ArrowRight size={20} className={`arrow-icon ${isHovering ? "arrow-animate" : ""}`} />
        </button>
        
      </div>
    </div>
  )
}

export default ProfessorHome;