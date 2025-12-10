using Ashi.MongoInterface.Helper;

namespace Submission.Api.Models;

[BsonCollection("signatures")]
public class Widget : Document
{
    public string Name { get; set; }
    public string IdCard { get; set; }
    public string Signature_SVG { get; set; }
    public DateTime Timestamp { get; set; }
}