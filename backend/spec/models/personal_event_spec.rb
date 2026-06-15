require 'rails_helper'

RSpec.describe PersonalEvent, type: :model do
  let(:user) { create(:user) }

  describe 'バリデーション' do
    it 'title と event_date と user があれば有効' do
      event = build(:personal_event, title: 'テストイベント', event_date: Date.today, user: user)
      expect(event).to be_valid
    end

    it 'title が空なら無効' do
      event = build(:personal_event, title: nil, user: user)
      expect(event).not_to be_valid
      expect(event.errors[:title]).to include("can't be blank")
    end

    it 'event_date が空なら無効' do
      event = build(:personal_event, event_date: nil, user: user)
      expect(event).not_to be_valid
      expect(event.errors[:event_date]).to include("can't be blank")
    end

    it 'user がなければ無効' do
      event = build(:personal_event, user: nil)
      expect(event).not_to be_valid
      expect(event.errors[:user]).to be_present
    end
  end

  describe '#as_json' do
    let(:event) do
      create(:personal_event,
             user: user,
             start_time: Time.zone.parse('10:30'),
             end_time: Time.zone.parse('12:00'))
    end

    it 'start_time を HH:MM 形式で返す' do
      expect(event.as_json['start_time']).to eq('10:30')
    end

    it 'end_time を HH:MM 形式で返す' do
      expect(event.as_json['end_time']).to eq('12:00')
    end

    it 'start_time が nil のとき nil を返す' do
      event.start_time = nil
      expect(event.as_json['start_time']).to be_nil
    end
  end
end
