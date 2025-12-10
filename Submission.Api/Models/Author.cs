using Ashi.MongoInterface.Helper;

namespace Submission.Api.Models;

[BsonCollection("author")]
public class Author : Document
{
    public string Name { get; set; }
    public string NID { get; set; } 
}