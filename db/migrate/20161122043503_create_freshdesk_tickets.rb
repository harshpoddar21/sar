class CreateFreshdeskTickets < ActiveRecord::Migration
  def change
    create_table :freshdesk_tickets do |t|
      t.text :subject
      t.text :description
      t.text :status
      t.text :priority
      t.text :source
      t.text :type
      t.text :requester_email
      t.text :requester_phone
      t.datetime :created_at
      t.text :phone_number
      t.integer :route_id
      t.text :category
      t.text :issue
      t.text :issue_type
      t.integer :booking_id
      t.integer :ticket_id

      t.timestamps null: false
    end
  end
end
