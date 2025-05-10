namespace backend.models{

    // Entidad Grupo
    public class Group{
        required public int ID {get; set;}

        required public string CourseCode {get; set;}

        public int Year {get; set;} // FK relación con Semestre

        public int Period {get; set;}   // FK relación con Semestre

        public int Number {get; set;}   // Número de grupo

    }
}