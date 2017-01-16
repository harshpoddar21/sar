class AddColumnFeedbackChannelToLLeadFeedback < ActiveRecord::Migration
  def change
    add_column :l_lead_feedbacks, :feedback_channel, :text
  end
end
