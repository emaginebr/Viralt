using Viralt.Domain.Interfaces.Services;
using Viralt.Domain.Models;
using Viralt.DTO.Campaign;
using Viralt.Infra.Interfaces.Repository;

namespace Viralt.Domain.Services;

public class PrizeService : IPrizeService
{
    private readonly IPrizeRepository<Prize> _repository;

    public PrizeService(IPrizeRepository<Prize> repository)
    {
        _repository = repository;
    }

    public PrizeInfo GetById(long prizeId)
    {
        var model = _repository.GetById(prizeId);
        return MapToDto(model);
    }

    public IEnumerable<PrizeInfo> ListByCampaign(long campaignId)
    {
        return _repository.ListByCampaign(campaignId).Select(MapToDto);
    }

    public PrizeInfo Insert(PrizeInsertInfo dto)
    {
        var model = MapToModel(dto);
        var saved = _repository.Insert(model);
        return MapToDto(saved);
    }

    public PrizeInfo Update(PrizeUpdateInfo dto)
    {
        var model = MapToModel(dto);
        var updated = _repository.Update(model);
        return MapToDto(updated);
    }

    public void Delete(long prizeId)
    {
        _repository.Delete(prizeId);
    }

    private static PrizeInfo MapToDto(Prize model)
    {
        if (model == null) return null;
        return new PrizeInfo
        {
            PrizeId = model.PrizeId,
            CampaignId = model.CampaignId,
            Title = model.Title,
            Description = model.Description,
            Image = model.Image,
            Quantity = model.Quantity,
            PrizeType = model.PrizeType.ToString(),
            CouponCode = model.CouponCode,
            SortOrder = model.SortOrder,
            MinEntriesRequired = model.MinEntriesRequired ?? 0
        };
    }

    private static Prize MapToModel(PrizeInsertInfo dto) => new()
    {
        CampaignId = dto.CampaignId,
        Title = dto.Title,
        Description = dto.Description,
        Image = dto.Image,
        Quantity = dto.Quantity,
        PrizeType = int.TryParse(dto.PrizeType, out var pt) ? pt : 0,
        CouponCode = dto.CouponCode,
        SortOrder = dto.SortOrder,
        MinEntriesRequired = dto.MinEntriesRequired
    };

    private static Prize MapToModel(PrizeUpdateInfo dto)
    {
        var model = MapToModel((PrizeInsertInfo)dto);
        model.PrizeId = dto.PrizeId;
        return model;
    }
}
