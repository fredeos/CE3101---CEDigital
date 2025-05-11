namespace backend.models{

    //Entidad GrupoEvaluación
    public class EvaluationGroup{

        public int ID {get; set;} // PK
        
        required public int AssignmentEvaluationID {get; set;} // FK relación con AsignaciónEvaluación

        public int Number {get; set;}
    }
}