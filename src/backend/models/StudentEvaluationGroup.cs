namespace backend.models{

    // Entidad EstudianteGrupoEvaluación
    public class StudentEvaluationGroup{

        required public int StudentID {get; set;}   // PK relación con Estudiante

        required public int EvaluationGroupID {get; set;} // PK relación con GrupoEvaluación
    }
}