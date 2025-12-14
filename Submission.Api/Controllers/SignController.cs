using Ashi.MongoInterface.Service;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Caching.Memory;
using MongoDB.Driver;
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
        private readonly IMongoRepository<Signature> _signatureRepository;
        private readonly IMemoryCache _cache;

        public SignController(
            IMongoRepository<Author> authorRepository,
            IMongoRepository<PetitionDetail> detailRepository,
            IMongoRepository<Signature> signatureRepository,
            IMemoryCache cache)
        {
            _authorRepository = authorRepository;
            _detailRepository = detailRepository;
            _signatureRepository = signatureRepository;
            _cache = cache;
        }

        [HttpPost("petition/{petition_id}", Name = "SignPetition")]
        [EnableRateLimiting("SignPetitionPolicy")]
        public async Task<IActionResult> SignDisHoe([FromRoute] Guid petition_id, [FromBody] WidgetsDto body)
        {
            var cacheKey = $"petition_{petition_id}";

            var pet = await _detailRepository.FindByIdAsync(petition_id);

            if (pet == null)
                return NotFound();

            //TODO : add svg validation 


            //check to see if the same person signed the petition already
            //if dupe send error saying user already signed 
            var dupe = await _signatureRepository.FindOneAsync(x => x.IdCard == body.IdCard);
            if (dupe != null)
                return Problem("You already signed this petition");

            //add signature to the db
            await _signatureRepository.InsertOneAsync(new Signature
            {
                IdCard = body.IdCard,
                Name = body.Name,
                Signature_SVG = body.Signature,
                Timestamp = DateTime.Now,
                PetitionId = petition_id
            });

            //update signature count 
            if (pet.SignatureCount == null)
            {
                pet.SignatureCount = 0;
            }

            var count_update_filter = Builders<PetitionDetail>.Filter.Eq("_id", petition_id);
            var Countupdate = Builders<PetitionDetail>.Update.Inc("SignatureCount", 1);
            await _detailRepository.UpdateOneAsync(count_update_filter, Countupdate);

            _cache.Remove(cacheKey);

            return Ok("your signature has been submitted");
        }

        [HttpGet("petition/{petition_id}", Name = "GetPetition")]
        public async Task<IActionResult> GetDisHoe([FromRoute] Guid petition_id)
        {
            var cacheKey = $"petition_{petition_id}";

            // Try to get from cache
            if (_cache.TryGetValue(cacheKey, out PetitionDetailsDto cachedDto))
            {
                return Ok(cachedDto);
            }

            // Not in cache, fetch from database
            var pet = await _detailRepository.FindByIdAsync(petition_id);

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
                },

                SignatureCount = pet.SignatureCount
            };

            // Store in cache with 5 minute expiration
            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromHours(1));

            _cache.Set(cacheKey, dto, cacheOptions);

            return Ok(dto);
        }
    }
}
