using Microsoft.AspNetCore.Mvc;

using backend.models;
using backend.services;
using backend.DTO;

namespace backend.controllers
{

    [ApiController]
    [Route("api")]

    // Esqueleto para hacer los endpoints de Asignaciones del profesor
    public class AssignmentController(CEDigitalService db_ap) : ControllerBase
    { 
        private readonly CEDigitalService db = db_ap;

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
                        
                        db.sql_db!.INSERT<object>(studentAssignmentQuery, new {});
                    }
                }
                

                // 6. Insertar especificación si existe
                if (assignmentDto.Specification != null)
                {
                    var specQuery = @$"
                        INSERT INTO Files.Specifications 
                        (assignment_id, file_name, file_type, size, specification_file, upload_date)
                        OUTPUT INSERTED.id
                        VALUES ({assignment.ID}, '{assignmentDto.Specification.FileName}', 
                            '{assignmentDto.Specification.FileType}', {assignmentDto.Specification.Size}, 
                            '{assignmentDto.Specification.FilePath}', GETDATE())";

                    var specId = db.sql_db!.INSERT<AssignmentSpecificationDto>(specQuery, assignmentDto.Specification);
                }

                return CreatedAtAction(nameof(CreateAssignment), new { id = assignment.ID }, assignment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error interno: {ex.Message}");
            }
        }
    }
}