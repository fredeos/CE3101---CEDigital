using Microsoft.AspNetCore.Mvc;

using backend.models;
using backend.services;
using backend.DTO;

namespace backend.controllers
{

    [ApiController]
    [Route("api")]
    public class AssignmentSubmissionController(CEDigitalService db_ap) : ControllerBase
    {
        private readonly CEDigitalService db = db_ap;

        /// <summary>
        /// Obtiene las entregas de un assignment específico.
        /// </summary>
        /// <param name="assignment_id"></param>
        /// <returns></returns>

        [HttpGet("AssignmentSubmission/{assignment_id}")]
        public ActionResult<IEnumerable<AssignmentSubmissionDTO>> GetAssignmentsSubmissions(int assignment_id)
        {
            string query = $@"
                SELECT 
                    A.id as {nameof(AssignmentSubmissionDTO.ID)},
                    A.assignment_id as {nameof(AssignmentSubmissionDTO.AssignmentID)},
                    A.student_id as {nameof(AssignmentSubmissionDTO.StudentID)},
                    A.group_id as {nameof(AssignmentSubmissionDTO.GroupID)},
                    A.grade as {nameof(AssignmentSubmissionDTO.Grade)},
                    A.commentary as {nameof(AssignmentSubmissionDTO.Commentary)},
                    A.submitted_file as {nameof(AssignmentSubmissionDTO.SubmittedFile)},
                    A.feedback_file as {nameof(AssignmentSubmissionDTO.FeedbackFile)},
                    A.submission_date as {nameof(AssignmentSubmissionDTO.SubmissionDate)},
                    A.published_flag as {nameof(AssignmentSubmissionDTO.PublishedFlag)}
                FROM Academic.AssignmentSubmissions AS A
                WHERE A.assignment_id = {assignment_id};
            ";

            var results = db.sql_db!.SELECT<AssignmentSubmissionDTO>(query);
            if (results == null || results.Count == 0)
            {
                return NotFound();
            }

            // Buscar los nombres en Mongo
            foreach (var submission in results)
            {
                if (submission.StudentID.HasValue)
                {
                    var student = db.mongo_db!.find<Student>(
                        "Students",
                        s => s.StudentID == submission.StudentID.Value
                    ).FirstOrDefault();

                    if (student != null)
                    {
                        submission.StudentFullName = $"{student.FirstName} {student.FirstLastName} {student.SecondLastName}";
                    }
                    else
                    {
                        submission.StudentFullName = "Desconocido";
                    }
                }
            }

            return Ok(results);
        }

        /// <summary>
        /// Actualiza una entrega de un assignment específico.
        /// Se espera que el ID de la entrega ya exista en la base de datos.
        /// </summary>
        /// <param name="submission_id"></param>
        /// <param name="updateDto"></param>
        /// <returns></returns>
        
        [HttpPut("AssignmentSubmission/{submission_id}")]
        public IActionResult UpdateAssignmentSubmission(int submission_id, [FromBody] UpdateAssignmentSubmissionDTO updateDto)
        {
            string query = $@"
                UPDATE Academic.AssignmentSubmissions
                SET grade = @Grade, commentary = @Commentary
                OUTPUT inserted.*
                WHERE id = @ID;
            ";

            var updateObj = new AssignmentSubmissionDTO {
                ID = submission_id,
                Grade = updateDto.Grade,
                Commentary = updateDto.Commentary
            };

            var updated = db.sql_db!.UPDATE<AssignmentSubmissionDTO>(query, updateObj);

            if (updated == null || updated.Count == 0)
                return NotFound();

            return Ok(updated.First());
        }
    }

    // DTO para el update
    public class UpdateAssignmentSubmissionDTO
    {
        public decimal? Grade { get; set; }
        public string? Commentary { get; set; }
    }

    // DTO for AssignmentSubmission
    public class AssignmentSubmissionDTO
    {
        public int ID { get; set; }
        public int AssignmentID { get; set; }
        public int? StudentID { get; set; }
        public int? GroupID { get; set; }
        public decimal? Grade { get; set; }
        public string? Commentary { get; set; }
        public string? SubmittedFile { get; set; }
        public string? FeedbackFile { get; set; }
        public DateTime SubmissionDate { get; set; }
        public int PublishedFlag { get; set; }
        public string? StudentFullName { get; set; } // Nuevo campo
    }
}