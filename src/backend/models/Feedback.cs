namespace backend.models{

    // Entidad Retroalimentación
    public class Feedback{
        required public int AssignmentSubmissionID {get; set;} // PK relación con EntregaEvaluación

        // Rutas con los diferentes documentos de retroalimentación por parte de los profesores
        required public string FeedbackFile {get; set;}   // PK atributo multivaluado Retroalimentación 
                                                        
    }
}