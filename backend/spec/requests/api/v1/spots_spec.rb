require 'rails_helper'

RSpec.describe 'Api::V1::Spots', type: :request do
  describe 'GET /api/v1/spots' do
    let!(:aizu_spot)    { create(:spot, name: '鶴ヶ城',     municipality: '会津若松市') }
    let!(:koriyama_spot) { create(:spot, name: '郡山公園',  municipality: '郡山市') }

    it 'municipalities[] を指定すると該当する市町村のスポットのみ返す' do
      get '/api/v1/spots', params: { municipalities: [ '会津若松市' ] }

      body = JSON.parse(response.body)
      names = body.map { |s| s['name'] }

      expect(names).to include('鶴ヶ城')
      expect(names).not_to include('郡山公園')
    end

    it 'municipalities[] を指定しなければ全件返す' do
      get '/api/v1/spots'

      body = JSON.parse(response.body)
      names = body.map { |s| s['name'] }

      expect(names).to include('鶴ヶ城', '郡山公園')
    end
  end
end
