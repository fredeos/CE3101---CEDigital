using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

using backend.models;
using backend.services;
using backend.DTO;

namespace backend.controllers
{
    [ApiController]
    [Route("api/documents")]
    public class DocumentController(CEDigitalService db_ap, IWebHostEnvironment env) : ControllerBase
    {
        private readonly CEDigitalService db = db_ap;
        private readonly IWebHostEnvironment _env = env;

        // ------------------------------------------ Metodos GET ------------------------------------------
        [HttpGet("download/{group_id}/{file_id}")]
        public IActionResult DownloadFile(int group_id, int file_id)
        {
            string sql_query = $@"
            SELECT  D.id as {nameof(Document.ID)}, D.folder_id as {nameof(Document.FolderID)}, D.file_name as {nameof(Document.Name)},
                    D.file_type as {nameof(Document.Extension)}, D.size as {nameof(Document.Size)}, D.filepath as {nameof(Document.Path)},
                    D.upload_date as {nameof(Document.CreationDate)}
            FROM (Files.Documents as D JOIN Files.Folders as F
                 ON D.folder_id = F.id ) JOIN Academic.Groups as G
                 ON F.group_id = G.id
            WHERE D.id = {file_id} AND G.id = {group_id};";

            var document = db.sql_db!.SELECT<Document>(sql_query).FirstOrDefault();
            if (document == null)
            {
                Console.WriteLine($"(HTTP)(GET={nameof(DownloadFile)}) File (ID={file_id}) not found in group (ID={group_id})");
                return BadRequest($"File (ID={file_id}) not found in group (ID={group_id})");
            }
            string content_type = "application/octet-stream";
            return PhysicalFile(document.Path, content_type, document.Name + "." + document.Extension);
        }

        // ------------------------------------------ Metodos POST ------------------------------------------
        [HttpPost("upload/{group_id}/{folder_id}")]
        public async Task<ActionResult<IEnumerable<FileDTO>>> UploadFile(int group_id, int folder_id, [FromForm] List<IFormFile> files)
        {
            List<FileDTO> documents = [];
            if (files.Count == 0)
            {
                Console.WriteLine($"(HTTP)(POST={nameof(UploadFile)}) List of files was empty");
                return BadRequest("Server received no files or something went wrong");
            }

            // Validar que el grupo y la carpeta existen
            string sql_query1 = $@"
            SELECT  F.id as {nameof(Folder.ID)}, F.group_id as {nameof(Folder.GroupID)},
                    F.parent_id as {nameof(Folder.ParentFolderID)}, F.folder_name as {nameof(Folder.Name)},
                    F.upload_date as {nameof(Folder.CreationDate)}
            FROM Files.Folders as F JOIN Academic.Groups as G ON F.group_id = G.id
            WHERE F.id = {folder_id} AND G.id = {group_id}; ";

            var folder = db.sql_db!.SELECT<Folder>(sql_query1).FirstOrDefault();
            if (folder == null)
            {
                Console.WriteLine($"(HTTP)(POST={nameof(UploadFile)}) Folder (ID={folder_id}) not found for group (ID={group_id}) ");
                return NotFound($"Folder (ID={folder_id}) not found for group (ID={group_id})");
            }

            // Guardar los archivos en el servidor
            string documents_path = Path.Combine(_env.WebRootPath ?? _env.ContentRootPath, "content", "documents");
            string sql_query2 = $@"
            INSERT INTO Files.Documents (folder_id, file_name, file_type, size, filepath)
            OUTPUT  INSERTED.id as {nameof(Document.ID)}, INSERTED.folder_id as {nameof(Document.FolderID)},
                    INSERTED.file_name as {nameof(Document.Name)}, INSERTED.file_type as {nameof(Document.Extension)},
                    INSERTED.size as {nameof(Document.Size)}, INSERTED.filepath as {nameof(Document.Path)},
                    INSERTED.upload_date as {nameof(Document.CreationDate)}
            VALUES
            ({folder.ID}, @{nameof(Document.Name)}, @{nameof(Document.Extension)}, @{nameof(Document.Size)}, @{nameof(Document.Path)}); ";

            foreach (var file in files)
            {
                try
                {
                    string extension = Path.GetExtension(file.FileName).Substring(1);
                    int nameLen = file.FileName.Length;
                    Document document = new()
                    {
                        Name = file.FileName.Substring(0, nameLen - extension.Length - 1),
                        Extension = extension,
                        Size = file.Length,
                        Path = Path.Combine(documents_path, Guid.NewGuid().ToString() + "." + extension),
                    };

                    var inserted = db.sql_db!.INSERT<Document>(sql_query2, document);
                    if (inserted != null)
                    { // Solo conserva los que se guardaron exitosamente en la base de datos
                        FileDTO inserted_file = new(){
                            FileID = inserted.ID,
                            ParentID = inserted.FolderID,
                            FileName = inserted.Name,
                            FileType = inserted.Extension,
                            FileSize = inserted.Size,
                            UploadDate = inserted.CreationDate
                        };
                        documents.Add(inserted_file);

                        using (var stream = System.IO.File.Create(inserted.Path))
                        {
                            await file.CopyToAsync(stream);
                        }
                    }
                }
                catch (System.Exception e)
                {
                    Console.WriteLine($"(HTTP)(POST={nameof(UploadFile)}) Crashed: {e.Message}");
                    return StatusCode(500, "Internal server error");
                }
            }

            return CreatedAtAction(nameof(UploadFile), new { group_id, folder_id }, documents);
        }

    }
}