using System.ComponentModel.DataAnnotations;

namespace Submission.Api.Dto
{
    public class PetitionFormDto
    {
        [Required]
        public string Slug { get; set; } = string.Empty;

        [Required]
        public string NameDhiv { get; set; } = string.Empty;

        [Required]
        public string NameEng { get; set; } = string.Empty;

        // Expect dd-MM-yyyy
        [Required]
        public string StartDate { get; set; } = string.Empty;

        [Required]
        public string AuthorName { get; set; } = string.Empty;

        [Required]
        public string AuthorNid { get; set; } = string.Empty;

        [Required]
        public string PetitionBodyDhiv { get; set; } = string.Empty;

        [Required]
        public string PetitionBodyEng { get; set; } = string.Empty;

        [Required]
        public string turnstileToken { get; set; } = string.Empty;
    }
}
