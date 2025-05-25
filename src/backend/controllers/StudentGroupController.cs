using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

using backend.models;
using backend.services;
using backend.DTO;
using backend.utils;
using Microsoft.Data.SqlClient;

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

        /// <summary>
        /// Permite añadir un estudiante a un grupo existente.
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        
        [HttpPost("add/student_to_a_group")]
        public ActionResult<StudentGroup> AddStudentToAGroup([FromBody] StudentGroup model)
        {
            // 1. Validación básica
            if (model == null)
                return BadRequest("El cuerpo de la solicitud no puede estar vacío");

            if (model.GroupID <= 0 || model.StudentID <= 0)
                return BadRequest("Los IDs deben ser valores positivos");

            // 2. Verificar si el grupo existe
            var groupExists = db.sql_db!.SELECT<int>(
                $"SELECT 1 FROM Academic.Groups WHERE id = {model.GroupID}").Any();

            if (!groupExists)
                return BadRequest($"El grupo con ID {model.GroupID} no existe");

            // 3. Verificar si el estudiante existe
            var studentExists = db.sql_db!.SELECT<int>(
                $"SELECT 1 FROM Academic.Students WHERE ssn = {model.StudentID}").Any();

            if (!studentExists)
                return BadRequest($"El estudiante con ID {model.StudentID} no existe");

            // 4. Intentar la inserción
            try
            {
                string query = @$"
                INSERT INTO Academic.CourseGroups (group_id, student_id)
                OUTPUT INSERTED.group_id as {nameof(StudentGroup.GroupID)}, 
                    INSERTED.student_id as {nameof(StudentGroup.StudentID)}
                VALUES (@{nameof(StudentGroup.GroupID)}, @{nameof(StudentGroup.StudentID)})";

                var result = db.sql_db!.INSERT<StudentGroup>(query, model);

                if (result == null)
                    return BadRequest("No se pudo agregar el estudiante al grupo (posible duplicado)");

                return CreatedAtAction(nameof(AddStudentToAGroup), new { id = result.GroupID }, result);
            }
            catch (Exception ex)
            {
                // Este catch ahora solo capturará errores inesperados
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Permite eliminar el registro de un estudiante en un grupo existente.
        /// </summary>
        /// <param name="group_id"></param>
        /// <param name="student_id"></param>
        /// <returns></returns>
        
        [HttpDelete("remove/student_from_group/{group_id}/{student_id}")]
        public ActionResult RemoveStudentFromGroup(int group_id, int student_id) // Uso directo del modelo
        {
            String tablename = "Academic.CourseGroups";

            // 1. Primero verificamos si existe el registro usando SELECT
            var checkQuery = $"SELECT TOP 1 student_id FROM {tablename} WHERE group_id = {group_id} AND student_id = {student_id}";
            var existingItems = db.sql_db!.SELECT<StudentGroup>(checkQuery);

            if (existingItems.Count == 0)
            {
                return NotFound($"No se encontró un registro con ID de grupo {group_id} y ID de estudiante {student_id}");
            }

            // 2. Si existe, procedemos a eliminar
            String retrieval = $"DELETED.group_id as {nameof(StudentGroup.GroupID)}, " +
                               $"DELETED.student_id as {nameof(StudentGroup.StudentID)}";

            String query = $@"
            DELETE FROM {tablename}
            OUTPUT {retrieval}
            WHERE group_id = {group_id} AND student_id = {student_id};";

            var results = db.sql_db!.DELETE<StudentGroup>(query);

            // 3. Verificar resultados (esto es redundante pero buena práctica)
            if (results == null || results.Count == 0)
            {
                // Esto no debería ocurrir porque ya verificamos que existe
                return StatusCode(500, "Error inesperado al eliminar la noticia");
            }

            return AcceptedAtAction(nameof(RemoveStudentFromGroup), results);
        }
    }

}
