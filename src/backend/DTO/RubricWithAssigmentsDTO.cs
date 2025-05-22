using backend.DTO;


namespace backend.DTO
{
    public class RubricWithAssignmentsDTO
    {
        required public int ID { get; set; }
        required public string Name { get; set; }
        public float? TotalPercentage { get; set; }
        public float? EarnedPercentage { get; set; }
        public List<AssignmentForStudentDTO> Assignments { get; set; }
    }
}