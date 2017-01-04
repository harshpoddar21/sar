class AddColumnSubscriptionBoughtToLLead < ActiveRecord::Migration
  def change
    add_column :l_leads, :subscription_bought, :integer
  end
end
