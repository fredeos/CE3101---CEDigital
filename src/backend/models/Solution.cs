namespace backend.models{

    // Entidad Entregables
    public class Solution
    {
        required public int? ID { get; set; } // PK
        required public int? AssigmentSubmissionID { get; set; } // FK
        required public string Name { get; set; }
        required public string Extension { get; set; }
        public long Size { get; set; }
        public string? Path { get; set; } // Ruta de guardado
        public DateTime? UploadDate { get; set; }
    }
}