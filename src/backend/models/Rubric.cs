namespace backend.models{

    // Entidad Rubro
    public class Rubric{

        public int ID {get; set;} // PK

        public int GroupID {get; set;}  // FK relación con Grupo

        required public string Name {get; set;}

        public int Percentage {get; set;}

    }
}