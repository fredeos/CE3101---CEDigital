using Microsoft.AspNetCore.Mvc;

using backend.models;
using backend.services;

namespace backend.controllers{

    [ApiController]
    [Route("api")]

    public class CourseController(CEDigitalService db_ap) : ControllerBase
    {

        private readonly CEDigitalService db = db_ap;

        /// <summary>
        /// Devuelve todos los cursos creados sin importar la carrera.
        /// </summary>
        /// <returns></returns>

        [HttpGet("courses")]
        public ActionResult<IEnumerable<Course>> GetCourses()
        {
            String tablename = "Academic.Courses as AC";
            String attributes = $"AC.code as {nameof(Course.Code)}, AC.course_name as {nameof(Course.Name)}, AC.credits as {nameof(Course.Credits)}, AC.career_name as {nameof(Course.Career)}";

            String query = @$"
            SELECT {attributes} 
            FROM {tablename};";

            var courses = db.sql_db!.SELECT<Course>(query);
            if (courses == null || !courses.Any())
            {
                return NotFound("No se encontraron cursos.");
            }

            return Ok(courses);
        }

        /// <summary>
        /// Devuelve toda la información de un curso según el código dado.
        /// </summary>
        /// <param name="code"></param>
        /// <returns></returns>

        [HttpGet("courses/{code}")]
        public ActionResult<Course> GetCourse(string code)
        { // Se debe ingresar el code en Swagger como 'código'
            Console.WriteLine(code);
            String tablename = "Academic.Courses as AC";
            String attributes = $"AC.code as {nameof(Course.Code)}, AC.course_name as {nameof(Course.Name)}, AC.credits as {nameof(Course.Credits)}, AC.career_name as {nameof(Course.Career)}";
            String query = @$"
            SELECT {attributes} 
            FROM {tablename}
            WHERE AC.code = {code};";
            var results = db.sql_db!.SELECT<Course>(query);
            if (results == null || results.Count == 0)
            {
                return NotFound();
            }
            return Ok(results.FirstOrDefault());
        }

        /// <summary>
        /// Permite añadir nuevos cursos.
        /// </summary>
        /// <param name="course"></param>
        /// <returns></returns>

        [HttpPost("add/course")]
        public ActionResult<Course> AddCourse ([FromBody] Course course)
        {
            String tablename = "Academic.Courses";
            String attributes = $"code, course_name, credits, career_name";
            String query = @$"
            INSERT INTO {tablename} ({attributes})
            OUTPUT INSERTED.code as {nameof(Course.Code)}, INSERTED.course_name as {nameof(Course.Name)}, INSERTED.credits as {nameof(Course.Credits)}, INSERTED.career_name as {nameof(Course.Career)}
            VALUES (@{nameof(Course.Code)}, @{nameof(Course.Name)}, @{nameof(Course.Credits)}, @{nameof(Course.Career)});";
            var result = db.sql_db!.INSERT<Course>(query, course);
            if (result == null)
            {
                return BadRequest("Error inserting course into the database");
            }
            return CreatedAtAction(nameof(AddCourse), new { id = result.Code }, result);
        }

        /// <summary>
        /// Permite modificar la información de un curso dado el código de este.
        /// El código de sebe ingresar en la parte de "Description" como 'Código'.
        /// </summary>
        /// <param name="code"></param>
        /// <param name="course"></param>
        /// <returns></returns>
        
        [HttpPut("modify/course/{code}")]
        public ActionResult ModifyCourse (string code, [FromBody] Course course){
            
            String tablename = "Academic.Courses";
            String retrieval = $"INSERTED.code as {nameof(Course.Code)}, INSERTED.course_name as {nameof(Course.Name)}, INSERTED.credits as {nameof(Course.Credits)}, INSERTED.career_name as {nameof(Course.Career)}";
            String modified_values = $"code = @{nameof(Course.Code)}, course_name = @{nameof(Course.Name)}, credits = @{nameof(Course.Credits)}, career_name = @{nameof(Course.Career)}";
            String condition = $"code = {code}";

            String query = @$"
            UPDATE {tablename} 
            SET {modified_values}
            OUTPUT {retrieval} 
            WHERE {condition};";

            // Realizar la consulta a la base
            var results = db.sql_db!.UPDATE<Course>(query, course);
            return AcceptedAtAction(nameof(ModifyCourse), new { id = code }, results);
        }

        }
     }