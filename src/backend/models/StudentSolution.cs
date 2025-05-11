namespace backend.models{

    // Entidad EstudianteEntrega
    public class StudentSolution{
        required public int StudentID {get; set;} // PK relación con Estudiante

        required public int AssignmentEvaluationID {get; set;}   // PK relación con AsignaciónEvaluación
    }
}