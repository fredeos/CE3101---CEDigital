import { useState } from "react"
import { useItemsData } from "../../hooks/useItemsData"
import { Plus, Edit, Trash2, AlertTriangle, Check, X, PercentIcon, List } from "lucide-react"
import Modal from "../Modal"
import "../../styles/Rubros/Items.css"

// Refactorizar y modularizar componentes en funciones

export default function ItemsModule({ course, group }) {
  // Hook para manejar rubros del grupo
  const {
    items,
    error,
    addItem,
    updateItem,
    deleteItem,
    calculateTotalPercentage
  } = useItemsData(course?.code, group?.groupId);

  // Estados locales para formulario, edición, mensajes y confirmación
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: "", percentage: "" });
  const [formError, setFormError] = useState(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Calcula el porcentaje total de los rubros
  const totalPercentage = calculateTotalPercentage();
  const isValidTotal = totalPercentage === 100;

  // Mostrar formulario para agregar rubro
  const handleAddClick = () => {
    setEditingItem(null);
    setFormData({ name: "", percentage: "" });
    setFormError(null);
    setShowForm(true);
  };

  // Mostrar formulario para editar rubro
  const handleEditClick = (item) => {
    setEditingItem(item);
    setFormData({ name: item.name, percentage: item.percentage });
    setFormError(null);
    setShowForm(true);
  };

  // Mostrar modal de confirmación para eliminar rubro
  const handleDeleteClick = (item) => {
    setDeleteConfirmation(item);
  };

  // Confirmar eliminación de rubro
  const handleConfirmDelete = async () => {
    if (deleteConfirmation) {
      const result = await deleteItem(deleteConfirmation.id);
      if (result.success) {
        setSuccessMessage("Rubro eliminado exitosamente.");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
      setDeleteConfirmation(null);
    }
  };

  // Manejar cambios en el formulario
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "percentage") {
      const numValue = Number.parseInt(value, 10);
      if (isNaN(numValue) && value !== "") return;
      if (numValue > 100) return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: name === "percentage" ? (value === "" ? "" : Number.parseInt(value, 10)) : value,
    }));
  };

  // Valida los datos del formulario antes de guardar
  const validateForm = () => {
    if (!formData.name.trim()) {
      setFormError("El nombre del rubro es obligatorio.")
      return false
    }
    if (formData.percentage === "" || isNaN(formData.percentage)) {
      setFormError("El porcentaje debe ser un número válido.")
      return false
    }
    if (formData.percentage < 1 || formData.percentage > 100) {
      setFormError("El porcentaje debe estar entre 1 y 100.")
      return false
    }

    let newTotal = 0

    if (editingItem) {
      newTotal = totalPercentage - editingItem.percentage + formData.percentage
    } else {
      newTotal = totalPercentage + formData.percentage
    }
    if (newTotal > 100) {
      setFormError(`El porcentaje total supera el 100% (${newTotal}%). Ajuste el valor.`)
      return false
    }
    setFormError(null)
    return true
  }

  // Guardar rubro (nuevo o editado)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) 
      return;
   
    let result;
    
    if (editingItem) {
      result = await updateItem(editingItem.id, formData);

      if (result.success) 
        setSuccessMessage("Rubro actualizado exitosamente.");

    } else {
      result = await addItem(formData);
      
      if (result.success) 
        setSuccessMessage("Rubro creado exitosamente.");

    }
    if (result.success) {
      setShowForm(false);
      setEditingItem(null);
      setFormData({ name: "", percentage: "" });
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // Cancelar formulario
  const handleCancelClick = () => {
    setShowForm(false);
    setEditingItem(null);
    setFormError(null);
  };

  // Mostrar error si ocurre
  if (error) {
    return (
      <div className="items-module">
        <div className="error-state">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-module">
      {/* Mensaje de éxito */}
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {/* Advertencia si el total no es 100% */}
      {!isValidTotal && items.length > 0 && (
        <div className="warning-message">
          <AlertTriangle size={16} />
          El porcentaje total es {totalPercentage}%. La suma de los rubros debe ser exactamente del 100%.
        </div>
      )}

      {/* Formulario para agregar o editar rubro */}
      {showForm ? (
        <div className="items-form">
          <h3 className="form-title">{editingItem ? "Actualizar rubro" : "Añadir rubro"}</h3>
          {formError && (
            <div className="form-error">
              <X size={16} />
              {formError}
            </div>
          )}
          <form onSubmit={handleFormSubmit}>
            <label htmlFor="name" className="form-label">
              Nombre del rubro *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleFormChange}
              required
            />
            <label htmlFor="percentage" className="form-label">
              Porcentaje (%) *
            </label>
            <div className="percentage-input-wrapper">
              <input
                id="percentage"
                name="percentage"
                className="form-input percentage-input"
                value={formData.percentage}
                onChange={handleFormChange}
                min="1"
                max="100"
                required
              />
              <PercentIcon size={16} className="percentage-icon" />
            </div>
            <div className="input-help-text-items">
              Porcentaje total:{" "}
              {editingItem
                ? totalPercentage - editingItem.percentage + (formData.percentage || 0)
                : totalPercentage + (formData.percentage || 0)}
              %
            </div>
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={handleCancelClick}>
                Cancelar
              </button>
              <button type="submit" className="btn-submit">
                {editingItem ? "Actualizar" : "Añadir"} rubro
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>

          {/* Encabezado y botón para añadir rubro */}
          <div className="items-header">
            <div className="items-title-section">
              <h2 className="items-title">Rubros del grupo</h2>
            </div>
            <button className="btn-submit" onClick={handleAddClick}>
              Añadir rubro
            </button>
          </div>

          {/* Lista de rubros o mensaje vacío */}
          {items.length === 0 ? (
            <div className="empty-state">
              <p className="empty-state-text">No hay rubros creados en este momento.</p>
            </div>
          ) : (
            <div className="items-list">
              <div className="items-list-header">
                <div className="item-name-header">Nombre del rubro</div>
                <div className="item-percentage-header">Porcentaje</div>
                <div className="item-actions-header">Acciones</div>
              </div>
              {items.map((item) => (
                <div key={item.id} className="item-row">
                  <div className="item-name">{item.name}</div>
                  <div className="item-percentage">{item.percentage}%</div>
                  <div className="item-actions">
                    <button className="btn-edit" onClick={() => handleEditClick(item)}>
                      <Edit size={16} />
                    </button>
                    <button className="btn-delete" onClick={() => handleDeleteClick(item)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              <div className="items-total-row">
                <div className="items-total-label">Total</div>
                <div className={`items-total-value ${isValidTotal ? "total-valid" : "total-invalid"}`}>
                  {totalPercentage}%
                </div>
                <div className="items-total-status">
                  {isValidTotal ? (
                    <Check size={16} className="status-icon valid" />
                  ) : (
                    <AlertTriangle size={16} className="status-icon invalid" />
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de confirmación para eliminar rubro */}
      <Modal
        isOpen={deleteConfirmation !== null}
        onClose={() => setDeleteConfirmation(null)}
        title="Confirmación de eliminación"
        actions={
          <>
            <button className="btn-cancel" onClick={() => setDeleteConfirmation(null)}>
              Cancelar
            </button>
            <button className="btn-danger" onClick={handleConfirmDelete}>
              Eliminar
            </button>
          </>
        }
      >
        <div className="delete-modal-content">
          <p>¿Está seguro de que desea eliminar el rubro seleccionado?</p>
        </div>
      </Modal>
    </div>
  );
}