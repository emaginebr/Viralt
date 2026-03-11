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

            entity.HasOne(d => d.Client).WithMany(p => p.ClientEntries)
                .HasForeignKey(d => d.ClientId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_client_entry_client");

            entity.HasOne(d => d.Entry).WithOne(p => p.ClientEntry)
                .HasForeignKey<ClientEntry>(d => d.EntryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("fk_client_entry_entry");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
