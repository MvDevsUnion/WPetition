# WPetition

a self hostable e-petition system to collect signatures for your cause.
this is made to be hosted by the person running the petition and not as a full on petition platform.
you will still have to export the signatures and submit it to the parliament.
for more info check out https://majlis.gov.mv/en/pes/petitions

## why make this

maldives parliament promised the release of a e-petition system powered by efass will be released months ago and then never released it
i said fuck it i want data protection bill so i made this simple signature collection system since the law doesnt care if your signature is signed digitally or via wet ink.

## features

- sign petitions with digital signatures (SVG)
- bilingual support (Dhivehi and English)
- rate limiting (3 signatures per minute per IP)
- duplicate signature prevention (one signature per ID card per petition)
- Cloudflare Turnstile bot protection
- SVG signature security validation (blocks XSS, scripts, external URIs)
- admin dashboard with JWT authentication
- export signatures as printable HTML for parliament submission
- petition approval workflow
- slug-based petition URLs
- MongoDB backend
- Docker support

## tech stack

| component | tech |
|-----------|------|
| API | ASP.NET Core 9.0 |
| Frontend | React 19 + TypeScript + Vite + TailwindCSS |
| Database | MongoDB |
| Bot protection | Cloudflare Turnstile |
| Auth | JWT (HS256, 24h expiry) |
| Web server | Nginx |
| Container | Docker |

## how to selfhost this

### 1. configure appsettings

update `appsettings.json` (or `appsettings.Production.json` for docker) with your settings:

```json
{
  "Turnstile": {
    "SecretKey": "your-turnstile-secret-key"
  },
  "PetitionSettings": {
    "AllowPetitionCreation": true
  },
  "MongoDbSettings": {
    "ConnectionString": "mongodb://localhost:27017",
    "DatabaseName": "petition_database"
  },
  "AdminSettings": {
    "Username": "your-admin-username",
    "Password": "a-strong-password"
  },
  "Jwt": {
    "Key": "a-sufficiently-long-secret-key-at-least-32-chars",
    "Issuer": "SubmissionApi"
  }
}
```

> **important:** change the default admin credentials and JWT key before deploying to production.

### 2. create a petition

head to the frontend and use the petition creation form to submit your petition with all the details (title, body in Dhivehi and English, author info, start date). the form handles Turnstile verification automatically.

you'll get back a petition ID once it's created:
```json
{
  "message": "Petition created successfully",
  "petitionId": "13921eaa-aea4-4d74-a0f5-52a81c5e7355"
}
```

### 3. lock down petition creation

go to `appsettings.json` and set this to false:

```json
"PetitionSettings": {
  "AllowPetitionCreation": false
}
```

restart the server. this prevents anyone from creating new petitions.

### 4. approve the petition

login to the admin dashboard and approve your petition, or use the API directly:

```bash
# get a token
curl -X POST 'http://localhost:5299/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"username": "your-username", "password": "your-password"}'

# approve the petition
curl -X PATCH 'http://localhost:5299/api/admin/petitions/{petition_id}/approve' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"IsApproved": true}'
```

### 5. share

petitions can be accessed by ID or slug:
- `www.yourdomain.com/?id={petition_id}`
- `www.yourdomain.com/{slug}`

## docker compose

```yaml
services:
  api:
    image: git.shihaam.dev/mvdevsunion/wpetition/api:latest
    restart: unless-stopped
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ASPNETCORE_URLS=http://+:9755
      - MongoDbSettings__ConnectionString=mongodb://admin:yourpassword@mongodb:27017
    depends_on:
      - mongodb
    volumes:
      - ./data/api/config/appsettings.Production.json:/app/appsettings.Production.json:ro

  frontend:
    image: git.shihaam.dev/mvdevsunion/wpetition/frontend:latest
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - api
    volumes:
      - ./data/frontend/index.html:/usr/share/nginx/html/index.html

  mongodb:
    image: mongo:latest
    restart: unless-stopped
    volumes:
      - ./data/mongodb:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=yourpassword
```

## local development

```bash
# restore dependencies
dotnet restore

# run the api
dotnet run --project Submission.Api
```

the API will be available with Swagger UI at `http://localhost:5xxx/swagger`

## API overview

### public endpoints

| method | endpoint | description |
|--------|----------|-------------|
| `POST` | `/api/Sign/petition/{id}` | sign a petition (rate limited: 3/min) |
| `GET` | `/api/Sign/petition/{id}` | get petition details by ID |
| `GET` | `/api/Sign/petition/by-slug/{slug}` | get petition details by slug |
| `POST` | `/api/Petition/upload-petition-form` | create a new petition |
| `GET` | `/api/Petition/get-latest-petitions` | get 10 most recent approved petitions |

### admin endpoints (JWT required)

| method | endpoint | description |
|--------|----------|-------------|
| `POST` | `/api/auth/login` | authenticate and get JWT token |
| `GET` | `/api/admin/petitions` | list all petitions |
| `GET` | `/api/admin/export/{id}` | export signatures as printable HTML |
| `PATCH` | `/api/admin/petitions/{id}/approve` | approve/unapprove a petition |

for detailed admin API docs, see [ADMIN_API.md](ADMIN_API.md).

## security

- **rate limiting** - 3 signatures per minute per IP (fixed window)
- **Cloudflare Turnstile** - bot protection on form submissions
- **SVG validation** - blocks `<script>`, `<foreignObject>`, `<iframe>`, event handlers, `javascript:` URIs, and external resources in signature SVGs
- **duplicate prevention** - one signature per ID card per petition
- **JWT auth** - HS256 with 24h expiry for admin endpoints
- **input validation** - name (min 3 chars), ID card (6-7 chars)

## project structure

```
├── Submission.Api/
│   ├── Controllers/
│   │   ├── SignController.cs        # petition signing & retrieval
│   │   ├── PetitionController.cs    # petition creation & listing
│   │   ├── AdminController.cs       # admin dashboard endpoints
│   │   ├── AuthController.cs        # JWT authentication
│   │   └── DebugController.cs       # debug utilities
│   ├── Models/                      # MongoDB document models
│   ├── Dto/                         # request/response DTOs
│   ├── Services/
│   │   ├── TurnstileService.cs      # Cloudflare Turnstile verification
│   │   └── SvgValidator.cs          # SVG security validation
│   └── Configuration/              # settings classes
├── frontend-react/                  # React frontend
├── nginx/                           # nginx config
└── compose.yaml                     # docker compose
```

## troubleshooting

**MongoDB Connection Failed**
- verify MongoDB is running
- check connection string in `appsettings.json`
- ensure network connectivity to MongoDB instance

**Petition not showing up**
- make sure the petition has been approved via the admin dashboard
- only approved petitions appear in the public listings

**Rate limit hit (429)**
- the API allows 3 signatures per minute per IP
- wait a minute and try again

## contributing

when contributing to this project:
1. follow existing code style and conventions
2. test all endpoints thoroughly
3. update documentation for any API changes
4. ensure rate limiting is not disabled in production

## license

[Must include Powered by Mv Devs Union](https://github.com/MvDevsUnion/.github/blob/main/LICENSE.md)
also any forks must be open source
this must never be used for data collection and profiling people

## support

for issues or questions, please open an issue on the repository.
