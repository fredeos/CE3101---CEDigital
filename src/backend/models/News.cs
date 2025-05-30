namespace backend.models{

    // Entidad Noticia
    public class News{
        required public int ID {get; set;}  // PK

        required public int ProfessorIDCard {get; set;} // FK relación con Profesor

        required public int GroupID {get; set;}  // FK relación con Grupo

        required public string Title {get; set;}

        required public string Message {get; set;}

        public DateTime PublicationDate {get; set;}
        

    }
}