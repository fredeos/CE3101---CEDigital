import { useState } from "react"
import { useNewsManager } from "../../hooks/useNewsManager.js"
import { Plus, Edit, Trash2, Calendar, User } from "lucide-react"

// Recibe también el profesor como prop
export default function NewsModule({ course, group, professor }) {
  const { news, isLoading, error, addNews, updateNews, deleteNews } = useNewsManager(course?.id)
  const [showForm, setShowForm] = useState(false)
  const [editingNews, setEditingNews] = useState(null)
  const [formData, setFormData] = useState({
    title: "",
    message: "",
  })

  // Filtra noticias por grupo si hay uno seleccionado
  const filteredNews = group ? news.filter((item) => item.groupId === group.id) : news

  const handleAddClick = () => {
    setEditingNews(null)
    setFormData({
      title: "",
      message: "",
    })
    setShowForm(true)
  }

  const handleEditClick = (newsItem) => {
    setEditingNews(newsItem)
    setFormData({
      title: newsItem.title,
      message: newsItem.message,
    })
    setShowForm(true)
  }

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure you want to delete this news item?")) {
      await deleteNews(id)
    }
  }

  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault()

    let authorName = "Profesor"
    if (professor && professor.name) {
      authorName = professor.name
    }

    if (editingNews) {
      await updateNews(editingNews.id, formData)
    } else {
      await addNews({
        ...formData,
        author: authorName,
        groupId: group?.id || null,
      })
    }

    setShowForm(false)
    setEditingNews(null)
  }

  // Solo la fecha (sin hora)
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  if (isLoading) {
    return <div className="dashboard-module">Loading news...</div>
  }

  if (error) {
    return <div className="dashboard-module">Error: {error}</div>
  }

  return (
    <div className="dashboard-module">
      {showForm ? (
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
          <div className="module-header">
            <h2 className="module-title">Noticias del grupo</h2>
            <button className="btn-add" onClick={handleAddClick}>
              <Plus size={16} />
              Añadir noticia
            </button>
          </div>

          {filteredNews.length === 0 ? (
            <div className="empty-state">
              <p>No hay noticias disponibles.</p> 
            </div>
          ) : (
            <div className="news-list">
              {filteredNews.map((item) => (
                <div key={item.id} className="news-item">
                  <div className="news-item-header">
                    <h3 className="news-item-title">{item.title}</h3>
                    <div className="news-item-actions">
                      <button className="btn-icon" onClick={() => handleEditClick(item)}>
                        <Edit size={16} />
                      </button>
                      <button className="btn-icon btn-delete" onClick={() => handleDeleteClick(item.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="news-item-meta">
                    <span className="meta-item">
                      <User size={14} />
                      {item.author}
                    </span>
                    <span className="meta-item">
                      <Calendar size={14} />
                      {formatDate(item.publicationDate)}
                    </span>
                  </div>

                  <p className="news-item-content">{item.message}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
