import { useState } from "react"
import { useAssessmentsData } from "../../hooks/useAssessmentsData"
import { Calendar, Clock, Upload, X } from "lucide-react"
import Modal from "../Modal"
import "../../styles/Evaluaciones/FormAssignments.css"

export default function FormAssignment({ course, group, items, assessment, onClose }) {
  const { addAssessment, updateAssessment, uploadFile } = useAssessmentsData(course?.code, group?.groupId);

  const [formData, setFormData] = useState({
    title: assessment?.title || "",
    itemId: assessment?.itemId || (items.length > 0 ? items[0].id : ""),
    weight: assessment?.weight || null,
    dueDate: assessment?.dueDate
      ? new Date(assessment.dueDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    dueTime: assessment?.dueDate
      ? new Date(assessment.dueDate).toTimeString().split(" ")[0].substring(0, 5)
      : "23:59",
    description: assessment?.description || "",
    isGroupAssessment: assessment?.isGroupAssessment || false,
    fileUrl: assessment?.fileUrl || null,
    fileName: assessment?.fileName || null,
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = "El nombre es obligatorio";
    if (!formData.itemId) errors.itemId = "Seleccione un rubro";
    if (formData.weight <= 0 || formData.weight > 100) errors.weight = "Peso entre 1 y 100";
    if (!formData.dueDate) errors.dueDate = "Fecha requerida";
    if (!formData.dueTime) errors.dueTime = "Hora requerida";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);

    try {
      let fileData = {
        fileUrl: formData.fileUrl,
        fileName: formData.fileName,
      };

      if (selectedFile) {
        const uploadResult = await uploadFile(selectedFile);
        if (uploadResult.success) {
          fileData = {
            fileUrl: uploadResult.fileUrl,
            fileName: uploadResult.fileName,
          };
        }
      }

      const dueDate = `${formData.dueDate}T${formData.dueTime}:00.000Z`;

      const assessmentData = {
        ...formData,
        ...fileData,
        dueDate,
      };
      delete assessmentData.dueTime;

      let result;
      if (assessment) {
        result = await updateAssessment(assessment.id, assessmentData);
        if (result.success) onClose(true, `Evaluación actualizada.`);
      } else {
        result = await addAssessment(assessmentData);
        if (result.success) onClose(true, `Evaluación creada.`);
      }
      if (!result.success) 
        throw new Error(result.error || "Error al guardar");
    } catch (error) {
      setFormErrors((prev) => ({ ...prev, submit: error.message }));
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={() => onClose(false)}
      title={assessment ? "Editar evaluación" : "Crear evaluación"}
      type="default"
    >
      <form onSubmit={handleSubmit} className="assessment-form">
        <div className="form-section">
          <h3 className="section-title">Información básica</h3>
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Nombre de evaluación *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className={`form-input ${formErrors.title ? "input-error" : ""}`}
              value={formData.title}
              onChange={handleChange}
              required
            />
            {formErrors.title && <div className="error-message">{formErrors.title}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="itemId" className="form-label">
              Asignar a rubro *
            </label>
            <select
              id="itemId"
              name="itemId"
              className="form-select"
              value={formData.itemId}
              onChange={handleChange}
              required
            >
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.percentage}%)
                </option>
              ))}
            </select>
            {formErrors.itemId && <div className="error-message">{formErrors.itemId}</div>}
          </div>
          <div className="form-group">
            <label htmlFor="weight" className="form-label">
              Peso (%) *
            </label>
            <input
              id="weight"
              name="weight"
              className={`form-input ${formErrors.weight ? "input-error" : ""}`}
              value={formData.weight}
              onChange={handleChange}
              min="1"
              max="100"
              required
            />
            {formErrors.weight && <div className="error-message">{formErrors.weight}</div>}
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="dueDate" className="form-label">
                Fecha de entrega *
              </label>
              <div className="input-with-icon">
                <Calendar size={16} className="input-icon" />
                <input
                  type="date"
                  id="dueDate"
                  name="dueDate"
                  className="form-input"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                />
              </div>
              {formErrors.dueDate && <div className="error-message">{formErrors.dueDate}</div>}
            </div>
            <div className="form-group">
              <label htmlFor="dueTime" className="form-label">
                Hora límite *
              </label>
              <div className="input-with-icon">
                <Clock size={16} className="input-icon" />
                <input
                  type="time"
                  id="dueTime"
                  name="dueTime"
                  className="form-input"
                  value={formData.dueTime}
                  onChange={handleChange}
                  required
                />
              </div>
              {formErrors.dueTime && <div className="error-message">{formErrors.dueTime}</div>}
            </div>
          </div>
        </div>
        <div className="form-section">
          <h3 className="section-title">Tipo de evaluación</h3>
          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="isGroupAssessment"
                name="isGroupAssessment"
                checked={formData.isGroupAssessment}
                onChange={handleChange}
              />
              <label htmlFor="isGroupAssessment" className="checkbox-label">
                Evaluación grupal
              </label>
            </div>
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={() => onClose(false)} disabled={isSubmitting}>
            Cancelar
          </button>
          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : assessment ? "Actualizar" : "Crear"}
          </button>
        </div>
        {formErrors.submit && <div className="error-message">{formErrors.submit}</div>}
      </form>
    </Modal>
  );
}