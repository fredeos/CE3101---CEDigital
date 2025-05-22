namespace backend.models{

    //Entidad GrupoEvaluación
    public class AssignmentGroups
    {

        required public int ID { get; set; } // PK

        required public int AssignmentID { get; set; } // FK relación con AsignaciónEvaluación

        public int Number { get; set; }
        
        public List<Student>? GroupMembers { get; set;}
    }
}