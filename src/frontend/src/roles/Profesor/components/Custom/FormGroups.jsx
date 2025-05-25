import { useState, useEffect } from "react";
import Modal from "../Modal";
import { Users, Trash2, User } from "lucide-react";
import "../../styles/Grupo/FormGroups.css";
import useAssignmentGroups from "../../hooks/useAssignmentGroups";

export default function FormGroups({ isOpen, onClose, students, assignmentId, }) {

  const [groupToDelete, setGroupToDelete] = useState(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  const {
    groups,
    loading,
    error,
    fetchGroups,
    createGroup,
    deleteGroup,
  } = useAssignmentGroups(assignmentId);

  // Cargar grupos al abrir el modal
  useEffect(() => {
    if (isOpen && assignmentId) {
      fetchGroups();
    }
  }, [isOpen, assignmentId, fetchGroups]);

  // Obtener IDs de estudiantes ya asignados
  const assignedIds = groups.flatMap((group) =>
    (group.Students || group.students || []).map(
      (member) => String(member.ID || member.id)
    )
  );

  // Estudiantes sin grupo
  const unassignedStudents = students.filter(
    (student) => !assignedIds.includes(String(student.id || student.ID))
  );


  const handleSelectStudent = (studentId) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleCreateGroup = async () => {
    if (!selectedStudentIds.length) return;
    try {
      await createGroup({
        number: groups.length + 1,
        studentIDs: selectedStudentIds,
      });
      setSelectedStudentIds([]);
    } catch (e) {
      // Manejo de errores
    }
  };

  const handleDeleteGroup = async (groupID) => {
    try {
      await deleteGroup(groupID);
    } catch (e) {
      // Manejo de errores
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Administración de Grupos"
      size="lg"
    >
      <div className="groups-management">
        <div className="create-group-section">
          <h4 className="section-title">Estudiantes sin grupo</h4>
          <ul className="students-list">
            {unassignedStudents.length === 0 ? (
              <li className="empty-message">
                Todos los estudiantes están asignados a un grupo.
              </li>
            ) : (
              unassignedStudents.map((student) => (
                <li key={student.id} className="student-item">
                  <input
                    type="checkbox"
                    checked={selectedStudentIds.includes(student.id)}
                    onChange={() => handleSelectStudent(student.id)}
                  />
                  <User size={14} className="member-icon" />
                  {student.name}
                </li>
              ))
            )}
          </ul>
          <button
            className="btn-submit"
            onClick={handleCreateGroup}
            disabled={selectedStudentIds.length === 0 || loading}
          >
            Crear grupo
          </button>
        </div>

        <div className="existing-groups-section">
          <h4 className="section-title">Grupos formados</h4>
          {loading ? (
            <p className="empty-message">Cargando...</p>
          ) : groups.length === 0 ? (
            <p className="empty-message">No hay grupos formados.</p>
          ) : error ? (
            <p className="empty-message">{error}</p>
          ) : (
            <div className="groups-list">
              {groups.map((group) => (
                <div key={group.groupID} className="group-card">
                  <div className="group-header">
                    <h5 className="group-name">
                      <Users size={16} className="group-icon" />
                      Grupo {group.number}
                    </h5>
                    <button
                      className="btn-delete-group"
                      onClick={() => {
                        setGroupToDelete(group.groupID);
                        setConfirmDeleteOpen(true);
                      }}
                      title="Eliminar grupo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <ul className="group-members">
                    {((group.students || [])).map((member) => (
                      <li key={member.ID || member.id} className="group-member">
                        {member.fullName}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
        <Modal
          isOpen={confirmDeleteOpen}
          onClose={() => setConfirmDeleteOpen(false)}
          title="Confirmar eliminación"
          actions={
            <>
              <button
                className="btn-cancel"
                onClick={() => setConfirmDeleteOpen(false)}
              >
                Cancelar
              </button>
              <button
                className="btn-danger"
                onClick={async () => {
                  await handleDeleteGroup(groupToDelete);
                  setConfirmDeleteOpen(false);
                }}
              >
                Eliminar
              </button>
            </>
          }
        >
          <p>¿Estás seguro de que deseas eliminar este grupo de trabajo?</p>
        </Modal>
      </div>
    </Modal>
  );
}