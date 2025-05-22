using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

using backend.models;
using backend.services;
using backend.DTO;

namespace backend.controllers{

    [ApiController]
    [Route("api/specifications")]
    public class SpecificationController(CEDigitalService db_ap, IWebHostEnvironment env) : ControllerBase
    {
        private readonly CEDigitalService db = db_ap;
        private readonly IWebHostEnvironment _env = env;

        // ------------------------------------------ Metodos GET ------------------------------------------
        [HttpGet("download/{group_id}/{assignment_id}/{specification_id}")]
        public IActionResult DownloadSpecification(int group_id, int assignment_id, int specification_id)
        {
            string sql_query = $@"
            SELECT  SP.id as {nameof(Specification.ID)}, SP.assignment_id as {nameof(Specification.AssigmentID)},
                    SP.file_name as {nameof(Specification.Name)}, SP.file_type as {nameof(Specification.Extension)},
                    SP.size as {nameof(Specification.Size)}, SP.specification_file as {nameof(Specification.Path)},
                    SP.upload_date as {nameof(Specification.UploadDate)}
            FROM ((Academic.Assignments as A JOIN Files.Specifications as SP ON A.id = SP.assignment_id)
                JOIN Academic.Rubrics as R ON A.rubric_id = R.id) 
                JOIN Academic.Groups as G ON R.group_id = G.id 
            WHERE G.id = {group_id} AND A.id = {assignment_id} AND SP.id = {specification_id}";

            var specification = db.sql_db!.SELECT<Specification>(sql_query).FirstOrDefault();
            if (specification == null) // Verificar que exista la especificacion indicada
            { 
                return NotFound($"Specification(ID={specification_id}) not found for assignment(ID={assignment_id}) on group(ID={group_id})");
            }

            string content_type = "application/octet-stream";
            return PhysicalFile(specification.Path!, content_type, specification.Name + "." + specification.Extension);
        }

        [HttpGet("download/{group_id}/{assignment_id}/recent")]
        public IActionResult DownloadLastSpecification(int group_id, int assignment_id)
        {
            string sql_query = $@"
            SELECT  SP.id as {nameof(Specification.ID)}, SP.assignment_id as {nameof(Specification.AssigmentID)},
                    SP.file_name as {nameof(Specification.Name)}, SP.file_type as {nameof(Specification.Extension)},
                    SP.size as {nameof(Specification.Size)}, SP.specification_file as {nameof(Specification.Path)},
                    SP.upload_date as {nameof(Specification.UploadDate)}
            FROM ((Academic.Assignments as A JOIN Files.Specifications as SP ON A.id = SP.assignment_id)
                JOIN Academic.Rubrics as R ON A.rubric_id = R.id) 
                JOIN Academic.Groups as G ON R.group_id = G.id 
            WHERE G.id = {group_id} AND A.id = {assignment_id}
            ORDER BY {nameof(Specification.UploadDate)} DESC; ";

            var specification = db.sql_db!.SELECT<Specification>(sql_query).FirstOrDefault();
            if (specification == null) // Verificar que exista una especificacion más reciente
            { 
                return NotFound($"No available specifications for assignment(ID={assignment_id}) on group(ID={group_id})");
            }
            string content_type = "application/octet-stream";
            return PhysicalFile(specification.Path!, content_type, specification.Name + "." + specification.Extension);
        }

        // ------------------------------------------ Metodos POST ------------------------------------------
        [HttpPost("upload/{group_id}/{assignment_id}")]
        public async Task<ActionResult<Specification>> UploadSpecification(int group_id, int assignment_id, IFormFile spec_file)
        {
            if (spec_file == null)
            {
                Console.WriteLine($"(HTTP)(POST={nameof(UploadSpecification)}) No file was given");
                return BadRequest("Server received no files or something went wrong");
            }

            // Buscar que exista la evaluacion para el grupo indicado
            string sql_query1 = $@"
            SELECT  A.id as {nameof(AssignmentEvaluation.ID)}, A.rubric_id as {nameof(AssignmentEvaluation.RubricID)},
                    A.name as {nameof(AssignmentEvaluation.Name)}, A.percentage as {nameof(AssignmentEvaluation.Percentage)},
                    A.turnin_date as {nameof(AssignmentEvaluation.Deadline)}, A.individual_flag as {nameof(AssignmentEvaluation.IsIndividualAssignment)}
            FROM (Academic.Assignments as A JOIN Academic.Rubrics as R 
            ON A.rubric_id = R.id) JOIN Academic.Groups as G ON G.id = R.group_id
            WHERE G.id = {group_id} AND A.id = {assignment_id}; ";

            var assignment = db.sql_db!.SELECT<AssignmentEvaluation>(sql_query1).FirstOrDefault();
            if (assignment == null)
            {
                return BadRequest($"Assignment(ID={assignment_id}) not found for group(ID={group_id})");
            }

            // Insertar la nueva especifacion
            string specifications_path = Path.Combine(_env.WebRootPath ?? _env.ContentRootPath, "content", "specifications");
            string extension = Path.GetExtension(spec_file.FileName).Substring(1);
            int nameLen = spec_file.FileName.Length;
            Specification spec = new(){
                ID = 0,
                AssigmentID = assignment.ID,
                Name = spec_file.FileName.Substring(0, nameLen - extension.Length - 1),
                Extension = extension,
                Size = spec_file.Length,
                Path = Path.Combine(specifications_path, Guid.NewGuid().ToString() + "." + extension),
            };

            string sql_query2 = $@"
            INSERT INTO Files.Specifications (assignment_id, file_name, file_type, size, specification_file)
            OUTPUT  INSERTED.id as {nameof(Specification.ID)}, INSERTED.assignment_id as {nameof(Specification.AssigmentID)},
                    INSERTED.file_name as {nameof(Specification.Name)}, INSERTED.file_type as {nameof(Specification.Extension)},
                    INSERTED.size as {nameof(Specification.Size)}, INSERTED.specification_file as {nameof(Specification.Path)},
                    INSERTED.upload_date as {nameof(Specification.UploadDate)}
            VALUES 
            (@{nameof(Specification.AssigmentID)}, @{nameof(Specification.Name)}, @{nameof(Specification.Extension)}, 
            @{nameof(Specification.Size)}, @{nameof(Specification.Path)}); ";

            var inserted_file = db.sql_db!.INSERT<Specification>(sql_query2, spec);
            if (inserted_file == null){
                return StatusCode(500, "Internal server error");
            }
            using (var stream = System.IO.File.Create(inserted_file.Path!)){
                await spec_file.CopyToAsync(stream);
            }

            return CreatedAtAction(nameof(UploadSpecification), new {inserted_file.ID}, inserted_file);
        }
        // ------------------------------------------ Metodos PUT ------------------------------------------

        // ------------------------------------------ Metodos DELETE ------------------------------------------

    }
}