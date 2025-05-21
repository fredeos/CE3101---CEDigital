using backend.DTO;

namespace backend.models
{

    // Entidad AsignaciónEvaluación
    public class Assignment
    {
        public int ID { get; set; }
        public int RubricID { get; set; }
        required public string Name { get; set; }
        public float Percentage { get; set; }
        public DateTime? TurninDate { get; set; }
        public int IndividualFlag { get; set; }
        public AssignmentSpecificationDto? Specification { get; set; }
    }
}