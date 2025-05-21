namespace backend.models{

    // Entidad EstudianteGrupoEvaluación
    public class AssignmentStudentGroups{

        required public int StudentID {get; set;}   // PK relación con Estudiante

        required public int AssignmentID {get; set;} // PK relación con GrupoEvaluación
    }
}