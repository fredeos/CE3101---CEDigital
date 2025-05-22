import { useState, useEffect } from "react";
import Modal from "../Modal";
import { Users, Trash2, User } from "lucide-react";
import "../../styles/Grupo/FormGroups.css";

export default function FormGroups({
  isOpen,
  onClose,
  students,
  assignmentId,
  existingGroups = [],
}) {
  const [groups, setGroups] = useState(existingGroups || []);
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);

  useEffect(() => {
    setGroups(existingGroups || []);
  }, [existingGroups, isOpen]);

  useEffect(() => {
    const assignedIds = groups.flatMap((group) =>
      group.members.map((member) => member.id)
    );
    setUnassignedStudents(
      students.filter((student) => !assignedIds.includes(student.id))
    );
    setSelectedStudentIds([]);
  }, [students, groups]);

  const handleSelectStudent = (studentId) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleCreateGroup = () => {
    if (!selectedStudentIds.length) return;
    const nextGroupNumber = groups.length + 1;
    const newGroup = {
      name: `Grupo ${nextGroupNumber}`,
      members: unassignedStudents.filter((s) =>
        selectedStudentIds.includes(s.id)
      ),
    };
    setGroups((prev) => [...prev, newGroup]);
    setSelectedStudentIds([]);
  };

  const handleDeleteGroup = (groupIndex) => {
    setGroups((prev) => prev.filter((_, index) => index !== groupIndex));
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
            disabled={selectedStudentIds.length === 0}
          >
            Crear grupo
          </button>
        </div>

        <div className="existing-groups-section">
          <h4 className="section-title">Grupos formados</h4>
          {groups.length === 0 ? (
            <p className="empty-message">Aún no hay grupos creados.</p>
          ) : (
            <div className="groups-list">
              {groups.map((group, index) => (
                <div key={index} className="group-card">
                  <div className="group-header">
                    <h5 className="group-name">
                      <Users size={16} className="group-icon" />
                      {group.name}
                    </h5>
                    <button
                      className="btn-delete-group"
                      onClick={() => handleDeleteGroup(index)}
                      title="Eliminar grupo"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <ul className="group-members">
                    {group.members.map((member) => (
                      <li key={member.id} className="group-member">
                        <User size={14} className="member-icon" />
                        {member.name}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}