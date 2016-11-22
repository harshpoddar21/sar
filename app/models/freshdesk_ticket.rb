class FreshdeskTicket < ActiveRecord::Base

  def self.generateTicketFromJson json


    ticket=FreshdeskTicket.new
    ticket.ticket_id=json["ticket_id"]
    ticket.subject=json["subject"]
    ticket.description=json["description"]
    if ticket.subject=="Trip feedback from app"

      ticket.booking_id=self.extractBookingIdFromTripFeedback ticket.description
      ticket.route_id=self.extractRouteIdFromTripFeedback ticket.description
      ticket.feedback=self.extractFeedbackFromDescription ticket.description
      ticket.trip_rating=self.extractTripRatingFromDescription ticket.description
    else
      ticket.booking_id=json["custom_fields"]["booking_id"]
      ticket.route_id=json["custom_fields"]["route_id"]

    end

    ticket.description=ActiveRecord::Base.connection.quote(ticket.description)

    ticket.status=json["status"]
    ticket.priority=json["priority"]
    ticket.source=json["source"]
    ticket.typi=json["type"]
    ticket.requester_email=json["requester_email"]
    ticket.requester_phone=json["requester_phone"]
    ticket.created_at=json["created_at"]
    ticket.phone_number=json["phone_number"]
    ticket.category=json["category"]
    ticket.issue=json["issue"]
    ticket.issue_type=json["issue_type"]
    ticket.ticket_id=json["id"]
    ticket

  end


  def self.extractBookingIdFromTripFeedback description

    if /Booking Id : (\d+)/.match(description).length==2
      return /Booking Id : (\d+)/.match(description)[1].to_i
    else
      return 0
    end

  end


  def self.extractRouteIdFromTripFeedback description

    if  /route_id: (\d+)/.match(description).length==2
      return  /route_id: (\d+)/.match(description)[1].to_i
    else
      return 0
    end

  end

  def self.extractFeedbackFromDescription description


    if /user feedback : (.*), user type/.match(description).length==2
      return /user feedback : (.*), user type/.match(description)[1]
    else
      return nil
    end

  end


  def self.extractTripRatingFromDescription description


    if /rating for issue : (\d)/.match(description).length==2
      return /rating for issue : (\d)/.match(description)[1]
    else
      return 0
    end
  end





end
