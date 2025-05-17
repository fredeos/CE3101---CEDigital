
namespace backend.models{

    // Entidad Semestre
    public class Semester{
        public int Id { get; set; } // Uk
        required public int Year { get; set; }    // Pk
        required public int Period {get; set;}  // Pk
    }
}