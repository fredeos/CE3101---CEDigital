using Microsoft.AspNetCore.Mvc;

using Dapper;
using backend.models;
using backend.services;


namespace backend.controllers
{

    [ApiController]
    [Route("api")]

    public class GroupController(CEDigitalService db_ap) : ControllerBase
    {

        private readonly CEDigitalService db = db_ap;

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