namespace backend.DTO
{
    public class GroupStudentDTO
    {
        public int GroupID { get; set; }
        public int StudentID { get; set; }
        required public string FullName { get; set; }
        required public string Email { get; set; }
        required public string PhoneNumber { get; set; }
    }
}