
namespace backend.DTO
{
        public class AssignmentSpecificationDto
    {
        public int Id { get; set; }
        public int AssignmentId { get; set; }
        required public string FileName { get; set; }
        required public string FileType { get; set; }
        public int Size { get; set; }
        required public string FilePath { get; set; }
        public DateTime UploadDate { get; set; }
    }
}