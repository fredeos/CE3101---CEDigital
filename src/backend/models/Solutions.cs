namespace backend.models{

    // Entidad Entregables
    public class Solutions{
        required public int AssignmentEvaluationID {get; set;} // PK relación con AsignaciónEvaluación

        required public string Solution {get; set;}   // PK atributo multivaluado Entregable (rutas con los diferentes entregables)
    }
}