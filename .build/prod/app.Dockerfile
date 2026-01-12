FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 9755
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
ARG CI_COMMIT_SHORT_SHA
ARG CI_COMMIT_SHA
ARG CI_COMMIT_BRANCH
WORKDIR /src
COPY ["Submission.Api/Submission.Api.csproj", "Submission.Api/"]
RUN dotnet restore "Submission.Api/Submission.Api.csproj"
COPY . .
WORKDIR "/src/Submission.Api"
RUN dotnet build "./Submission.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Submission.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
ARG CI_COMMIT_SHORT_SHA
ARG CI_COMMIT_SHA
ARG CI_COMMIT_BRANCH
ENV CI_COMMIT_SHORT_SHA=$CI_COMMIT_SHORT_SHA
ENV CI_COMMIT_SHA=$CI_COMMIT_SHA
ENV CI_COMMIT_BRANCH=$CI_COMMIT_BRANCH
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Submission.Api.dll"]
