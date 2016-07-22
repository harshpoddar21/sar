class UmsUser < ActiveRecord::Base
  USER_NOT_FOUND_ID=-1
  establish_connection "ums_read_only_replica".to_sym
  self.table_name = 'USERS'



  def createNewUser phoneNumber,userType

    if phoneNumber!=nil && userType!=nil

      user=self.find_by(:PHONE_NUMBER=>phoneNumber)
      if user!=nil
        return true
      else

        success=createNewUserUms phoneNumber,userType
        return success

      end
    end


  end


  def self.createNewUserUms phoneNumber,userType

    reqParams=Hash.new
    reqParams["phoneNumber"]=phoneNumber
    reqParams["userType"]=userType
    response=ConnectionManager.makePostHttpRequest Url::CREATE_USER,reqParams,{'Content-Type' =>'application/json'},true

    if response!=nil
      response=JSON.parse response
      if response["success"]
        return true
      else
        Rails.logger.error "User creation api failed for "+phoneNumber
      end
    else
      Rails.logger.error "User creation api response failed for "+phoneNumber
    end

    return false
  end

  class UserType

    TAB_NEW_USER="SUGGEST_ROUTE_USER"

  end

  class Url
    CREATE_USER="http://goplus.in/v2/auth/user/b2b"
  end
end