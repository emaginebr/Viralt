namespace Viralt.Infra.Interfaces;

public interface IUnitOfWork
{
    ITransaction BeginTransaction();
}

public interface ITransaction : IDisposable
{
    void Commit();
    void Rollback();
}
