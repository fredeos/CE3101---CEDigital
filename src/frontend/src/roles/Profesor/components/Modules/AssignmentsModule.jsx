import { useState, useEffect } from "react"
import { useAssessmentsData } from "../../hooks/useAssessmentsData"
import { useItemsData } from "../../hooks/useItemsData"
import { ChevronDown, Check } from "lucide-react"
import Modal from "../Modal"
import FormAssignment from "../Custom/FormAssignment"
import FormGroups from "../Custom/FormGroups"
import { useStudentsData } from "../../hooks/useStudentsData"
import { UploadFileModal } from "../Custom/UploadFileModal"
import TableAssessments from "../Custom/TableAssignments"

export default function Assessments({ course, group }) {
  const {
    assessments,
    isLoading: assessmentsLoading,
    error: assessmentsError,
    deleteAssessment,
    uploadFile,
    reload,
    getSpecificationDownloadUrl
  } = useAssessmentsData(course?.code, group?.id);

  const { items, isLoading: itemsLoading, error: itemsError } = useItemsData(course?.id, group?.id);
  const { students } = useStudentsData(course?.id, group?.id);

  const [selectedItem, setSelectedItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [groupAssessmentSelected, setGroupAssessmentSelected] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [uploadAssessment, setUploadAssessment] = useState(null)
  const [localAssessments, setLocalAssessments] = useState(assessments);

  
  useEffect(() => {
    if (items && items.length > 0 && !selectedItem) {
      setSelectedItem(items[0]);
    }
  }, [items, selectedItem]);



  useEffect(() => {
    setLocalAssessments(assessments);
  }, [assessments]);

  const handleItemSelect = (item) => {
    setSelectedItem(item);
    setDropdownOpen(false);
  };

  const handleAddClick = () => {
    setEditingAssessment(null);
    setShowForm(true);
  };

  const handleEditClick = (assessment) => {
    setEditingAssessment(assessment);
    setShowForm(true);
  };

  const handleDeleteClick = (assessment) => {
    setDeleteConfirmation(assessment);
  };

  const handleUploadFile = async (file) => {
    if (!uploadAssessment || !group?.id) return;
    const result = await uploadFile(file, group.id, uploadAssessment.id);
    if (result.success) {
      reload();
    } else {
      alert("Error al subir el archivo");
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmation) {
      const result = await deleteAssessment(deleteConfirmation.id);
      if (result.success) {
        setSuccessMessage("Evaluación eliminada exitosamente.");
        setLocalAssessments(prev =>
          prev.filter(a => a.id !== deleteConfirmation.id)
        );
        setTimeout(() => setSuccessMessage(null), 1500);
      }
      setDeleteConfirmation(null);
    }
  };

  const handleFormClose = (success, message) => {
    setShowForm(false);
    setEditingAssessment(null);
    if (success && message) {
      setSuccessMessage(message);
      reload();
      setTimeout(() => setSuccessMessage(null), 1500);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  };

  const filteredAssessments = selectedItem
    ? localAssessments.filter((assessment) => assessment.itemId === selectedItem.id)
    : [];

  const isLoading = assessmentsLoading || itemsLoading;
  const error = assessmentsError || itemsError;

  if (isLoading) return <div className="loading-state">Cargando evaluaciones...</div>;
  if (error) return <div className="error-state">{error}</div>;

  return (
    <div className="dashboard-module">
      {successMessage && (
        <div className="success-message">
          <Check size={16} />
          {successMessage}
        </div>
      )}

      <div className="module-header">
        Evaluaciones
        <div className="header-actions">

          <div className="dropdown-container">
            <button className="dropdown-toggle" onClick={() => setDropdownOpen(!dropdownOpen)}>
              {selectedItem ? selectedItem.name : "Seleccionar rubro"}
              <ChevronDown size={16} className={`dropdown-icon ${dropdownOpen ? "open" : ""}`} />
            </button>
            {dropdownOpen && (
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
          <button className="btn-submit" onClick={handleAddClick}>
            Crear evaluación
          </button>
        </div>

      </div>

      <div className="main-content">
        {filteredAssessments.length === 0 ? (
          <div className="empty-state">
            <p>No hay evaluaciones creadas para este rubro.</p>
          </div>
        ) : (
          <TableAssessments
            groupId={group.id}
            assessments={filteredAssessments}
            formatDate={formatDate}
            formatTime={formatTime}
            handleEditClick={handleEditClick}
            handleDeleteClick={handleDeleteClick}
            setGroupAssessmentSelected={setGroupAssessmentSelected}
            setUploadAssessment={setUploadAssessment}
            setUploadModalOpen={setUploadModalOpen}
            getSpecificationDownloadUrl={getSpecificationDownloadUrl}
          />
        )}
      </div>

      {showForm && (
        <FormAssignment
          course={course}
          group={group}
          items={items}
          assessment={editingAssessment}
          onClose={handleFormClose}
        />
      )}

      {groupAssessmentSelected && (
        <FormGroups
          isOpen={!!groupAssessmentSelected}
          onClose={() => setGroupAssessmentSelected(null)}
          students={students}
          assignmentId={groupAssessmentSelected.id}
          existingGroups={groupAssessmentSelected.groups || []}
        />
      )}

      <UploadFileModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleUploadFile}
      />

      <Modal
        isOpen={deleteConfirmation !== null}
        onClose={() => setDeleteConfirmation(null)}
        title="Confirmación de eliminación"
        actions={
          <>
            <button className="btn-cancel" onClick={() => { setDropdownOpen(null); setDeleteConfirmation(null); }}>
              Cancelar
            </button>
            <button className="btn-danger" onClick={handleConfirmDelete}>
              Eliminar
            </button>
          </>
        }
      >
        <div className="delete-modal-content">
          <p>¿Está seguro de que desea eliminar la evaluación seleccionada?</p>
        </div>
      </Modal>

    </div>
  );
}