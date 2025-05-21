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

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div className="search-container">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Buscar estudiante"
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            className="btn-download"
            onClick={() => setShowDownloadModal(true)}
            disabled={students.length === 0}
          >
            <Download size={16} />
            PDF
          </button>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="empty-state">No hay estudiantes matriculados en este grupo</div>
      ) : (
        <div className="student-table-container">
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
                  <td className="student-id">{student.id}</td>
                  <td className="student-name">{student.name}</td>
                  <td className="student-email">{student.email}</td>
                  <td className="student-phone">{student.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        title="Confirmar descarga"
      >
        <p>¿Descargar lista de estudiantes en PDF?</p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={() => setShowDownloadModal(false)}>
            Cancelar
          </button>
          <button
            className="btn-submit"
            onClick={handleConfirmDownload}
            disabled={isGeneratingPDF}
          >
            {isGeneratingPDF ? "Generando..." : "Descargar"}
          </button>
        </div>
      </Modal>
    </div>
  );
}