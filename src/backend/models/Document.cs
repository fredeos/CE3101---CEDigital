namespace backend.models{

    // Entidad Documento
    public class Document{

        public int ID {get; set;} // PK

        public int FolderID {get; set;} // FK relación con Carpeta

        required public string Name {get; set;}

        required public string Extension {get; set;} // Ejemplo: pdf

        public long Size {get; set;}

        required public string Path {get; set;}

        public DateTime? CreationDate {get; set;}
    }
}