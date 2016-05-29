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

ActiveRecord::Schema.define(version: 20160529135943) do

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

  create_table "locations", force: :cascade do |t|
    t.text     "name",       limit: 65535
    t.float    "lat",        limit: 24
    t.float    "lng",        limit: 24
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
  end

  create_table "route_exists", force: :cascade do |t|
    t.text     "name",         limit: 65535
    t.text     "route_points", limit: 65535
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
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
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
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
  end

end
