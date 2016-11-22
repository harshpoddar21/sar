class DataUpdater

  def self.refreshFreshDeskData

    lastTicketId=Freshdesk::Ticket.getLastTicketId
    refreshedTickets=Freshdesk::Ticket.viewAllTickets lastTicketId
    Freshdesk::Ticket.saveAllTickets refreshedTickets

  end
end