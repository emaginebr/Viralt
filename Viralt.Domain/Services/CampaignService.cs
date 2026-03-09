using Viralt.Domain.Interfaces.Services;
using Viralt.Domain.Models;
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
            MinEntry = model.MinEntry
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
        MinEntry = dto.MinEntry
    };
}
