require 'rails_helper'

RSpec.describe Event, type: :model do
  describe 'area バリデーション' do
    it '13市町村に含まれない市町村（会津若松市）でも有効' do
      event = build(:event, area: '会津若松市')
      expect(event).to be_valid
    end

    it 'オンラインなら有効' do
      event = build(:event, area: 'オンライン')
      expect(event).to be_valid
    end

    it '福島県の市町村でもオンラインでもない値なら無効' do
      event = build(:event, area: '東京都')
      expect(event).not_to be_valid
      expect(event.errors[:area]).to be_present
    end

    it 'その他はもう許可されない' do
      event = build(:event, area: 'その他')
      expect(event).not_to be_valid
    end
  end
end
