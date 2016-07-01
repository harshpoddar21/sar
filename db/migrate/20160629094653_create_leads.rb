class CreateLeads < ActiveRecord::Migration
  def change
    create_table :leads do |t|
      t.text :number

      t.timestamps null: false
    end
  end
end
