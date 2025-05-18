
namespace backend.DTO
{

    public class ProfessorGroupWithCourseDto
    {
        // Datos del Grupo (de la tabla Group)
        public int GroupId { get; set; }        // Group.ID
        public int GroupNumber { get; set; }    // Group.Number
        public int SemesterId { get; set; }     // Group.Semester_ID

        // Datos del Curso (de la tabla Course)
        required public string CourseCode { get; set; }  // Course.Code
        required public string CourseName { get; set; }   // Course.Name
        public int Credits { get; set; }         // Course.Credits
        required public string Career { get; set; }       // Course.Career
    }

}
