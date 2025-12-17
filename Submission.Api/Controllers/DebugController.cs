using Ashi.MongoInterface.Service;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Submission.Api.Configuration;
using Submission.Api.Models;
using System.Globalization;
using YamlDotNet.Serialization;
using YamlDotNet.Serialization.NamingConventions;

namespace Submission.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DebugController : ControllerBase
    {
        private readonly PetitionSettings _petitionSettings;
        private readonly IMongoRepository<Author> _authorRepository;
        private readonly IMongoRepository<PetitionDetail> _petitionRepository;

        public DebugController(
            IOptions<PetitionSettings> petitionSettings,
            IMongoRepository<Author> authorRepository,
            IMongoRepository<PetitionDetail> petitionRepository)
        {
            _petitionSettings = petitionSettings.Value;
            _authorRepository = authorRepository;
            _petitionRepository = petitionRepository;
        }

        [HttpGet("petitions", Name = "GetPetitions")]
        public IActionResult GetPetitions()
        {
            try
            {
                var files = Directory.EnumerateFiles("Petitions");
                return Ok(files);
            }
            catch (Exception e)
            {
                return Problem("Petitions Folder not found");
            }
        }


        [HttpGet("petitions-list", Name = "GetPetitionsList")]
        public IActionResult GetPetitionsList()
        {
            var list = _petitionRepository.FilterBy(x => x.Id != null);
            return Ok(list);
        }



        [HttpGet("create-petition-folder", Name = "CreatePetitionFolder")]
        public IActionResult create_petition_folder()
        {
            if (Directory.Exists("Petitions"))
            {
                return Ok("Petitions folder already exists");
            }

            try
            {
                Directory.CreateDirectory("Petitions");
                return Ok("Petitions folder created");
            }
            catch (Exception e)
            {
                return Problem(e.Message);
            }
        }

        [HttpPost("upload-petition", Name = "UploadPetition")]
        public async Task<IActionResult> UploadPetition(IFormFile file)
        {
            // Check if petition creation is allowed
            if (!_petitionSettings.AllowPetitionCreation)
            {
                return StatusCode(403, new { message = "Petition creation is disabled. Set 'PetitionSettings:AllowPetitionCreation' to true in appsettings.json" });
            }

            // Validate file exists
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { message = "No file uploaded" });
            }

            // Validate file extension
            if (!file.FileName.EndsWith(".md", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Only .md files are allowed" });
            }

            try
            {
                // Read file content
                string fileContent;
                using (var reader = new StreamReader(file.OpenReadStream()))
                {
                    fileContent = await reader.ReadToEndAsync();
                }

                // Parse frontmatter and body
                var (frontmatter, body) = ParseMarkdownFile(fileContent);

                if (frontmatter == null)
                {
                    return BadRequest(new { message = "Invalid markdown format. Frontmatter is required." });
                }

                // Parse YAML frontmatter
                var deserializer = new DeserializerBuilder()
                    .WithNamingConvention(CamelCaseNamingConvention.Instance)
                    .Build();

                var metadata = deserializer.Deserialize<Dictionary<string, object>>(frontmatter);

                // Extract values
                var petitionId = Guid.NewGuid();
                var startDateStr = metadata["startDate"].ToString();
                var nameDhiv = metadata["nameDhiv"].ToString();
                var nameEng = metadata["nameEng"].ToString();
                var authorData = metadata["author"] as Dictionary<object, object>;

                var authorName = authorData["name"].ToString();
                var authorNid = authorData["nid"].ToString();

                // Parse start date (format: dd-MM-yyyy)
                var startDate = DateOnly.ParseExact(startDateStr, "dd-MM-yyyy", CultureInfo.InvariantCulture);

                // Parse petition bodies from markdown
                var (petitionBodyDhiv, petitionBodyEng) = ParsePetitionBodies(body);

                // Check if petition already exists
                var existingPetition = await _petitionRepository.FindByIdAsync(petitionId);
                if (existingPetition != null)
                {
                    return Conflict(new { message = $"A petition with ID '{petitionId}' already exists in the database" });
                }

                // Create or get author
                var author = await _authorRepository.FindOneAsync(x => x.NID == authorNid);
                if (author == null)
                {
                    author = new Author
                    {
                        Id = Guid.NewGuid(),
                        Name = authorName,
                        NID = authorNid
                    };
                    await _authorRepository.InsertOneAsync(author);
                }

                // Create petition
                var petition = new PetitionDetail
                {
                    Id = petitionId,
                    StartDate = startDate,
                    NameDhiv = nameDhiv,
                    NameEng = nameEng,
                    AuthorId = author.Id,
                    PetitionBodyDhiv = petitionBodyDhiv,
                    PetitionBodyEng = petitionBodyEng,
                    SignatureCount = 0
                };

                await _petitionRepository.InsertOneAsync(petition);

                // Save file with GUID prefix
                Directory.CreateDirectory("Petitions");
                var newFileName = $"{Guid.NewGuid()}_{file.FileName}";
                var filePath = Path.Combine("Petitions", newFileName);

                await System.IO.File.WriteAllTextAsync(filePath, fileContent);

                return Ok(new
                {
                    message = "Petition created successfully",
                    petitionId = petitionId,
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

        private (string frontmatter, string body) ParseMarkdownFile(string content)
        {
            var lines = content.Split('\n');
            if (lines.Length < 3 || lines[0].Trim() != "---")
            {
                return (null, null);
            }

            var frontmatterLines = new List<string>();
            var bodyLines = new List<string>();
            var inFrontmatter = true;
            var frontmatterClosed = false;

            for (int i = 1; i < lines.Length; i++)
            {
                if (lines[i].Trim() == "---" && inFrontmatter)
                {
                    inFrontmatter = false;
                    frontmatterClosed = true;
                    continue;
                }

                if (inFrontmatter)
                {
                    frontmatterLines.Add(lines[i]);
                }
                else
                {
                    bodyLines.Add(lines[i]);
                }
            }

            if (!frontmatterClosed)
            {
                return (null, null);
            }

            return (string.Join("\n", frontmatterLines), string.Join("\n", bodyLines));
        }

        private (string dhivehiBody, string englishBody) ParsePetitionBodies(string body)
        {
            var dhivehiBody = "";
            var englishBody = "";

            var sections = body.Split("##", StringSplitOptions.RemoveEmptyEntries);

            foreach (var section in sections)
            {
                var trimmed = section.Trim();
                if (trimmed.StartsWith("Petition Body (Dhivehi)", StringComparison.OrdinalIgnoreCase))
                {
                    dhivehiBody = trimmed.Replace("Petition Body (Dhivehi)", "").Trim();
                }
                else if (trimmed.StartsWith("Petition Body (English)", StringComparison.OrdinalIgnoreCase))
                {
                    englishBody = trimmed.Replace("Petition Body (English)", "").Trim();
                }
            }

            return (dhivehiBody, englishBody);
        }
    }
}
