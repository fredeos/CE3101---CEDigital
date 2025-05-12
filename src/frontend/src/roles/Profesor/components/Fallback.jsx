import '../styles/Fallback.css'

// Componente de carga personalizado
function LoadingFallback() {
  return (
    <div className="fallback-container">
      <div className="spinner"></div>
      <p>Cargando, por favor espera...</p>
    </div>
  );

}

export default LoadingFallback
