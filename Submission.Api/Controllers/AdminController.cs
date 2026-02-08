using Ashi.MongoInterface.Service;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Submission.Api.Configuration;
using Submission.Api.Dto;
using Submission.Api.Models;

namespace Submission.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AdminController : ControllerBase
    {
        private readonly PetitionSettings _petitionSettings;
        private readonly IMongoRepository<Author> _authorRepository;
        private readonly IMongoRepository<PetitionDetail> _petitionRepository;
        private readonly IMongoRepository<Signature> _signatureRepository;
        public AdminController(IOptions<PetitionSettings> petitionSettings, IMongoRepository<Author> authorRepository, IMongoRepository<PetitionDetail> petitionRepository, IMongoRepository<Signature> signatureRepository)
        {
            _petitionSettings = petitionSettings.Value;
            _authorRepository = authorRepository;
            _petitionRepository = petitionRepository;
            _signatureRepository = signatureRepository;
        }

        [HttpGet("petitions", Name = "GetPetitions")]
        public IActionResult GetPetitions()
        {
            try
            {
              var petitions =  _petitionRepository.FilterBy(x => x.Id != null);
              return Ok(petitions);
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



        [HttpGet("export/{petition_id}", Name = "ExportSignatures")]
        public async Task<IActionResult> ExportSignatures([FromRoute] Guid petition_id)
        {
            var petition = await _petitionRepository.FindByIdAsync(petition_id);
            if (petition == null)
                return NotFound("Petition not found");

            var signatures = _signatureRepository.FilterBy(x => x.PetitionId == petition_id)
                .OrderBy(x => x.Timestamp)
                .ToList();

            var rows = new System.Text.StringBuilder();
            int index = 1;
            foreach (var sig in signatures)
            {
                rows.Append($@"
                <tr>
                    <td>{index++}</td>
                    <td>{System.Net.WebUtility.HtmlEncode(sig.Name)}</td>
                    <td>{System.Net.WebUtility.HtmlEncode(sig.IdCard)}</td>
                    <td>{sig.Timestamp:yyyy-MM-dd}</td>
                    <td class=""sig-cell"">{sig.Signature_SVG}</td>
                </tr>");
            }

            var html = $@"<!DOCTYPE html>
<html>
<head>
    <meta charset=""utf-8"" />
    <title>Signatures - {System.Net.WebUtility.HtmlEncode(petition.NameEng)}</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        h1 {{ font-size: 1.4em; }}
        table {{ border-collapse: collapse; width: 100%; }}
        th, td {{ border: 1px solid #ccc; padding: 8px; text-align: left; vertical-align: middle; }}
        th {{ background: #f5f5f5; }}
        .sig-cell {{ width: 220px; height: 90px; }}
        .sig-cell svg {{ max-width: 100%; max-height: 100%; display: block; }}
        @media print {{ body {{ margin: 0; }} }}
    </style>
</head>
<body>
    <script>
        document.addEventListener('DOMContentLoaded', function() {{
            document.querySelectorAll('.sig-cell svg').forEach(function(svg) {{
                var w = svg.getAttribute('width');
                var h = svg.getAttribute('height');
                if (!svg.getAttribute('viewBox') && w && h) {{
                    svg.setAttribute('viewBox', '0 0 ' + parseFloat(w) + ' ' + parseFloat(h));
                }}
                svg.removeAttribute('width');
                svg.removeAttribute('height');
                svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            }});
        }});
    </script>
    <h1>Signatures for: {System.Net.WebUtility.HtmlEncode(petition.NameEng)}</h1>
    <p>Total signatures: {signatures.Count}</p>
    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Name</th>
                <th>ID Card</th>
                <th>Date Signed</th>
                <th>Signature</th>
            </tr>
        </thead>
        <tbody>
            {rows}
        </tbody>
    </table>
</body>
</html>";

            return Content(html, "text/html");
        }
        [HttpPatch("petitions/{petition_id}/approve")]
        public async Task<IActionResult> ApprovePetition([FromRoute] Guid petition_id, [FromBody] ApprovalDto body)
        {
            var petition = await _petitionRepository.FindByIdAsync(petition_id);
            if (petition == null)
                return NotFound("Petition not found");

            petition.isApproved = body.IsApproved;
            await _petitionRepository.ReplaceOneAsync(petition);

            return Ok(petition);
        }
    }
}
