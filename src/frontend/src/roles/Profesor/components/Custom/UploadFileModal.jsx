import { useState } from "react"
import Modal from "../Modal"
import "../../styles/Evaluaciones/FormAssignments.css"

export function UploadFileModal({ isOpen, onClose, onUpload }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [inputKey, setInputKey] = useState(Date.now())
  
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedFile) {
      onUpload(selectedFile)
      setSelectedFile(null)
      setInputKey(Date.now())
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cargar archivo" type="default">
      <form onSubmit={handleSubmit}>
        
        <div className="file-upload-container">
          <label className="file-upload-label">
            Selecciona un archivo
            <input
              key={inputKey}
              type="file"
              className="file-upload-input"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.ppt,.pptx"
            />
          </label>
          {selectedFile && <div className="selected-file-name">{selectedFile.name}</div>}
        </div>
        
        <div className="form-actions">
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn-submit" disabled={!selectedFile}>
            Subir
          </button>
        
        </div>
      </form>
    </Modal>
  )
}