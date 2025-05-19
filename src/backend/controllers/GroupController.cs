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
            string attributes = "course_code, semester_id, num"; // <- No incluir 'id' a la hora de hacer el post
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
            return CreatedAtAction(nameof(AddGroup), new { id = result.ID }, result);
        }

        
    }
    
    
}