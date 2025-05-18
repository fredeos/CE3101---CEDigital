namespace backend.models{
    // Entidad EntregaEvaluación
    public class AssignmentSubmission
    {

        public int ID { get; set; } // PK

        public int EvaluationGroupID { get; set; }    // FK relación con GrupoEvaluación

        public int AssignmentEvaluationID { get; set; }

        required public string AssignmentSolution { get; set; }   // Ruta del archivo entregado como solución

        public string? Comments { get; set; } // Observaciones por parte del profesor

        public string? FeedbackFile { get; set; } // Archivo de retroalimentación por parte del profesor

        public bool Published { get; set; } // Para saber si las notas son visibles para el estudiante

        public decimal grade { get; set; }

    } 
}