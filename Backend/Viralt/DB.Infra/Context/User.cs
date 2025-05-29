using System;
using System.Collections.Generic;

namespace DB.Infra.Context;

public partial class User
{
    public long UserId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public string Slug { get; set; }

    public string Name { get; set; }

    public string Email { get; set; }

    public string Password { get; set; }

    public int? Plan { get; set; }

    public string Token { get; set; }

    public string RecoveryHash { get; set; }

    public int Status { get; set; }

    public string Hash { get; set; }

    public string Image { get; set; }

    public virtual ICollection<Campaign> Campaigns { get; set; } = new List<Campaign>();
}
