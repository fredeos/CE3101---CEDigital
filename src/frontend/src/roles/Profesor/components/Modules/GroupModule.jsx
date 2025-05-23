import { useState } from "react";
import { useStudentsData } from "../../hooks/useStudentsData";
import { generateStudentReport } from "../../../../utils/pdfGenerator";
import { Download, Search } from "lucide-react";
import Modal from "../Modal";
import "../../styles/Grupo/Group.css"

export default function GroupModule({ course, group }) {
  const { students, isLoading, error } = useStudentsData(course?.id, group?.id);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleConfirmDownload = () => {
    if (!course || !group || students.length === 0) return;
    setIsGeneratingPDF(true);
    generateStudentReport(students, course, group);
    setIsGeneratingPDF(false);
    setShowDownloadModal(false);
  };

  if (isLoading) {
    return (
      <div className="group-module">
        <div className="loading-state">Cargando estudiantes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="group-module">
        <div className="error-state">{error}</div>
      </div>
    );
  }

  if (!course || !group) {
    return (
      <div className="group-module">
        <div className="empty-state">Seleccione un curso y grupo para ver los estudiantes.</div>
      </div>
    );
  }

  return (
    <div className="dashboard-module">
      <div className="group-header">
        <h1 className="group-title">Estudiantes matriculados</h1>
        <div className="group-actions">
          <button className="btn-download" onClick={() => setShowDownloadModal(true)} disabled={students.length === 0}>
            <Download size={16} />
            PDF
          </button>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="empty-state">No hay estudiantes matriculados en este grupo</div>
      ) : (
        <table className="student-table">
          <thead>
            <tr>
              <th>Carnet</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Número télefonico</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((student) => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.name}</td>
                <td>{student.email}</td>
                <td>{student.phone}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal isOpen={showDownloadModal} onClose={() => setShowDownloadModal(false)} title="Confirmar descarga">
        <p>¿Descargar lista de estudiantes en PDF?</p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={() => setShowDownloadModal(false)}>
            Cancelar
          </button>
          <button className="btn-submit" onClick={handleConfirmDownload} disabled={isGeneratingPDF}>
            Descargar
          </button>
        </div>
      </Modal>

    </div>
  );
}