# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy solution file
COPY Backend/*.sln ./Backend/

# Copy project files
COPY Backend/KymWantsAPI.Domain/*.csproj ./Backend/KymWantsAPI.Domain/
COPY Backend/KymWantsAPI.Application/*.csproj ./Backend/KymWantsAPI.Application/
COPY Backend/KymWantsAPI.Infrastructure/*.csproj ./Backend/KymWantsAPI.Infrastructure/
COPY Backend/KymWantsAPI.Presentation/*.csproj ./Backend/KymWantsAPI.Presentation/

# Restore using the exact solution file path from /src
RUN dotnet restore Backend/*.sln

# Copy the rest of the source code
COPY Backend/ ./Backend/

# Publish the startup project directly
RUN dotnet publish Backend/KymWantsAPI.Presentation/KymWantsAPI.Presentation.csproj -c Release -o /app/out

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .

# Render exposes PORT via environment variable
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "KymWantsAPI.Presentation.dll"]