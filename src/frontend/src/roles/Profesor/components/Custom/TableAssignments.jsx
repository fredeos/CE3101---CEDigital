import { Edit, Trash2, Users, Upload } from "lucide-react"

export default function TableAssessments({
    groupId,
    assessments,
    formatDate,
    formatTime,
    handleEditClick,
    handleDeleteClick,
    setGroupAssessmentSelected,
    setUploadAssessment,
    setUploadModalOpen,
    getSpecificationDownloadUrl
}) {
    return (
        <div className="data-table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Evaluación</th>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Tipo</th>
                        <th>Peso</th>
                        <th>Especificación</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {assessments.map((assessment) => {
                        // Solo mostrar el enlace si hay archivo cargado (por ejemplo, assessment.fileUrl o assessment.fileName)
                        const fileUrl = assessment.fileUrl ? getSpecificationDownloadUrl(groupId, assessment.id) : null;
                        return (
                            <tr key={assessment.id}>
                                <td className="title-cell"><span>{assessment.title}</span></td>
                                <td>{formatDate(assessment.dueDate)}</td>
                                <td>{formatTime(assessment.dueDate)}</td>
                                <td>
                                    {assessment.isGroupAssessment ? <span>Grupal</span> : <span>Individual</span>}
                                </td>
                                <td>{assessment.weight}%</td>
                                <td>
                                    {fileUrl ? (
                                        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="file-link">
                                            <span>
                                                Descargar especificación
                                            </span>
                                        </a>
                                    ) : (
                                        <span className="file-link-disabled">Sin archivo</span>
                                    )}
                                </td>
                                <td>
                                    <div className="actions-cell">
                                        <button className="icon-btn edit" onClick={() => handleEditClick(assessment)} title="Editar">
                                            <Edit size={18} />
                                        </button>
                                        <button className="icon-btn delete" onClick={() => handleDeleteClick(assessment)} title="Eliminar">
                                            <Trash2 size={18} />
                                        </button>

                                        <button
                                            className="icon-btn upload"
                                            onClick={() => {
                                                setUploadAssessment(assessment)
                                                setUploadModalOpen(true)
                                            }}
                                            title="Cargar archivo"
                                        >
                                            <Upload size={16} />
                                        </button>

                                        {assessment.isGroupAssessment && (
                                            <button
                                                className="icon-btn groups"
                                                onClick={() => setGroupAssessmentSelected(assessment)}
                                                title="Formar grupos"
                                            >
                                                <Users size={18} />
                                            </button>
                                        )}

                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}