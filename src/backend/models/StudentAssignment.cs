namespace backend.models{

    // Entidad EstudianteEvaluación
    public class StudentAssignment{
        required public int StudentID {get; set;} // PK relación con Estudiante

        required public int AssignmentSubmissionID {get; set;}   // PK relación con EntregaEvaluación
    }
}