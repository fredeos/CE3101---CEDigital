using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

using backend.models;
using backend.services;
using backend.DTO;

namespace backend.controllers
{
    [ApiController]
    [Route("api/submissions")]
    public class SolutionController(CEDigitalService db_ap, IWebHostEnvironment env) : ControllerBase
    {
        private readonly CEDigitalService db = db_ap;
        private readonly IWebHostEnvironment _env = env;

        // ------------------------------------------ Metodos GET ------------------------------------------
        [HttpGet("download/{submissionfile_id}")]
        public IActionResult DownloadSolution(int submissionfile_id)
        {
            string sql_query = @$"
            SELECT  F.id as {nameof(Solution.ID)}, F.submission_id as {nameof(Solution.AssigmentSubmissionID)},
                    F.file_name as {nameof(Solution.Name)}, F.file_type as {nameof(Solution.Extension)},
                    F.size as {nameof(Solution.Size)}, F.submission_file as {nameof(Solution.Path)},
                    F.upload_date as {nameof(Solution.UploadDate)}
            FROM Files.SubmissionFiles as F
            WHERE F.id = {submissionfile_id}";

            var submission = db.sql_db!.SELECT<Solution>(sql_query).FirstOrDefault();
            if (submission == null) {
                return NotFound($"Submmited file(ID={submissionfile_id}) not found");
            }

            string content_type = "application/octet-stream";
            return PhysicalFile(submission.Path!, content_type, submission.Name + "." + submission.Extension);
        }


        // ------------------------------------------ Metodos POST ------------------------------------------
        [HttpPost("upload/{group_id}/{student_id}/{assignment_id}")]
        public async Task<ActionResult<Solution>> UploadSolution(int group_id, int student_id, int assignment_id, IFormFile submission_file)
        {
            // Buscar que exista la evaluacion para el grupo indicado
            string sql_query1 = $@"
            SELECT  A.id as {nameof(Assignment.ID)}, A.rubric_id as {nameof(Assignment.RubricID)},
                    A.name as {nameof(Assignment.Name)}, A.percentage as {nameof(Assignment.Percentage)},
                    A.turnin_date as {nameof(Assignment.TurninDate)}, A.individual_flag as {nameof(Assignment.IndividualFlag)}
            FROM (Academic.Groups as G JOIN Academic.Rubrics as R ON G.id = R.group_id)
                JOIN Academic.Assignments as A ON A.rubric_id = R.id
            WHERE G.id = {group_id} AND A.id = {assignment_id}; ";

            var assignment = db.sql_db!.SELECT<Assignment>(sql_query1).FirstOrDefault();
            // Verificar si la asignacion es individual o grupal
            if (assignment != null && assignment.IndividualFlag == 0) // Individual
            {
                // Verificar si ya existe un registro para guardar el entregable
                string sql_query2 = $@"
                SELECT  SUB.id as {nameof(AssignmentSubmission.ID)}, SUB.student_id as {nameof(AssignmentSubmission.StudentID)},
                        SUB.assignment_id as {nameof(AssignmentSubmission.AssignmentEvaluationID)}
                FROM (Academic.StudentAssignments as S JOIN Academic.Assignments as A ON S.assignment_id = A.id)
                    JOIN Academic.AssignmentSubmissions as SUB ON SUB.assignment_id = A.id
                WHERE SUB.student_id = {student_id} AND A.id = {assignment.ID}; ";

                var submission_field = db.sql_db!.SELECT<AssignmentSubmission>(sql_query2).FirstOrDefault();
                if (submission_field == null) // Crear un nuevo campo de entregas
                {
                    // Crear espacio
                    string sql_query3 = $@"
                    INSERT INTO Academic.AssignmentSubmissions (assignment_id, student_id, group_id, grade, 
                                commentary, submitted_file, feedback_file)
                    OUTPUT  INSERTED.id as {nameof(AssignmentSubmission.ID)}, 
                            INSERTED.assignment_id as {nameof(AssignmentSubmission.AssignmentEvaluationID)}
                    VALUES
                    ({assignment.ID}, {student_id}, NULL, NULL, NULL, NULL, NULL); ";

                    submission_field = db.sql_db!.INSERT<AssignmentSubmission>(sql_query3, new() { });
                    // Crear relacion con el estudiante que hace la entrega
                    string sql_query4 = $@"
                    INSERT INTO Academic.StudentSubmissions (student_id, submission_id)
                    OUTPUT  INSERTED.student_id as {nameof(StudentSolution.StudentID)},
                            INSERTED.submission_id as {nameof(StudentSolution.AssignmentSubmissionID)}
                    VALUES
                    ({student_id}, {submission_field!.ID}); ";

                    db.sql_db!.INSERT<StudentSolution>(sql_query4, new() { StudentID = 0, AssignmentSubmissionID = 0 });
                }
                // Actualizar el campo de entrega al subir el entregable
                string submissions_path = Path.Combine(_env.WebRootPath ?? _env.ContentRootPath, "content", "submissions");
                string extension = Path.GetExtension(submission_file.FileName).Substring(1);
                int nameLen = submission_file.FileName.Length;
                Solution solution = new()
                {
                    ID = 0,
                    AssigmentSubmissionID = submission_field.ID,
                    Name = submission_file.FileName.Substring(0, nameLen - extension.Length - 1),
                    Extension = extension,
                    Size = submission_file.Length,
                    Path = Path.Combine(submissions_path, Guid.NewGuid().ToString() + "." + extension)
                };

                try // Guardar el archivo
                {
                    string sql_query3 = $@"
                    INSERT INTO Files.SubmissionFiles (submission_id, file_name, file_type, size, submission_file)
                    OUTPUT  INSERTED.id as {nameof(Solution.ID)}, INSERTED.submission_id as {nameof(Solution.AssigmentSubmissionID)},
                            INSERTED.file_name as {nameof(Solution.Name)}, INSERTED.file_type as {nameof(Solution.Extension)},
                            INSERTED.size as {nameof(Solution.Size)}, INSERTED.submission_file as {nameof(Solution.Path)},
                            INSERTED.upload_date as {nameof(Solution.UploadDate)}
                    VALUES
                    (@{nameof(Solution.AssigmentSubmissionID)}, @{nameof(Solution.Name)}, @{nameof(Solution.Extension)}, @{nameof(Solution.Size)}, @{nameof(Solution.Path)}); ";

                    var inserted = db.sql_db!.INSERT<Solution>(sql_query3, solution);
                    // Actualizar el entregable de la evaluacion
                    if (inserted != null)
                    {
                        using (var stream = System.IO.File.Create(inserted.Path!))
                        {
                            await submission_file.CopyToAsync(stream);
                        }

                        string sql_query4 = @$"
                        UPDATE Academic.AssignmentSubmissions
                        SET submitted_file = {inserted.ID}, submission_date = getdate()
                        OUTPUT INSERTED.id as {nameof(AssignmentSubmission.ID)}
                        WHERE id = {submission_field.ID} AND student_id = {student_id}";

                        db.sql_db!.UPDATE<AssignmentSubmission>(sql_query4, submission_field);

                        return CreatedAtAction(nameof(UploadSolution), new { inserted.ID }, inserted);
                    }
                }
                catch (System.Exception)
                {
                    return StatusCode(500, "Internal server error");
                }
            }
            else if (assignment != null && assignment.IndividualFlag == 1) // Grupo
            {
                // Buscar el grupo al que pertenece el estudiante
                string sql_query2 = @$"
                SELECT  AG.id as {nameof(AssignmentGroups.ID)}, AG.assignment_id as {nameof(AssignmentGroups.AssignmentID)},
                        AG.group_num as {nameof(AssignmentGroups.Number)}
                FROM (Academic.AssignmentStudentGroups as SG JOIN Academic.AssignmentGroups as AG ON SG.group_id = AG.id)
                    JOIN Academic.Assignments as A ON AG.assignment_id = A.id
                WHERE SG.student_id = {student_id} AND A.id = {assignment.ID}; ";

                var group = db.sql_db!.SELECT<AssignmentGroups>(sql_query2).FirstOrDefault();
                if (group != null)
                {
                    group.GroupMembers = [];
                    // Buscar los integrantes del grupo
                    string sql_query3 = @$"
                    SELECT SG.group_id as {nameof(StudentGroup.GroupID)}, SG.student_id as {nameof(StudentGroup.StudentID)}
                    FROM Academic.AssignmentStudentGroups as SG JOIN Academic.AssignmentGroups as AG
                    ON SG.group_id = AG.id
                    WHERE SG.group_id = {group.ID}; ";

                    var sqlmembers = db.sql_db!.SELECT<StudentGroup>(sql_query3);
                    foreach (var sqlmember in sqlmembers)
                    {
                        var member = db.mongo_db!.find<Student>("Students", s => s.StudentID == sqlmember.StudentID).FirstOrDefault();
                        if (member != null) group.GroupMembers.Add(member);
                    }
                    // Verificar si ya existe un registro para guardar el entregable
                    string sql_query4 = @$"
                    SELECT  SUB.id as {nameof(AssignmentSubmission.ID)}, SUB.group_id as {nameof(AssignmentSubmission.EvaluationGroupID)},
                            SUB.assignment_id as {nameof(AssignmentSubmission.AssignmentEvaluationID)}
                    FROM (Academic.Assignments as A JOIN Academic.AssignmentSubmissions as SUB ON SUB.assignment_id = A.id)
                        JOIN Academic.AssignmentGroups as AG ON AG.assignment_id = A.id
                    WHERE SUB.group_id = {group.ID} AND SUB.assignment_id = {assignment.ID}; ";

                    var submission_field = db.sql_db!.SELECT<AssignmentSubmission>(sql_query4).FirstOrDefault();
                    if (submission_field == null)
                    {
                        // Crear el espacio de entrega
                        string sql_query5 = @$"
                        INSERT INTO Academic.AssignmentSubmissions (assignment_id, student_id, group_id, grade, 
                                commentary, submitted_file, feedback_file)
                        OUTPUT  INSERTED.id as {nameof(AssignmentSubmission.ID)}, 
                                INSERTED.assignment_id as {nameof(AssignmentSubmission.AssignmentEvaluationID)}
                        VALUES
                        ({assignment.ID}, NULL, {group.ID}, NULL, NULL, NULL, NULL); ";

                        submission_field = db.sql_db!.INSERT<AssignmentSubmission>(sql_query5, new(){})!;
                        // Agregar a todos los miembros del grupo al mismo espacio de entrega
                        foreach (var member in group.GroupMembers)
                        {
                            string sql_query6 = @$"
                            INSERT INTO Academic.StudentSubmissions (student_id, submission_id)
                            OUTPUT  INSERTED.student_id as {nameof(StudentSolution.StudentID)},
                                    INSERTED.submission_id as {nameof(StudentSolution.AssignmentSubmissionID)}
                            VALUES 
                            ({member.StudentID}, {submission_field!.ID}); ";

                            db.sql_db!.INSERT<StudentSolution>(sql_query6, new() { StudentID = 0, AssignmentSubmissionID = 0 });
                        }
                    }
                    // Crear un objeto para el archivo por subir
                    string submissions_path = Path.Combine(_env.WebRootPath ?? _env.ContentRootPath, "content", "submissions");
                    string extension = Path.GetExtension(submission_file.FileName).Substring(1);
                    int nameLen = submission_file.FileName.Length;
                    Solution solution = new()
                    {
                        ID = 0,
                        AssigmentSubmissionID = submission_field.ID,
                        Name = submission_file.FileName.Substring(0, nameLen - extension.Length - 1),
                        Extension = extension,
                        Size = submission_file.Length,
                        Path = Path.Combine(submissions_path, Guid.NewGuid().ToString() + "." + extension)
                    };

                    try
                    {
                        // Guardar el archivo del entregable
                        string sql_query5 = $@"
                        INSERT INTO Files.SubmissionFiles (submission_id, file_name, file_type, size, submission_file)
                        OUTPUT  INSERTED.id as {nameof(Solution.ID)}, INSERTED.submission_id as {nameof(Solution.AssigmentSubmissionID)},
                                INSERTED.file_name as {nameof(Solution.Name)}, INSERTED.file_type as {nameof(Solution.Extension)},
                                INSERTED.size as {nameof(Solution.Size)}, INSERTED.submission_file as {nameof(Solution.Path)},
                                INSERTED.upload_date as {nameof(Solution.UploadDate)}
                        VALUES
                        (@{nameof(Solution.AssigmentSubmissionID)}, @{nameof(Solution.Name)}, @{nameof(Solution.Extension)}, @{nameof(Solution.Size)}, @{nameof(Solution.Path)}); ";

                        var inserted = db.sql_db!.INSERT<Solution>(sql_query5, solution);
                        // Actualizar el espacio de entrega
                        if (inserted != null)
                        {
                            using (var stream = System.IO.File.Create(inserted.Path!))
                            {
                                await submission_file.CopyToAsync(stream);
                            }

                            string sql_query6 = @$"
                            UPDATE Academic.AssignmentSubmissions
                            SET submitted_file = {inserted.ID}, submission_date = getdate()
                            OUTPUT INSERTED.id as {nameof(AssignmentSubmission.ID)}
                            WHERE id = {submission_field.ID} AND group_id = {group.ID}; ";

                            db.sql_db!.UPDATE<AssignmentSubmission>(sql_query6, submission_field);

                            return CreatedAtAction(nameof(UploadSolution), new { inserted.ID }, inserted);
                        }
                    }
                    catch (System.Exception)
                    {
                        return StatusCode(500, "Internal server error");
                    }
                }
                else
                {
                    return NotFound($"Student(ID={student_id}) is not part of any subgroup for assignment(ID={assignment_id}) not found in group(ID={group_id})");
                }
            }
            else
            {
                return NotFound($"Assignment(ID={assignment_id}) not found in group(ID={group_id})");
            }
            return StatusCode(500, "Internal server error");
        }

        // ------------------------------------------ Metodos PUT ------------------------------------------

        // ------------------------------------------ Metodos DELETE ------------------------------------------

    }
}