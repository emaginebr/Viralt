using Viralt.Domain.Enums;
using Viralt.Domain.Interfaces.Core;
using Viralt.Infra.Context;
using Viralt.Infra.Interfaces;

namespace Viralt.Infra;

public class UnitOfWork : IUnitOfWork
{
    private readonly ViraltContext _context;
    private readonly ILogCore _log;

    public UnitOfWork(ILogCore log, ViraltContext context)
    {
        _context = context;
        _log = log;
    }

    public ITransaction BeginTransaction()
    {
        _log.Log("Iniciando bloco de transação.", Levels.Trace);
        return new TransactionDisposable(_log, _context.Database.BeginTransaction());
    }
}
