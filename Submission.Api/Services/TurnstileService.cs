using Microsoft.Extensions.Options;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Submission.Api.Services
{
    public class TurnstileSettings
    {
        public string SecretKey { get; set; } = string.Empty;
    }

    public class TurnstileService
    {
        private readonly HttpClient _httpClient;
        private readonly string _secretKey;
        private readonly IWebHostEnvironment _env;
        private const string SiteverifyUrl = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

        public TurnstileService(HttpClient httpClient, IOptions<TurnstileSettings> options, IWebHostEnvironment env)
        {
            _httpClient = httpClient;
            _secretKey = options?.Value?.SecretKey ?? throw new ArgumentNullException(nameof(options), "Turnstile:SecretKey must be configured in appsettings.json");
            _env = env;
        }

        public async Task<TurnstileResponse> ValidateTokenAsync(string token, string remoteip = null)
        {
            if (_env.IsDevelopment() && token == "DEV_BYPASS_TOKEN")
            {
                return new TurnstileResponse { Success = true };
            }

            var parameters = new Dictionary<string, string>
            {
                { "secret", _secretKey },
                { "response", token }
            };

            if (!string.IsNullOrEmpty(remoteip))
            {
                parameters.Add("remoteip", remoteip);
            }

            var postContent = new FormUrlEncodedContent(parameters);

            try
            {
                var response = await _httpClient.PostAsync(SiteverifyUrl, postContent);
                var stringContent = await response.Content.ReadAsStringAsync();

                Console.WriteLine("Turnstile response: " + stringContent);

                // deserialize with case-insensitive option; mapping for "error-codes" is handled by attribute on ErrorCodes
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                return JsonSerializer.Deserialize<TurnstileResponse>(stringContent, options);
            }
            catch (Exception)
            {
                return new TurnstileResponse
                {
                    Success = false,
                    ErrorCodes = new[] { "internal-error" }
                };
            }
        }
    }

    public class TurnstileResponse
    {
        [JsonPropertyName("success")]
        public bool Success { get; set; }

        // Cloudflare returns "error-codes" (with a hyphen) — map it explicitly
        [JsonPropertyName("error-codes")]
        public string[] ErrorCodes { get; set; }

        [JsonPropertyName("challenge_ts")]
        public string ChallengeTs { get; set; }

        public string Hostname { get; set; }

        public string Action { get; set; }

        // "cdata" may be present
        public string Cdata { get; set; }

        // metadata is optional and can be an object
        public JsonElement? Metadata { get; set; }
    }
}
