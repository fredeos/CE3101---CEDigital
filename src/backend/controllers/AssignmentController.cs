using Microsoft.AspNetCore.Mvc;

using backend.models;
using backend.services;
using backend.DTO;

namespace backend.controllers
{

    [ApiController]
    [Route("api")]


    public class AssignmentController(CEDigitalService db_ap) : ControllerBase
    {
        private readonly CEDigitalService db = db_ap;

        /// <summary>
        /// Permite crear asignaciones dentro de un rubro especificado.
        /// </summary>
        /// <param name="assignmentDto"></param>
        /// <returns></returns>

        [HttpPost("add/assignment")]
        public ActionResult<Assignment> CreateAssignment([FromBody] AssignmentCreationDto assignmentDto)
        {
            if (assignmentDto == null)
                return BadRequest("El cuerpo de la solicitud no puede estar vacío");

            if (string.IsNullOrWhiteSpace(assignmentDto.Name))
                return BadRequest("El nombre de la asignación es requerido");

            if (assignmentDto.Percentage <= 0 || assignmentDto.Percentage > 100)
                return BadRequest("El porcentaje debe ser un valor entre 0 y 100");

            try
            {
                var rubricExists = db.sql_db!.SELECT<int>(
                    $"SELECT 1 FROM Academic.Rubrics WHERE id = {assignmentDto.RubricID}").Any();

                if (!rubricExists)
                    return BadRequest($"El rubro con ID {assignmentDto.RubricID} no existe");


                // 1. Obtener el porcentaje total actual del rubro
                var currentPercentage = db.sql_db!.SELECT<float>(
                    $"SELECT ISNULL(SUM(percentage), 0) FROM Academic.Assignments WHERE rubric_id = {assignmentDto.RubricID}").FirstOrDefault();

                // 2. Obtener el porcentaje máximo permitido para este rubro
                var rubricPercentage = db.sql_db!.SELECT<float>(
                    $"SELECT percentage FROM Academic.Rubrics WHERE id = {assignmentDto.RubricID}").FirstOrDefault();

                // 3. Verificar que no se exceda el porcentaje
                if (currentPercentage + assignmentDto.Percentage > rubricPercentage)
                {
                    return BadRequest($"No se puede crear la asignación. " +
                        $"El rubro solo permite {rubricPercentage}% y actualmente tiene {currentPercentage}% asignado. " +
                        $"Estás intentando añadir {assignmentDto.Percentage}% (Total: {currentPercentage + assignmentDto.Percentage}%)");
                }

                var groupId = db.sql_db!.SELECT<int>(
                    $"SELECT group_id FROM Academic.Rubrics WHERE id = {assignmentDto.RubricID}").FirstOrDefault();

                // Crear objeto Assignment para el INSERT
                var assignmentData = new Assignment
                {
                    RubricID = assignmentDto.RubricID,
                    Name = assignmentDto.Name,
                    Percentage = assignmentDto.Percentage,
                    TurninDate = assignmentDto.TurninDate,
                    IndividualFlag = assignmentDto.IndividualFlag
                };

                var assignmentQuery = @$"
                    INSERT INTO Academic.Assignments 
                    (rubric_id, name, percentage, turnin_date, individual_flag)
                    OUTPUT INSERTED.id as {nameof(Assignment.ID)},
                        INSERTED.rubric_id as {nameof(Assignment.RubricID)},
                        INSERTED.name as {nameof(Assignment.Name)},
                        INSERTED.percentage as {nameof(Assignment.Percentage)},
                        INSERTED.turnin_date as {nameof(Assignment.TurninDate)},
                        INSERTED.individual_flag as {nameof(Assignment.IndividualFlag)}
                    VALUES (@{nameof(Assignment.RubricID)}, @{nameof(Assignment.Name)}, 
                        @{nameof(Assignment.Percentage)}, @{nameof(Assignment.TurninDate)}, 
                        @{nameof(Assignment.IndividualFlag)})";

                var assignment = db.sql_db!.INSERT<Assignment>(assignmentQuery, assignmentData);

                if (assignment == null)
                    return StatusCode(500, "Error al crear la asignación");

                // 5. Asignar a estudiantes si no es individual

                var studentsQuery = $@"
                    SELECT student_id 
                    FROM Academic.CourseGroups 
                    WHERE group_id = {groupId}";

                var studentIds = db.sql_db!.SELECT<int>(studentsQuery);

                if (studentIds.Any())
                {
                    foreach (var studentId in studentIds)
                    {
                        var studentAssignmentQuery = $@"
                            INSERT INTO Academic.StudentAssignments 
                            (student_id, assignment_id)
                            VALUES ({studentId}, {assignment.ID})";

                        db.sql_db!.INSERT<object>(studentAssignmentQuery, new { });
                    }
                }

                // 6. Insertar especificación si existe
                if (assignmentDto.Specification != null)
                {
                    // Asignar el assignment_id correcto a la especificación
                    assignmentDto.Specification.AssignmentId = assignment.ID;

                    var specQuery = @$"
                        INSERT INTO Files.Specifications 
                        (assignment_id, file_name, file_type, size, specification_file, upload_date)
                        OUTPUT INSERTED.id
                        VALUES (@AssignmentId, @FileName, @FileType, @Size, @FilePath, GETDATE())";

                    var specId = db.sql_db!.INSERT<AssignmentSpecificationDto>(specQuery, assignmentDto.Specification);
                }

                return CreatedAtAction(nameof(CreateAssignment), new { id = assignment.ID }, assignment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }


        /// <summary>
        /// Permite obtener las asignaciones relacionadas a un rubri especificado.
        /// </summary>
        /// <param name="rubric_id"></param>
        /// <returns></returns>

        [HttpGet("assignments/by-rubric/{rubric_id}")]
        public ActionResult<IEnumerable<Assignment>> GetAssignmentsByRubricId(int rubric_id)
        {
            try
            {
                // 1. Verificar si el rubro existe
                var rubricExists = db.sql_db!.SELECT<int>(
                    $"SELECT 1 FROM Academic.Rubrics WHERE id = {rubric_id}").Any();

                if (!rubricExists)
                    return NotFound($"No se encontró el rubro con ID {rubric_id}");

                // 2. Consultar las asignaciones relacionadas
                string assignmentQuery = @$"
                    SELECT 
                        id as {nameof(Assignment.ID)},
                        rubric_id as {nameof(Assignment.RubricID)},
                        name as {nameof(Assignment.Name)},
                        percentage as {nameof(Assignment.Percentage)},
                        turnin_date as {nameof(Assignment.TurninDate)},
                        individual_flag as {nameof(Assignment.IndividualFlag)}
                    FROM Academic.Assignments
                    WHERE rubric_id = {rubric_id}";

                var assignments = db.sql_db!.SELECT<Assignment>(assignmentQuery);

                // 3. Para cada asignación, obtener su especificación (si existe)
                foreach (var assignment in assignments)
                {
                    string specQuery = @$"
                        SELECT 
                            id as {nameof(AssignmentSpecificationDto.Id)},
                            assignment_id as {nameof(AssignmentSpecificationDto.AssignmentId)},
                            file_name as {nameof(AssignmentSpecificationDto.FileName)},
                            file_type as {nameof(AssignmentSpecificationDto.FileType)},
                            size as {nameof(AssignmentSpecificationDto.Size)},
                            specification_file as {nameof(AssignmentSpecificationDto.FilePath)},
                            upload_date as {nameof(AssignmentSpecificationDto.UploadDate)}
                        FROM Files.Specifications
                        WHERE assignment_id = {assignment.ID}";

                    assignment.Specification = db.sql_db!.SELECT<AssignmentSpecificationDto>(specQuery).FirstOrDefault();
                }

                return Ok(assignments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al obtener las asignaciones: {ex.Message}");
            }
        }
        
        /// <summary>
        /// Permite modificar una asignación existente.
        /// Se valida que el nuevo porcentaje no exceda el permitido por el rubro.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="updateDto"></param>
        /// <returns></returns>
        [HttpPut("update/assignment/{id}")]
        public ActionResult<Assignment> UpdateAssignment(int id, [FromBody] AssignmentUpdateDto updateDto)
        {
            // Validaciones básicas
            if (updateDto == null)
                return BadRequest("El cuerpo de la solicitud no puede estar vacío");

            if (string.IsNullOrWhiteSpace(updateDto.Name))
                return BadRequest("El nombre de la asignación es requerido");

            if (updateDto.Percentage <= 0 || updateDto.Percentage > 100)
                return BadRequest("El porcentaje debe ser un valor entre 0 y 100");

            try
            {
                // 1. Obtener la asignación actual
                var currentAssignment = db.sql_db!.SELECT<Assignment>(
                    $"SELECT id as {nameof(Assignment.ID)}, rubric_id as {nameof(Assignment.RubricID)}, " +
                    $"name as {nameof(Assignment.Name)}, percentage as {nameof(Assignment.Percentage)}, " +
                    $"turnin_date as {nameof(Assignment.TurninDate)}, individual_flag as {nameof(Assignment.IndividualFlag)} " +
                    $"FROM Academic.Assignments WHERE id = {id}").FirstOrDefault();

                if (currentAssignment == null)
                    return NotFound($"No se encontró la asignación con ID {id}");

                // 2. Verificación de porcentaje del rubro
                if (updateDto.Percentage != currentAssignment.Percentage)
                {
                    var currentPercentageSum = db.sql_db!.SELECT<float>(
                        $"SELECT ISNULL(SUM(percentage), 0) FROM Academic.Assignments " +
                        $"WHERE rubric_id = {currentAssignment.RubricID} AND id != {id}").FirstOrDefault();

                    var rubricPercentage = db.sql_db!.SELECT<float>(
                        $"SELECT percentage FROM Academic.Rubrics WHERE id = {currentAssignment.RubricID}").FirstOrDefault();

                    if (currentPercentageSum + updateDto.Percentage > rubricPercentage)
                    {
                        return BadRequest($"No se puede actualizar la asignación. " +
                            $"El rubro solo permite {rubricPercentage}% y actualmente tiene {currentPercentageSum}% asignado " +
                            $"en otras asignaciones. Estás intentando asignar {updateDto.Percentage}% " +
                            $"(Total: {currentPercentageSum + updateDto.Percentage}%)");
                    }
                }

                // 3. Preparar objeto Assignment para la actualización
                var assignmentToUpdate = new Assignment
                {
                    ID = id,
                    Name = updateDto.Name,
                    Percentage = updateDto.Percentage,
                    TurninDate = updateDto.TurninDate,
                    IndividualFlag = updateDto.IndividualFlag,
                    RubricID = currentAssignment.RubricID // Mantenemos el mismo rubro
                };

                // 4. Consulta UPDATE corregida
                var updateQuery = @$"
                    UPDATE Academic.Assignments
                    SET name = @{nameof(Assignment.Name)},
                        percentage = @{nameof(Assignment.Percentage)},
                        turnin_date = @{nameof(Assignment.TurninDate)},
                        individual_flag = @{nameof(Assignment.IndividualFlag)}
                    OUTPUT INSERTED.id as {nameof(Assignment.ID)},
                        INSERTED.rubric_id as {nameof(Assignment.RubricID)},
                        INSERTED.name as {nameof(Assignment.Name)},
                        INSERTED.percentage as {nameof(Assignment.Percentage)},
                        INSERTED.turnin_date as {nameof(Assignment.TurninDate)},
                        INSERTED.individual_flag as {nameof(Assignment.IndividualFlag)}
                    WHERE id = @{nameof(Assignment.ID)}";

                var updatedAssignment = db.sql_db!.UPDATE<Assignment>(updateQuery, assignmentToUpdate).FirstOrDefault();

                if (updatedAssignment == null)
                    return StatusCode(500, "Error al actualizar la asignación");

                // 5. Manejo de la especificación
                if (updateDto.Specification != null)
                {
                    // Verificar si ya existe una especificación
                    var existingSpec = db.sql_db!.SELECT<int>(
                        $"SELECT 1 FROM Files.Specifications WHERE assignment_id = {id}").Any();

                    if (existingSpec)
                    {
                        // Actualizar especificación existente
                        var updateSpecQuery = @$"
                            UPDATE Files.Specifications
                            SET file_name = '{updateDto.Specification.FileName.Replace("'", "''")}',
                                file_type = '{updateDto.Specification.FileType.Replace("'", "''")}',
                                size = {updateDto.Specification.Size},
                                specification_file = '{updateDto.Specification.FilePath.Replace("'", "''")}',
                                upload_date = GETDATE()
                            WHERE assignment_id = {id}";

                        db.sql_db!.UPDATE<object>(updateSpecQuery, new { });
                    }
                    else
                    {
                        // Crear nueva especificación
                        var insertSpecQuery = @$"
                            INSERT INTO Files.Specifications 
                            (assignment_id, file_name, file_type, size, specification_file, upload_date)
                            VALUES ({id}, '{updateDto.Specification.FileName.Replace("'", "''")}', 
                                '{updateDto.Specification.FileType.Replace("'", "''")}', {updateDto.Specification.Size}, 
                                '{updateDto.Specification.FilePath.Replace("'", "''")}', GETDATE())";

                        db.sql_db!.INSERT<object>(insertSpecQuery, new { });
                    }
                }
                else
                {
                    // Opcional: Eliminar especificación si se envía null
                    // db.sql_db!.DELETE<object>($"DELETE FROM Files.Specifications WHERE assignment_id = {id}", null);
                }

                // 6. Obtener la especificación actualizada para incluir en la respuesta
                var specQuery = @$"
                    SELECT 
                        id as {nameof(AssignmentSpecificationDto.Id)},
                        assignment_id as {nameof(AssignmentSpecificationDto.AssignmentId)},
                        file_name as {nameof(AssignmentSpecificationDto.FileName)},
                        file_type as {nameof(AssignmentSpecificationDto.FileType)},
                        size as {nameof(AssignmentSpecificationDto.Size)},
                        specification_file as {nameof(AssignmentSpecificationDto.FilePath)},
                        upload_date as {nameof(AssignmentSpecificationDto.UploadDate)}
                    FROM Files.Specifications
                    WHERE assignment_id = {id}";

                updatedAssignment.Specification = db.sql_db!.SELECT<AssignmentSpecificationDto>(specQuery).FirstOrDefault();

                return Ok(updatedAssignment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }
        

        /// <summary>
        /// Elimina una asignación y todo lo relacionado a ella en cascada.
        /// </summary>
        /// <param name="assignment_id"></param>
        /// <returns></returns>
        [HttpDelete("delete/assignment/{assignment_id}")]
        public ActionResult DeleteAssignment(int assignment_id)
        {
            try
            {
                // 1. Obtener todos los submissions de la asignación
                var submissionIds = db.sql_db!.SELECT<int>(
                    $"SELECT id FROM Academic.AssignmentSubmissions WHERE assignment_id = {assignment_id}"
                );

                foreach (var submissionId in submissionIds)
                {
                    // 2. Eliminar SubmissionFiles relacionados
                    db.sql_db!.DELETE<object>(
                        $"DELETE FROM Files.SubmissionFiles WHERE submission_id = {submissionId}"
                    );

                    // 3. Eliminar FeedbackFiles relacionados
                    db.sql_db!.DELETE<object>(
                        $"DELETE FROM Files.FeedbackFiles WHERE submission_id = {submissionId}"
                    );

                    // 4. Eliminar StudentSubmissions relacionados
                    db.sql_db!.DELETE<object>(
                        $"DELETE FROM Academic.StudentSubmissions WHERE submission_id = {submissionId}"
                    );
                }

                // 5. Eliminar AssignmentSubmissions de la asignación
                db.sql_db!.DELETE<object>(
                    $"DELETE FROM Academic.AssignmentSubmissions WHERE assignment_id = {assignment_id}"
                );

                // 6. Eliminar StudentAssignments para la asignación
                db.sql_db!.DELETE<object>(
                    $"DELETE FROM Academic.StudentAssignments WHERE assignment_id = {assignment_id}"
                );

                // 7. Eliminar AssignmentStudentGroups para los grupos de la asignación
                db.sql_db!.DELETE<object>(
                    $"DELETE FROM Academic.AssignmentStudentGroups WHERE group_id IN " +
                    $"(SELECT id FROM Academic.AssignmentGroups WHERE assignment_id = {assignment_id})"
                );

                // 8. Eliminar AssignmentGroups para la asignación
                db.sql_db!.DELETE<object>(
                    $"DELETE FROM Academic.AssignmentGroups WHERE assignment_id = {assignment_id}"
                );

                // 9. Eliminar Specifications para la asignación
                db.sql_db!.DELETE<object>(
                    $"DELETE FROM Files.Specifications WHERE assignment_id = {assignment_id}"
                );

                // 10. Eliminar la asignación
                var deletedAssignments = db.sql_db!.DELETE<Assignment>(
                    $"DELETE FROM Academic.Assignments " +
                    $"OUTPUT DELETED.id AS {nameof(Assignment.ID)}, " +
                    $"DELETED.rubric_id AS {nameof(Assignment.RubricID)}, " +
                    $"DELETED.name AS {nameof(Assignment.Name)}, " +
                    $"DELETED.percentage AS {nameof(Assignment.Percentage)}, " +
                    $"DELETED.turnin_date AS {nameof(Assignment.TurninDate)}, " +
                    $"DELETED.individual_flag AS {nameof(Assignment.IndividualFlag)} " +
                    $"WHERE id = {assignment_id}"
                );

                if (deletedAssignments.Count == 0)
                {
                    return NotFound($"No se encontró la asignación con ID {assignment_id}");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error al eliminar la asignación: {ex.Message}");
            }
        }

    }
}