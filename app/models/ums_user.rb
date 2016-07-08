class UmsUser < ActiveRecord::Base
  USER_NOT_FOUND_ID=-1
  establish_connection "ums_read_only_replica".to_sym
  self.table_name = 'USERS'


end