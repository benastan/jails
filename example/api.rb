require 'sinatra'
require 'json'

helpers do
  def static_file(relative)
    File.new(File.join(Dir.pwd, 'example', relative)).read
  end
end

get '/jails.js' do
  headers['Content-Type'] = 'text/javascript'
  static_file(File.join('..', 'lib', 'jails.js'))
end
get '/jquery.js' do
  headers['Content-Type'] = 'text/javascript'
  static_file(File.join('jquery.js'))
end

get '/books.json' do
  headers['Content-Type'] ='application/json'
  static_file('books.json')
end

get '/:filename' do
  static_file(params[:filename])
end
