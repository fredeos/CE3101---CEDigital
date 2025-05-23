using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using System.IO;

using backend.models;
using backend.services;
using backend.DTO;

namespace backend.controllers
{
    [ApiController]
    [Route("api/folders")]
    public class FolderController(CEDigitalService db_ap) : ControllerBase
    {
        private readonly CEDigitalService db = db_ap;

        // ------------------------------------------ Metodos GET ------------------------------------------
        [HttpGet("{group_id}/{folder_id}/files")]
        public ActionResult<IEnumerable<FileDTO>> GetFolderContent(int group_id, int folder_id)
        {
            List<FileDTO> files = new();

            if (folder_id < 0)
            { // Si no se especifica un folder_id, se obtienen todos los archivos de la carpeta raiz del curso
                // Buscar ID de la raiz del grupo
                string sql_query1 = $@"
                SELECT  F.id as {nameof(Folder.ID)}, F.group_id as {nameof(Folder.GroupID)}, 
                        F.parent_id as {nameof(Folder.ParentFolderID)}, F.folder_name as {nameof(Folder.Name)}
                FROM Files.Folders as F
                WHERE F.group_id = {group_id} AND F.parent_id IS NULL; ";

                var root_folder = db.sql_db!.SELECT<Folder>(sql_query1).FirstOrDefault();
                if (root_folder == null)
                {
                    return NotFound($"No root folder exists for group (ID={group_id})");
                }

                // Buscar todas las carpetas en la raiz
                string sql_query2 = $@"
                SELECT  F.id as {nameof(FileDTO.FileID)}, F.parent_id as {nameof(FileDTO.ParentID)},
                        F.folder_name as {nameof(FileDTO.FileName)}, F.upload_date as {nameof(FileDTO.UploadDate)}
                FROM Files.Folders as F
                WHERE F.group_id = {group_id} AND F.parent_id = {root_folder.ID}
                ORDER BY {nameof(FileDTO.FileName)} ASC; ";

                var folders = db.sql_db!.SELECT<FileDTO>(sql_query2);
                folders.ForEach(f =>
                {
                    f.FileType = "folder";
                    f.FileSize = 0;
                });
                files.AddRange(folders);

                // Buscar todos los archivos de la raiz
                string sql_query3 = $@"
                SELECT  D.id as {nameof(FileDTO.FileID)}, D.folder_id as {nameof(FileDTO.ParentID)},
                        D.file_name as {nameof(FileDTO.FileName)}, D.file_type as {nameof(FileDTO.FileType)},
                        D.size as {nameof(FileDTO.FileSize)}, D.upload_date as {nameof(FileDTO.UploadDate)}
                FROM Files.Documents as D JOIN Files.Folders as F
                ON F.id = D.folder_id
                WHERE F.group_id = {group_id} AND D.folder_id = {root_folder.ID}
                ORDER BY {nameof(FileDTO.FileName)} ASC; ";

                var docs = db.sql_db!.SELECT<FileDTO>(sql_query3);
                files.AddRange(docs);
            }
            else
            { // Se busca los archivos de una carpeta especifica de un curso
                // Buscar todas las carpetas en el folder indicado
                string sql_query1 = $@"
                SELECT  F.id as {nameof(FileDTO.FileID)}, F.parent_id as {nameof(FileDTO.ParentID)},
                        F.folder_name as {nameof(FileDTO.FileName)}, F.upload_date as {nameof(FileDTO.UploadDate)}
                FROM Files.Folders as F
                WHERE F.group_id = {group_id} AND F.parent_id = {folder_id}
                ORDER BY {nameof(FileDTO.FileName)} ASC; ";

                var folders = db.sql_db!.SELECT<FileDTO>(sql_query1);
                folders.ForEach(f =>
                {
                    f.FileType = "folder";
                    f.FileSize = 0;
                });
                files.AddRange(folders);

                // Buscar todos los archivos en el folder indicado
                string sql_query2 = $@"
                SELECT  D.id as {nameof(FileDTO.FileID)}, D.folder_id as {nameof(FileDTO.ParentID)},
                        D.file_name as {nameof(FileDTO.FileName)}, D.file_type as {nameof(FileDTO.FileType)},
                        D.size as {nameof(FileDTO.FileSize)}, D.upload_date as {nameof(FileDTO.UploadDate)}
                FROM Files.Documents as D JOIN Files.Folders as F
                ON F.id = D.folder_id
                WHERE F.group_id = {group_id} AND D.folder_id = {folder_id}
                ORDER BY {nameof(FileDTO.FileName)} ASC; ";

                var docs = db.sql_db!.SELECT<FileDTO>(sql_query2);
                files.AddRange(docs);
            }
            return Ok(files);
        }

        // ------------------------------------------ Metodos POST ------------------------------------------
        [HttpPost("add/{group_id}/{parent_id}")]
        public ActionResult<FileDTO> CreateFolder(int group_id, int parent_id, [FromBody] FileDTO folder)
        {
            // Validar que los atributos del objeto sean los mismos que los indicados en la ruta
            if (parent_id != folder.ParentID)
            {
                return BadRequest($"Given parent folder id({parent_id}) doesn't match the objet file parent({folder.ParentID})");    
            }

            // Verificar que exista la carpeta indicada para en el grupo
            string sql_query1 = @$"
            SELECT  F.id as {nameof(FileDTO.FileID)}, F.parent_id as {nameof(FileDTO.ParentID)},
                    F.folder_name as {nameof(FileDTO.FileName)}, {nameof(FileDTO.FileType)} = 'folder',
                    {nameof(FileDTO.FileSize)} = 0, F.upload_date as {nameof(FileDTO.UploadDate)}
            FROM Files.Folders as F JOIN Academic.Groups as G
            ON F.group_id = G.id
            WHERE F.group_id = {group_id} AND F.id = {parent_id}; ";

            var parent_folder = db.sql_db!.SELECT<FileDTO>(sql_query1).FirstOrDefault();
            if (parent_folder == null)
            {
                return NotFound($"Parent folder(ID={parent_id}) not found in group(ID={group_id})");
            } 

            // Insertar el objeto
            string sql_query2 = @$"
            INSERT INTO Files.Folders (group_id, parent_id, folder_name)
            OUTPUT  INSERTED.id as {nameof(FileDTO.FileID)}, INSERTED.parent_id as {nameof(FileDTO.ParentID)},
                    INSERTED.folder_name as {nameof(FileDTO.FileName)}, INSERTED.upload_date as {nameof(FileDTO.UploadDate)}
            VALUES
            ({group_id}, @{nameof(FileDTO.ParentID)}, @{nameof(FileDTO.FileName)}); ";

            var inserted = db.sql_db!.INSERT<FileDTO>(sql_query2, folder);
            if (inserted == null)
            {
                return StatusCode(500, "Internal server error");   
            }
            inserted.FileType = "folder";
            inserted.FileSize = 0;

            return CreatedAtAction(nameof(CreateFolder), new { inserted.FileID }, inserted);
        }

        // ------------------------------------------ Metodos PUT ------------------------------------------
        [HttpPut("update/{folder_id}")]
        public ActionResult<FileDTO> ModifyFolder(int folder_id, [FromBody] FileDTO folder)
        {
            if (folder_id != folder.FileID)
            {
                return BadRequest($"Given file_id({folder_id}) doesn't match the id of the file object(ID={folder.FileID})");
            }
            // Actualizar la instancia
            string sql_query = @$"
            UPDATE Files.Folders
            SET parent_id = @{nameof(FileDTO.ParentID)}, folder_name = @{nameof(FileDTO.FileName)}, upload_date = getdate()
            OUTPUT  INSERTED.id as {nameof(FileDTO.FileID)}, INSERTED.parent_id as {nameof(FileDTO.ParentID)},
                    INSERTED.folder_name as {nameof(FileDTO.FileName)}, INSERTED.upload_date as {nameof(FileDTO.UploadDate)}
            WHERE id = {folder_id}; ";

            var updated = db.sql_db!.UPDATE<FileDTO>(sql_query, folder).FirstOrDefault();
            if (updated == null)
            {
                return StatusCode(500, "Something went wrong");
            }

            updated.FileType = "folder";
            updated.FileSize = 0;

            return Ok(updated);
        }

        // ------------------------------------------ Metodos DELETE ------------------------------------------
        [HttpDelete("removed/{folder_id}")]
        public ActionResult<FileDTO> DeleteFolder(int folder_id)
        {
            // Remover todas las carpetas y archivos anidados dentro de la carpeta
            RecursiveFileDelete(folder_id);

            // Remover carpeta indicada
            string sql_query = @$"
            DELETE FROM Files.Folders
            OUTPUT  DELETED.id as {nameof(FileDTO.FileID)}, DELETED.parent_id as {nameof(FileDTO.ParentID)},
                    DELETED.folder_name as {nameof(FileDTO.FileName)}, DELETED.upload_date as {nameof(FileDTO.UploadDate)}
            WHERE id = {folder_id}; ";

            var deleted = db.sql_db!.DELETE<FileDTO>(sql_query).FirstOrDefault();
            if (deleted == null)
            {
                return NotFound($"Folder(ID={folder_id}) was not found");
            }
            deleted.FileType = "folder";
            deleted.FileSize = 0;

            return Ok(deleted);
        }

        private void RecursiveFileDelete(int parent_id)
        {
            // Borrar todos los archivos dentro de esta carpeta (en la DB)
            string sql_query1 = @$"
            DELETE FROM Files.Documents
            OUTPUT  DELETED.id as {nameof(Document.ID)}, DELETED.folder_id as {nameof(Document.FolderID)},
                    DELETED.file_name as {nameof(Document.Name)}, DELETED.file_type as {nameof(Document.Extension)},
                    DELETED.size as {nameof(Document.Size)}, DELETED.filepath as {nameof(Document.Path)},
                    DELETED.upload_date as {nameof(Document.CreationDate)}
            WHERE folder_id = {parent_id}; ";

            var deleted_files = db.sql_db!.DELETE<Document>(sql_query1);
            // Borrar todos los archivos fisicos relacionados a estos registros
            foreach (var file in deleted_files)
            {
                if (System.IO.File.Exists(file.Path))
                {
                    System.IO.File.Delete(file.Path);
                }
            }

            // Borrar todas las carpetas virtuales anidadas
            string sql_query2 = @$"
            DELETE FROM Files.Folders
            OUTPUT  DELETED.id as {nameof(Folder.ID)}, DELETED.group_id as {nameof(Folder.GroupID)},
                    DELETED.parent_id as {nameof(Folder.ParentFolderID)}, DELETED.folder_name as {nameof(Folder.Name)},
                    DELETED.upload_date as {nameof(Folder.CreationDate)}
            WHERE parent_id = {parent_id}; ";

            var deleted_folders = db.sql_db!.DELETE<Folder>(sql_query2);
            foreach (var folder in deleted_folders)
            {
                RecursiveFileDelete(folder.ID);
            }
        }


    }
}