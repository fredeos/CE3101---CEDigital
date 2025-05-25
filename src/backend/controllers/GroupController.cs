using Microsoft.AspNetCore.Mvc;

using Dapper;
using backend.models;
using backend.services;
using backend.DTO;


namespace backend.controllers
{

    [ApiController]
    [Route("api")]
    public class GroupController(CEDigitalService db_ap) : ControllerBase
    {
        private readonly CEDigitalService db = db_ap;

        // ------------------------------------------ Metodos GET ------------------------------------------
        
        /// <summary>
        /// Obtiene todos los grupos de un curso en un semestre específico.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>

        [HttpGet("groups/student/{id}")]
        public ActionResult<IEnumerable<GroupOfCourseForStudentDTO>> GetAllGroupsForStudent(int id)
        {
            string table = @$"((Academic.Groups as G JOIN Academic.CourseGroups as A ON G.id = A.group_id)
            JOIN Academic.Semesters as S ON G.semester_id = S.id)
            JOIN Academic.Courses as C ON G.course_code = C.code";

            string attributes = $@"G.id as {nameof(GroupOfCourseForStudentDTO.ID)}, G.num as {nameof(GroupOfCourseForStudentDTO.GroupNum)},
            C.course_name as {nameof(GroupOfCourseForStudentDTO.CourseName)}, S.id as {nameof(GroupOfCourseForStudentDTO.SemesterID)},
            S.year as {nameof(GroupOfCourseForStudentDTO.SemesterYear)}, S.period as {nameof(GroupOfCourseForStudentDTO.SemesterPeriod)}";

            string condition = $@"A.student_id = {id}";
            string sort = $@"{nameof(GroupOfCourseForStudentDTO.SemesterYear)} DESC, {nameof(GroupOfCourseForStudentDTO.SemesterPeriod)} DESC";

            string sql_query = $@"
            SELECT {attributes}
            FROM {table}
            WHERE {condition}
            ORDER BY {sort}; ";

            var results = db.sql_db!.SELECT<GroupOfCourseForStudentDTO>(sql_query);

            return Ok(results);
        }


        // ------------------------------------------ Metodos POST ------------------------------------------

        /// <summary>
        /// Permite añadir grupos en un semestre existente colocando tanto el código del curso, 
        /// el semestre al que pertenece y el número de grupo.
        /// </summary>
        /// <param name="Group"></param>
        /// <returns></returns>

        [HttpPost("add/group")]
        public ActionResult<Group> AddGroup([FromBody] Group Group)
        {

            string tablename = "Academic.Groups";
            string attributes = "course_code, semester_id, num";

            // Verificación de unicidad SIN parámetros
            string checkQuery = $@"
                SELECT COUNT(1)
                FROM {tablename}
                WHERE course_code = '{Group.CourseCode}'
                AND semester_id = {Group.Semester_ID}
                AND num = {Group.Number}";

            var exists = db.sql_db!.SELECT<int>(checkQuery).FirstOrDefault();

            if (exists > 0)
            {
                return Conflict("Ya existe un grupo con ese código de curso, semestre y número.");
            }
            
            // <- No incluir 'id' a la hora de hacer el post
            // en caso de swagger dejarlo en 0, ya que SQL lo asigna solo.
            string query = @$"
                INSERT INTO {tablename} ({attributes})
                OUTPUT 
                    INSERTED.id as {nameof(Group.ID)},
                    INSERTED.course_code as {nameof(Group.CourseCode)},
                    INSERTED.semester_id as {nameof(Group.Semester_ID)},
                    INSERTED.num as {nameof(Group.Number)}
                VALUES (@{nameof(Group.CourseCode)}, @{nameof(Group.Semester_ID)}, @{nameof(Group.Number)})";

            var result = db.sql_db!.INSERT<Group>(query, Group);

            if (result == null)
            {
                return BadRequest("Error inserting group into the database");
            }

            // Insertar rubros por defecto
            var defaultRubrics = new List<Rubric>
            {
                new() { GroupID = result.ID, Name = "Quices", Percentage = 30 },
                new() { GroupID = result.ID, Name = "Exámenes", Percentage = 30 },
                new() { GroupID = result.ID, Name = "Proyectos", Percentage = 40 }
            };

            string rubricTable = "Academic.Rubrics";
            string rubricAttributes = "group_id, rubric_name, percentage";
            string rubricQuery = @$"
                INSERT INTO {rubricTable} ({rubricAttributes})
                OUTPUT INSERTED.id as ID, INSERTED.group_id as GroupID, INSERTED.rubric_name as Name, INSERTED.percentage as Percentage
                VALUES (@GroupID, @Name, @Percentage)";

            foreach (var rubric in defaultRubrics)
            {
                db.sql_db!.INSERT<Rubric>(rubricQuery, rubric);
            }

            // Insertar carpeta raíz
            var rootFolder = new Folder
            {
                ID = 0,
                GroupID = result.ID,
                ParentFolderID = null,
                Name = "root",
                CreationDate = DateTime.UtcNow
            };

            string folderTable = "Files.Folders";
            string folderAttributes = "group_id, parent_id, folder_name, upload_date";
            string rootFolderQuery = @$"
                INSERT INTO {folderTable} ({folderAttributes})
                OUTPUT INSERTED.id as ID, INSERTED.group_id as GroupID, INSERTED.parent_id as ParentFolderID, INSERTED.folder_name as Name, INSERTED.upload_date as CreationDate
                VALUES (@GroupID, @ParentFolderID, @Name, @CreationDate)";

            var insertedRoot = db.sql_db!.INSERT<Folder>(rootFolderQuery, rootFolder);

            if (insertedRoot != null)
            {
                // Insertar carpetas hijas por defecto
                var defaultFolders = new List<Folder>
                {
                    new() { ID = 0, GroupID = result.ID, ParentFolderID = insertedRoot.ID, Name = "Documentos públicos", CreationDate = DateTime.UtcNow },
                    new() { ID = 0, GroupID = result.ID, ParentFolderID = insertedRoot.ID, Name = "Examenes", CreationDate = DateTime.UtcNow },
                    new() { ID = 0, GroupID = result.ID, ParentFolderID = insertedRoot.ID, Name = "Proyectos", CreationDate = DateTime.UtcNow },
                    new() { ID = 0, GroupID = result.ID, ParentFolderID = insertedRoot.ID, Name = "Tareas", CreationDate = DateTime.UtcNow },
                    new() { ID = 0, GroupID = result.ID, ParentFolderID = insertedRoot.ID, Name = "Apuntes", CreationDate = DateTime.UtcNow }
                };

                string childFolderQuery = @$"
                    INSERT INTO {folderTable} ({folderAttributes})
                    OUTPUT INSERTED.id as ID, INSERTED.group_id as GroupID, INSERTED.parent_id as ParentFolderID, INSERTED.folder_name as Name, INSERTED.upload_date as CreationDate
                    VALUES (@GroupID, @ParentFolderID, @Name, @CreationDate)";

                foreach (var folder in defaultFolders)
                {
                    db.sql_db!.INSERT<Folder>(childFolderQuery, folder);
                }
            }

            return CreatedAtAction(nameof(AddGroup), new { id = result.ID }, result);
        }

        
    }
    
    
}