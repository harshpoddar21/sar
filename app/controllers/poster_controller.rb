class PosterController < ApplicationController
	def generateNewPoster
		@pickupPoints = params["points"].split(",")
	end
end