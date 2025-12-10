namespace Submission.Api.Dto;

public class PetitionDetailsDto
{
    public Guid Id { get; set; }
    public DateOnly StartDate { get; set; }
    
    public string NameDhiv { get; set; }
    public string NameEng { get; set; }
    
    public AuthorsDto AuthorDetails { get; set; }
    
    public string PetitionBodyDhiv { get; set; }
    public string PetitionBodyEng { get; set; }
    
    public int SignatureCount { get; set; }
}