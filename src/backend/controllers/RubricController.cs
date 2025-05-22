using Microsoft.AspNetCore.Mvc;

using backend.models;
using backend.services;

namespace backend.controllers
{

    [ApiController]
    [Route("api")]

    public class RubricController(CEDigitalService db_ap) : ControllerBase
    {

        private readonly CEDigitalService db = db_ap;

        /// <summary>
        /// Permite obtener los rubros relacionados a cierto grupo.
        /// </summary>
        /// <param name="group_id"></param>
        /// <returns></returns>
        
        [HttpGet("rubric/{group_id}")]
        public ActionResult<IEnumerable<Rubric>> GetRubric(int group_id)
        {
            Console.WriteLine(group_id);
            String tablename = "Academic.Rubrics as AR";
            String attributes = $"AR.id as {nameof(Rubric.ID)}, AR.group_id as {nameof(Rubric.GroupID)}, AR.rubric_name as {nameof(Rubric.Name)}, AR.percentage as {nameof(Rubric.Percentage)}";

            String query = @$"
            SELECT {attributes} 
            FROM {tablename}
            WHERE AR.group_id = {group_id};";

            var results = db.sql_db!.SELECT<Rubric>(query);
            if (results == null || results.Count == 0)
            {
                return NotFound("No sé encontraron rubros para el grupo con ID " + group_id.ToString());
            }
            return Ok(results);
        }

        /// <summary>
        /// Permite crear rubros para cierto grupo.
        /// </summary>
        /// <param name="newRubric"></param>
        /// <returns></returns>
        
        [HttpPost("add/rubric")]
        public ActionResult<Rubric> CreateRubric([FromBody] Rubric newRubric)
        {
            // Primero verificamos que el porcentaje total no exceda 100
            string checkQuery = @$"
                SELECT SUM(percentage) 
                FROM Academic.Rubrics 
                WHERE group_id = {newRubric.GroupID}";

            int currentTotal = db.sql_db!.SELECT<int>(checkQuery).FirstOrDefault();

            if (currentTotal + newRubric.Percentage > 100)
            {
                return BadRequest($"No se puede agregar. El porcentaje total excedería el 100% (Actual: {currentTotal}%, Nuevo: {newRubric.Percentage}%)");
            }

            // Si está OK, procedemos con la inserción
            string insertQuery = @$"
                INSERT INTO Academic.Rubrics (group_id, rubric_name, percentage)
                OUTPUT
                    INSERTED.group_id AS {nameof(Rubric.GroupID)}, 
                    INSERTED.rubric_name AS {nameof(Rubric.Name)}, 
                    INSERTED.percentage AS {nameof(Rubric.Percentage)}
                VALUES (@GroupID, @Name, @Percentage)";

            var result = db.sql_db!.INSERT<Rubric>(insertQuery, newRubric);

            if (result == null)
            {
                return StatusCode(500, "Error al crear el rubro");
            }

            return CreatedAtAction(nameof(GetRubric), new { group_id = result.GroupID }, result);
        }

        /// <summary>
        /// Permite modificar un rubro consideran que el cambio no aumente el porcentaje total a más de 100%.
        /// </summary>
        /// <param name="rubric_id"></param>
        /// <param name="updatedRubric"></param>
        /// <returns></returns>
        [HttpPut("modified/rubric/{rubric_id}")]
        public ActionResult<Rubric> UpdateRubric(int rubric_id, [FromBody] Rubric updatedRubric)
        {
            // Primero obtenemos el rubro actual para comparar
            string getCurrentQuery = @$"
                SELECT percentage 
                FROM Academic.Rubrics 
                WHERE id = {rubric_id}";

            int currentPercentage = db.sql_db!.SELECT<int>(getCurrentQuery).FirstOrDefault();

            // Verificamos la diferencia de porcentaje
            string checkQuery = @$"
                SELECT SUM(percentage) 
                FROM Academic.Rubrics 
                WHERE group_id = {updatedRubric.GroupID} AND id != {rubric_id}";

            int otherItemsTotal = db.sql_db!.SELECT<int>(checkQuery).FirstOrDefault();
            int newTotal = otherItemsTotal + updatedRubric.Percentage;
            Console.WriteLine($"Total sin este rubro: {otherItemsTotal}%, Nuevo: {updatedRubric.Percentage}%, Total: {newTotal}%");
            if (newTotal > 100)
            {
                return BadRequest($"No se puede actualizar. El porcentaje total excedería el 100% (Actual sin este rubro: {otherItemsTotal}%, Nuevo: {updatedRubric.Percentage}%)");
            }

            // Si está OK, procedemos con la actualización
            string updateQuery = @$"
                UPDATE Academic.Rubrics
                SET group_id = @GroupID,
                    rubric_name = @Name,
                    percentage = @Percentage
                OUTPUT INSERTED.id AS {nameof(Rubric.ID)}, 
                    INSERTED.group_id AS {nameof(Rubric.GroupID)}, 
                    INSERTED.rubric_name AS {nameof(Rubric.Name)}, 
                    INSERTED.percentage AS {nameof(Rubric.Percentage)}
                WHERE id = {rubric_id}";

            var result = db.sql_db!.UPDATE<Rubric>(updateQuery, updatedRubric).FirstOrDefault();

            if (result == null)
            {
                return NotFound($"Rubro con ID {rubric_id} no encontrado");
            }

            return Ok(result);
        }

        /// <summary>
        /// Elimina en cadena un rubro y todo lo relacionado a este.
        /// </summary>
        /// <param name="rubric_id"></param>
        /// <returns></returns>
        
        [HttpDelete("delete/rubric/{rubric_id}")]
        public ActionResult DeleteRubric(int rubric_id)
        {
            try
            {
                // 1. Primero obtenemos todas las asignaciones relacionadas con este rubro
                var assignmentIds = db.sql_db!.SELECT<int>(
                    $"SELECT id FROM Academic.Assignments WHERE rubric_id = {rubric_id}"
                );

                foreach (var assignmentId in assignmentIds)
                {
                    // 2. Obtenemos todos los AssignmentSubmissions para esta asignación
                    var submissionIds = db.sql_db!.SELECT<int>(
                        $"SELECT id FROM Academic.AssignmentSubmissions WHERE assignment_id = {assignmentId}"
                    );

                    foreach (var submissionId in submissionIds)
                    {
                        // 3. Eliminar SubmissionFiles relacionados con este submission
                        db.sql_db!.DELETE<object>(
                            $"DELETE FROM Files.SubmissionFiles WHERE submission_id = {submissionId}"
                        );

                        // 4. Eliminar FeedbackFiles relacionados con este submission
                        db.sql_db!.DELETE<object>(
                            $"DELETE FROM Files.FeedbackFiles WHERE submission_id = {submissionId}"
                        );

                        // 5. Eliminar StudentSubmissions relacionados con este submission
                        db.sql_db!.DELETE<object>(
                            $"DELETE FROM Academic.StudentSubmissions WHERE submission_id = {submissionId}"
                        );
                    }

                    // 6. Eliminar los AssignmentSubmissions de esta asignación
                    db.sql_db!.DELETE<object>(
                        $"DELETE FROM Academic.AssignmentSubmissions WHERE assignment_id = {assignmentId}"
                    );

                    // 7. Eliminar StudentAssignments para esta asignación
                    db.sql_db!.DELETE<object>(
                        $"DELETE FROM Academic.StudentAssignments WHERE assignment_id = {assignmentId}"
                    );

                    // 8. Eliminar AssignmentStudentGroups para los grupos de esta asignación
                    db.sql_db!.DELETE<object>(
                        $"DELETE FROM Academic.AssignmentStudentGroups WHERE group_id IN " +
                        $"(SELECT id FROM Academic.AssignmentGroups WHERE assignment_id = {assignmentId})"
                    );

                    // 9. Eliminar AssignmentGroups para esta asignación
                    db.sql_db!.DELETE<object>(
                        $"DELETE FROM Academic.AssignmentGroups WHERE assignment_id = {assignmentId}"
                    );

                    // 10. Eliminar Specifications para esta asignación
                    db.sql_db!.DELETE<object>(
                        $"DELETE FROM Files.Specifications WHERE assignment_id = {assignmentId}"
                    );
                }

                // 11. Eliminar todas las Assignments del rubro
                db.sql_db!.DELETE<object>(
                    $"DELETE FROM Academic.Assignments WHERE rubric_id = {rubric_id}"
                );

                // 12. Finalmente eliminar el rubro
                var deletedRubrics = db.sql_db!.DELETE<Rubric>(
                    $"DELETE FROM Academic.Rubrics " +
                    $"OUTPUT DELETED.id AS {nameof(Rubric.ID)}, " +
                    $"DELETED.group_id AS {nameof(Rubric.GroupID)}, " +
                    $"DELETED.rubric_name AS {nameof(Rubric.Name)}, " +
                    $"DELETED.percentage AS {nameof(Rubric.Percentage)} " +
                    $"WHERE id = {rubric_id}"
                );

                if (deletedRubrics.Count == 0)
                {
                    return NotFound($"Rubro con ID {rubric_id} no encontrado");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al eliminar: {ex.Message}");
            }
        }
    }
}