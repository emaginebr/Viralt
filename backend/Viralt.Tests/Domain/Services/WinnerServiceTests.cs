using Moq;
using Viralt.Domain.Models;
using Viralt.Domain.Services;
using Viralt.DTO.Campaign;
using Viralt.DTO.MailerSend;
using Viralt.Infra.Interfaces.AppServices;
using Viralt.Infra.Interfaces.Repository;

namespace Viralt.Tests.Domain.Services;

public class WinnerServiceTests
{
    private const long CampaignId = 10;
    private const string ProviderErrorMessage = "MailerSend: HTTP 500";

    private readonly Mock<IWinnerRepository<Winner>> _winnerRepositoryMock;
    private readonly Mock<IClientRepository<Client>> _clientRepositoryMock;
    private readonly Mock<ICampaignRepository<Campaign>> _campaignRepositoryMock;
    private readonly Mock<IPrizeRepository<Prize>> _prizeRepositoryMock;
    private readonly Mock<IMailerSendAppService> _mailerSendAppServiceMock;
    private readonly WinnerService _sut;

    public WinnerServiceTests()
    {
        _winnerRepositoryMock = new Mock<IWinnerRepository<Winner>>();
        _clientRepositoryMock = new Mock<IClientRepository<Client>>();
        _campaignRepositoryMock = new Mock<ICampaignRepository<Campaign>>();
        _prizeRepositoryMock = new Mock<IPrizeRepository<Prize>>();
        _mailerSendAppServiceMock = new Mock<IMailerSendAppService>();

        _campaignRepositoryMock
            .Setup(r => r.GetById(CampaignId))
            .Returns(new Campaign { CampaignId = CampaignId, Title = "Summer Giveaway" });

        _winnerRepositoryMock
            .Setup(r => r.Update(It.IsAny<Winner>()))
            .Returns<Winner>(w => w);

        _mailerSendAppServiceMock
            .Setup(m => m.SendMail(It.IsAny<MailerInfo>()))
            .ReturnsAsync(true);

        _sut = new WinnerService(
            _winnerRepositoryMock.Object,
            _clientRepositoryMock.Object,
            _campaignRepositoryMock.Object,
            _prizeRepositoryMock.Object,
            _mailerSendAppServiceMock.Object);
    }

    private Winner ArrangeWinner(long winnerId, long clientId, string name, string email, bool notified = false)
    {
        var winner = new Winner
        {
            WinnerId = winnerId,
            CampaignId = CampaignId,
            ClientId = clientId,
            Notified = notified
        };
        var client = new Client
        {
            ClientId = clientId,
            CampaignId = CampaignId,
            Name = name,
            Email = email
        };

        _winnerRepositoryMock.Setup(r => r.GetById(winnerId)).Returns(winner);
        _clientRepositoryMock.Setup(r => r.GetById(clientId)).Returns(client);

        return winner;
    }

    [Fact]
    public void NotifyWinner_ShouldMarkNotifiedAndUpdateOnce_WhenSendMailSucceeds()
    {
        // Arrange
        var winner = ArrangeWinner(1, 100, "Ana", "ana@example.com");

        // Act
        _sut.NotifyWinner(1);

        // Assert
        Assert.True(winner.Notified);
        _mailerSendAppServiceMock.Verify(m => m.SendMail(It.IsAny<MailerInfo>()), Times.Once);
        _winnerRepositoryMock.Verify(
            r => r.Update(It.Is<Winner>(w => w.WinnerId == 1 && w.Notified)), Times.Once);
    }

    [Fact]
    public void NotifyWinner_ShouldPropagateExceptionAndNeverUpdate_WhenSendMailThrows()
    {
        // Arrange
        var winner = ArrangeWinner(1, 100, "Ana", "ana@example.com");
        _mailerSendAppServiceMock
            .Setup(m => m.SendMail(It.IsAny<MailerInfo>()))
            .ThrowsAsync(new InvalidOperationException(ProviderErrorMessage));

        // Act
        var ex = Assert.Throws<InvalidOperationException>(() => _sut.NotifyWinner(1));

        // Assert
        Assert.Contains(ProviderErrorMessage, ex.Message);
        Assert.False(winner.Notified);
        _winnerRepositoryMock.Verify(r => r.Update(It.IsAny<Winner>()), Times.Never);
    }

    [Fact]
    public void NotifyWinner_ShouldLeaveFromNull_WhenSendingMail()
    {
        // Arrange
        ArrangeWinner(1, 100, "Ana", "ana@example.com");
        MailerInfo sent = null;
        _mailerSendAppServiceMock
            .Setup(m => m.SendMail(It.IsAny<MailerInfo>()))
            .Callback<MailerInfo>(m => sent = m)
            .ReturnsAsync(true);

        // Act
        _sut.NotifyWinner(1);

        // Assert
        Assert.NotNull(sent);
        Assert.Null(sent.From);
        Assert.Single(sent.To);
        Assert.Equal("ana@example.com", sent.To[0].Email);
    }

    [Fact]
    public void NotifyWinner_ShouldHtmlEncodeCampaignTitle_WhenTitleContainsHtml()
    {
        // Arrange
        ArrangeWinner(1, 100, "Ana", "ana@example.com");
        _campaignRepositoryMock
            .Setup(r => r.GetById(CampaignId))
            .Returns(new Campaign { CampaignId = CampaignId, Title = "<b>Promo & Cia</b>" });
        MailerInfo sent = null;
        _mailerSendAppServiceMock
            .Setup(m => m.SendMail(It.IsAny<MailerInfo>()))
            .Callback<MailerInfo>(m => sent = m)
            .ReturnsAsync(true);

        // Act
        _sut.NotifyWinner(1);

        // Assert
        Assert.NotNull(sent);
        Assert.Contains("&lt;b&gt;Promo &amp; Cia&lt;/b&gt;", sent.Html);
        Assert.DoesNotContain("<b>Promo & Cia</b>", sent.Html);
    }

    [Fact]
    public void NotifyAll_ShouldSummarizePartialFailures_WhenOneHasNoEmailAndOneProviderFails()
    {
        // Arrange
        var ok = ArrangeWinner(1, 100, "Ana", "ana@example.com");
        var noEmail = ArrangeWinner(2, 200, "Bruno", null);
        var providerFail = ArrangeWinner(3, 300, "Carla", "carla@example.com");

        _winnerRepositoryMock
            .Setup(r => r.ListByCampaign(CampaignId))
            .Returns(new List<Winner> { ok, noEmail, providerFail });

        _mailerSendAppServiceMock
            .Setup(m => m.SendMail(It.Is<MailerInfo>(i => i.To.Any(t => t.Email == "carla@example.com"))))
            .ThrowsAsync(new InvalidOperationException(ProviderErrorMessage));

        // Act
        NotifyAllResult result = _sut.NotifyAll(CampaignId);

        // Assert
        Assert.Equal(3, result.Total);
        Assert.Equal(1, result.Notificados);
        Assert.Equal(2, result.Falhas.Count);
        Assert.False(result.Sucesso);

        var noEmailFailure = Assert.Single(result.Falhas, f => f.WinnerId == 2);
        Assert.Contains("Participante sem e-mail", noEmailFailure.Motivo);

        var providerFailure = Assert.Single(result.Falhas, f => f.WinnerId == 3);
        Assert.Contains(ProviderErrorMessage, providerFailure.Motivo);

        Assert.NotNull(result.Erros);
        Assert.Equal(2, result.Erros.Count());

        Assert.True(ok.Notified);
        Assert.False(noEmail.Notified);
        Assert.False(providerFail.Notified);
        _winnerRepositoryMock.Verify(r => r.Update(It.Is<Winner>(w => w.WinnerId == 1)), Times.Once);
        _winnerRepositoryMock.Verify(r => r.Update(It.Is<Winner>(w => w.WinnerId != 1)), Times.Never);
    }

    [Fact]
    public void NotifyAll_ShouldReturnSuccessWithZeroTotal_WhenThereAreNoPendingWinners()
    {
        // Arrange
        _winnerRepositoryMock
            .Setup(r => r.ListByCampaign(CampaignId))
            .Returns(new List<Winner>());

        // Act
        var result = _sut.NotifyAll(CampaignId);

        // Assert
        Assert.True(result.Sucesso);
        Assert.Equal(0, result.Total);
        Assert.Equal(0, result.Notificados);
        Assert.Empty(result.Falhas);
        _mailerSendAppServiceMock.Verify(m => m.SendMail(It.IsAny<MailerInfo>()), Times.Never);
    }

    [Fact]
    public void NotifyAll_ShouldIgnoreAlreadyNotifiedWinners_WhenListingPending()
    {
        // Arrange
        var alreadyNotified = ArrangeWinner(1, 100, "Ana", "ana@example.com", notified: true);
        var pending = ArrangeWinner(2, 200, "Bruno", "bruno@example.com");

        _winnerRepositoryMock
            .Setup(r => r.ListByCampaign(CampaignId))
            .Returns(new List<Winner> { alreadyNotified, pending });

        // Act
        var result = _sut.NotifyAll(CampaignId);

        // Assert
        Assert.Equal(1, result.Total);
        Assert.Equal(1, result.Notificados);
        Assert.True(result.Sucesso);
        _mailerSendAppServiceMock.Verify(
            m => m.SendMail(It.Is<MailerInfo>(i => i.To.Any(t => t.Email == "ana@example.com"))), Times.Never);
        _mailerSendAppServiceMock.Verify(
            m => m.SendMail(It.Is<MailerInfo>(i => i.To.Any(t => t.Email == "bruno@example.com"))), Times.Once);
    }
}
