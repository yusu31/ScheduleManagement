require 'rails_helper'

RSpec.describe Restaurant, type: :model do
  describe 'municipality バリデーション' do
    it '福島県の市町村なら有効' do
      restaurant = build(:restaurant, municipality: '会津若松市')
      expect(restaurant).to be_valid
    end

    it '空なら無効' do
      restaurant = build(:restaurant, municipality: nil)
      expect(restaurant).not_to be_valid
      expect(restaurant.errors[:municipality]).to include("can't be blank")
    end

    it '福島県の市町村に含まれない値なら無効' do
      restaurant = build(:restaurant, municipality: '東京都')
      expect(restaurant).not_to be_valid
    end
  end
end
