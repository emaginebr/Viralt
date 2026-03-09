using Viralt.Domain.Models;
using Viralt.Infra.Context;
using Viralt.Infra.Interfaces.Repository;

namespace Viralt.Infra.Repository;

public class ClientRepository : IClientRepository<Client>
{
    private readonly ViraltContext _context;

    public ClientRepository(ViraltContext context)
    {
        _context = context;
    }

    public Client GetById(long clientId)
    {
        return _context.Clients.Find(clientId);
    }

    public IEnumerable<Client> ListClients(long campaignId)
    {
        return _context.Clients.Where(x => x.CampaignId == campaignId).ToList();
    }

    public Client Insert(Client model)
    {
        _context.Clients.Add(model);
        _context.SaveChanges();
        return model;
    }

    public Client Update(Client model)
    {
        var existing = _context.Clients.Find(model.ClientId)
            ?? throw new KeyNotFoundException($"Client {model.ClientId} not found.");

        _context.Entry(existing).CurrentValues.SetValues(model);
        _context.SaveChanges();
        return existing;
    }

    public void Delete(long clientId)
    {
        var entity = _context.Clients.Find(clientId)
            ?? throw new KeyNotFoundException($"Client {clientId} not found.");
        _context.Clients.Remove(entity);
        _context.SaveChanges();
    }
}
