class ChangeDatatypeLlead < ActiveRecord::Migration
  def change

    change_column(:l_leads, :campaign_id, :text)
    change_column(:l_leads,:channel_category_id,:text)
    change_column(:l_leads,:channel_id,:text)

  end
end
