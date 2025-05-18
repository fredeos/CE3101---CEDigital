using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

using backend.models;
using backend.services;
using backend.DTO;
using backend.utils;

namespace backend.controllers
{

    [ApiController]
    [Route("api")]
    public class StudentGroupController(CEDigitalService db_ap) : ControllerBase
    {
        private readonly CEDigitalService db = db_ap;

        /// <summary>
        /// Permite obtener la lista de estudiantes matriculados en cierto grupo.
        /// </summary>
        /// <param name="group_id"></param>
        /// <returns></returns>
        
        [HttpGet("group/students/{group_id}")]
        public ActionResult<IEnumerable<GroupStudentDTO>> GetStudentsByGroup(int group_id)
        {
            // 1. Obtener los IDs de estudiantes en este grupo desde SQL
            string sqlQuery = @$"
            SELECT student_id AS StudentID
            FROM Academic.CourseGroups
            WHERE group_id = {group_id};";

            var studentIds = db.sql_db!.SELECT<StudentGroup>(sqlQuery)
                .Select(sg => sg.StudentID)
                .ToList();

            if (!studentIds.Any())
            {
                return NotFound("No se encontraron estudiantes en el grupo" + group_id.ToString());
            }

            // 2. Obtener detalles de estudiantes desde MongoDB
            var students = db.mongo_db!.find<Student>("Students", s => studentIds.Contains(s.StudentID));

            // 3. Combinar los datos en el DTO
            var result = students
            .OrderBy(s => s.FirstLastName)  // Ordenar por primer apellido
            .ThenBy(s => s.SecondLastName) // Luego por segundo apellido (opcional)
            .ThenBy(s => s.FirstName)       // Finalmente por nombre (opcional)
            .Select(s => new GroupStudentDTO
            {
                GroupID = group_id,
                StudentID = s.StudentID,
                FullName = $"{s.FirstLastName} {s.SecondLastName} {s.FirstName}",
                Email = s.Email,
                PhoneNumber = s.PhoneNumber
            })
            .ToList();

            return Ok(result);
        }
    }

}
