class AddColumnIsVerifiedToAffiliate < ActiveRecord::Migration
  def change
    add_column :affiliates, :is_verified, :integer
  end
end
