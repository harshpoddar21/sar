# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20170108111504) do

  create_table "Route_Suggestion_Combined", primary_key: "ID", force: :cascade do |t|
    t.string  "USER_ID",           limit: 20
    t.string  "PHONE_NUMBER",      limit: 20
    t.decimal "FROM_LAT",                      precision: 8, scale: 6
    t.decimal "FROM_LNG",                      precision: 8, scale: 6
    t.decimal "TO_LAT",                        precision: 8, scale: 6
    t.decimal "TO_LNG",                        precision: 8, scale: 6
    t.date    "DATE_CREATED"
    t.string  "DATA_BASE",         limit: 20
    t.string  "APP_DOWNLOAD",      limit: 10
    t.date    "LAST_BOOKING_DATE"
    t.string  "LAST_ACTIVE_ROUTE", limit: 20
    t.string  "PLEDGE_AMOUNT",     limit: 20
    t.string  "ROUTE_TYPE",        limit: 30
    t.string  "ROUTE_ID",          limit: 20
    t.string  "HOME_PICKUP",       limit: 255
    t.string  "OFFICE_DROP",       limit: 255
  end

  create_table "affiliates", force: :cascade do |t|
    t.text     "phone_number", limit: 65535
    t.integer  "agent_id",     limit: 4
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
    t.integer  "is_verified",  limit: 4
  end

  create_table "boarding_assistances", force: :cascade do |t|
    t.text     "owner_phone_number", limit: 65535
    t.text     "from",               limit: 65535
    t.text     "to",                 limit: 65535
    t.integer  "route_id",           limit: 4
    t.text     "exec_no",            limit: 65535
    t.datetime "created_at",                       null: false
    t.datetime "updated_at",                       null: false
    t.text     "lead_phone_number",  limit: 65535
  end

  create_table "boarding_requests", force: :cascade do |t|
    t.text     "from",                    limit: 65535
    t.text     "to",                      limit: 65535
    t.text     "phone_number",            limit: 65535
    t.text     "channelId",               limit: 65535
    t.text     "channelCategoryId",       limit: 65535
    t.text     "campaignId",              limit: 65535
    t.integer  "requested_boarding_time", limit: 4
    t.datetime "created_at",                            null: false
    t.datetime "updated_at",                            null: false
    t.text     "channel_category_id",     limit: 65535
    t.text     "channel_id",              limit: 65535
    t.text     "campaign_id",             limit: 65535
    t.integer  "ums_booking_id",          limit: 4
    t.integer  "reminder_sent",           limit: 4
  end

  create_table "boarding_sms_campaign_messages", force: :cascade do |t|
    t.text     "from",       limit: 65535
    t.text     "to",         limit: 65535
    t.text     "message",    limit: 65535
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
  end

  create_table "boardings", force: :cascade do |t|
    t.text     "customer_number", limit: 65535
    t.integer  "booking_id",      limit: 4
    t.integer  "promoter_id",     limit: 4
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
  end

  create_table "booking_follows", force: :cascade do |t|
    t.integer  "booking_id",                limit: 4
    t.text     "phone_number",              limit: 65535
    t.text     "called",                    limit: 65535
    t.text     "response",                  limit: 65535
    t.datetime "created_at",                              null: false
    t.datetime "updated_at",                              null: false
    t.integer  "trip_rating",               limit: 4
    t.integer  "count_link_sent",           limit: 4
    t.integer  "count_clicked_on_positive", limit: 4
    t.integer  "count_clicked_on_negative", limit: 4
  end

  create_table "booking_referrals", force: :cascade do |t|
    t.text     "phone_number", limit: 65535
    t.integer  "dest",         limit: 4
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
    t.integer  "origin",       limit: 4
    t.integer  "destination",  limit: 4
  end

  create_table "campaign_managers", force: :cascade do |t|
    t.text     "phone_number",          limit: 65535
    t.integer  "campaign_id",           limit: 4
    t.integer  "time_sent",             limit: 4
    t.integer  "positive_link_clicked", limit: 4
    t.integer  "negative_link_clicked", limit: 4
    t.datetime "created_at",                          null: false
    t.datetime "updated_at",                          null: false
    t.integer  "campaign_type",         limit: 4
  end

  create_table "customer_suggestions", force: :cascade do |t|
    t.text     "from_str",        limit: 65535
    t.float    "from_lat",        limit: 24
    t.float    "from_lng",        limit: 24
    t.float    "to_lat",          limit: 24
    t.float    "to_lng",          limit: 24
    t.text     "to_str",          limit: 65535
    t.text     "customer_number", limit: 65535
    t.text     "from_time",       limit: 65535
    t.text     "to_time",         limit: 65535
    t.text     "from_mode",       limit: 65535
    t.text     "to_mode",         limit: 65535
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
    t.integer  "routeid",         limit: 4
    t.integer  "route_type",      limit: 4
    t.text     "sub_status",      limit: 65535
    t.text     "sub_id",          limit: 65535
    t.text     "source",          limit: 65535
  end

  create_table "dtc_locations", force: :cascade do |t|
    t.text     "name",       limit: 65535
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
  end

  create_table "dtc_route_locations", force: :cascade do |t|
    t.integer  "routeid",    limit: 4
    t.integer  "locationid", limit: 4
    t.datetime "created_at",           null: false
    t.datetime "updated_at",           null: false
  end

  create_table "dtc_routes", force: :cascade do |t|
    t.text     "name",       limit: 65535
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
  end

  create_table "evening_times", force: :cascade do |t|
    t.text     "phone_number", limit: 65535
    t.text     "evening_time", limit: 65535
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
  end

  create_table "feedbacks", force: :cascade do |t|
    t.integer  "booking_id",     limit: 4
    t.text     "channel",        limit: 65535
    t.integer  "time_sent",      limit: 4
    t.integer  "time_responded", limit: 4
    t.text     "response",       limit: 65535
    t.datetime "created_at",                   null: false
    t.datetime "updated_at",                   null: false
    t.text     "phone_number",   limit: 65535
  end

  create_table "freshdesk_tickets", force: :cascade do |t|
    t.text     "subject",         limit: 65535
    t.text     "description",     limit: 65535
    t.text     "status",          limit: 65535
    t.text     "priority",        limit: 65535
    t.text     "source",          limit: 65535
    t.text     "typi",            limit: 65535
    t.text     "requester_email", limit: 65535
    t.text     "requester_phone", limit: 65535
    t.datetime "created_at",                    null: false
    t.text     "phone_number",    limit: 65535
    t.integer  "route_id",        limit: 4
    t.text     "category",        limit: 65535
    t.text     "issue",           limit: 65535
    t.text     "issue_type",      limit: 65535
    t.integer  "booking_id",      limit: 4
    t.integer  "ticket_id",       limit: 4
    t.datetime "updated_at",                    null: false
    t.text     "feedback",        limit: 65535
    t.integer  "trip_rating",     limit: 4
  end

  create_table "get_suggestion_via_tabs", force: :cascade do |t|
    t.text     "customer_number", limit: 65535
    t.text     "from_str",        limit: 65535
    t.text     "from_mode",       limit: 65535
    t.text     "to_mode",         limit: 65535
    t.text     "from_time",       limit: 65535
    t.text     "to_time",         limit: 65535
    t.integer  "routeid",         limit: 4
    t.integer  "route_type",      limit: 4
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
    t.text     "to_str",          limit: 65535
    t.integer  "make_booking",    limit: 4
    t.integer  "repeat_user",     limit: 4
    t.integer  "promoter_id",     limit: 4
    t.integer  "fraud_detector",  limit: 4
    t.integer  "from_id",         limit: 4
    t.integer  "to_id",           limit: 4
    t.text     "affiliate",       limit: 65535
    t.integer  "unsubscribed",    limit: 4
  end

  create_table "graph_coordinates", force: :cascade do |t|
    t.integer "x",   limit: 4
    t.integer "y",   limit: 4
    t.decimal "lat",           precision: 8, scale: 6
    t.decimal "lon",           precision: 8, scale: 6
  end

  create_table "graph_dist_times", id: false, force: :cascade do |t|
    t.integer "origin_id", limit: 4, default: 0, null: false
    t.integer "dest_id",   limit: 4, default: 0, null: false
    t.integer "dist",      limit: 4
    t.integer "duration",  limit: 4
  end

  create_table "ivr_call_logs", force: :cascade do |t|
    t.text     "phone_number", limit: 65535
    t.integer  "success",      limit: 4
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
  end

  create_table "l_btl_channels", force: :cascade do |t|
    t.text     "name",         limit: 65535
    t.text     "phone_number", limit: 65535
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
    t.text     "channel_id",   limit: 65535
  end

  create_table "l_channel_categories", force: :cascade do |t|
    t.text     "name",                limit: 65535
    t.datetime "created_at",                        null: false
    t.datetime "updated_at",                        null: false
    t.text     "channel_category_id", limit: 65535
  end

  create_table "l_lead_routes", force: :cascade do |t|
    t.integer  "route_id",         limit: 4
    t.datetime "created_at",                     null: false
    t.datetime "updated_at",                     null: false
    t.integer  "is_reverse_route", limit: 4
    t.text     "name",             limit: 65535
  end

  create_table "l_leads", force: :cascade do |t|
    t.text     "email",               limit: 65535
    t.text     "phone_number",        limit: 65535
    t.text     "from",                limit: 65535
    t.text     "to",                  limit: 65535
    t.text     "mode_of_comute",      limit: 65535
    t.text     "answer",              limit: 65535
    t.text     "prefilled_answer",    limit: 65535
    t.text     "campaign_id",         limit: 65535
    t.datetime "created_at",                        null: false
    t.datetime "updated_at",                        null: false
    t.integer  "is_interested",       limit: 4
    t.text     "channel_category_id", limit: 65535
    t.text     "channel_id",          limit: 65535
    t.integer  "route_id",            limit: 4
    t.integer  "no_of_rides",         limit: 4
    t.integer  "subscription_bought", limit: 4
  end

  create_table "l_new_lead_campaigns", force: :cascade do |t|
    t.text     "name",        limit: 65535
    t.text     "description", limit: 65535
    t.datetime "created_at",                null: false
    t.datetime "updated_at",                null: false
  end

  create_table "l_queries", force: :cascade do |t|
    t.text     "phone_number",        limit: 65535
    t.text     "query",               limit: 65535
    t.text     "campaign_id",         limit: 65535
    t.text     "channel_id",          limit: 65535
    t.text     "channel_category_id", limit: 65535
    t.datetime "created_at",                        null: false
    t.datetime "updated_at",                        null: false
  end

  create_table "l_unsubscribes", force: :cascade do |t|
    t.integer  "issue_type",          limit: 4
    t.text     "phone_number",        limit: 65535
    t.text     "category_channel_id", limit: 65535
    t.text     "channel_id",          limit: 65535
    t.text     "campaign_id",         limit: 65535
    t.datetime "created_at",                        null: false
    t.datetime "updated_at",                        null: false
    t.text     "issue_id",            limit: 65535
  end

  create_table "lead_convertors", force: :cascade do |t|
    t.text     "phone_number",  limit: 65535
    t.text     "email",         limit: 65535
    t.text     "answer",        limit: 65535
    t.integer  "is_interested", limit: 4
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
  end

  create_table "leads", force: :cascade do |t|
    t.text     "number",     limit: 65535
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
  end

  create_table "locations", force: :cascade do |t|
    t.text     "name",       limit: 65535
    t.float    "lat",        limit: 24
    t.float    "lng",        limit: 24
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
  end

  create_table "new_leads", force: :cascade do |t|
    t.text     "phone_number",              limit: 65535
    t.integer  "whatsapp_status",           limit: 4
    t.datetime "acquired_date"
    t.integer  "subscription_status",       limit: 4
    t.integer  "count_link_sent",           limit: 4
    t.integer  "count_clicked_on_positive", limit: 4
    t.integer  "count_clicked_on_negative", limit: 4
    t.datetime "created_at",                              null: false
    t.datetime "updated_at",                              null: false
    t.text     "from_location",             limit: 65535
    t.text     "to_location",               limit: 65535
    t.integer  "user_id",                   limit: 4
    t.integer  "called",                    limit: 4
    t.integer  "interested",                limit: 4
    t.text     "response",                  limit: 65535
    t.text     "channel",                   limit: 65535
    t.text     "from_time",                 limit: 65535
    t.text     "to_time",                   limit: 65535
  end

  create_table "otp_messages", force: :cascade do |t|
    t.integer  "otp",          limit: 4
    t.text     "phone_number", limit: 65535
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
  end

  create_table "pick_up_point_cluster_mappings", force: :cascade do |t|
    t.text     "name",       limit: 65535
    t.integer  "from_id",    limit: 4
    t.text     "cluster",    limit: 65535
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
  end

  create_table "pick_ups", force: :cascade do |t|
    t.text     "name",       limit: 65535
    t.float    "lat",        limit: 24
    t.float    "lng",        limit: 24
    t.integer  "routeid",    limit: 4
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
    t.text     "landmark",   limit: 65535
  end

  create_table "point_owners", force: :cascade do |t|
    t.text     "from",               limit: 65535
    t.text     "owner_phone_number", limit: 65535
    t.datetime "created_at",                       null: false
    t.datetime "updated_at",                       null: false
  end

  create_table "poster_referrals", force: :cascade do |t|
    t.text     "code",         limit: 65535
    t.text     "phone_number", limit: 65535
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
  end

  create_table "prices", force: :cascade do |t|
    t.integer  "routeid",      limit: 4
    t.integer  "price",        limit: 4
    t.integer  "pass_type",    limit: 4
    t.datetime "created_at",             null: false
    t.datetime "updated_at",             null: false
    t.integer  "offer_price",  limit: 4
    t.integer  "price_single", limit: 4
    t.integer  "no_of_rides",  limit: 4
  end

  create_table "promoters", force: :cascade do |t|
    t.text     "username",   limit: 65535
    t.text     "password",   limit: 65535
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
    t.text     "name",       limit: 65535
  end

  create_table "pt_customer_responses", force: :cascade do |t|
    t.text     "phone_number", limit: 65535
    t.integer  "response",     limit: 4
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
  end

  create_table "referral_codes", force: :cascade do |t|
    t.text     "phone_number", limit: 65535
    t.text     "code",         limit: 65535
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
  end

  create_table "referral_leads", force: :cascade do |t|
    t.text     "phone_number",  limit: 65535
    t.integer  "referral_code", limit: 4
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
  end

  create_table "route_cybercity", primary_key: "cord_id", force: :cascade do |t|
    t.integer "row_id",    limit: 4
    t.decimal "start_lat",           precision: 8, scale: 6
    t.decimal "start_lon",           precision: 8, scale: 6
    t.decimal "end_lat",             precision: 8, scale: 6
    t.decimal "end_lon",             precision: 8, scale: 6
  end

  create_table "route_eta_statuses", force: :cascade do |t|
    t.integer  "routeid",    limit: 4
    t.integer  "eta_status", limit: 4
    t.datetime "created_at",           null: false
    t.datetime "updated_at",           null: false
    t.integer  "driverid",   limit: 4
    t.integer  "trip_id",    limit: 4
  end

  create_table "route_exists", force: :cascade do |t|
    t.text     "name",         limit: 65535
    t.text     "route_points", limit: 65535
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
    t.integer  "deleted",      limit: 4
  end

  create_table "route_suggestion_and_live_summaries", force: :cascade do |t|
    t.integer  "route_type",        limit: 4
    t.integer  "routeid",           limit: 4
    t.integer  "timeslot",          limit: 4
    t.integer  "people_interested", limit: 4
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
  end

  create_table "route_suggests", force: :cascade do |t|
    t.text     "name",         limit: 65535
    t.text     "route_points", limit: 65535
    t.datetime "created_at"
    t.datetime "updated_at",                 null: false
    t.text     "fromname",     limit: 65535
    t.text     "toname",       limit: 65535
  end

  create_table "slots", force: :cascade do |t|
    t.integer  "routeid",          limit: 4
    t.integer  "timeinmins",       limit: 4
    t.integer  "locationid",       limit: 4
    t.integer  "deleted",          limit: 4
    t.integer  "distanceinmeters", limit: 4
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
  end

  create_table "subscriptions", force: :cascade do |t|
    t.text     "customer_number", limit: 65535
    t.float    "from_lat",        limit: 24
    t.float    "from_lng",        limit: 24
    t.float    "to_lat",          limit: 24
    t.float    "to_lng",          limit: 24
    t.text     "from_str",        limit: 65535
    t.text     "from_mode",       limit: 65535
    t.text     "from_time",       limit: 65535
    t.text     "to_time",         limit: 65535
    t.text     "to_str",          limit: 65535
    t.text     "to_mode",         limit: 65535
    t.integer  "route_type",      limit: 4
    t.integer  "routeid",         limit: 4
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
  end

  create_table "tab_drops", force: :cascade do |t|
    t.integer  "routeid",     limit: 4
    t.text     "name",        limit: 65535
    t.datetime "created_at",                null: false
    t.datetime "updated_at",                null: false
    t.integer  "location_id", limit: 4
    t.integer  "route_id",    limit: 4
  end

  create_table "tab_pick_news", force: :cascade do |t|
    t.integer  "location_id", limit: 4
    t.text     "name",        limit: 65535
    t.datetime "created_at",                null: false
    t.datetime "updated_at",                null: false
  end

  create_table "tab_picks", force: :cascade do |t|
    t.integer  "routeid",     limit: 4
    t.text     "name",        limit: 65535
    t.datetime "created_at",                null: false
    t.datetime "updated_at",                null: false
    t.integer  "location_id", limit: 4
  end

  create_table "tab_routes", force: :cascade do |t|
    t.text     "name",       limit: 65535
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
    t.integer  "routeid",    limit: 4
  end

  create_table "timestamp_suggests", force: :cascade do |t|
    t.integer  "routeid",    limit: 4
    t.integer  "fromtime",   limit: 4
    t.integer  "totime",     limit: 4
    t.integer  "interval",   limit: 4
    t.datetime "created_at",           null: false
    t.datetime "updated_at",           null: false
  end

  create_table "timestamps", force: :cascade do |t|
    t.datetime "fromtime"
    t.datetime "totime"
    t.integer  "interval",   limit: 4
    t.integer  "deleted",    limit: 4
    t.datetime "created_at",           null: false
    t.datetime "updated_at",           null: false
    t.integer  "routeid",    limit: 4
  end

  create_table "transactions", force: :cascade do |t|
    t.text     "phone_number", limit: 65535
    t.text     "email",        limit: 65535
    t.integer  "status",       limit: 4
    t.text     "comments",     limit: 65535
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
    t.integer  "amount",       limit: 4
    t.text     "comment",      limit: 65535
    t.text     "route_type",   limit: 65535
    t.integer  "routeid",      limit: 4
    t.text     "referred_by",  limit: 65535
  end

  create_table "trip_eta", force: :cascade do |t|
    t.integer  "eta",        limit: 4
    t.integer  "locationid", limit: 4
    t.integer  "routeid",    limit: 4
    t.integer  "start_time", limit: 4
    t.text     "remarks",    limit: 65535
    t.integer  "driverid",   limit: 4
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
  end

  create_table "url_shortener_bookings", force: :cascade do |t|
    t.integer  "booking_id", limit: 4
    t.text     "p_link",     limit: 65535
    t.text     "n_link",     limit: 65535
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
  end

  create_table "url_shorteners", force: :cascade do |t|
    t.integer  "new_lead_id", limit: 4
    t.text     "url_long",    limit: 65535
    t.integer  "sign",        limit: 4
    t.datetime "created_at",                null: false
    t.datetime "updated_at",                null: false
    t.text     "p_link",      limit: 65535
    t.text     "n_link",      limit: 65535
  end

  create_table "user_campaign_statuses", force: :cascade do |t|
    t.integer  "campaign_id",  limit: 4
    t.integer  "times_sent",   limit: 4
    t.integer  "unsubscribed", limit: 4
    t.datetime "created_at",             null: false
    t.datetime "updated_at",             null: false
  end

  create_table "whats_app_data", force: :cascade do |t|
    t.text     "location",   limit: 65535
    t.text     "data",       limit: 16777215
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
  end

  create_table "whatsapps", force: :cascade do |t|
    t.text     "group_name",       limit: 65535
    t.text     "group_identifier", limit: 65535
    t.datetime "created_at",                     null: false
    t.datetime "updated_at",                     null: false
  end

end
