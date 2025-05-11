namespace backend.models{

    // Entidad Grupo
    public class StudentGroup{
        required public int GroupID {get; set;} // PK relación con Grupo

        required public int StudentID {get; set;}   // PK relación con Estudiante
    }
}