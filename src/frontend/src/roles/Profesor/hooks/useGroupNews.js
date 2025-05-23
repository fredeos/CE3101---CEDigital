import { useState, useEffect } from "react"

// Construye el payload para crear o actualizar una noticia
function buildNewsPayload(data, id = 0) {
  return {
    id,
    professorIDCard: data.professorIDCard,
    groupID: data.groupID,
    title: data.title,
    message: data.message,
    publicationDate: data.publicationDate,
  }
}

// Funcion principal para manejar noticias de grupo (conexiones con la API)
export function useGroupNews(groupId) {
  const [news, setNews] = useState([])           // Estado para las noticias
  const [isLoading, setIsLoading] = useState(true) // Estado de carga
  const [error, setError] = useState(null)         // Estado de error

  // Obtiene noticias del grupo cuando cambia el groupId
  useEffect(() => {
    if (!groupId) {
      setNews([])
      setIsLoading(false)
      return
    }

    const fetchNews = async () => {
      setIsLoading(true)
      try {
        // Llama a la API para obtener noticias del grupo
        const response = await fetch(`http://localhost:5039/api/news-with-professor/${groupId}`)
        if (!response.ok) throw new Error("No se pudieron obtener las noticias")
        const result = await response.json()
        setNews(Array.isArray(result) ? result : [result]) // Asegura que sea un array
      } catch (err) {
        setError(err.message)
        setNews([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchNews()
  }, [groupId])

  // Agrega una noticia al grupo
  const addNews = async (data) => {
    const payload = buildNewsPayload(data)
    try {
      const response = await fetch("http://localhost:5039/api/add/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error("No se pudo publicar la noticia")
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  // Actualiza una noticia existente
  const updateNews = async (id, data) => {
    const payload = buildNewsPayload(data, id)
    try {
      const response = await fetch(`http://localhost:5039/api/update/new/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error("No se pudo actualizar la noticia")
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  // Elimina una noticia por su ID
  const removeNews = async (id) => {
    try {
      const response = await fetch(`http://localhost:5039/api/remove/new/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("No se pudo eliminar la noticia")
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  // Retorna estados y funciones principales del hook
  return { news, isLoading, error, addNews, updateNews, removeNews }
}