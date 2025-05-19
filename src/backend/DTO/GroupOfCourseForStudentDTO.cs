
namespace backend.DTO
{
    public class GroupOfCourseForStudentDTO
    {
        public int ID { get; set; }
        public int GroupNum { get; set; }
        required public string CourseName { get; set; }
        public int SemesterID { get; set; }
        public int SemesterYear { get; set; }
        public int SemesterPeriod { get; set; }
    }
}