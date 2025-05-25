// DTO para el update
namespace backend.DTO
{
    public class UpdateAssignmentSubmissionDTO
    {
        public decimal? Grade { get; set; }
        public string? Commentary { get; set; }
    }

    // DTO para actualizar published_flag
    public class UpdatePublishedFlagDTO
    {
        public int PublishedFlag { get; set; }
    }

    // DTO para obtener la información de todos los estudiantes de una entrega en específico
    public class AssignmentSubmissionDTO
    {
        public int ID { get; set; }
        public int AssignmentID { get; set; }
        public int? StudentID { get; set; }
        public int? GroupID { get; set; }
        public decimal? Grade { get; set; }
        public string? Commentary { get; set; }
        public string? SubmittedFile { get; set; }
        public string? FeedbackFile { get; set; }
        public DateTime SubmissionDate { get; set; }
        public int PublishedFlag { get; set; }
        public string? StudentFullName { get; set; } // Nuevo campo
    }
}