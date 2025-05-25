import { useState, useEffect } from "react"

// Adapta un rubro recibido del backend al formato del frontend
function adaptItem(item) {
  return {
    id: item.id ?? item.ID,
    name: item.name ?? item.Name,
    percentage: item.percentage ?? item.Percentage,
    groupId: item.groupID ?? item.GroupID,
  }
}

// Construye el payload para crear o actualizar un rubro
function buildItemPayload(data, groupId, id = null) {
  return {
    ...(id && { id }),
    groupID: groupId,
    name: data.name,
    percentage: data.percentage,
  }
}

// Funcion principal para manejar rubros/items (conexiones con la API)
export function useItemsData(courseCode, groupId) {
  const [items, setItems] = useState([])           // Estado para los rubros
  const [isLoading, setIsLoading] = useState(true) // Estado de carga
  const [error, setError] = useState(null)         // Estado de error

  // Obtiene los rubros del grupo cuando cambia el groupId
  useEffect(() => {
    const fetchItems = async () => {
      if (!groupId) {
        setItems([])
        setIsLoading(false)
        return
      }
      setIsLoading(true)
      try {
        // Llama a la API para obtener rubros del grupo
        const response = await fetch(`http://localhost:5039/api/rubric/${groupId}`)
        if (!response.ok) throw new Error("No se pudieron obtener los rubros")
        const data = await response.json()
        // Adapta los datos al formato esperado
        setItems(data.map(adaptItem))
        setIsLoading(false)
      } catch (err) {
        setError("Failed to load items")
        setIsLoading(false)
      }
    }
    fetchItems()
  }, [groupId])

  // Crear un nuevo rubro
  const addItem = async (newItem) => {
    try {
      const payload = buildItemPayload(newItem, groupId)
      const response = await fetch("http://localhost:5039/api/add/rubric", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const errorMsg = await response.text()
        setError(errorMsg)
        return { success: false, error: errorMsg }
      }
      const created = await response.json()
      // Agrega el nuevo rubro a la lista
      setItems((prev) => [...prev, adaptItem(created)])
      return { success: true, item: created }
    } catch (err) {
      setError("Failed to add item")
      return { success: false, error: "Failed to add item" }
    }
  }

  // Actualizar un rubro existente
  const updateItem = async (id, updatedData) => {
    try {
      const payload = buildItemPayload(updatedData, groupId, id)
      const response = await fetch(`http://localhost:5039/api/modified/rubric/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const errorMsg = await response.text()
        setError(errorMsg)
        return { success: false, error: errorMsg }
      }
      const updated = await response.json()
      // Actualiza el rubro en la lista
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? adaptItem(updated) : item
        )
      )
      return { success: true }
    } catch (err) {
      setError("Failed to update item")
      return { success: false, error: "Failed to update item" }
    }
  }

  // Eliminar un rubro
  const deleteItem = async (id) => {
    try {
      const response = await fetch(`http://localhost:5039/api/delete/rubric/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const errorMsg = await response.text()
        setError(errorMsg)
        return { success: false, error: errorMsg }
      }
      // Elimina el rubro de la lista
      setItems((prev) => prev.filter((item) => item.id !== id))
      return { success: true }
    } catch (err) {
      setError("Failed to delete item")
      return { success: false, error: "Failed to delete item" }
    }
  }

  // Calcular el porcentaje total de todos los rubros
  const calculateTotalPercentage = () => {
    return items.reduce((total, item) => total + Number(item.percentage), 0)
  }

  // Retorna estados y funciones principales del hook
  return {
    items,
    isLoading,
    error,
    addItem,
    updateItem,
    deleteItem,
    calculateTotalPercentage,
  }
}