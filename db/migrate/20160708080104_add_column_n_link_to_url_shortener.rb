class AddColumnNLinkToUrlShortener < ActiveRecord::Migration
  def change
    add_column :url_shorteners, :n_link, :text
  end
end
