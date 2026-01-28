using Ashi.MongoInterface.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Submission.Api.Configuration;
using Submission.Api.Dto;
using Submission.Api.Models;
using Submission.Api.Services;
using System.Globalization;

namespace Submission.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PetitionController : ControllerBase
    {
        private readonly PetitionSettings _petitionSettings;
        private readonly IMongoRepository<Author> _authorRepository;
        private readonly IMongoRepository<PetitionDetail> _petitionRepository;
        public readonly TurnstileService _turnstileService;

        public PetitionController(
            IOptions<PetitionSettings> petitionSettings,
            IMongoRepository<Author> authorRepository,
            IMongoRepository<PetitionDetail> petitionRepository,
            TurnstileService turnstileService)
        {
            _petitionSettings = petitionSettings.Value;
            _authorRepository = authorRepository;
            _petitionRepository = petitionRepository;
            _turnstileService = turnstileService;

        }


        // New endpoint: form-based petition upload
        [HttpPost("upload-petition-form", Name = "UploadPetitionForm")]
        public async Task<IActionResult> UploadPetitionForm([FromForm] PetitionFormDto form)
        {
            var remoteip = HttpContext.Request.Headers["CF-Connecting-IP"].FirstOrDefault() ??
            HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault() ??
            HttpContext.Connection.RemoteIpAddress?.ToString();

            if (form.turnstileToken == null)
                return BadRequest("Turnstile token is missing");

            Console.WriteLine("Token received: " + form.turnstileToken);

            var validation = await _turnstileService.ValidateTokenAsync(form.turnstileToken, remoteip);

            if(!validation.Success)
            {
                // Invalid token - reject submission
                // Make joining error codes null-safe to avoid ArgumentNullException
                var errorCodes = validation?.ErrorCodes;
                var errors = (errorCodes != null && errorCodes.Length > 0)
                    ? string.Join(", ", errorCodes)
                    : "unknown";
                return BadRequest($"Verification failed: {errors}");
            }

            // Check if petition creation is allowed
            if (!_petitionSettings.AllowPetitionCreation)
            {
                return StatusCode(403, new { message = "Petition creation is disabled. Set 'PetitionSettings:AllowPetitionCreation' to true in appsettings.json" });
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                // Parse start date (format: dd-MM-yyyy)
                DateOnly startDate;
                try
                {
                    startDate = DateOnly.ParseExact(form.StartDate, "dd-MM-yyyy", CultureInfo.InvariantCulture);
                }
                catch (FormatException)
                {
                    return BadRequest(new { message = "StartDate must be in format dd-MM-yyyy" });
                }

                // Check for duplicate slug
                var existingPetition = await _petitionRepository.FindOneAsync(x => x.Slug == form.Slug);
                if (existingPetition != null)
                {
                    return Conflict(new { message = $"A petition with slug '{form.Slug}' already exists" });
                }

                var petitionId = Guid.NewGuid();

                // Create or get author
                var author = await _authorRepository.FindOneAsync(x => x.NID == form.AuthorNid);
                if (author == null)
                {
                    author = new Author
                    {
                        Id = Guid.NewGuid(),
                        Name = form.AuthorName,
                        NID = form.AuthorNid
                    };
                    await _authorRepository.InsertOneAsync(author);
                }

                // Create petition
                var petition = new PetitionDetail
                {
                    Id = petitionId,
                    Slug = form.Slug,
                    StartDate = startDate,
                    NameDhiv = form.NameDhiv,
                    NameEng = form.NameEng,
                    AuthorId = author.Id,
                    PetitionBodyDhiv = form.PetitionBodyDhiv,
                    PetitionBodyEng = form.PetitionBodyEng,
                    SignatureCount = 0,
                    isApproved = false
                };

                await _petitionRepository.InsertOneAsync(petition);

                // Build markdown file content and save to Petitions folder
                var frontmatter = $"---\nslug: \"{EscapeYaml(form.Slug)}\"\nstartDate: {form.StartDate}\nnameDhiv: \"{EscapeYaml(form.NameDhiv)}\"\nnameEng: \"{EscapeYaml(form.NameEng)}\"\nauthor:\n  name: \"{EscapeYaml(form.AuthorName)}\"\n  nid: \"{EscapeYaml(form.AuthorNid)}\"\n---\n";
                var body = $"## Petition Body (Dhivehi)\n\n{form.PetitionBodyDhiv}\n\n## Petition Body (English)\n\n{form.PetitionBodyEng}\n";
                var fileContent = frontmatter + "\n" + body;

                Directory.CreateDirectory("Petitions");
                var newFileName = $"{Guid.NewGuid()}.md";
                var filePath = Path.Combine("Petitions", newFileName);

                await System.IO.File.WriteAllTextAsync(filePath, fileContent);

                return Ok(new
                {
                    message = "Petition created successfully",
                    petitionId = petitionId,
                    slug = form.Slug,
                    fileName = newFileName,
                    filePath = filePath,
                    authorId = author.Id
                });
            }
            catch (Exception e)
            {
                return Problem(e.Message);
            }
        }


        [HttpGet("get-latest-petitions", Name = "GetLatestPetitions")]
        public IActionResult GetLatestPetitions()
        {
            var latestPetitions = _petitionRepository
                .FilterBy(p => p.isApproved == true)
                .OrderByDescending(p => p.StartDate)
                .Take(10)
                .ToList();

            var dtoList = latestPetitions.Select(p => new SimplePetitionDto
            {
                Id = p.Id,
                Slug = p.Slug,
                Title = p.NameEng,
                Title_Dhiv = p.NameDhiv,
                SignatureCount = p.SignatureCount
            }).ToList();

            return Ok(dtoList);
        }

        private static string EscapeYaml(string value)
        {
            if (string.IsNullOrEmpty(value)) return "";
            return value.Replace("\"", "\\\"");
        }
    }
}
