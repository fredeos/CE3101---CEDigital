

namespace backend.models.DTO{
    public class SemesterGroupInfoDTO
    {
        // Propiedades del grupo
        required public int ID { get; set; }  // PK
        public int Number { get; set; }   // Número de grupo

        // Propieades del curso
        required public string CourseCode { get; set; } // FK
        public string? CourseName { get; set; }

        // Propiedades del semestre
        required public int Semester_ID { get; set; } // FK
        public int SemesterYear { get; set; }
        public int SemesterPeriod { get; set; }

        // Propiedades del profesor
        required public int Professor_ID { get; set; } // FK (mongo)
        required public string? ProfessorName { get; set; }
        required public string? ProfessorLastName { get; set; }

    }
}