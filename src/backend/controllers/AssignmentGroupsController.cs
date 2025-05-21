using Microsoft.AspNetCore.Mvc;
using backend.models;
using backend.services;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.controllers
{
    [ApiController]
    [Route("api/add/assignment-groups")]
    public class AssignmentGroupsController(CEDigitalService db_ap) : ControllerBase
    {
        private readonly CEDigitalService db = db_ap;

        public class CreateGroupWithStudentsDto
        {
            public int AssignmentID { get; set; }
            public int Number { get; set; }
            public List<int> StudentIDs { get; set; } = [];
        }

        [HttpPost]
        public IActionResult CreateGroupWithStudents([FromBody] CreateGroupWithStudentsDto dto)
        {
            // 1. Validar que no exista otro grupo con el mismo número para la asignación
            var sqlCheckGroupNum = @"SELECT COUNT(*) FROM Academic.AssignmentGroups 
                         WHERE assignment_id = @AssignmentID AND group_num = @Number";
            var existingGroupNum = db.sql_db!.SELECT<int>(sqlCheckGroupNum.Replace("@AssignmentID", dto.AssignmentID.ToString()).Replace("@Number", dto.Number.ToString()))[0];
            if (existingGroupNum > 0)
            {
            return Conflict(new { message = "Ya existe un grupo con ese número para la asignación." });
            }

            // 2. Validar que ningún estudiante ya pertenezca a un grupo de la misma asignación
            var studentIdsStr = string.Join(",", dto.StudentIDs);
            var sqlCheckStudents = $@"
            SELECT student_id FROM Academic.AssignmentStudentGroups AS sg
            INNER JOIN Academic.AssignmentGroups AS g ON sg.group_id = g.id
            WHERE g.assignment_id = {dto.AssignmentID} AND sg.student_id IN ({studentIdsStr})";
            var existingStudents = db.sql_db!.SELECT<int>(sqlCheckStudents);
            if (existingStudents.Count > 0)
            {
            return Conflict(new { message = "Uno o más estudiantes ya pertenecen a un grupo de esta asignación.", students = existingStudents });
            }

            // 3. Crear el grupo
            var sqlGroup = @"INSERT INTO Academic.AssignmentGroups (assignment_id, group_num)
                     OUTPUT INSERTED.id
                     VALUES (@AssignmentID, @Number)";
            var groupId = db.sql_db!.SELECT<int>(sqlGroup.Replace("@AssignmentID", dto.AssignmentID.ToString()).Replace("@Number", dto.Number.ToString()))[0];

            // 4. Asignar estudiantes al grupo
            var sqlStudent = @"INSERT INTO Academic.AssignmentStudentGroups (student_id, group_id)
                       VALUES (@StudentID, @GroupID)";
            foreach (var studentId in dto.StudentIDs)
            {
            var parameters = new { StudentID = studentId, GroupID = groupId };
            db.sql_db!.INSERT<object>(sqlStudent, parameters);
            }

            return Ok(new { GroupID = groupId, Students = dto.StudentIDs });
        }
    }
}