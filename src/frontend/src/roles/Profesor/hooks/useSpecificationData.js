import { useState, useEffect } from "react"

export function useAssignmentSpecification(groupId, assignmentId) {
  const [fileUrl, setFileUrl] = useState(null)
  const [fileName, setFileName] = useState(null)
  const [isLoadingFile, setIsLoading] = useState(true)

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
        const url = `http://localhost:5039/api/specifications/group/${groupId}/${assignmentId}/recent`
        const response = await fetch(url, { method: "GET" })
        if (response.status === 404) {
          setFileUrl(null)
          setFileName(null)
          console.log("Va a ser nuloooo")
        } else if (response.ok) {
          const disposition = response.headers.get("content-disposition")
          let name = null
          if (disposition) {
            const match = disposition.match(/filename\*?=(?:UTF-8'')?([^;]+)/i)
            if (match) {
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

  return { fileUrl, fileName, isLoadingFile }
}