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

    public class ProfessorGroupController(CEDigitalService db_ap) : ControllerBase
    {
        private readonly CEDigitalService db = db_ap;

        /// <summary>
        /// Permite obtener una lista con los grupos asociados a un profesor.
        /// </summary>
        /// <param name="professorIdCard"></param>
        /// <returns></returns>

        [HttpGet("professors/groups-with-courses/{professorIdCard}")]
        public ActionResult<IEnumerable<ProfessorGroupWithCourseDto>> GetProfessorGroupsWithCourses(int professorIdCard)
        {
            String query = @$"
                SELECT 
                    g.ID AS {nameof(ProfessorGroupWithCourseDto.GroupId)},
                    g.num AS {nameof(ProfessorGroupWithCourseDto.GroupNumber)},
                    g.Semester_ID AS {nameof(ProfessorGroupWithCourseDto.SemesterId)},
                    c.Code AS {nameof(ProfessorGroupWithCourseDto.CourseCode)},
                    c.course_name AS {nameof(ProfessorGroupWithCourseDto.CourseName)},
                    c.Credits AS {nameof(ProfessorGroupWithCourseDto.Credits)},
                    c.career_name AS {nameof(ProfessorGroupWithCourseDto.Career)}
                FROM 
                    Academic.ProfessorGroups pg
                INNER JOIN 
                    Academic.Groups g ON pg.group_id = g.ID
                INNER JOIN 
                    Academic.Courses c ON g.course_code = c.Code
                WHERE 
                    pg.professor_id = {professorIdCard}";

            var results = db.sql_db!.SELECT<ProfessorGroupWithCourseDto>(query);
            if (results == null || results.Count == 0)
            {
                return NotFound("No se encontraron grupos asociados al profesor con ssn " + professorIdCard.ToString());
            }
            return Ok(results);
        }

        /// <summary>
        /// Permite asignar un profesor a un grupo existente. 
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>

        [HttpPost("add/professor_to_a_group")]
        public ActionResult<ProfessorGroup> AssignProfessorToAGroup([FromBody] ProfessorGroup model)
        {
            // 1. Validación básica
            if (model == null)
                return BadRequest("El cuerpo de la solicitud no puede estar vacío");

            if (model.GroupID <= 0 || model.ProfessorIDCard <= 0)
                return BadRequest("Los IDs deben ser valores positivos");

            // 2. Verificar si el grupo existe
            var groupExists = db.sql_db!.SELECT<int>(
                $"SELECT 1 FROM Academic.Groups WHERE id = {model.GroupID}").Any();

            if (!groupExists)
                return BadRequest($"El grupo con ID {model.GroupID} no existe");

            // 3. Verificar si el profesor existe
            var professorExists = db.sql_db!.SELECT<int>(
                $"SELECT 1 FROM Academic.Professors WHERE ssn = {model.ProfessorIDCard}").Any();

            if (!professorExists)
                return BadRequest($"El profesor con ID {model.ProfessorIDCard} no existe");

            // 4. Intentar la inserción
            try
            {
                string query = @$"
                INSERT INTO Academic.ProfessorGroups (group_id, professor_id)
                OUTPUT INSERTED.group_id as {nameof(ProfessorGroup.GroupID)}, 
                    INSERTED.professor_id as {nameof(ProfessorGroup.ProfessorIDCard)}
                VALUES (@{nameof(ProfessorGroup.GroupID)}, @{nameof(ProfessorGroup.ProfessorIDCard)})";

                var result = db.sql_db!.INSERT<ProfessorGroup>(query, model);

                if (result == null)
                    return BadRequest("No se pudo agregar el estudiante al grupo (posible duplicado)");

                return CreatedAtAction(nameof(AssignProfessorToAGroup), result);
            }
            catch (Exception ex)
            {
                // Este catch ahora solo capturará errores inesperados
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Permite eliminar la asignación de un profesor en un grupo existente.
        /// </summary>
        /// <param name="group_id"></param>
        /// <param name="professor_id"></param>
        /// <returns></returns>
        
        [HttpDelete("remove/professor_from_group/{group_id}/{professor_id}")]
        public ActionResult RemoveStudentFromGroup(int group_id, int professor_id) // Uso directo del modelo
        {
            String tablename = "Academic.ProfessorGroups";

            // 1. Primero verificamos si existe el registro usando SELECT
            var checkQuery = $"SELECT TOP 1 professor_id FROM {tablename} WHERE group_id = {group_id} AND professor_id = {professor_id}";
            var existingItems = db.sql_db!.SELECT<ProfessorGroup>(checkQuery);

            if (existingItems.Count == 0)
            {
                return NotFound($"No se encontró un registro con ID de grupo {group_id} y ID de profesor {professor_id}");
            }

            // 2. Si existe, procedemos a eliminar
            String retrieval = $"DELETED.group_id as {nameof(ProfessorGroup.GroupID)}, " +
                               $"DELETED.professor_id as {nameof(ProfessorGroup.ProfessorIDCard)}";

            String query = $@"
            DELETE FROM {tablename}
            OUTPUT {retrieval}
            WHERE group_id = {group_id} AND professor_id = {professor_id};";

            var results = db.sql_db!.DELETE<ProfessorGroup>(query);

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