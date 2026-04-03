namespace Viralt.Infra.Interfaces.Repository;

public interface IBrandRepository<TModel> where TModel : class
{
    TModel GetById(long brandId);
    IEnumerable<TModel> ListByUser(long userId);
    TModel GetBySlug(string slug);
    TModel Insert(TModel model);
    TModel Update(TModel model);
    void Delete(long brandId);
}
