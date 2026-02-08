using Ashi.MongoInterface.Service;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Submission.Api.Configuration;
using Submission.Api.Dto;
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




        [HttpPost("svg-debug", Name = "SvgDebug")]
        public async Task<IActionResult> SVG_TEST([FromForm]string svg)
        {
            // SVG validation: reject bad/malicious SVGs before persisting
            if (!Submission.Api.Services.SvgValidator.TryValidate(svg, out var svgError))
            {
                return BadRequest($"Invalid signature SVG: {svgError}");
            }
            return Ok("Valid SVG");
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
