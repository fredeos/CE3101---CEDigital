

namespace backend.DTO
{
    public class AssignmentForStudentDTO
    {
        required public int ID { get; set; }
        required public string Name { get; set; }
        public DateTime? DueDate { get; set; }
        public float? TotalPercentage { get; set; }
        public float? EarnedPercentage { get; set; }
        public float? EarnedGrade { get; set; }
        public int? ShowPercentage { get; set; }
    }
}