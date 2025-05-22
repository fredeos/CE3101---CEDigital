using backend.DTO;
using backend.models;


namespace backend.DTO
{
    public class SpecificationDTO
    {
        public int? ID { get; set; } // PK
        public string? Name { get; set; }
        public string? Extension { get; set; }
        public long Size { get; set; }
    }

    public class SolutionDTO
    {
        required public int? ID { get; set; } // PK
        required public string Name { get; set; }
        required public string Extension { get; set; }
        public long Size { get; set; }
        public DateTime? UploadDate { get; set; }
    }

    public class FeedbackDTO
    {
        required public int? ID { get; set; } // PK
        required public string Name { get; set; }
        required public string Extension { get; set; }
        public long Size { get; set; }
    }

    public class StudentViewFullAssignmentDTO
    {
        required public int ID { get; set; }

        required public string Name { get; set; }

        public string? Category { get; set; } // Rubric Name

        public float? TotalPercentage { get; set; }

        public float? EarnedPercentage { get; set; }

        public float MaxScore = 100.00f;

        public float? EarnedScore { get; set; }

        public string? Commentary { get; set; }

        public DateTime? DueDate { get; set; }

        public List<Student>? GroupMembers { get; set; }

        public List<SpecificationDTO>? Attachments { get; set; }

        public SolutionDTO? Submission { get; set; }

        public FeedbackDTO? Feedback { get; set; }

    }
}