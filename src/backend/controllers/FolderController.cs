using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

using backend.models;
using backend.models.DTO;
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
                SELECT F.id as {nameof(Folder.ID)}, F.group_id as {nameof(Folder.GroupID)}, 
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
                SELECT F.id as {nameof(FileDTO.FileID)}, F.parent_id as {nameof(FileDTO.ParentID)},
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
                SELECT D.id as {nameof(FileDTO.FileID)}, D.folder_id as {nameof(FileDTO.ParentID)},
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
                SELECT F.id as {nameof(FileDTO.FileID)}, F.parent_id as {nameof(FileDTO.ParentID)},
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
                SELECT D.id as {nameof(FileDTO.FileID)}, D.folder_id as {nameof(FileDTO.ParentID)},
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

    }
}