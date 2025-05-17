using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

using backend.models;
using backend.services;
using backend.DTO;
using backend.utils;

namespace backend.controllers
{

    [ApiController]
    [Route("api")]
    public class ProfessorGroupController(CEDigitalService db_ap) : ControllerBase
    {
        private readonly CEDigitalService db = db_ap;

        [HttpGet("professors/groups-with-courses/{professorIdCard}")]
        public ActionResult<IEnumerable<ProfessorGroupWithCourseDto>> GetProfessorGroupsWithCourses(int professorIdCard)
        {
            String query = @$"
                SELECT 
                    g.ID AS GroupId,
                    g.num AS GroupNumber,
                    g.Semester_ID AS SemesterId,
                    c.Code AS CourseCode,
                    c.course_name AS CourseName,
                    c.Credits,
                    c.career_name AS Career
                FROM 
                    Academic.ProfessorGroups pg
                INNER JOIN 
                    Academic.Groups g ON pg.group_id = g.ID
                INNER JOIN 
                    Academic.Courses c ON g.course_code = c.Code
                WHERE 
                    pg.professor_id = {professorIdCard}";

            var results = db.sql_db!.SELECT<ProfessorGroupWithCourseDto>(query);
            if (results == null || results.Count == 0)
            {
                return NotFound("No se encontraron grupos asociados al profesor con ssn " + professorIdCard.ToString());
            }
            return Ok(results);
        }
    }
}