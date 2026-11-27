using Viralt.Domain.Enums;

namespace Viralt.Domain.Interfaces.Core;

public interface ILogCore
{
    void Log(string message, Levels level);
}
