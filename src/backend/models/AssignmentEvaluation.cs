namespace backend.models{

    // Entidad AsignaciónEvaluación
    public class AssignmentEvaluation{
        public int ID {get; set;}   // PK

        public int RubricID {get; set;} // FK relación con Rubro

        required public string Name {get; set;}

        public double Percentage {get; set;}

        public DateTime Deadline {get; set;}

        public int IsIndividualAssignment {get; set;} 
    }
}