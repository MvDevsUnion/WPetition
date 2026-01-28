using Ashi.MongoInterface.Service;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Caching.Memory;
using MongoDB.Driver;
using Submission.Api.Dto;
using Submission.Api.Models;
using Submission.Api.Services;

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
        public readonly TurnstileService _turnstileService;

        public SignController(
            IMongoRepository<Author> authorRepository,
            IMongoRepository<PetitionDetail> detailRepository,
            IMongoRepository<Signature> signatureRepository,
            IMemoryCache cache, TurnstileService turnstileService)
        {
            _authorRepository = authorRepository;
            _detailRepository = detailRepository;
            _signatureRepository = signatureRepository;
            _cache = cache;
            _turnstileService = turnstileService;
        }

        [HttpPost("petition/{petition_id}", Name = "SignPetition")]
        [EnableRateLimiting("SignPetitionPolicy")]
        public async Task<IActionResult> SignDisHoe([FromRoute] Guid petition_id, [FromBody] WidgetsDto body)
        {
            var remoteip = HttpContext.Request.Headers["CF-Connecting-IP"].FirstOrDefault() ??
                   HttpContext.Request.Headers["X-Forwarded-For"].FirstOrDefault() ??
                   HttpContext.Connection.RemoteIpAddress?.ToString();

            if (body.turnstileToken == null)
                return BadRequest("Turnstile token is missing");

            Console.WriteLine("Token received: " + body.turnstileToken);

            var validation = await _turnstileService.ValidateTokenAsync(body.turnstileToken, remoteip);

            if (validation.Success)
            {
              //  var cacheKey = $"petition_{petition_id}";

                var pet = await _detailRepository.FindByIdAsync(petition_id);

//                var SlugcacheKey = $"petition_slug_{pet.Slug}";


                if (pet == null)
                    return NotFound();

                // SVG validation: reject bad/malicious SVGs before persisting
                if (!Submission.Api.Services.SvgValidator.TryValidate(body.Signature, out var svgError))
                {
                    return BadRequest($"Invalid signature SVG: {svgError}");
                }

                //check to see if the same person signed the petition already
                //if dupe send error saying user already signed 
                var dupe = await _signatureRepository.FindOneAsync(x => x.IdCard == body.IdCard && x.PetitionId == petition_id);
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

              //  _cache.Remove(cacheKey);
                //_cache.Remove(SlugcacheKey);

                return Ok("your signature has been submitted");
            }
            else
            {
                // Invalid token - reject submission
                // Make joining error codes null-safe to avoid ArgumentNullException
                var errorCodes = validation?.ErrorCodes;
                var errors = (errorCodes != null && errorCodes.Length > 0)
                    ? string.Join(", ", errorCodes)
                    : "unknown";
                return BadRequest($"Verification failed: {errors}");
            }
        }

        [HttpGet("petition/{petition_id}", Name = "GetPetition")]
        public async Task<IActionResult> GetDisHoe([FromRoute] Guid petition_id)
        {
            //var cacheKey = $"petition_{petition_id}";

            //// Try to get from cache
            //if (_cache.TryGetValue(cacheKey, out PetitionDetailsDto cachedDto))
            //{
            //    return Ok(cachedDto);
            //}

            // Not in cache, fetch from database
            var pet = await _detailRepository.FindByIdAsync(petition_id);

            if (pet == null)
                return NotFound();

            var author = await _authorRepository.FindOneAsync(x => x.Id == pet.AuthorId);

            var dto = new PetitionDetailsDto
            {
                Id = petition_id,
                Slug = pet.Slug,
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
           // var cacheOptions = new MemoryCacheEntryOptions()
           //     .SetAbsoluteExpiration(TimeSpan.FromHours(1));

           // _cache.Set(cacheKey, dto, cacheOptions);

            return Ok(dto);
        }

        [HttpGet("petition/by-slug/{slug}", Name = "GetPetitionBySlug")]
        public async Task<IActionResult> GetPetitionBySlug([FromRoute] string slug)
        {
            //var cacheKey = $"petition_slug_{slug}";

            //// Try to get from cache
            //if (_cache.TryGetValue(cacheKey, out PetitionDetailsDto cachedDto))
            //{
            //    return Ok(cachedDto);
            //}

            // Not in cache, fetch from database by slug
            var pet = await _detailRepository.FindOneAsync(x => x.Slug == slug);

            if (pet == null)
                return NotFound();

            var author = await _authorRepository.FindOneAsync(x => x.Id == pet.AuthorId);

            var dto = new PetitionDetailsDto
            {
                Id = pet.Id,
                Slug = pet.Slug,
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

            //// Store in cache with 1 hour expiration
            //var cacheOptions = new MemoryCacheEntryOptions()
            //    .SetAbsoluteExpiration(TimeSpan.FromHours(1));

            //_cache.Set(cacheKey, dto, cacheOptions);

            return Ok(dto);
        }
    }
}
