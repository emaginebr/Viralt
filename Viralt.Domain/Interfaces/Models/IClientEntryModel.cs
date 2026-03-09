using System;
using System.Collections.Generic;
using Viralt.Domain.Interfaces.Factory;

namespace Viralt.Domain.Interfaces.Models
{
    public interface IClientEntryModel
    {
        long ClientEntryId { get; set; }
        long ClientId { get; set; }
        long EntryId { get; set; }
        int Status { get; set; }
        string EntryValue { get; set; }

        IClientEntryModel Insert(IClientEntryDomainFactory factory);
        IClientEntryModel Update(IClientEntryDomainFactory factory);
        IClientEntryModel GetById(long clientEntryId, IClientEntryDomainFactory factory);
        IEnumerable<IClientEntryModel> ListByClient(long clientId, IClientEntryDomainFactory factory);
        void Delete(long clientEntryId, IClientEntryDomainFactory factory);
    }
}