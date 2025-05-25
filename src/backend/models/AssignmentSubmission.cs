namespace backend.models{
    // Entidad EntregaEvaluación
    public class AssignmentSubmission
    {

        public int ID { get; set; } // PK

        public int? StudentID { get; set; }    // FK relación con Student
        
        public int? EvaluationGroupID { get; set; }    // FK relación con GrupoEvaluación

        public int AssignmentEvaluationID { get; set; }

        public int? AssignmentSolution { get; set; }   // FK: archivo entregado como solucion

        public string? Comments { get; set; } // Observaciones por parte del profesor

        public int? FeedbackFile { get; set; } // FK: Archivo de retroalimentación por parte del profesor

        public int Published { get; set; } // Para saber si las notas son visibles para el estudiante

        public float? grade { get; set; }

    } 
}