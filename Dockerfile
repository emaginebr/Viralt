FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["Viralt.API/Viralt.API.csproj", "Viralt.API/"]
COPY ["Viralt.Application/Viralt.Application.csproj", "Viralt.Application/"]
COPY ["Viralt.Domain/Viralt.Domain.csproj", "Viralt.Domain/"]
COPY ["Viralt.DTO/Viralt.DTO.csproj", "Viralt.DTO/"]
COPY ["Viralt.Infra/Viralt.Infra.csproj", "Viralt.Infra/"]
COPY ["Viralt.Infra.Interfaces/Viralt.Infra.Interfaces.csproj", "Viralt.Infra.Interfaces/"]
COPY ["Viralt.BackgroundService/Viralt.BackgroundService.csproj", "Viralt.BackgroundService/"]
RUN dotnet restore "Viralt.API/Viralt.API.csproj"
COPY . .
WORKDIR "/src/Viralt.API"
RUN dotnet build "Viralt.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Viralt.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Viralt.API.dll"]
