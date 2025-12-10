using System.Runtime.InteropServices;
using Ashi.MongoInterface.Helper;

namespace Submission.Api.Models;

[BsonCollection("petitionDetail")]
public class PetitionDetail : Document
{
    public DateOnly StartDate { get; set; }
    
    public string NameDhiv { get; set; }
    public string NameEng { get; set; }
    
    public Guid AuthorId { get; set; }
    
    public string PetitionBodyDhiv { get; set; }
    public string PetitionBodyEng { get; set; }
    
    public int SignatureCount { get; set; }
}