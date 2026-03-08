using System;
using Viralt.Domain.Interfaces.Models;

namespace Viralt.Domain.Interfaces.Factory
{
    public interface IUserDomainFactory
    {
        IUserModel BuildUserModel();
    }
}
