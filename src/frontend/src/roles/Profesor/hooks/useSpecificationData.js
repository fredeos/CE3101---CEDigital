import { useState, useEffect } from "react"

// Funcion para obtener la especificacion de una tarea
export function useAssignmentSpecification(groupId, assignmentId) {
  const [fileUrl, setFileUrl] = useState(null)      // URL del archivo
  const [fileName, setFileName] = useState(null)    // Nombre del archivo
  const [isLoadingFile, setIsLoading] = useState(true) // Estado de carga

  useEffect(() => {
    if (!groupId || !assignmentId) {
      setFileUrl(null)
      setFileName(null)
      setIsLoading(false)
      return
    }

    const fetchSpecification = async () => {
      setIsLoading(true)
      try {
        
        // Llama a la API para obtener la especificación
        const url = `http://localhost:5039/api/specifications/group/${groupId}/${assignmentId}/recent`
        const response = await fetch(url, { method: "GET" })
        if (response.status === 404) {
          setFileUrl(null)
          setFileName(null)
        } else if (response.ok) {
          
          // Extrae el nombre del archivo del header
          const disposition = response.headers.get("content-disposition")
          let name = null
            // Si existe el header 'content-disposition', intenta extraer el nombre del archivo
            if (disposition) {
            // Busca el nombre de archivo usando una expresion regular
            const match = disposition.match(/filename\*?=(?:UTF-8'')?([^;]+)/i)
            if (match) {
              // Decodifica el nombre del archivo (por si viene codificado en UTF-8)
              name = decodeURIComponent(match[1].replace(/"/g, ""))
            }
            }
          setFileName(name)
          setFileUrl(url)
        } else {
          setFileUrl(null)
          setFileName(null)
        }
      } catch {
        setFileUrl(null)
        setFileName(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSpecification()
  }, [groupId, assignmentId])

  // Retorna la URL, nombre y estado de carga del archivo
  return { fileUrl, fileName, isLoadingFile }
}