using Microsoft.EntityFrameworkCore;
using Viralt.Domain.Models;

namespace Viralt.Infra.Context;

public partial class ViraltContext : DbContext
{
    public ViraltContext()
    {
    }

    public ViraltContext(DbContextOptions<ViraltContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Campaign> Campaigns { get; set; }
    public virtual DbSet<CampaignEntry> CampaignEntries { get; set; }
    public virtual DbSet<CampaignEntryOption> CampaignEntryOptions { get; set; }
    public virtual DbSet<CampaignField> CampaignFields { get; set; }
    public virtual DbSet<CampaignFieldOption> CampaignFieldOptions { get; set; }
    public virtual DbSet<Client> Clients { get; set; }
    public virtual DbSet<ClientEntry> ClientEntries { get; set; }
    public virtual DbSet<Prize> Prizes { get; set; }
    public virtual DbSet<Winner> Winners { get; set; }
    public virtual DbSet<CampaignView> CampaignViews { get; set; }
    public virtual DbSet<Brand> Brands { get; set; }
    public virtual DbSet<Referral> Referrals { get; set; }
    public virtual DbSet<Submission> Submissions { get; set; }
    public virtual DbSet<Vote> Votes { get; set; }
    public virtual DbSet<Webhook> Webhooks { get; set; }
    public virtual DbSet<UnlockReward> UnlockRewards { get; set; }
    public virtual DbSet<ClientReward> ClientRewards { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Campaign>(entity =>
        {
            entity.HasKey(e => e.CampaignId).HasName("campaigns_pkey");
            entity.ToTable("campaigns");

            entity.Property(e => e.CampaignId).HasColumnName("campaign_id");
            entity.Property(e => e.BgImage).HasMaxLength(80).HasColumnName("bg_image");
            entity.Property(e => e.CustomCss).HasColumnName("custom_css");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.EmailRequired).HasDefaultValue(true).HasColumnName("email_required");
            entity.Property(e => e.EndTime).HasColumnType("timestamp without time zone").HasColumnName("end_time");
            entity.Property(e => e.MinAge).HasColumnName("min_age");
            entity.Property(e => e.MinEntry).HasColumnName("min_entry");
            entity.Property(e => e.NameRequired).HasDefaultValue(true).HasColumnName("name_required");
            entity.Property(e => e.PhoneRequired).HasDefaultValue(false).HasColumnName("phone_required");
            entity.Property(e => e.StartTime).HasColumnType("timestamp without time zone").HasColumnName("start_time");
            entity.Property(e => e.Status).HasDefaultValue(1).HasColumnName("status");
            entity.Property(e => e.Title).IsRequired().HasMaxLength(260).HasColumnName("title");
            entity.Property(e => e.TopImage).HasMaxLength(80).HasColumnName("top_image");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.YoutubeUrl).HasMaxLength(300).HasColumnName("youtube_url");
            entity.Property(e => e.Slug).IsRequired().HasMaxLength(260).HasColumnName("slug");
            entity.Property(e => e.Timezone).HasMaxLength(60).HasColumnName("timezone");
            entity.Property(e => e.MaxEntriesPerUser).HasColumnName("max_entries_per_user");
            entity.Property(e => e.WinnerCount).HasColumnName("winner_count");
            entity.Property(e => e.IsPublished).HasDefaultValue(false).HasColumnName("is_published");
            entity.Property(e => e.Password).HasColumnName("password");
            entity.Property(e => e.ThemePrimaryColor).HasMaxLength(7).HasColumnName("theme_primary_color");
            entity.Property(e => e.ThemeSecondaryColor).HasMaxLength(7).HasColumnName("theme_secondary_color");
            entity.Property(e => e.ThemeBgColor).HasMaxLength(7).HasColumnName("theme_bg_color");
            entity.Property(e => e.ThemeFont).HasMaxLength(80).HasColumnName("theme_font");
            entity.Property(e => e.LogoImage).HasMaxLength(80).HasColumnName("logo_image");
            entity.Property(e => e.TermsUrl).HasMaxLength(500).HasColumnName("terms_url");
            entity.Property(e => e.RedirectUrl).HasMaxLength(500).HasColumnName("redirect_url");
            entity.Property(e => e.WelcomeEmailEnabled).HasDefaultValue(false).HasColumnName("welcome_email_enabled");
            entity.Property(e => e.WelcomeEmailSubject).HasMaxLength(260).HasColumnName("welcome_email_subject");
            entity.Property(e => e.WelcomeEmailBody).HasColumnName("welcome_email_body");
            entity.Property(e => e.GeoCountries).HasColumnName("geo_countries");
            entity.Property(e => e.BlockVpn).HasDefaultValue(false).HasColumnName("block_vpn");
            entity.Property(e => e.RequireEmailVerification).HasDefaultValue(false).HasColumnName("require_email_verification");
            entity.Property(e => e.EntryType).HasDefaultValue(1).HasColumnName("entry_type");
            entity.Property(e => e.TotalEntries).HasDefaultValue(0L).HasColumnName("total_entries");
            entity.Property(e => e.TotalParticipants).HasDefaultValue(0L).HasColumnName("total_participants");
            entity.Property(e => e.ViewCount).HasDefaultValue(0L).HasColumnName("view_count");
            entity.Property(e => e.GaTrackingId).HasMaxLength(30).HasColumnName("ga_tracking_id");
            entity.Property(e => e.FbPixelId).HasMaxLength(30).HasColumnName("fb_pixel_id");
            entity.Property(e => e.TiktokPixelId).HasMaxLength(30).HasColumnName("tiktok_pixel_id");
            entity.Property(e => e.GtmId).HasMaxLength(30).HasColumnName("gtm_id");
            entity.Property(e => e.BrandId).HasColumnName("brand_id");
            entity.Property(e => e.Language).HasMaxLength(5).HasColumnName("language");

            entity.HasOne(d => d.Brand).WithMany(p => p.Campaigns)
                .HasForeignKey(d => d.BrandId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_brand_campaign");
        });

        modelBuilder.Entity<CampaignEntry>(entity =>
        {
            entity.HasKey(e => e.EntryId).HasName("campaign_entries_pkey");
            entity.ToTable("campaign_entries");

            entity.Property(e => e.EntryId).HasColumnName("entry_id");
            entity.Property(e => e.CampaignId).HasColumnName("campaign_id");
            entity.Property(e => e.Daily).HasDefaultValue(false).HasColumnName("daily");
            entity.Property(e => e.Entries).HasDefaultValue(0).HasColumnName("entries");
            entity.Property(e => e.EntryLabel).HasMaxLength(300).HasColumnName("entry_label");
            entity.Property(e => e.EntryType).HasDefaultValue(1).HasColumnName("entry_type");
            entity.Property(e => e.EntryValue).HasMaxLength(300).HasColumnName("entry_value");
            entity.Property(e => e.Mandatory).HasDefaultValue(false).HasColumnName("mandatory");
            entity.Property(e => e.Title).IsRequired().HasMaxLength(300).HasColumnName("title");
            entity.Property(e => e.SortOrder).HasDefaultValue(0).HasColumnName("sort_order");
            entity.Property(e => e.RequireVerification).HasDefaultValue(false).HasColumnName("require_verification");
            entity.Property(e => e.Icon).HasMaxLength(80).HasColumnName("icon");
            entity.Property(e => e.Instructions).HasMaxLength(500).HasColumnName("instructions");
            entity.Property(e => e.TargetUrl).HasMaxLength(500).HasColumnName("target_url");
            entity.Property(e => e.ExternalProvider).HasMaxLength(50).HasColumnName("external_provider");
            entity.Property(e => e.ExternalEntryId).HasMaxLength(200).HasColumnName("external_entry_id");

            entity.HasOne(d => d.Campaign).WithMany(p => p.CampaignEntries)
                .HasForeignKey(d => d.CampaignId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_campaign_entry");
        });

        modelBuilder.Entity<CampaignEntryOption>(entity =>
        {
            entity.HasKey(e => e.OptionId).HasName("campaign_entry_options_pkey");
            entity.ToTable("campaign_entry_options");

            entity.Property(e => e.OptionId).HasColumnName("option_id");
            entity.Property(e => e.EntryId).HasColumnName("entry_id");
            entity.Property(e => e.OptionKey).IsRequired().HasMaxLength(80).HasColumnName("option_key");
            entity.Property(e => e.OptionValue).IsRequired().HasMaxLength(120).HasColumnName("option_value");

            entity.HasOne(d => d.Entry).WithMany(p => p.CampaignEntryOptions)
                .HasForeignKey(d => d.EntryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_entry_options");
        });

        modelBuilder.Entity<CampaignField>(entity =>
        {
            entity.HasKey(e => e.FieldId).HasName("campaign_fields_pkey");
            entity.ToTable("campaign_fields");

            entity.Property(e => e.FieldId).HasColumnName("field_id");
            entity.Property(e => e.CampaignId).HasColumnName("campaign_id");
            entity.Property(e => e.FieldType).HasDefaultValue(1).HasColumnName("field_type");
            entity.Property(e => e.Required).HasDefaultValue(false).HasColumnName("required");
            entity.Property(e => e.Title).IsRequired().HasMaxLength(300).HasColumnName("title");

            entity.HasOne(d => d.Campaign).WithMany(p => p.CampaignFields)
                .HasForeignKey(d => d.CampaignId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_campaign_field");
        });

        modelBuilder.Entity<CampaignFieldOption>(entity =>
        {
            entity.HasKey(e => e.OptionId).HasName("campaign_field_options_pkey");
            entity.ToTable("campaign_field_options");

            entity.Property(e => e.OptionId).HasColumnName("option_id");
            entity.Property(e => e.FieldId).HasColumnName("field_id");
            entity.Property(e => e.OptionKey).IsRequired().HasMaxLength(80).HasColumnName("option_key");
            entity.Property(e => e.OptionValue).IsRequired().HasMaxLength(120).HasColumnName("option_value");

            entity.HasOne(d => d.Field).WithMany(p => p.CampaignFieldOptions)
                .HasForeignKey(d => d.FieldId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_field_options");
        });

        modelBuilder.Entity<Client>(entity =>
        {
            entity.HasKey(e => e.ClientId).HasName("clients_pkey");
            entity.ToTable("clients");

            entity.Property(e => e.ClientId).HasColumnName("client_id");
            entity.Property(e => e.Birthday).HasColumnType("timestamp without time zone").HasColumnName("birthday");
            entity.Property(e => e.CampaignId).HasColumnName("campaign_id");
            entity.Property(e => e.CreatedAt).HasColumnType("timestamp without time zone").HasColumnName("created_at");
            entity.Property(e => e.Email).HasMaxLength(180).HasColumnName("email");
            entity.Property(e => e.Name).HasMaxLength(180).HasColumnName("name");
            entity.Property(e => e.Phone).HasMaxLength(30).HasColumnName("phone");
            entity.Property(e => e.Status).HasColumnName("status");
            entity.Property(e => e.Token).HasMaxLength(180).HasColumnName("token");
            entity.Property(e => e.ReferralToken).HasMaxLength(20).HasColumnName("referral_token");
            entity.Property(e => e.ReferredByClientId).HasColumnName("referred_by_client_id");
            entity.Property(e => e.IpAddress).HasMaxLength(45).HasColumnName("ip_address");
            entity.Property(e => e.CountryCode).HasMaxLength(2).HasColumnName("country_code");
            entity.Property(e => e.UserAgent).HasMaxLength(500).HasColumnName("user_agent");
            entity.Property(e => e.TotalEntries).HasDefaultValue(0).HasColumnName("total_entries");
            entity.Property(e => e.EmailVerified).HasDefaultValue(false).HasColumnName("email_verified");
            entity.Property(e => e.IsWinner).HasDefaultValue(false).HasColumnName("is_winner");
            entity.Property(e => e.IsDisqualified).HasDefaultValue(false).HasColumnName("is_disqualified");

            entity.HasOne(d => d.Campaign).WithMany(p => p.Clients)
                .HasForeignKey(d => d.CampaignId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_campaign_clients");
        });

        modelBuilder.Entity<ClientEntry>(entity =>
        {
            entity.HasKey(e => e.EntryId).HasName("client_entries_pkey");
            entity.ToTable("client_entries");

            entity.Property(e => e.EntryId).ValueGeneratedNever().HasColumnName("entry_id");
            entity.Property(e => e.ClientEntryId).ValueGeneratedOnAdd().HasColumnName("client_entry_id");
            entity.Property(e => e.ClientId).HasColumnName("client_id");
            entity.Property(e => e.EntryValue).HasMaxLength(300).HasColumnName("entry_value");
            entity.Property(e => e.Status).HasDefaultValue(1).HasColumnName("status");
            entity.Property(e => e.CompletedAt).HasColumnType("timestamp without time zone").HasColumnName("completed_at");
            entity.Property(e => e.Verified).HasDefaultValue(false).HasColumnName("verified");
            entity.Property(e => e.VerificationData).HasColumnName("verification_data");
            entity.Property(e => e.EntriesEarned).HasDefaultValue(0).HasColumnName("entries_earned");

            entity.HasOne(d => d.Client).WithMany(p => p.ClientEntries)
                .HasForeignKey(d => d.ClientId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_client_entry_client");

            entity.HasOne(d => d.Entry).WithOne(p => p.ClientEntry)
                .HasForeignKey<ClientEntry>(d => d.EntryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_client_entry_entry");
        });

        modelBuilder.Entity<Prize>(entity =>
        {
            entity.HasKey(e => e.PrizeId).HasName("prizes_pkey");
            entity.ToTable("prizes");

            entity.Property(e => e.PrizeId).HasColumnName("prize_id");
            entity.Property(e => e.CampaignId).HasColumnName("campaign_id");
            entity.Property(e => e.Title).IsRequired().HasMaxLength(260).HasColumnName("title");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.Image).HasMaxLength(80).HasColumnName("image");
            entity.Property(e => e.Quantity).HasDefaultValue(1).HasColumnName("quantity");
            entity.Property(e => e.PrizeType).HasDefaultValue(1).HasColumnName("prize_type");
            entity.Property(e => e.CouponCode).HasMaxLength(100).HasColumnName("coupon_code");
            entity.Property(e => e.SortOrder).HasDefaultValue(0).HasColumnName("sort_order");
            entity.Property(e => e.MinEntriesRequired).HasColumnName("min_entries_required");

            entity.HasOne(d => d.Campaign).WithMany(p => p.Prizes)
                .HasForeignKey(d => d.CampaignId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_campaign_prize");
        });

        modelBuilder.Entity<Winner>(entity =>
        {
            entity.HasKey(e => e.WinnerId).HasName("winners_pkey");
            entity.ToTable("winners");

            entity.Property(e => e.WinnerId).HasColumnName("winner_id");
            entity.Property(e => e.CampaignId).HasColumnName("campaign_id");
            entity.Property(e => e.ClientId).HasColumnName("client_id");
            entity.Property(e => e.PrizeId).HasColumnName("prize_id");
            entity.Property(e => e.SelectedAt).HasColumnType("timestamp without time zone").HasColumnName("selected_at");
            entity.Property(e => e.SelectionMethod).HasDefaultValue(1).HasColumnName("selection_method");
            entity.Property(e => e.Notified).HasDefaultValue(false).HasColumnName("notified");
            entity.Property(e => e.Claimed).HasDefaultValue(false).HasColumnName("claimed");
            entity.Property(e => e.ClaimData).HasColumnName("claim_data");

            entity.HasOne(d => d.Campaign).WithMany(p => p.Winners)
                .HasForeignKey(d => d.CampaignId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_campaign_winner");

            entity.HasOne(d => d.Client).WithMany()
                .HasForeignKey(d => d.ClientId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_client_winner");

            entity.HasOne(d => d.Prize).WithMany(p => p.Winners)
                .HasForeignKey(d => d.PrizeId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_prize_winner");
        });

        modelBuilder.Entity<CampaignView>(entity =>
        {
            entity.HasKey(e => e.ViewId).HasName("campaign_views_pkey");
            entity.ToTable("campaign_views");

            entity.Property(e => e.ViewId).HasColumnName("view_id");
            entity.Property(e => e.CampaignId).HasColumnName("campaign_id");
            entity.Property(e => e.ViewedAt).HasColumnType("timestamp without time zone").HasColumnName("viewed_at");
            entity.Property(e => e.IpAddress).HasMaxLength(45).HasColumnName("ip_address");
            entity.Property(e => e.UserAgent).HasMaxLength(500).HasColumnName("user_agent");
            entity.Property(e => e.Referrer).HasMaxLength(500).HasColumnName("referrer");
            entity.Property(e => e.CountryCode).HasMaxLength(2).HasColumnName("country_code");

            entity.HasOne(d => d.Campaign).WithMany(p => p.CampaignViews)
                .HasForeignKey(d => d.CampaignId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_campaign_view");
        });

        modelBuilder.Entity<Brand>(entity =>
        {
            entity.HasKey(e => e.BrandId).HasName("brands_pkey");
            entity.ToTable("brands");

            entity.Property(e => e.BrandId).HasColumnName("brand_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.Name).IsRequired().HasMaxLength(260).HasColumnName("name");
            entity.Property(e => e.Slug).IsRequired().HasMaxLength(260).HasColumnName("slug");
            entity.Property(e => e.LogoImage).HasMaxLength(80).HasColumnName("logo_image");
            entity.Property(e => e.PrimaryColor).HasMaxLength(7).HasColumnName("primary_color");
            entity.Property(e => e.CustomDomain).HasMaxLength(260).HasColumnName("custom_domain");
            entity.Property(e => e.CreatedAt).HasColumnType("timestamp without time zone").HasColumnName("created_at");
        });

        modelBuilder.Entity<Referral>(entity =>
        {
            entity.HasKey(e => e.ReferralId).HasName("referrals_pkey");
            entity.ToTable("referrals");

            entity.Property(e => e.ReferralId).HasColumnName("referral_id");
            entity.Property(e => e.CampaignId).HasColumnName("campaign_id");
            entity.Property(e => e.ReferrerClientId).HasColumnName("referrer_client_id");
            entity.Property(e => e.ReferredClientId).HasColumnName("referred_client_id");
            entity.Property(e => e.CreatedAt).HasColumnType("timestamp without time zone").HasColumnName("created_at");
            entity.Property(e => e.BonusEntriesAwarded).HasDefaultValue(0).HasColumnName("bonus_entries_awarded");

            entity.HasOne(d => d.Campaign).WithMany()
                .HasForeignKey(d => d.CampaignId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_campaign_referral");

            entity.HasOne(d => d.ReferrerClient).WithMany()
                .HasForeignKey(d => d.ReferrerClientId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_referrer_client");

            entity.HasOne(d => d.ReferredClient).WithMany()
                .HasForeignKey(d => d.ReferredClientId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_referred_client");
        });

        modelBuilder.Entity<Submission>(entity =>
        {
            entity.HasKey(e => e.SubmissionId).HasName("submissions_pkey");
            entity.ToTable("submissions");

            entity.Property(e => e.SubmissionId).HasColumnName("submission_id");
            entity.Property(e => e.CampaignId).HasColumnName("campaign_id");
            entity.Property(e => e.ClientId).HasColumnName("client_id");
            entity.Property(e => e.FileUrl).IsRequired().HasMaxLength(200).HasColumnName("file_url");
            entity.Property(e => e.FileType).HasColumnName("file_type");
            entity.Property(e => e.Caption).HasMaxLength(500).HasColumnName("caption");
            entity.Property(e => e.Status).HasDefaultValue(0).HasColumnName("status");
            entity.Property(e => e.VoteCount).HasDefaultValue(0).HasColumnName("vote_count");
            entity.Property(e => e.JudgeScore).HasColumnName("judge_score");
            entity.Property(e => e.SubmittedAt).HasColumnType("timestamp without time zone").HasColumnName("submitted_at");

            entity.HasOne(d => d.Campaign).WithMany(p => p.Submissions)
                .HasForeignKey(d => d.CampaignId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_campaign_submission");

            entity.HasOne(d => d.Client).WithMany()
                .HasForeignKey(d => d.ClientId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_client_submission");
        });

        modelBuilder.Entity<Vote>(entity =>
        {
            entity.HasKey(e => e.VoteId).HasName("votes_pkey");
            entity.ToTable("votes");

            entity.Property(e => e.VoteId).HasColumnName("vote_id");
            entity.Property(e => e.SubmissionId).HasColumnName("submission_id");
            entity.Property(e => e.IpAddress).IsRequired().HasMaxLength(45).HasColumnName("ip_address");
            entity.Property(e => e.VotedAt).HasColumnType("timestamp without time zone").HasColumnName("voted_at");

            entity.HasOne(d => d.Submission).WithMany(p => p.Votes)
                .HasForeignKey(d => d.SubmissionId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_submission_vote");
        });

        modelBuilder.Entity<Webhook>(entity =>
        {
            entity.HasKey(e => e.WebhookId).HasName("webhooks_pkey");
            entity.ToTable("webhooks");

            entity.Property(e => e.WebhookId).HasColumnName("webhook_id");
            entity.Property(e => e.UserId).HasColumnName("user_id");
            entity.Property(e => e.Url).IsRequired().HasMaxLength(500).HasColumnName("url");
            entity.Property(e => e.Secret).IsRequired().HasMaxLength(100).HasColumnName("secret");
            entity.Property(e => e.Events).HasColumnName("events");
            entity.Property(e => e.IsActive).HasDefaultValue(true).HasColumnName("is_active");
            entity.Property(e => e.CreatedAt).HasColumnType("timestamp without time zone").HasColumnName("created_at");
        });

        modelBuilder.Entity<UnlockReward>(entity =>
        {
            entity.HasKey(e => e.RewardId).HasName("unlock_rewards_pkey");
            entity.ToTable("unlock_rewards");

            entity.Property(e => e.RewardId).HasColumnName("reward_id");
            entity.Property(e => e.CampaignId).HasColumnName("campaign_id");
            entity.Property(e => e.Title).IsRequired().HasMaxLength(260).HasColumnName("title");
            entity.Property(e => e.Description).HasColumnName("description");
            entity.Property(e => e.EntriesThreshold).HasColumnName("entries_threshold");
            entity.Property(e => e.RewardType).HasDefaultValue(1).HasColumnName("reward_type");
            entity.Property(e => e.RewardValue).HasColumnName("reward_value");
            entity.Property(e => e.Image).HasMaxLength(80).HasColumnName("image");

            entity.HasOne(d => d.Campaign).WithMany(p => p.UnlockRewards)
                .HasForeignKey(d => d.CampaignId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_campaign_reward");
        });

        modelBuilder.Entity<ClientReward>(entity =>
        {
            entity.HasKey(e => e.ClientRewardId).HasName("client_rewards_pkey");
            entity.ToTable("client_rewards");

            entity.Property(e => e.ClientRewardId).HasColumnName("client_reward_id");
            entity.Property(e => e.ClientId).HasColumnName("client_id");
            entity.Property(e => e.RewardId).HasColumnName("reward_id");
            entity.Property(e => e.UnlockedAt).HasColumnType("timestamp without time zone").HasColumnName("unlocked_at");

            entity.HasOne(d => d.Client).WithMany(p => p.ClientRewards)
                .HasForeignKey(d => d.ClientId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_client_reward");

            entity.HasOne(d => d.Reward).WithMany(p => p.ClientRewards)
                .HasForeignKey(d => d.RewardId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_reward_client_reward");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
