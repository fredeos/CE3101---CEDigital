namespace backend.DTO
{
    public class NewsWithProfessorDTO
    {
        public int Id { get; set; }
        public int ProfessorIDCard { get; set; }
        required public string ProfessorFullName { get; set; }  // Nombre completo concatenado
        public int GroupID { get; set; }
        required public string Title { get; set; }
        required public string Message { get; set; }
        public DateTime PublishDate { get; set; }
    }
}
