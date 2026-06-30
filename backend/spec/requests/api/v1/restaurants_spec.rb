require 'rails_helper'

RSpec.describe 'Api::V1::Restaurants', type: :request do
  describe 'GET /api/v1/restaurants' do
    let!(:aizu_restaurant)    { create(:restaurant, name: '会津食堂',   municipality: '会津若松市') }
    let!(:koriyama_restaurant) { create(:restaurant, name: '郡山食堂', municipality: '郡山市') }

    it 'municipalities[] を指定すると該当する市町村のグルメのみ返す' do
      get '/api/v1/restaurants', params: { municipalities: [ '会津若松市' ] }

      body = JSON.parse(response.body)
      names = body.map { |r| r['name'] }

      expect(names).to include('会津食堂')
      expect(names).not_to include('郡山食堂')
    end

    it 'municipalities[] を指定しなければ全件返す' do
      get '/api/v1/restaurants'

      body = JSON.parse(response.body)
      names = body.map { |r| r['name'] }

      expect(names).to include('会津食堂', '郡山食堂')
    end
  end
end
