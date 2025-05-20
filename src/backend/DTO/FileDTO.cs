

namespace backend.DTO
{
    /// <summary>
    /// DTO for both folders and documents
    /// </summary>
    public class FileDTO
    {
        public int FileID { get; set; }
        public int? ParentID { get; set; }
        required public string FileName { get; set; }
        public string? FileType { get; set; }
        public int? FileSize { get; set; }
        required public DateTime UploadDate { get; set; }
    }
}