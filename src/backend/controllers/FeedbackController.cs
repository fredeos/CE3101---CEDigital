using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

using backend.models;
using backend.services;
using backend.DTO;

namespace backend.controllers
{
    [ApiController]
    [Route("api/feedbacks")]
    public class FeedbackController(CEDigitalService db_ap, IWebHostEnvironment env) : ControllerBase
    {
        private readonly CEDigitalService db = db_ap;
        private readonly IWebHostEnvironment _env = env;

        // ------------------------------------------ Metodos GET ------------------------------------------
        [HttpGet("download/{feedback_id}")]
        public IActionResult DownloadFeedback(int feedback_id)
        {
            string sql_query = @$"
            SELECT  F.id as {nameof(Feedback.ID)}, F.submission_id as {nameof(Feedback.AssigmentSubmissionID)},
                    F.file_name as {nameof(Feedback.Name)}, F.file_type as {nameof(Feedback.Extension)},
                    F.size as {nameof(Feedback.Size)}, F.feedback_file as {nameof(Feedback.Path)},
                    F.upload_date as {nameof(Feedback.UploadDate)}
            FROM Files.FeedbackFiles as F
            WHERE F.id = {feedback_id}";

            var feedback_file = db.sql_db!.SELECT<Feedback>(sql_query).FirstOrDefault();
            if (feedback_file == null) {
                return NotFound($"Feedback file(ID={feedback_id}) not found");
            }

            string content_type = "application/octet-stream";
            return PhysicalFile(feedback_file.Path!, content_type, feedback_file.Name + "." + feedback_file.Extension);
        }

        // ------------------------------------------ Metodos POST ------------------------------------------
        [HttpPost("upload/{group_id}/{assignment_id}/{submission_id}")]
        public async Task<ActionResult<Feedback>> UploadFeedback(int group_id, int assignment_id, int submission_id, IFormFile feedback_file)
        {
            // Verificar que exista la evaluacion y espacio para el grupo indicado
            string sql_query1 = @$"
            SELECT  SUB.id as {nameof(AssignmentSubmission.ID)}, SUB.assignment_id as {nameof(AssignmentSubmission.AssignmentEvaluationID)},
                    SUB.feedback_file as {nameof(AssignmentSubmission.FeedbackFile)}
            FROM (( Academic.Rubrics as R JOIN Academic.Groups as G
                ON G.id = R.group_id ) JOIN Academic.Assignments as A 
                ON A.rubric_id = R.id ) JOIN Academic.AssignmentSubmissions as SUB
                ON SUB.assignment_id = A.id
            WHERE G.id = {group_id} AND SUB.assignment_id = {assignment_id} AND SUB.id = {submission_id}; ";

            var submission_field = db.sql_db!.SELECT<AssignmentSubmission>(sql_query1).FirstOrDefault();
            if (submission_field == null)
            {
                return NotFound($"Submission(ID={submission_id}) for assignment(ID={assignment_id}) not found in group(ID={group_id})");
            }
            // Crear un objeto de retroalimentacion para subir
            string feedbacks_path = Path.Combine(_env.WebRootPath ?? _env.ContentRootPath, "content", "feedbacks");
            string extension = Path.GetExtension(feedback_file.FileName).Substring(1);
            int nameLen = feedback_file.FileName.Length;
            Feedback feedback = new(){
                ID = 0,
                AssigmentSubmissionID = submission_field.ID,
                Name = feedback_file.FileName.Substring(0, nameLen - extension.Length - 1),
                Extension = extension,
                Size = feedback_file.Length,
                Path = Path.Combine(feedbacks_path, Guid.NewGuid().ToString() + "." + extension),
            };

            // Guardar archivo
            try
            {
                string sql_query2 = @$"
                INSERT INTO Files.FeedbackFiles (submission_id, file_name, file_type, size, feedback_file)
                OUTPUT  INSERTED.id as {nameof(Feedback.ID)}, INSERTED.submission_id as {nameof(Feedback.AssigmentSubmissionID)},
                        INSERTED.file_name as {nameof(Feedback.Name)}, INSERTED.file_type as {nameof(Feedback.Extension)},
                        INSERTED.size as {nameof(Feedback.Size)}, INSERTED.feedback_file as {nameof(Feedback.Path)},
                        INSERTED.upload_date as {nameof(Feedback.UploadDate)}
                VALUES
                (@{nameof(Feedback.AssigmentSubmissionID)}, @{nameof(Feedback.Name)}, @{nameof(Feedback.Extension)}, @{nameof(Feedback.Size)}, @{nameof(Feedback.Path)}); ";

                var inserted_file = db.sql_db!.INSERT<Feedback>(sql_query2, feedback);
                if (inserted_file == null)
                {
                    return StatusCode(500, "Something went wron");
                }

                using (var stream = System.IO.File.Create(inserted_file.Path!))
                {
                    await feedback_file.CopyToAsync(stream);
                }

                feedback = inserted_file;
            }
            catch (System.Exception)
            {
                return StatusCode(500, "Internal server error");
            }
            // Actualizar la tabla de la entrega de evaluacion 
            string sql_query3 = @$"
            UPDATE Academic.AssignmentSubmissions
            SET feedback_file = {feedback.ID}
            OUTPUT INSERTED.id as {nameof(AssignmentSubmission.ID)}
            WHERE id = {feedback.AssigmentSubmissionID}; ";

            db.sql_db!.UPDATE<AssignmentSubmission>(sql_query3, new());

            return CreatedAtAction(nameof(UploadFeedback), new { feedback.ID }, feedback);
        }
        // ------------------------------------------ Metodos PUT ------------------------------------------

        // ------------------------------------------ Metodos DELETE ------------------------------------------

    }
}