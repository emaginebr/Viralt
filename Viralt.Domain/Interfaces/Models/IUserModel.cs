using Viralt.Domain.Impl.Models;
using Viralt.Domain.Interfaces.Factory;
using System;
using System.Collections.Generic;

namespace Viralt.Domain.Interfaces.Models
{
    public interface IUserModel
    {
        long UserId { get; set; }
        DateTime CreatedAt { get; set; }
        DateTime UpdatedAt { get; set; }
        string Hash { get; set; }
        string Slug { get; set; }
        string Name { get; set; }
        string Email { get; set; }
        string Password { get; set; }
        string Image { get; set; }
        int? Plan { get; set; }
        string Token { get; set; }
        string RecoveryHash { get; set; }
        int Status { get; set; }

        IUserModel Insert(IUserDomainFactory factory);
        IUserModel Update(IUserDomainFactory factory);
        IUserModel GetByEmail(string email, IUserDomainFactory factory);
        IUserModel GetBySlug(string slug, IUserDomainFactory factory);
        IUserModel GetById(long userId, IUserDomainFactory factory);
        IUserModel GetByToken(string token, IUserDomainFactory factory);
        string GenerateNewToken(IUserDomainFactory factory);
        IUserModel GetByRecoveryHash(string recoveryHash, IUserDomainFactory factory);
        IEnumerable<IUserModel> ListUsers(int take, IUserDomainFactory factory);
        IUserModel LoginWithEmail(string email, string password, IUserDomainFactory factory);
        bool HasPassword(long userId, IUserDomainFactory factory);
        void ChangePassword(long userId, string password, IUserDomainFactory factory);
        string GenerateRecoveryHash(long userId, IUserDomainFactory factory);
        bool ExistSlug(long userId, string slug);
    }
}
