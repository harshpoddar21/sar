module Freshdesk

  class Ticket
    FRESHDESK_DOMAIN="https://shuttl.freshdesk.com"
    VIEW_ALL_TICKETS=FRESHDESK_DOMAIN+"/api/v2/tickets?order_by=created_at&order_type=desc&per_page=100"

    def self.viewAllTickets afterTicketId

      puts "trying with ticket id"+afterTicketId.to_s
      headers=Hash.new
      headers["Content-Type"]="application/json"
      headers["Authorization"]="Basic OXZ3M1pyWGZQMEF3Skp4T0pwQ0U6c2trc2Ftc2E="


      tickets=Array.new
      isLastTicketReached=false

      pageNo=0
      ticketsProcessed=0
      while !isLastTicketReached
        pageNo=pageNo+1
        puts "pulling data for "+pageNo.to_s
        response=ConnectionManager.makeHttpRequest VIEW_ALL_TICKETS+"&page="+pageNo.to_s,headers,nil
        puts response

        if response.code.to_i!=200
          isLastTicketReached=true
          break
        end
        response=JSON.parse response.body

        if response.length==0
          isLastTicketReached=true
          break
        end
        response.each do |res|

          ticketsProcessed=ticketsProcessed+1
          puts "Tickets processed #{ticketsProcessed}"
          if res["id"]<=afterTicketId

            isLastTicketReached=true
            break

          else

            tic=FreshdeskTicket.generateTicketFromJson res

            if Time.now.to_i-tic.created_at.to_i>60*86400
              puts "2 Month old ticket breaking now"
              isLastTicketReached=true
              break
            end
            tickets.push tic



          end

        end
      end


      tickets


    end


    def self.saveAllTickets tickets


      errors=0
      tickets.each do |tic|
        begin
          tic.save
        rescue =>e
          errors=errors+1
          puts "error encountered "
          puts e.message
        end
        
      end

    end


    def self.getLastTicketId

      lastTicket=FreshdeskTicket.order(" ticket_id desc ").limit(1).first

      return lastTicket==nil ? 0 : lastTicket.ticket_id

    end



  end

end
