class TabController



  def createRoute

    systemRoute=params[:routeId]
    pickUp=params[:pick]
    pickUp=JSON.parse pickUp
    drop=params[:drop]
    drop=JSON.parse drop
    if systemRoute!nil
      TabPick.where(:routeid=>85)
    end
  end

end