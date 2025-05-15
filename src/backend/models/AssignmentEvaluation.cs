namespace backend.models{

    // Entidad AsignaciónEvaluación
    public class AssignmentEvaluation{
        public int ID {get; set;}   // PK

        public int RubricID {get; set;} // FK relación con Rubro

        required public string Name {get; set;}

        public int Percentage {get; set;}

        public DateTime Deadline {get; set;}

        public bool IndividualAssignment {get; set;} 
    }
}