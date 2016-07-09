class AddColumnChannelToNewLead < ActiveRecord::Migration
  def change
    add_column :new_leads, :channel, :text
  end
end
