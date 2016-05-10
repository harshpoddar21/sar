require 'test_helper'

class SuggestControllerTest < ActionController::TestCase
  test "should get getFromTo" do
    get :getFromTo
    assert_response :success
  end

end
