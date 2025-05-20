namespace backend.models{

    // Entidad Carpeta
    public class Folder
    {

        required public int ID { get; set; }  // PK

        required public int GroupID { get; set; } // FK de la relación con Grupo

        public int? ParentFolderID { get; set; } // FK por la relación recursiva entre carpetas

        required public string Name { get; set; }
        
        public DateTime? UploadDate { get; set; } // Fecha de creación de la carpeta

    }
}