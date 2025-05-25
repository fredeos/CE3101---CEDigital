import { useState, useEffect } from "react"

import { UploadFileModal } from "../Custom/UploadFileModal";
import { useAssessmentsData } from "../../hooks/useAssessmentsData"
import { useItemsData } from "../../hooks/useItemsData"
import { useSubmissionsData } from "../../hooks/useSubmissionsData"
import { ChevronDown, Upload } from "lucide-react"

import Modal from "../Modal"
import Notification from "../Notification";
import "../../styles/Entregables/Submissions.css"


export default function SubmissionsModule({ course, group }) {


  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [itemDropdownOpen, setItemDropdownOpen] = useState(false); //Rubros
  const [assessmentDropdownOpen, setAssessmentDropdownOpen] = useState(false); //Evaluaciones
  const [showGradeModal, setShowGradeModal] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [notification, setNotification] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedUploadSubmission, setSelectedUploadSubmission] = useState(null);

  const { submissions, updateSubmission, updatePublishedFlag, uploadFeedbackFile, getSolutionDownloadUrl, reload } = useSubmissionsData(selectedAssessment?.id);
  const { assessments } = useAssessmentsData(course?.code, group?.id);
  const { items } = useItemsData(course?.id, group?.id);

  // Cuando se cargan los items, selecciona el primero por defecto si no hay uno seleccionado
  useEffect(() => {
    if (items && items.length > 0 && !selectedItem) {
      setSelectedItem(items[0]);
    }
  }, [items, selectedItem]);

  // Mostrar rubros seleccionados
  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setSelectedAssessment(null);
    setItemDropdownOpen(false);
  };

  // Mostrar evaluaciones del rubro seleccionado
  const handleAssessmentSelect = (assessment) => {
    setSelectedAssessment(assessment)
    setAssessmentDropdownOpen(false)
  }

  // Mostrar el formulario para calificar
  const handleGradeForm = (submission) => {
    setSelectedSubmission(submission);
    setShowGradeModal(true);
  }

  // Maneja la apertura del modal de upload
  const handleUploadClick = (submission) => {
    setSelectedUploadSubmission(submission);
    setShowUploadModal(true);
  };

  // Maneja el cambio de publicación de una entrega
  const handlePublishChange = async (submission, checked) => {
    const result = await updatePublishedFlag(submission.id, checked ? 1 : 0);
    if (result.success) {
      setNotification({
        type: "success",
        message: checked
          ? "Entrega publicada correctamente."
          : "Entrega marcada como no publicada.",
      });
    } else {
      setNotification({
        type: "error",
        message: result.error || "Error al actualizar publicación.",
      });
    }
  };

  // Maneja la subida del archivo
  const handleFileUpload = async (file) => {
    const result = await uploadFeedbackFile({
      file,
      groupId: group?.id,
      assignmentId: selectedAssessment?.id,
      submissionId: selectedUploadSubmission?.id,
    });
    if (result.success) {
      setNotification({
        type: "success",
        message: `Archivo "${file.name}" subido correctamente.`,
      });
      setShowUploadModal(false);
      reload();
    } else {
      setNotification({
        type: "error",
        message: result.error || "Error al subir el archivo.",
      });
    }
  };
  // Filtra evaluaciones por rubro seleccionado
  let filteredAssessments = [];
  if (selectedItem) {
    filteredAssessments = assessments.filter(a => a.itemId === selectedItem.id);
  }

  return (
    <div className="dashboard-module">

      {/* Notificacion */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="module-header">
        Calificaciones
        <div className="header-actions">

          {/* Dropdown de rubros */}
          <div className="dropdown-container">
            <button className="dropdown-toggle" onClick={() => setItemDropdownOpen(!itemDropdownOpen)}>
              {selectedItem ? selectedItem.name : "Seleccionar rubro"}
              <ChevronDown size={16} className={`dropdown-icon ${itemDropdownOpen ? "open" : ""}`} />
            </button>
            {itemDropdownOpen && (
              <div className="dropdown-menu">
                {items.map((item) => (
                  <button key={item.id} className="dropdown-item" onClick={() => handleItemSelect(item)}>
                    {item.name}
                    <span>{item.percentage}%</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dropdown de evaluaciones */}
          <div className="dropdown-container">
            <button className="dropdown-toggle" onClick={() => selectedItem && setAssessmentDropdownOpen(!assessmentDropdownOpen)} disabled={!selectedItem}>
              {selectedAssessment ? selectedAssessment.title : "Seleccionar evaluación"}
              <ChevronDown size={16} className={`dropdown-icon ${assessmentDropdownOpen ? "open" : ""}`} />
            </button>
            {assessmentDropdownOpen && selectedItem && (
              <div className="dropdown-menu">
                {filteredAssessments.length === 0 ? (
                  <div className="dropdown-item">No hay evaluaciones</div>
                ) : (
                  filteredAssessments.map(assessment => (
                    <button key={assessment.id} className="dropdown-item" onClick={() => handleAssessmentSelect(assessment)}>
                      {assessment.title}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="main-content">
        {selectedAssessment ? (
          submissions.length === 0 ? (
            <div className="empty-state">
              <p>No hay entregas para esta evaluación.</p>
            </div>
          ) : (
            <SubmissionsTable
              submissions={submissions}
              onGradeClick={handleGradeForm}
              onPublishChange={handlePublishChange}
              onUploadClick={handleUploadClick}
              getSolutionDownloadUrl={getSolutionDownloadUrl}
            />
          )
        ) : (
          <div className="empty-state">
            <p>Seleccione una evaluación para ver las entregas.</p>
          </div>
        )}
      </div>

      {/* Modal para calificar */}
      {showGradeModal && selectedSubmission && (
        <GradeForm
          submission={selectedSubmission}
          onClose={() => setShowGradeModal(false)}
          updateSubmission={updateSubmission}
          setNotification={setNotification}
        />
      )}

      {/* Modal para subir archivo */}
      {showUploadModal && selectedUploadSubmission && (
        <UploadFileModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUpload={handleFileUpload}
        />
      )}

    </div>
  );
}

// Funcion que reanderiza la tabla de entregados
function SubmissionsTable({ submissions, onGradeClick, onPublishChange, onUploadClick, getSolutionDownloadUrl }) {
  return (
    <div className="data-table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Estudiante</th>
            <th>Fecha de entrega</th>
            <th>Entregable</th>
            <th>Nota</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map(submission => (
            <tr key={submission.id}>
              <td className="title-cell"><span>{submission.studentFullName}</span></td>
              <td>{new Date(submission.submissionDate).toLocaleDateString()}</td>
              <td>
                {submission.submittedFile ? (
                  <a href={getSolutionDownloadUrl(submission.submittedFile)} target="_blank" rel="noopener noreferrer" className="file-link">
                    Descargar solución
                  </a>
                ) : (
                  "Sin archivo"
                )}
              </td>
              <td>{submission.grade ?? "-"}/100</td>
              <td>
                <input
                  type="checkbox"
                  checked={submission.publishedFlag === 1}
                  onChange={e => onPublishChange(submission, e.target.checked)}
                />
              </td>
              <td>
                <div className="actions-cell">
                  <button className="btn-grade" onClick={() => onGradeClick(submission)} title="Calificar">
                    Calificar
                  </button>
                  <button className="icon-btn upload" onClick={() => onUploadClick(submission)} title="Retroalimentación">
                    <Upload size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}


function GradeForm({ submission, onClose, updateSubmission, setNotification }) {
  const [gradeValue, setGradeValue] = useState(submission.grade ?? "");
  const [commentValue, setCommentValue] = useState(submission.commentary ?? "");
  const [loading, setLoading] = useState(false);

  const handleChangeGrade = (e) => {
    const { name, value } = e.target;
    if (name === "grade") setGradeValue(value);
    if (name === "comment") setCommentValue(value);
  };

  const handleSubmitGrade = async (e) => {
    e.preventDefault();

    // Validación: nota entre 0 y 100
    const gradeNum = Number(gradeValue);
    if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
      setNotification({
        type: "error",
        message: "La nota debe ser un número entre 0 y 100.",
      });
      return;
    }

    setLoading(true);
    const result = await updateSubmission(submission.id, {
      grade: gradeNum,
      commentary: commentValue,
    });
    setLoading(false);

    if (result.success) {
      setNotification({
        type: "success",
        message: "Calificación guardada correctamente.",
      });
      onClose(); // Cierra el modal y refresca la tabla
    } else {
      setNotification({
        type: "error",
        message: result.error || "Error al guardar la calificación.",
      });
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={"Calificar"} type="default">
      <form onSubmit={handleSubmitGrade} className="assessment-form">
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="grade" className="form-label">
              Asignar nota *
            </label>
            <input
              type="number"
              id="grade"
              name="grade"
              className="form-input"
              value={gradeValue}
              onChange={handleChangeGrade}
              min={0}
              max={100}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="comment" className="form-label">
              Comentario
            </label>
            <input
              type="text"
              id="comment"
              name="comment"
              className="form-input"
              value={commentValue}
              onChange={handleChangeGrade}
              placeholder="Opcional"
            />
          </div>
        </div>
        <div className="form-actions">
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}