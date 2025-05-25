namespace backend.models
{

    // Entidad Grupo
    public class Group
    {
        required public int ID { get; set; }  // PK

        required public string CourseCode { get; set; }

        public int Semester_ID { get; set; }

        public int Number { get; set; }   // Número de grupo

    }
    
}