using Microsoft.AspNetCore.Mvc;

using backend.models;
using backend.services;

namespace backend.controllers{

    [ApiController]
    [Route("api")]

     public class CourseController(CEDigitalService db_ap) : ControllerBase {

        private readonly CEDigitalService db = db_ap;

        // Devuelve todos los cursos
        
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

        // Devuelve toda la información de un curso según el coódigo dado

        [HttpGet("courses/{code}")]
        public ActionResult<Course> GetCourse(string code){ // Se debe ingresar el code en Swagger como 'código'
            Console.WriteLine(code);
            String tablename = "Academic.Courses as AC";
            String attributes = $"AC.code as {nameof(Course.Code)}, AC.course_name as {nameof(Course.Name)}, AC.credits as {nameof(Course.Credits)}, AC.career_name as {nameof(Course.Career)}";
            String query = @$"
            SELECT {attributes} 
            FROM {tablename}
            WHERE AC.code = {code};"; 
            var results = db.sql_db!.SELECT<Course>(query);
            if (results == null || results.Count == 0){
                return NotFound();
            }
            return Ok(results.FirstOrDefault());
        }

        }
     }