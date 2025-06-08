# Build
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project files
COPY backend/ backend/
COPY blink-http/ blink-http/

# Build blink-http
RUN dotnet publish blink-http/BlinkHttp.sln -c Release

# Publish in release
RUN dotnet publish backend/nomnom.sln -c Release -o /app/publish

# Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish ./
COPY docker/restaurants /app/data/restaurants

ENTRYPOINT ["dotnet", "nomnom.dll"]
