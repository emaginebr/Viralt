using Microsoft.EntityFrameworkCore;
using Viralt.Domain.Models;
using Viralt.Infra.Context;
using Viralt.Infra.Interfaces.Repository;

namespace Viralt.Infra.Repository;

public class UserRepository : IUserRepository<User>
{
    private readonly ViraltContext _context;

    public UserRepository(ViraltContext context)
    {
        _context = context;
    }

    public User GetById(long userId)
    {
        return _context.Users.Find(userId);
    }

    public User GetByEmail(string email)
    {
        return _context.Users.FirstOrDefault(x => x.Email == email);
    }

    public User GetBySlug(string slug)
    {
        return _context.Users.FirstOrDefault(x => x.Slug == slug);
    }

    public User GetByToken(string token)
    {
        return _context.Users.FirstOrDefault(x => x.Token == token);
    }

    public User GetByRecoveryHash(string recoveryHash)
    {
        return _context.Users.FirstOrDefault(x => x.RecoveryHash == recoveryHash);
    }

    public User LoginWithEmail(string email, string encryptPwd)
    {
        return _context.Users
            .FirstOrDefault(x => x.Email == email.ToLower() && x.Password == encryptPwd);
    }

    public IEnumerable<User> ListUsers(int take)
    {
        return _context.Users.OrderBy(x => x.Name).Take(take).ToList();
    }

    public User Insert(User model)
    {
        _context.Users.Add(model);
        _context.SaveChanges();
        return model;
    }

    public User Update(User model)
    {
        var existing = _context.Users.Find(model.UserId);
        if (existing == null)
            throw new KeyNotFoundException($"User {model.UserId} not found.");

        _context.Entry(existing).CurrentValues.SetValues(model);
        existing.UpdatedAt = DateTime.Now;
        _context.SaveChanges();
        return existing;
    }

    public void UpdateToken(long userId, string token)
    {
        var row = _context.Users.Find(userId);
        row.Token = token;
        _context.SaveChanges();
    }

    public void UpdateRecoveryHash(long userId, string recoveryHash)
    {
        var row = _context.Users.Find(userId);
        row.UpdatedAt = DateTime.Now;
        row.RecoveryHash = recoveryHash;
        _context.SaveChanges();
    }

    public void ChangePassword(long userId, string encryptPwd)
    {
        var row = _context.Users.Find(userId);
        row.UpdatedAt = DateTime.Now;
        row.Password = encryptPwd;
        _context.SaveChanges();
    }

    public bool HasPassword(long userId)
    {
        var row = _context.Users.Find(userId);
        return row != null && !string.IsNullOrEmpty(row.Password);
    }

    public bool ExistSlug(long userId, string slug)
    {
        return _context.Users.Any(x => x.Slug == slug && (userId == 0 || x.UserId != userId));
    }
}
