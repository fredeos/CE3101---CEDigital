namespace backend.models{

    // Entidad Especificación
    public class Specification{
        required public int? ID { get; set; } // PK
        required public int? AssigmentID { get; set; } // FK
        required public string Name { get; set; }
        required public string Extension { get; set; }
        public long Size { get; set; }
        public string? Path { get; set; } // Ruta de guardado
        public DateTime? UploadDate { get; set; }
    }
}