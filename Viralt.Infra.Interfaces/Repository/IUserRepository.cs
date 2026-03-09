namespace Viralt.Infra.Interfaces.Repository;

public interface IUserRepository<TModel> where TModel : class
{
    TModel GetById(long userId);
    TModel GetByEmail(string email);
    TModel GetBySlug(string slug);
    TModel GetByToken(string token);
    TModel GetByRecoveryHash(string recoveryHash);
    TModel LoginWithEmail(string email, string encryptPwd);
    IEnumerable<TModel> ListUsers(int take);
    TModel Insert(TModel model);
    TModel Update(TModel model);
    void UpdateToken(long userId, string token);
    void UpdateRecoveryHash(long userId, string recoveryHash);
    void ChangePassword(long userId, string encryptPwd);
    bool HasPassword(long userId);
    bool ExistSlug(long userId, string slug);
}
