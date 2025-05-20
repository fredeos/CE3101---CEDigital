
namespace backend.DTO
{
    public class AssignmentSpecificationDto
    {
        required public string FileName { get; set; }
        required public string FileType { get; set; }
        public int Size { get; set; }
        required public string FilePath { get; set; }
    }
}