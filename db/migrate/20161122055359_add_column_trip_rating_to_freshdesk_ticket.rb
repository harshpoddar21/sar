class AddColumnTripRatingToFreshdeskTicket < ActiveRecord::Migration
  def change
    add_column :freshdesk_tickets, :trip_rating, :integer
  end
end
