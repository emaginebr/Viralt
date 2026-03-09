using Viralt.Domain.Interfaces.Models;

namespace Viralt.Domain.Interfaces.Factory
{
    public interface IClientEntryDomainFactory
    {
        IClientEntryModel BuildClientEntryModel();
    }
}