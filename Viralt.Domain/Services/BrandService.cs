using Viralt.Domain.Interfaces.Services;
using Viralt.Domain.Models;
using Viralt.DTO.Campaign;
using Viralt.Infra.Interfaces.Repository;

namespace Viralt.Domain.Services;

public class BrandService : IBrandService
{
    private readonly IBrandRepository<Brand> _repository;

    public BrandService(IBrandRepository<Brand> repository)
    {
        _repository = repository;
    }

    public BrandInfo GetById(long brandId)
    {
        var model = _repository.GetById(brandId);
        return MapToDto(model);
    }

    public IEnumerable<BrandInfo> ListByUser(long userId)
    {
        return _repository.ListByUser(userId).Select(MapToDto);
    }

    public BrandInfo GetBySlug(string slug)
    {
        var model = _repository.GetBySlug(slug);
        return MapToDto(model);
    }

    public BrandInfo Insert(BrandInsertInfo dto)
    {
        var model = MapToModel(dto);
        var saved = _repository.Insert(model);
        return MapToDto(saved);
    }

    public BrandInfo Update(BrandUpdateInfo dto)
    {
        var model = MapToModel(dto);
        model.BrandId = dto.BrandId;
        var updated = _repository.Update(model);
        return MapToDto(updated);
    }

    public void Delete(long brandId)
    {
        _repository.Delete(brandId);
    }

    private static BrandInfo MapToDto(Brand model)
    {
        if (model == null) return null;
        return new BrandInfo
        {
            BrandId = model.BrandId,
            UserId = model.UserId,
            Name = model.Name,
            Slug = model.Slug,
            LogoImage = model.LogoImage,
            PrimaryColor = model.PrimaryColor,
            CustomDomain = model.CustomDomain,
            CreatedAt = model.CreatedAt
        };
    }

    private static Brand MapToModel(BrandInsertInfo dto) => new()
    {
        UserId = dto.UserId,
        Name = dto.Name,
        Slug = dto.Slug,
        LogoImage = dto.LogoImage,
        PrimaryColor = dto.PrimaryColor,
        CustomDomain = dto.CustomDomain,
        CreatedAt = dto.CreatedAt
    };
}
