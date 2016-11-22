class ChangeColumnTypeToTypi < ActiveRecord::Migration

    def self.up
      rename_column :freshdesk_tickets, :type, :typi
    end

    def self.down
      # rename back if you need or do something else or do nothing
    end

end
