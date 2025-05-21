import { useState, useEffect } from "react"

export function useItemsData(courseCode, groupId) {
  const [items, setItems] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchItems = async () => {
      if (!groupId) {
        setItems([])
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(
          `http://localhost:5039/api/rubric/${groupId}`
        )
        if (!response.ok) throw new Error("No se pudieron obtener los rubros")
        const data = await response.json()
        // Adaptar los datos al formato esperado por el componente
        const adapted = data.map((item) => ({
          id: item.id ?? item.ID,
          name: item.name ?? item.Name,
          percentage: item.percentage ?? item.Percentage,
          groupId: item.groupID ?? item.GroupID,
        }))
        setItems(adapted)
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
      const payload = {
        groupID: groupId,
        name: newItem.name,
        percentage: newItem.percentage,
      }
      const response = await fetch("http://localhost:5039/api/add/rubric", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const errorMsg = await response.text()
        setError(errorMsg)
        return { success: false, error: errorMsg }
      }
      const created = await response.json()
      // Recargar la lista
      await new Promise((resolve) => setTimeout(resolve, 200))
      setItems((prev) => [...prev, {
        id: created.id ?? created.ID,
        name: created.name ?? created.Name,
        percentage: created.percentage ?? created.Percentage,
        groupId: created.groupID ?? created.GroupID,
      }])
      return { success: true, item: created }
    } catch (err) {
      setError("Failed to add item")
      return { success: false, error: "Failed to add item" }
    }
  }

  // Actualizar un rubro existente
  const updateItem = async (id, updatedData) => {
    try {
      const payload = {
        id: id,
        groupID: groupId,
        name: updatedData.name,
        percentage: updatedData.percentage,
      }
      const response = await fetch(`http://localhost:5039/api/modified/rubric/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const errorMsg = await response.text()
        setError(errorMsg)
        return { success: false, error: errorMsg }
      }
      const updated = await response.json()
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                id: updated.id ?? updated.ID,
                name: updated.name ?? updated.Name,
                percentage: updated.percentage ?? updated.Percentage,
                groupId: updated.groupID ?? updated.GroupID,
              }
            : item
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
      setItems((prev) => prev.filter((item) => item.id !== id))
      return { success: true }
    } catch (err) {
      setError("Failed to delete item")
      return { success: false, error: "Failed to delete item" }
    }
  }

  // Calcular el porcentaje total
  const calculateTotalPercentage = () => {
    return items.reduce((total, item) => total + Number(item.percentage), 0)
  }

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