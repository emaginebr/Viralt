using System;
using Viralt.Domain.Impl.Core;
using Microsoft.Extensions.Logging;

namespace Viralt.Domain.Interfaces.Core
{
    public interface ILogCore
    {
        void Log(string message, Levels level);
    }
}
