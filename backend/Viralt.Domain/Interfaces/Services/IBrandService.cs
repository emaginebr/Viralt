using Viralt.DTO.Campaign;

namespace Viralt.Domain.Interfaces.Services;

public interface IBrandService
{
    BrandInfo GetById(long brandId);
    IEnumerable<BrandInfo> ListByUser(long userId);
    BrandInfo GetBySlug(string slug);
    BrandInfo Insert(BrandInsertInfo dto);
    BrandInfo Update(BrandUpdateInfo dto);
    void Delete(long brandId);
}
