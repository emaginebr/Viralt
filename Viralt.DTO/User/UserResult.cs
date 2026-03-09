using System;
using Viralt.DTO.Domain;

namespace Viralt.DTO.User
{
    public class UserResult : StatusResult
    {
        public UserInfo User { get; set; }
    }
}
