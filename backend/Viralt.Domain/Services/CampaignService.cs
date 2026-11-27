using Viralt.Domain.Interfaces.Services;
using Viralt.Domain.Models;
using Viralt.Domain.Utils;
using Viralt.DTO.Campaign;
using Viralt.Infra.Interfaces.Repository;

namespace Viralt.Domain.Services;

public class CampaignService : ICampaignService
{
    private readonly ICampaignRepository<Campaign> _repository;

    public CampaignService(ICampaignRepository<Campaign> repository)
    {
        _repository = repository;
    }

    public CampaignInfo Insert(CampaignInfo dto)
    {
        var model = MapToModel(dto);

        if (!string.IsNullOrWhiteSpace(dto.Title) && string.IsNullOrWhiteSpace(dto.Slug))
        {
            model.Slug = SlugHelper.GerarSlug(dto.Title);
        }

        var saved = _repository.Insert(model);
        return MapToDto(saved);
    }

    public CampaignInfo Update(CampaignInfo dto)
    {
        var model = MapToModel(dto);
        var updated = _repository.Update(model);
        return MapToDto(updated);
    }

    public CampaignInfo GetById(long campaignId)
    {
        var model = _repository.GetById(campaignId);
        return MapToDto(model);
    }

    public CampaignInfo GetBySlug(string slug)
    {
        var model = _repository.GetBySlug(slug);
        return MapToDto(model);
    }

    public List<CampaignInfo> ListCampaigns(int take)
    {
        return _repository.ListCampaigns(take).Select(MapToDto).ToList();
    }

    public void Delete(long campaignId)
    {
        _repository.Delete(campaignId);
    }

    public List<CampaignInfo> ListByUser(long userId)
    {
        return _repository.ListByUser(userId).Select(MapToDto).ToList();
    }

    private static CampaignInfo MapToDto(Campaign model)
    {
        if (model == null) return null;
        return new CampaignInfo
        {
            CampaignId = model.CampaignId,
            UserId = model.UserId,
            Title = model.Title,
            Description = model.Description,
            StartTime = model.StartTime,
            EndTime = model.EndTime,
            Status = model.Status,
            NameRequired = model.NameRequired,
            EmailRequired = model.EmailRequired,
            PhoneRequired = model.PhoneRequired,
            MinAge = model.MinAge,
            BgImage = model.BgImage,
            TopImage = model.TopImage,
            YoutubeUrl = model.YoutubeUrl,
            CustomCss = model.CustomCss,
            MinEntry = model.MinEntry,
            Slug = model.Slug,
            Timezone = model.Timezone,
            MaxEntriesPerUser = model.MaxEntriesPerUser,
            WinnerCount = model.WinnerCount,
            IsPublished = model.IsPublished,
            Password = model.Password,
            ThemePrimaryColor = model.ThemePrimaryColor,
            ThemeSecondaryColor = model.ThemeSecondaryColor,
            ThemeBgColor = model.ThemeBgColor,
            ThemeFont = model.ThemeFont,
            LogoImage = model.LogoImage,
            TermsUrl = model.TermsUrl,
            RedirectUrl = model.RedirectUrl,
            WelcomeEmailEnabled = model.WelcomeEmailEnabled,
            WelcomeEmailSubject = model.WelcomeEmailSubject,
            WelcomeEmailBody = model.WelcomeEmailBody,
            GeoCountries = model.GeoCountries,
            BlockVpn = model.BlockVpn,
            RequireEmailVerification = model.RequireEmailVerification,
            EntryType = model.EntryType.ToString(),
            TotalEntries = model.TotalEntries,
            TotalParticipants = model.TotalParticipants,
            ViewCount = model.ViewCount,
            GaTrackingId = model.GaTrackingId,
            FbPixelId = model.FbPixelId,
            TiktokPixelId = model.TiktokPixelId,
            GtmId = model.GtmId,
            BrandId = model.BrandId,
            Language = model.Language
        };
    }

    private static Campaign MapToModel(CampaignInfo dto) => new()
    {
        CampaignId = dto.CampaignId,
        UserId = dto.UserId,
        Title = dto.Title,
        Description = dto.Description,
        StartTime = dto.StartTime,
        EndTime = dto.EndTime,
        Status = dto.Status,
        NameRequired = dto.NameRequired,
        EmailRequired = dto.EmailRequired,
        PhoneRequired = dto.PhoneRequired,
        MinAge = dto.MinAge,
        BgImage = dto.BgImage,
        TopImage = dto.TopImage,
        YoutubeUrl = dto.YoutubeUrl,
        CustomCss = dto.CustomCss,
        MinEntry = dto.MinEntry,
        Slug = dto.Slug,
        Timezone = dto.Timezone,
        MaxEntriesPerUser = dto.MaxEntriesPerUser,
        WinnerCount = dto.WinnerCount ?? 0,
        IsPublished = dto.IsPublished,
        Password = dto.Password,
        ThemePrimaryColor = dto.ThemePrimaryColor,
        ThemeSecondaryColor = dto.ThemeSecondaryColor,
        ThemeBgColor = dto.ThemeBgColor,
        ThemeFont = dto.ThemeFont,
        LogoImage = dto.LogoImage,
        TermsUrl = dto.TermsUrl,
        RedirectUrl = dto.RedirectUrl,
        WelcomeEmailEnabled = dto.WelcomeEmailEnabled,
        WelcomeEmailSubject = dto.WelcomeEmailSubject,
        WelcomeEmailBody = dto.WelcomeEmailBody,
        GeoCountries = dto.GeoCountries,
        BlockVpn = dto.BlockVpn,
        RequireEmailVerification = dto.RequireEmailVerification,
        EntryType = int.TryParse(dto.EntryType, out var et) ? et : 0,
        TotalEntries = dto.TotalEntries,
        TotalParticipants = dto.TotalParticipants,
        ViewCount = dto.ViewCount,
        GaTrackingId = dto.GaTrackingId,
        FbPixelId = dto.FbPixelId,
        TiktokPixelId = dto.TiktokPixelId,
        GtmId = dto.GtmId,
        BrandId = dto.BrandId,
        Language = dto.Language
    };
}
