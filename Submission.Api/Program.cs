using Ashi.MongoInterface;
using Ashi.MongoInterface.Service;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;
using Submission.Api.Configuration;
using Submission.Api.Controllers;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection("MongoDbSettings"));
builder.Services.Configure<PetitionSettings>(builder.Configuration.GetSection("PetitionSettings"));
builder.Services.Configure<TurnstileSettings>(builder.Configuration.GetSection("Turnstile"));

builder.Services.AddSingleton<IMongoDbSettings>(serviceProvider =>
    serviceProvider.GetRequiredService<IOptions<MongoDbSettings>>().Value);

builder.Services.AddScoped((typeof(IMongoRepository<>)), typeof(MongoRepository<>));

builder.Services.AddMemoryCache();

builder.Services.AddControllers();
// Add Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register TurnstileService with typed HttpClient
builder.Services.AddHttpClient<TurnstileService>();

// Add rate limiting
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("SignPetitionPolicy", limiterOptions =>
    {
        limiterOptions.PermitLimit = 3;
        limiterOptions.Window = TimeSpan.FromMinutes(1);
        limiterOptions.QueueProcessingOrder = System.Threading.RateLimiting.QueueProcessingOrder.OldestFirst;
        limiterOptions.QueueLimit = 0;
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
//if (app.Environment.IsDevelopment())
//{
app.UseSwagger();
app.UseSwaggerUI();
//}

app.UseHttpsRedirection();

app.UseRateLimiter();

app.UseAuthorization();

app.MapControllers();

app.Run();