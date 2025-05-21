import { useState, useEffect } from "react"
import { useAssessmentsData } from "../../hooks/useAssessmentsData"
import { useItemsData } from "../../hooks/useItemsData"
import { ChevronDown, Edit, Trash2, Check, Users } from "lucide-react"
import Modal from "../Modal"
import FormAssignment from "../FormAssignment"
import FormGroups from "../FormGroups"
import { useStudentsData } from "../../hooks/useStudentsData"

export default function Assessments({ course, group }) {
  const {
    assessments,
    isLoading: assessmentsLoading,
    error: assessmentsError,
    deleteAssessment,
    reload,
  } = useAssessmentsData(course?.code, group?.groupId);

  const { items, isLoading: itemsLoading, error: itemsError } = useItemsData(course?.id, group?.id);
  const { students } = useStudentsData(course?.id, group?.id);

  const [selectedItem, setSelectedItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [groupAssessmentSelected, setGroupAssessmentSelected] = useState(null);

  useEffect(() => {
    if (items && items.length > 0 && !selectedItem) {
      setSelectedItem(items[0]);
    }
  }, [items, selectedItem]);

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

  const handleConfirmDelete = async () => {
    if (deleteConfirmation) {
      const result = await deleteAssessment(deleteConfirmation.id);
      if (result.success) {
        setSuccessMessage("Evaluación eliminada exitosamente.");
        reload();
        setTimeout(() => setSuccessMessage(null), 3000);
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
      setTimeout(() => setSuccessMessage(null), 3000);
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
    ? assessments.filter((assessment) => assessment.itemId === selectedItem.id)
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
        <h2 className="header-title">Evaluaciones</h2>
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
          <button className="btn-create" onClick={handleAddClick}>
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
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Evaluación</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Tipo</th>
                  <th>Peso</th>
                  <th>Especificación</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssessments.map((assessment) => (
                  <tr key={assessment.id}>
                    <td className="title-cell"><span>{assessment.title}</span></td>
                    <td>{formatDate(assessment.dueDate)}</td>
                    <td>{formatTime(assessment.dueDate)}</td>
                    <td>
                      {assessment.isGroupAssessment ? (
                        <span className="type-badge group">Grupal</span>
                      ) : (
                        <span className="type-badge individual">Individual</span>
                      )}
                    </td>
                    <td>{assessment.weight}%</td>
                    <td>
                      {assessment.fileName && (
                        <a href={assessment.fileUrl} target="_blank" rel="noopener noreferrer" className="file-link">
                          <span>
                            {assessment.fileName.length > 20
                              ? `${assessment.fileName.substring(0, 20)}...`
                              : assessment.fileName}
                          </span>
                        </a>
                      )}
                    </td>
                    <td>
                      <div className="actions-cell">
                        <button className="icon-btn edit" onClick={() => handleEditClick(assessment)} title="Editar">
                          <Edit size={16} />
                        </button>
                        <button className="icon-btn delete" onClick={() => handleDeleteClick(assessment)} title="Eliminar">
                          <Trash2 size={16} />
                        </button>
                        {assessment.isGroupAssessment && (
                          <button
                            className="icon-btn groups"
                            onClick={() => setGroupAssessmentSelected(assessment)}
                            title="Formar grupos"
                          >
                            <Users size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
          <p>Esta acción no se puede deshacer y puede afectar los cálculos de calificaciones.</p>
        </div>
      </Modal>
    </div>
  );
}