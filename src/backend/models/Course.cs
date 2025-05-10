
namespace backend.models {

    // Entidad Cursos
    public class Course{

        required public string Code {get; set;} // PK

        required public string Name {get; set;}

        public int Credits {get; set;}

        required public string Career {get; set;}

    }
}