import { useState } from "react";
import { useGroupNews } from "../../hooks/useGroupNews";
import { Edit, Trash2, Calendar, User } from "lucide-react";
import Modal from "../Modal";
import "../../styles/Noticias/News.css";

// Refactorizar y modularizar componentes en funciones

export default function NewsModule({ course, group, professor }) {

  // Hook para obtener y manejar noticias del grupo
  const { news, isLoading, addNews, updateNews, removeNews } = useGroupNews(group?.id);

  // Estados locales para formulario, edicion y eliminacion
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newsToDelete, setNewsToDelete] = useState(null);
  const [formData, setFormData] = useState({ title: "", message: "", professorFullName: "" });

  const filteredNews = news;

  // Mostrar formulario para agregar noticia
  const handleAddClick = () => {
    setEditingNews(null);
    setFormData({ title: "", message: "", professorFullName: "" });
    setShowForm(true);
  };

  // Mostrar formulario para editar noticia
  const handleEditClick = (newsItem) => {
    setEditingNews(newsItem);
    setFormData({
      title: newsItem.title,
      message: newsItem.message,
      professorFullName: newsItem.professorFullName,
    });
    setShowForm(true);
  };

  // Mostrar modal para confirmar eliminación
  const handleDeleteClick = (id) => {
    setNewsToDelete(id);
    setShowDeleteModal(true);
  };

  // Confirmar eliminación de noticia
  const confirmDelete = async () => {
    const success = await removeNews(newsToDelete);
    if (success) window.location.reload();
    else alert("Error al eliminar la noticia");
    setShowDeleteModal(false);
  };
  // Manejar cambios en el formulario
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Guardar noticia (nueva o editada)
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!professor || !group) return;

    const payload = {
      professorIDCard: professor.idCard,
      groupID: group.id,
      title: formData.title,
      message: formData.message,
      publicationDate: new Date().toISOString(),
    };

    let success = false;
    if (editingNews) {
      success = await updateNews(editingNews.id, { ...payload, id: editingNews.id });
    } else {
      success = await addNews(payload);
    }

    if (success) {
      setShowForm(false);
      setEditingNews(null);
      window.location.reload();
    } else {
      alert("Error al guardar la noticia");
    }
  };
  
  // Formatea la fecha para mostrarla
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return <div className="dashboard-module">Cargando noticias</div>;
  }

  return (
    <div className="dashboard-module">
      {showForm ? (
        // Formulario para agregar o editar noticia
        <div className="news-form">
          <h2 className="module-title">{editingNews ? "Editar noticias" : "Añadir noticias"}</h2>
          <form onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Título
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="message" className="form-label">
                Mensaje
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleFormChange}
                className="form-textarea"
                rows="5"
                required
              ></textarea>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn-submit">
                {editingNews ? "Actualizar" : "Publicar"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {/* Encabezado y boton para anadir noticia */}
          <div className="module-header">
            <h2 className="module-title">Noticias del grupo</h2>
            <button className="btn-add-news" onClick={handleAddClick}>
              Añadir noticia
            </button>
          </div>
          {/* Lista de noticias o mensaje vacío */}
          {filteredNews.length === 0 ? (
            <div className="empty-state">
              No hay noticias disponibles
            </div>
          ) : (
            <div className="news-list">
              {filteredNews.map((item) => (
                <div key={item.id} className="news-item">
                  <div className="news-item-header">
                    <h3 className="news-item-title">{item.title}</h3>
                    <div className="news-item-actions">
                      <button className="btn-edit" onClick={() => handleEditClick(item)} title="Editar">
                        <Edit size={18} />
                      </button>
                      <button className="btn-delete" onClick={() => handleDeleteClick(item.id)} title="Eliminar">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="news-item-meta">
                    <span className="meta-item">
                      <User size={14} />
                      {item.professorFullName}
                    </span>
                    <span className="meta-item">
                      <Calendar size={14} />
                      {formatDate(item.publishDate)}
                    </span>
                  </div>
                  <p className="news-item-content">{item.message}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      {/* Modal de confirmación para eliminar noticia */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar eliminación"
      >
        <p>¿Está seguro de que desea eliminar esta noticia?</p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </button>
          <button className="btn-danger" onClick={confirmDelete}>
            Eliminar
          </button>
        </div>
      </Modal>
    </div>
  );
}