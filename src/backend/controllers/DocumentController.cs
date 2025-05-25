using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.IO;

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
                return NotFound($"File (ID={file_id}) not found in group (ID={group_id})");
            }

            string true_document_path = Path.Combine(_env.WebRootPath ?? _env.ContentRootPath, document.Path);
            string content_type = "application/octet-stream";
            return PhysicalFile(true_document_path, content_type, document.Name + "." + document.Extension);
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

            string folder_identification = $"F.id = {folder_id}";
            if (folder_id <= 0)
            {
                folder_identification = "F.parent_id is NULL";
            }

            // Validar que el grupo y la carpeta existen
            string sql_query1 = $@"
            SELECT  F.id as {nameof(Folder.ID)}, F.group_id as {nameof(Folder.GroupID)},
                    F.parent_id as {nameof(Folder.ParentFolderID)}, F.folder_name as {nameof(Folder.Name)},
                    F.upload_date as {nameof(Folder.CreationDate)}
            FROM Files.Folders as F JOIN Academic.Groups as G ON F.group_id = G.id
            WHERE {folder_identification} AND G.id = {group_id}; ";

            var folder = db.sql_db!.SELECT<Folder>(sql_query1).FirstOrDefault();
            if (folder == null)
            {
                Console.WriteLine($"(HTTP)(POST={nameof(UploadFile)}) Folder (ID={folder_id}) not found for group (ID={group_id}) ");
                return NotFound($"Folder (ID={folder_id}) not found for group (ID={group_id})");
            }

            // Guardar los archivos en el servidor
            // string documents_path = Path.Combine(_env.WebRootPath ?? _env.ContentRootPath, "content", "documents");
            string documents_path = Path.Combine("content", "documents");
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
                        FileDTO inserted_file = new()
                        {
                            FileID = inserted.ID,
                            ParentID = inserted.FolderID,
                            FileName = inserted.Name,
                            FileType = inserted.Extension,
                            FileSize = inserted.Size,
                            UploadDate = inserted.CreationDate
                        };
                        documents.Add(inserted_file);

                        using (var stream = System.IO.File.Create(Path.Combine(_env.WebRootPath ?? _env.ContentRootPath, inserted.Path)))
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

        // ------------------------------------------ Metodos PUT ------------------------------------------
        [HttpPut("update/{file_id}")]
        public ActionResult<FileDTO> UpdateDocument(int file_id, [FromBody] FileDTO file)
        {
            if (file_id != file.FileID)
            {
                return BadRequest($"Given file_id({file_id}) doesn't match the id of the file object(ID={file.FileID})");
            }
            // Actualizar la instancia
            string sql_query = @$"
            UPDATE Files.Documents
            SET folder_id = @{nameof(FileDTO.ParentID)}, file_name = @{nameof(FileDTO.FileName)}, upload_date = getdate()
            OUTPUT  INSERTED.id as {nameof(FileDTO.FileID)}, INSERTED.folder_id as {nameof(FileDTO.ParentID)},
                    INSERTED.file_name as {nameof(FileDTO.FileName)}, INSERTED.file_type as {nameof(FileDTO.FileType)},
                    INSERTED.size as {nameof(FileDTO.FileSize)}, INSERTED.upload_date as {nameof(FileDTO.UploadDate)}
            WHERE id = {file_id};  ";

            var updated = db.sql_db!.UPDATE<FileDTO>(sql_query, file).FirstOrDefault();
            if (updated == null)
            {
                return NotFound($"File(ID={file_id}) was not found in the database for updating");
            }
            return Ok(updated);
        }


        // ------------------------------------------ Metodos DELETE ------------------------------------------
        [HttpDelete("delete/{file_id}")]
        public ActionResult<FileDTO> DeleteDocument(int file_id)
        {
            // Remover el archivo de la base de datos
            string sql_query = @$"
            DELETE FROM Files.Documents
            OUTPUT  DELETED.id as {nameof(Document.ID)}, DELETED.folder_id as {nameof(Document.FolderID)},
                    DELETED.file_name as {nameof(Document.Name)}, DELETED.file_type as {nameof(Document.Extension)},
                    DELETED.size as {nameof(Document.Size)}, DELETED.filepath as {nameof(Document.Path)},
                    DELETED.upload_date as {nameof(Document.CreationDate)}
            WHERE id = {file_id}; ";

            var deleted = db.sql_db!.DELETE<Document>(sql_query);
            // Remover el archivo fisico segun indica el registro borrado
            List<FileDTO> files = [];
            foreach (var document in deleted)
            {
                FileDTO file = new()
                {
                    FileID = document.ID,
                    ParentID = document.FolderID,
                    FileName = document.Name,
                    FileType = document.Extension,
                    FileSize = document.Size,
                    UploadDate = document.CreationDate
                };
                files.Add(file);

                string path_to_file = Path.Combine(_env.WebRootPath ?? _env.ContentRootPath, document.Path);
                if (System.IO.File.Exists(path_to_file))
                {
                    System.IO.File.Delete(path_to_file);
                }
            }

            return Ok(files);
        }

    }
}