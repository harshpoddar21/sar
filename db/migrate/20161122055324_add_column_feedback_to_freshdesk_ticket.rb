class AddColumnFeedbackToFreshdeskTicket < ActiveRecord::Migration
  def change
    add_column :freshdesk_tickets, :feedback, :text
  end
end
