require 'rails_helper'

RSpec.describe Spot, type: :model do
  describe 'municipality バリデーション' do
    it '福島県の市町村なら有効' do
      spot = build(:spot, municipality: '会津若松市')
      expect(spot).to be_valid
    end

    it '空なら無効' do
      spot = build(:spot, municipality: nil)
      expect(spot).not_to be_valid
      expect(spot.errors[:municipality]).to include("can't be blank")
    end

    it '福島県の市町村に含まれない値なら無効' do
      spot = build(:spot, municipality: '東京都')
      expect(spot).not_to be_valid
    end
  end
end
