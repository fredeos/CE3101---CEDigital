import { useState, useEffect } from "react"

export function useGroupNews(groupId) {
  const [news, setNews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!groupId) {
      setNews([])
      setIsLoading(false)
      return
    }

    // Funcion para obtener noticias por medio del ID del grupo
    const fetchNews = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(
          `http://localhost:5039/api/news-with-professor/${groupId}`
        )
        if (!response.ok) throw new Error("No se pudieron obtener las noticias")
        const result = await response.json()
        setNews(Array.isArray(result) ? result : [result])
      } catch (err) {
        setError(err.message)
        setNews([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchNews()
  }, [groupId])

  // Funcion para agregar una noticia por medio del ID del grupo
  const addNews = async ({ professorIDCard, groupID, title, message, publicationDate }) => {
    const payload = {
      id: 0,
      professorIDCard,
      groupID,
      title,
      message,
      publicationDate,
    }

    try {
      const response = await fetch("http://localhost:5039/api/add/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("No se pudo publicar la noticia")
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  // Funcion para actualizar una noticia por medio del ID de la noticia
  const updateNews = async (id, newsData) => {
    const payload = {
      id,
      professorIDCard: newsData.professorIDCard,
      groupID: newsData.groupID,
      title: newsData.title,
      message: newsData.message,
      publicationDate: newsData.publicationDate,
    }

    try {
      const response = await fetch(`http://localhost:5039/api/update/new/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      if (!response.ok) throw new Error("No se pudo actualizar la noticia")
      return true
    } catch (err) {
      setError(err.message)
      return false
    }
  }

  // Funcion para eliminar una noticia por medio del ID de la noticia
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

  return { news, isLoading, error, addNews, updateNews, removeNews }
}