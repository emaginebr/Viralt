using Viralt.Domain.Models;
using Viralt.Infra.Context;
using Viralt.Infra.Interfaces.Repository;

namespace Viralt.Infra.Repository;

public class BrandRepository : IBrandRepository<Brand>
{
    private readonly ViraltContext _context;

    public BrandRepository(ViraltContext context)
    {
        _context = context;
    }

    public Brand GetById(long brandId)
    {
        return _context.Brands.Find(brandId);
    }

    public IEnumerable<Brand> ListByUser(long userId)
    {
        return _context.Brands.Where(x => x.UserId == userId).ToList();
    }

    public Brand GetBySlug(string slug)
    {
        return _context.Brands.FirstOrDefault(x => x.Slug == slug);
    }

    public Brand Insert(Brand model)
    {
        _context.Brands.Add(model);
        _context.SaveChanges();
        return model;
    }

    public Brand Update(Brand model)
    {
        var existing = _context.Brands.Find(model.BrandId);
        if (existing == null)
            throw new KeyNotFoundException($"Brand {model.BrandId} not found.");

        _context.Entry(existing).CurrentValues.SetValues(model);
        _context.SaveChanges();
        return existing;
    }

    public void Delete(long brandId)
    {
        var entity = _context.Brands.Find(brandId)
            ?? throw new KeyNotFoundException($"Brand {brandId} not found.");
        _context.Brands.Remove(entity);
        _context.SaveChanges();
    }
}
