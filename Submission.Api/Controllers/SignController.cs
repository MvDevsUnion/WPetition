using System.CodeDom;
using System.Runtime.InteropServices;
using Ashi.MongoInterface.Service;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Caching.Memory;
using Submission.Api.Dto;
using Submission.Api.Models;

namespace Submission.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SignController : ControllerBase
    {
        
        private readonly IMongoRepository<Author> _authorRepository;
        private readonly IMongoRepository<PetitionDetail> _detailRepository;
        private readonly IMongoRepository<Widget> _signatureRepository;
        private readonly IMemoryCache _cache;

        public SignController(
            IMongoRepository<Author> authorRepository,
            IMongoRepository<PetitionDetail> detailRepository,
            IMongoRepository<Widget> signatureRepository,
            IMemoryCache cache)
        {
            _authorRepository = authorRepository;
            _detailRepository = detailRepository;
            _signatureRepository = signatureRepository;
            _cache = cache;
        }

        [HttpPost(Name = "petition/{id}")]
        [EnableRateLimiting("SignPetitionPolicy")]
        public async Task<IActionResult> SignDisHoe([FromRoute]Guid petition_id,[FromBody] WidgetsDto body)
        {
            //check to see if the same person signed the petition already
            //if dupe send error saying user already signed 
             var dupe = await _signatureRepository.FindOneAsync(x => x.IdCard == body.IdCard);
             if (dupe != null)
                 return Problem("You already signed this petition");
             
            //add signature to the db
            await _signatureRepository.InsertOneAsync(new Widget
            {
                IdCard = body.IdCard,
                Name = body.Name,
                Signature_SVG = body.Signature,
                Timestamp = DateTime.Now
            });
            
            //update signature count 
            
            return Ok("your signature has been submitted");
        }

        [HttpGet(Name = "petition/{id}")]
        public async Task<IActionResult>  GetDisHoe([FromRoute] Guid petition_id)
        {
            var cacheKey = $"petition_{petition_id}";

            // Try to get from cache
            if (_cache.TryGetValue(cacheKey, out PetitionDetailsDto cachedDto))
            {
                return Ok(cachedDto);
            }

            // Not in cache, fetch from database
            var pet =  await _detailRepository.FindByIdAsync(petition_id);

            if (pet == null)
                return NotFound();

            var author = await _authorRepository.FindOneAsync(x => x.Id == pet.AuthorId);

            var dto = new PetitionDetailsDto
            {
                Id = petition_id,
                NameDhiv = pet.NameDhiv,
                StartDate = pet.StartDate,
                NameEng = pet.NameEng,
                PetitionBodyDhiv = pet.PetitionBodyDhiv,
                PetitionBodyEng = pet.PetitionBodyEng,

                AuthorDetails = new AuthorsDto
                {
                    Name = author.Name,
                    NID = author.NID,
                }
            };

            // Store in cache with 5 minute expiration
            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromHours(12));

            _cache.Set(cacheKey, dto, cacheOptions);

            return Ok(dto);
        }
    }
}
