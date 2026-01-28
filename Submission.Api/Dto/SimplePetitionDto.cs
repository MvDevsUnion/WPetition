namespace Submission.Api.Dto
{
    public class SimplePetitionDto
    {
        public string Title { get; set; }
        public string Title_Dhiv { get; set; }
        public int SignatureCount{get; set;}
        public Guid Id { get; set; }
        public string Slug { get; set; }
    }
}
