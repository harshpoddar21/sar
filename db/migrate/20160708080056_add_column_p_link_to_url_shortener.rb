class AddColumnPLinkToUrlShortener < ActiveRecord::Migration
  def change
    add_column :url_shorteners, :p_link, :text
  end
end
