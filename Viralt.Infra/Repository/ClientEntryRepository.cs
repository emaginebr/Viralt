using Viralt.Domain.Models;
using Viralt.Infra.Context;
using Viralt.Infra.Interfaces.Repository;

namespace Viralt.Infra.Repository;

public class ClientEntryRepository : IClientEntryRepository<ClientEntry>
{
    private readonly ViraltContext _context;

    public ClientEntryRepository(ViraltContext context)
    {
        _context = context;
    }

    public ClientEntry GetById(long clientEntryId)
    {
        return _context.ClientEntries.Find(clientEntryId);
    }

    public IEnumerable<ClientEntry> ListByClient(long clientId)
    {
        return _context.ClientEntries.Where(x => x.ClientId == clientId).ToList();
    }

    public ClientEntry Insert(ClientEntry model)
    {
        _context.ClientEntries.Add(model);
        _context.SaveChanges();
        return model;
    }

    public ClientEntry Update(ClientEntry model)
    {
        var existing = _context.ClientEntries.Find(model.ClientEntryId)
            ?? throw new KeyNotFoundException($"ClientEntry {model.ClientEntryId} not found.");

        _context.Entry(existing).CurrentValues.SetValues(model);
        _context.SaveChanges();
        return existing;
    }

    public void Delete(long clientEntryId)
    {
        var entity = _context.ClientEntries.Find(clientEntryId)
            ?? throw new KeyNotFoundException($"ClientEntry {clientEntryId} not found.");
        _context.ClientEntries.Remove(entity);
        _context.SaveChanges();
    }
}
