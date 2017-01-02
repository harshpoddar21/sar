class CreateLBtlChannels < ActiveRecord::Migration
  def change
    create_table :l_btl_channels do |t|
      t.text :name
      t.text :phone_number

      t.timestamps null: false
    end
  end
end
