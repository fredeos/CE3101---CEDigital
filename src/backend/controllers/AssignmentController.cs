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

        [HttpGet("assignments/group/{group_id}/student/{student_id}")]
        public ActionResult<IEnumerable<RubricWithAssignmentsDTO>> GetAssignmentsPerRubricForStudent(int student_id, int group_id)
        {
            List<RubricWithAssignmentsDTO> rubrics_list = [];
            // Buscar todas las rubricas del grupo
            string sql_query1 = $@"
            SELECT  R.id as {nameof(RubricWithAssignmentsDTO.ID)}, R.rubric_name as {nameof(RubricWithAssignmentsDTO.Name)},
                    R.percentage as {nameof(RubricWithAssignmentsDTO.TotalPercentage)}
            FROM Academic.Groups as G JOIN Academic.Rubrics as R ON G.id = R.group_id
            WHERE G.id = {group_id}; ";
            var rubrics = db.sql_db!.SELECT<RubricWithAssignmentsDTO>(sql_query1);
            rubrics.ForEach(r =>
            {
                r.Assignments = [];
            });
            rubrics_list.AddRange(rubrics);

            bool show_rubric_percentage = false;
            foreach (var rubric in rubrics_list) // Buscar las asignaciones en cada rubro 
            {   
                // Buscar todas las asignaciones de cada rubrica para el estudiante en cuestion
                string sql_query2 = $@"
                SELECT  A.id as {nameof(AssignmentForStudentDTO.ID)}, A.name as {nameof(AssignmentForStudentDTO.Name)},
                        A.percentage as {nameof(AssignmentForStudentDTO.TotalPercentage)}, A.turnin_date as {nameof(AssignmentForStudentDTO.DueDate)}
                FROM Academic.Assignments as A JOIN Academic.StudentAssignments as S
                ON A.id = S.assignment_id
                WHERE S.student_id = {student_id} AND A.rubric_id = {rubric.ID}";
                var assignments = db.sql_db!.SELECT<AssignmentForStudentDTO>(sql_query2);

                // Buscar si existen un entregable para cada asignacion
                assignments.ForEach(a =>
                {
                    a.ShowPercentage = 0;
                    string sql_query3 = $@"
                    SELECT SUB.grade as {nameof(AssignmentSubmission.grade)}, SUB.published_flag as {nameof(AssignmentSubmission.Published)}
                    FROM (Academic.AssignmentSubmissions as SUB JOIN Academic.StudentSubmissions as SS ON SS.submission_id = SUB.id)
                    JOIN Academic.Assignments as A ON SUB.assignment_id = A.id
                    WHERE SUB.assignment_id = {a.ID} AND SS.student_id = {student_id}";
                    var assignment_submission = db.sql_db!.SELECT<AssignmentSubmission>(sql_query3).FirstOrDefault();
                    if (assignment_submission != null)
                    {
                        a.EarnedGrade = assignment_submission.grade;
                        a.ShowPercentage = assignment_submission.Published;
                        if (a.EarnedGrade != null)
                        {
                            a.EarnedPercentage = (a.EarnedGrade / 100) * a.TotalPercentage;
                        }
                        if (a.ShowPercentage == 1 && !show_rubric_percentage)
                        {
                            show_rubric_percentage = true;
                        }
                    } 
                });

                rubric.Assignments.AddRange(assignments);
                if (show_rubric_percentage)
                {
                    foreach (var assignment in rubric.Assignments)
                    {
                        if (assignment.EarnedGrade != null)
                        {
                            rubric.EarnedPercentage += assignment.EarnedPercentage;
                        }
                    }
                }
            }

            return Ok(rubrics_list);
        }
        

        [HttpGet("assigments/{assignment_id}/forstudent/{student_id}")]
        public ActionResult<StudentViewFullAssignmentDTO> GetFullAssignmentInformation(int assignment_id, int student_id)
        {
            // Verificar si el estudiante esta en un grupo para la asignacion
            string sql_query1 = $@"
            SELECT  AG.id as {nameof(AssignmentGroups.ID)}, AG.assignment_id as {nameof(AssignmentGroups.AssignmentID)},
                    AG.group_num as {nameof(AssignmentGroups.Number)}
            FROM (Academic.StudentSubmissions as SS JOIN Academic.AssignmentSubmissions as SUB
                ON SS.submission_id = SUB.id ) JOIN Academic.AssignmentGroups as AG 
                ON SUB.group_id = AG.id
            WHERE SS.student_id = {student_id} AND SUB.assignment_id = {assignment_id}; ";

            var group = db.sql_db!.SELECT<AssignmentGroups>(sql_query1).FirstOrDefault();
            string context_condition = "";
            if (group == null){ // No tiene grupo
                context_condition = $"AND SUB.student_id = {student_id}";
            } else{ // Tiene grupo
                context_condition = $"AND SUB.group_id = {group.ID}";
            }

            // Buscar que exista la asignacion
            string sql_query2 = @$"
            SELECT  A.id as {nameof(StudentViewFullAssignmentDTO.ID)}, A.name as {nameof(StudentViewFullAssignmentDTO.Name)},
                    R.rubric_name as {nameof(StudentViewFullAssignmentDTO.Category)}, A.percentage as {nameof(StudentViewFullAssignmentDTO.TotalPercentage)},
                    A.turnin_date as {nameof(StudentViewFullAssignmentDTO.DueDate)}
            FROM ( Academic.Assignments as A JOIN Academic.Rubrics as R 
                ON A.rubric_id = R.id ) JOIN Academic.StudentAssignments as SA
                ON SA.assignment_id = A.id
            WHERE A.id = {assignment_id} AND SA.student_id = {student_id}; ";
            var fullassignment = db.sql_db!.SELECT<StudentViewFullAssignmentDTO>(sql_query2).FirstOrDefault();
            if (fullassignment == null)
            {
                return NotFound($"Assignment(ID={assignment_id}) not found for student(ID={student_id})");
            }

            // Agregar los integrantes del grupo si existian
            if (group != null)
            {
                group.GroupMembers = [];
                string sql_query = @$"
                SELECT SG.group_id as {nameof(StudentGroup.GroupID)}, SG.student_id as {nameof(StudentGroup.StudentID)}
                FROM Academic.AssignmentStudentGroups as SG JOIN Academic.AssignmentGroups as AG
                ON SG.group_id = AG.id
                WHERE SG.group_id = {group.ID}; ";

                var sqlmembers = db.sql_db!.SELECT<StudentGroup>(sql_query);
                foreach (var sqlmember in sqlmembers)
                {
                    var member = db.mongo_db!.find<Student>("Students", s => s.StudentID == sqlmember.StudentID).FirstOrDefault();
                    if (member != null) group.GroupMembers.Add(member);
                }

                fullassignment.GroupMembers = group.GroupMembers;
            }

            // Buscar las especificaciones
            string sql_query3 = @$"
            SELECT  S.id as {nameof(SpecificationDTO.ID)}, S.file_name as {nameof(SpecificationDTO.Name)},
                    S.file_type as {nameof(SpecificationDTO.Extension)}, S.size as {nameof(SpecificationDTO.Size)}
            FROM Files.Specifications as S JOIN Academic.Assignments as A
            ON S.assignment_id = A.id
            WHERE S.assignment_id = {assignment_id}; ";

            var specifications = db.sql_db!.SELECT<SpecificationDTO>(sql_query3);
            fullassignment.Attachments = specifications;

            // Buscar la la entrega de la evaluacion
            string sql_query4 = @$"
            SELECT  SUB.grade as {nameof(StudentViewFullAssignmentDTO.EarnedScore)}, 
                    SUB.commentary as {nameof(StudentViewFullAssignmentDTO.Commentary)},
                    SUB.published_flag as {nameof(StudentViewFullAssignmentDTO.ShowGrades)}
            FROM Academic.Assignments as A JOIN Academic.AssignmentSubmissions as SUB
            ON SUB.assignment_id = A.id
            WHERE SUB.assignment_id = {assignment_id} {context_condition}; ";

            var assignment_complement = db.sql_db!.SELECT<StudentViewFullAssignmentDTO>(sql_query4).FirstOrDefault();
            if (assignment_complement != null)
            {   
                fullassignment.ShowGrades = assignment_complement.ShowGrades;
                if (assignment_complement.EarnedScore != null && fullassignment.ShowGrades > 0)
                {   
                    fullassignment.EarnedScore = assignment_complement.EarnedScore;
                    fullassignment.EarnedPercentage = fullassignment.EarnedScore / fullassignment.MaxScore * fullassignment.TotalPercentage;
                }
                fullassignment.Commentary = assignment_complement.Commentary;

                // Buscar el entregable mas reciente
                string sql_query5 = @$"
                SELECT  F.id as {nameof(SolutionDTO.ID)}, F.file_name as {nameof(SolutionDTO.Name)},
                        F.file_type as {nameof(SolutionDTO.Extension)}, F.size as {nameof(SolutionDTO.Size)},
                        F.upload_date as {nameof(SolutionDTO.UploadDate)}
                FROM ( Academic.Assignments as A JOIN Academic.AssignmentSubmissions as SUB
                    ON SUB.assignment_id = A.id ) JOIN Files.SubmissionFiles as F
                    ON SUB.submitted_file = F.id
                WHERE SUB.assignment_id = {assignment_id} {context_condition}; ";

                var lastsubmission = db.sql_db!.SELECT<SolutionDTO>(sql_query5).FirstOrDefault();
                fullassignment.Submission = lastsubmission;

                // Buscar la retroalimenaction mas reciente
                string sql_query6 = $@"
                SELECT  F.id as {nameof(FeedbackDTO.ID)}, F.file_name as {nameof(FeedbackDTO.Name)},
                        F.file_type as {nameof(FeedbackDTO.Extension)}, F.size as {nameof(FeedbackDTO.Size)}
                FROM ( Academic.Assignments as A JOIN Academic.AssignmentSubmissions as SUB
                    ON SUB.assignment_id = A.id ) JOIN Files.FeedbackFiles as F
                    ON SUB.feedback_file = F.id
                WHERE SUB.assignment_id = {assignment_id} {context_condition}; ";

                var lastfeedback = db.sql_db!.SELECT<FeedbackDTO>(sql_query6).FirstOrDefault();
                fullassignment.Feedback = lastfeedback;
            }

            return Ok(fullassignment);
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

                if (submissionIds.Any())
                {
                    // 1.1 Romper la relación de archivos en AssignmentSubmissions
                    db.sql_db!.UPDATE<object>(
                        $"UPDATE Academic.AssignmentSubmissions SET submitted_file = NULL, feedback_file = NULL WHERE assignment_id = {assignment_id}",
                        new { }
                    );

                    foreach (var submissionId in submissionIds)
                    {
                        // 1.2 Eliminar StudentSubmissions relacionados
                        db.sql_db!.DELETE<object>(
                            $"DELETE FROM Academic.StudentSubmissions WHERE submission_id = {submissionId}"
                        );

                        // 1.3 Eliminar SubmissionFiles relacionados
                        db.sql_db!.DELETE<object>(
                            $"DELETE FROM Files.SubmissionFiles WHERE submission_id = {submissionId}"
                        );

                        // 1.4 Eliminar FeedbackFiles relacionados
                        db.sql_db!.DELETE<object>(
                            $"DELETE FROM Files.FeedbackFiles WHERE submission_id = {submissionId}"
                        );
                    }

                    // 1.5 Eliminar AssignmentSubmissions de la asignación
                    db.sql_db!.DELETE<object>(
                        $"DELETE FROM Academic.AssignmentSubmissions WHERE assignment_id = {assignment_id}"
                    );
                }

                // 2. Eliminar StudentAssignments para la asignación
                db.sql_db!.DELETE<object>(
                    $"DELETE FROM Academic.StudentAssignments WHERE assignment_id = {assignment_id}"
                );

                // 3. Eliminar AssignmentStudentGroups para los grupos de la asignación
                db.sql_db!.DELETE<object>(
                    $"DELETE FROM Academic.AssignmentStudentGroups WHERE group_id IN " +
                    $"(SELECT id FROM Academic.AssignmentGroups WHERE assignment_id = {assignment_id})"
                );

                // 4. Eliminar AssignmentGroups para la asignación
                db.sql_db!.DELETE<object>(
                    $"DELETE FROM Academic.AssignmentGroups WHERE assignment_id = {assignment_id}"
                );

                // 5. Eliminar Specifications para la asignación
                db.sql_db!.DELETE<object>(
                    $"DELETE FROM Files.Specifications WHERE assignment_id = {assignment_id}"
                );

                // 6. Eliminar la asignación
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