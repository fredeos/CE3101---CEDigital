namespace backend.DTO
{
    public class AssignmentUpdateDto
    {
        required public string Name { get; set; }
        public float Percentage { get; set; }
        public DateTime? TurninDate { get; set; }
        public int IndividualFlag { get; set; }
        public AssignmentSpecificationDto? Specification { get; set; }
    }
}