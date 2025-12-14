# WPetition Submission API

a self hostable e petition system to collect signatures for your cause.   

## why make this
maldives parliment promised the release of a e-petition system powered by efass will be released months ago and then never released it   
i said fuck it i want data protection bill so i made this simple signature collection system since the law doesnt care if youre signature is signed digitally or via wet ink.   

## nerd shit
A petition signing API built with ASP.NET Core 9.0 that allows users to sign petitions and retrieve petition details. Features rate limiting to prevent spam and duplicate signature detection.

## Features

- Sign petitions with digital signatures
- Retrieve petition details including author information
- Rate limiting (3 signatures per minute per IP)
- Duplicate signature prevention (one signature per ID card)
- MongoDB backend for data persistence
- Docker support for easy deployment
- Bilingual support (Dhivehi and English)

## Prerequisites

- .NET 9.0 SDK
- MongoDB instance
- Docker (optional, for containerized deployment)

## Configuration

### MongoDB Setup

refer to the details below

### Application Configuration

Update `appsettings.json` with your MongoDB connection settings:

```json
{
  "PetitionSettings": {
    "AllowPetitionCreation": true
  },
  "MongoDbSettings": {
    "ConnectionString": "mongodb://localhost:27017",
    "DatabaseName": "petition_database"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

by default `AllowPetitionCreation` is true. you must upload your Petition to the debug controller and then shut down the server and set this value to false and reboot or anyone will be able to submit petitions. 

check out `sample.Petition.md` on how to structure your petition so it will be accepted by the server

### Rate Limiting Configuration

The API is configured with rate limiting to prevent spam. Default settings in `Program.cs`:

- **Limit**: 3 signatures per minute per IP address
- **Window**: Fixed 1-minute window
- **Queue**: Disabled (requests over limit receive HTTP 429)

To modify rate limits, edit `Program.cs`:

```csharp
limiterOptions.PermitLimit = 3;  // Change this number
limiterOptions.Window = TimeSpan.FromMinutes(1);  // Change time window
```

## Installation

### Local Development

1. Clone the repository:
```bash
git clone <repository-url>
cd Submission.Api
```

2. Restore dependencies:
```bash
dotnet restore
```

3. Update `appsettings.json` with your MongoDB connection string

4. Run the application:
```bash
dotnet run --project Submission.Api
```

The API will be available at:
- HTTPS: `https://localhost:7xxx`
- HTTP: `http://localhost:5xxx`

### Docker Deployment

1. Build the Docker image:
```bash
docker build -t petition-api .
```

2. Run the container:
```bash
docker run -d -p 8080:8080 -p 8081:8081 \
  -e MongoDbSettings__ConnectionString="mongodb://your-mongo-host:27017" \
  -e MongoDbSettings__DatabaseName="petition_database" \
  petition-api
```

## API Endpoints

### Sign a Petition

Signs a petition with user information and signature.

**Endpoint**: `POST /api/Sign`

**Rate Limit**: 3 requests per minute per IP

**Request Body**:
```json
{
  "name": "John Doe",
  "idCard": "A123456",
  "signature": "<svg>...</svg>"
}
```

**Field Validation**:
- `name`: Required, minimum 3 characters
- `idCard`: Required, 6-7 characters (typically National ID)
- `signature`: Required, SVG signature data

**Success Response** (200 OK):
```json
{}
```

**Error Responses**:

- **400 Bad Request** - Invalid request body or validation failed
```json
{
  "errors": {
    "name": ["The field Name must be a string with a minimum length of 3."],
    "idCard": ["The field IdCard must be a string with a minimum length of 6 and a maximum length of 7."]
  }
}
```

- **429 Too Many Requests** - Rate limit exceeded
```json
{
  "status": 429,
  "title": "Too Many Requests"
}
```

- **500 Internal Server Error** - User already signed the petition
```json
{
  "title": "You already signed this petition"
}
```

### Get Petition Details

Retrieves details of a specific petition including author information.

**Endpoint**: `GET /api/Sign/{petition_id}`

**URL Parameters**:
- `petition_id` (GUID) - The unique identifier of the petition

**Success Response** (200 OK):
```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "startDate": "2025-01-15",
  "nameDhiv": "ޕެޓިޝަން ނަން",
  "nameEng": "Petition Name",
  "authorDetails": {
    "name": "Author Name",
    "nid": "A123456"
  },
  "petitionBodyDhiv": "ޕެޓިޝަން ތަފްސީލް...",
  "petitionBodyEng": "Petition description...",
  "signatureCount": 0
}
```

**Error Response**:

- **404 Not Found** - Petition does not exist
```json
{}
```


## Security Features

### Rate Limiting
- Prevents spam by limiting signature submissions to 3 per minute per IP
- Uses ASP.NET Core built-in rate limiting middleware
- Returns HTTP 429 when limit is exceeded

### Duplicate Prevention
- Each ID card can only sign a petition once
- Checked before inserting into database
- Returns error message if duplicate detected

### Input Validation
- Name: Minimum 3 characters
- ID Card: Must be 6-7 characters (validates National ID format)
- Signature: Required field

## Development

### Project Structure
```
Submission.Api/
├── Controllers/
│   └── SignController.cs       # API endpoints
├── Dto/
│   ├── WidgetsDto.cs           # Signature request DTO
│   ├── PetitionDetailsDto.cs   # Petition response DTO
│   └── Author.cs               # Author DTO
├── Models/
│   ├── Widget.cs               # Signature database model
│   ├── PetitionDetail.cs       # Petition database model
│   └── Author.cs               # Author database model
├── Program.cs                  # Application configuration
├── Dockerfile                  # Docker configuration
└── appsettings.json           # Application settings
```

### Dependencies
- ASP.NET Core 9.0
- MongoDB Driver (via Ashi.MongoInterface)
- Microsoft.AspNetCore.OpenApi 9.0.11
- Microsoft.AspNetCore.RateLimiting (built-in)

## Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Verify MongoDB is running
- Check connection string in `appsettings.json`
- Ensure network connectivity to MongoDB instance

## Contributing

When contributing to this project:
1. Follow existing code style and conventions
2. Test all endpoints thoroughly
3. Update documentation for any API changes
4. Ensure rate limiting is not disabled in production

## License

if you use this you must mention that its powered by Mv Devs Union 

also any forks must be open source 

this must never be used for data collection and profiling people 

## Support

For issues or questions, please open an issue on the repository.
