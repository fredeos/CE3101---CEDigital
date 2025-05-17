using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

using backend.models;
using backend.models.DTO;
using backend.services;

namespace backend.controllers
{
    [ApiController]
    [Route("api/semesters")]
    public class SemesterController(CEDigitalService db_ap) : ControllerBase
    {
        CEDigitalService db = db_ap;

        [HttpGet]
        public ActionResult<IEnumerable<Semester>> GetAllSemesters()
        {
            string sql_query = $@"
            SELECT id as {nameof(Semester.Id)}, year as {nameof(Semester.Year)}, period as {nameof(Semester.Period)}
            FROM Academic.Semesters;
            ";
            var results = db.sql_db!.SELECT<Semester>(sql_query);
            return results;
        }

        [HttpGet("{id}/groups")]
        public ActionResult<IEnumerable<SemesterGroupInfoDTO>> GetGroupsForSemester(int id)
        {
            string attributes = $@"
            G.id as {nameof(SemesterGroupInfoDTO.ID)}, G.num as {nameof(SemesterGroupInfoDTO.Number)},
            G.course_code as {nameof(SemesterGroupInfoDTO.CourseCode)}, C.course_name as {nameof(SemesterGroupInfoDTO.CourseName)},
            G.semester_id as {nameof(SemesterGroupInfoDTO.Semester_ID)}, S.year as {nameof(SemesterGroupInfoDTO.SemesterYear)}, S.period as {nameof(SemesterGroupInfoDTO.SemesterPeriod)},
            PG.professor_id as {nameof(SemesterGroupInfoDTO.Professor_ID)}
            "; 

            string sql_query = $@"
            SELECT {attributes}
            FROM ((Academic.ProfessorGroups as PG JOIN Academic.Groups as G ON PG.group_id = G.id) JOIN Academic.Semesters as S
            ON G.semester_id = S.id ) JOIN Academic.Courses as C ON G.course_code = C.code
            WHERE S.id = {id};
            ";

            var results = db.sql_db!.SELECT<SemesterGroupInfoDTO>(sql_query);
            if (results != null & results!.Count > 0){
                foreach (var group in results)
                {
                    var professor = db.mongo_db!.find<Professor>("Professors", p => p.IDCard == group.Professor_ID).FirstOrDefault();
                    if (professor != null){
                        group.ProfessorName = professor.FirstName;
                        group.ProfessorLastName = professor.FirstLastName;
                    } else {
                        return NotFound($"Professor (ID={group.Professor_ID}) not found for {group.CourseCode} group #{group.Number}");
                    }
                }
            }
            return Ok(results);
        }

        [HttpPost]
        public ActionResult<Semester> CreateSemester([FromBody] Semester semester)
        {
            string sql_query = $@"
            INSERT INTO Academic.Semesters (year, period)
            OUTPUT INSERTED.id as {nameof(Semester.Id)}, INSERTED.year as {nameof(Semester.Year)}, INSERTED.period as {nameof(Semester.Period)}
            VALUES (@{nameof(Semester.Year)}, @{nameof(Semester.Period)});
            ";
            var result = db.sql_db!.INSERT<Semester>(sql_query, semester);
            if (result == null)
            {
                return BadRequest($"Error inserting a new semester {semester.Year}-{semester.Period}");
            }
            return CreatedAtAction(nameof(CreateSemester), new { id = result.Id }, result);
        }

    }
}