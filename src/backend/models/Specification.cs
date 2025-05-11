namespace backend.models{

    // Entidad Especificación
    public class Specification{
        public int AssignmentEvaluationID {get; set;} // PK relación con AsignaciónEvaluación

        required public string SpecificationPath {get; set;}   // PK de atributo multivaluado (ruta del archivo de especificación de la asignación)
    }
}