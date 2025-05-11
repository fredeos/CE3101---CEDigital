namespace backend.models{

    // Entidad GrupoProfesor
    public class ProfessorGroup{
        required public int GroupID {get; set;} // PK relación con Grupo

        required public int ProfessorIDCard {get; set;} // PK relación con Profesor
    }
}