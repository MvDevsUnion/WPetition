using System.ComponentModel.DataAnnotations;

namespace Submission.Api.Dto;

public class WidgetsDto
{
    [Required]
    [MinLength(3)]
    public string Name { get; set; }
    
    [Required]
    [MinLength(6)]
    [MaxLength(7)]
    public string IdCard { get; set; }
    
    [Required]
    public string Signature { get; set; }
}