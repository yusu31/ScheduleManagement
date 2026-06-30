# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.2].define(version: 2026_06_30_020151) do
  create_table "events", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "title", null: false
    t.text "description"
    t.string "location"
    t.string "area", limit: 50, null: false
    t.string "category", limit: 50, null: false
    t.datetime "start_at", null: false
    t.datetime "end_at"
    t.integer "capacity"
    t.string "event_url"
    t.string "image_url"
    t.string "source", limit: 20, default: "connpass", null: false
    t.integer "connpass_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.json "tags"
    t.string "status", default: "published", null: false
    t.index ["area"], name: "index_events_on_area"
    t.index ["category"], name: "index_events_on_category"
    t.index ["connpass_id"], name: "index_events_on_connpass_id", unique: true
    t.index ["start_at"], name: "index_events_on_start_at"
    t.index ["status"], name: "index_events_on_status"
  end

  create_table "favorites", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "event_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["event_id"], name: "index_favorites_on_event_id"
    t.index ["user_id", "event_id"], name: "index_favorites_on_user_id_and_event_id", unique: true
    t.index ["user_id"], name: "index_favorites_on_user_id"
  end

  create_table "personal_events", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "title", null: false
    t.text "memo"
    t.date "event_date", null: false
    t.bigint "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.time "start_time"
    t.time "end_time"
    t.string "location"
    t.string "url"
    t.string "municipality"
    t.index ["user_id"], name: "index_personal_events_on_user_id"
  end

  create_table "region_conquests", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "region_id", null: false
    t.datetime "conquered_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "region_id"], name: "index_region_conquests_on_user_id_and_region_id", unique: true
    t.index ["user_id"], name: "index_region_conquests_on_user_id"
  end

  create_table "restaurants", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name", null: false
    t.text "description"
    t.string "area", null: false
    t.string "municipality"
    t.string "address"
    t.string "category", null: false
    t.string "genre"
    t.decimal "latitude", precision: 10, scale: 7
    t.decimal "longitude", precision: 10, scale: 7
    t.string "image_url", limit: 500
    t.string "official_url", limit: 500
    t.string "phone"
    t.string "opening_hours"
    t.string "budget"
    t.string "hotpepper_id"
    t.string "source", default: "manual"
    t.string "status", default: "published", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.json "situation_tags"
    t.index ["area"], name: "index_restaurants_on_area"
    t.index ["category"], name: "index_restaurants_on_category"
    t.index ["hotpepper_id"], name: "index_restaurants_on_hotpepper_id", unique: true
    t.index ["status"], name: "index_restaurants_on_status"
  end

  create_table "schedules", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "event_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["event_id"], name: "index_schedules_on_event_id"
    t.index ["user_id", "event_id"], name: "index_schedules_on_user_id_and_event_id", unique: true
    t.index ["user_id"], name: "index_schedules_on_user_id"
  end

  create_table "spots", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name", null: false
    t.text "description"
    t.string "area", null: false
    t.string "municipality"
    t.string "address"
    t.string "category", null: false
    t.string "season", default: "all"
    t.decimal "latitude", precision: 10, scale: 7
    t.decimal "longitude", precision: 10, scale: 7
    t.string "image_url", limit: 500
    t.string "official_url", limit: 500
    t.string "phone"
    t.string "opening_hours"
    t.string "access"
    t.string "admission_fee"
    t.string "source", default: "manual"
    t.string "status", default: "published"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["area"], name: "index_spots_on_area"
    t.index ["category"], name: "index_spots_on_category"
    t.index ["season"], name: "index_spots_on_season"
    t.index ["status"], name: "index_spots_on_status"
  end

  create_table "users", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "provider", default: "email", null: false
    t.string "uid", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.boolean "allow_password_change", default: false
    t.datetime "remember_created_at"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "unconfirmed_email"
    t.string "name"
    t.string "nickname"
    t.string "image"
    t.string "email"
    t.text "tokens"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "role", default: "user", null: false
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["role"], name: "index_users_on_role"
    t.index ["uid", "provider"], name: "index_users_on_uid_and_provider", unique: true
  end

  create_table "visit_records", charset: "utf8mb4", collation: "utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "event_id"
    t.string "municipality", limit: 100, null: false
    t.string "companion_type", limit: 20, null: false
    t.text "photo_url", size: :medium
    t.datetime "visited_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "memo"
    t.index ["event_id"], name: "index_visit_records_on_event_id"
    t.index ["user_id", "municipality"], name: "index_visit_records_on_user_id_and_municipality"
    t.index ["user_id"], name: "index_visit_records_on_user_id"
  end

  add_foreign_key "favorites", "events"
  add_foreign_key "favorites", "users"
  add_foreign_key "personal_events", "users"
  add_foreign_key "region_conquests", "users"
  add_foreign_key "schedules", "events"
  add_foreign_key "schedules", "users"
  add_foreign_key "visit_records", "events"
  add_foreign_key "visit_records", "users"
end
