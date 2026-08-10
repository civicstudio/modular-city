require 'capybara/rspec'
require 'rack'
require 'selenium-webdriver'
require 'axe-capybara'
require 'axe-rspec'
require 'stringio'
require 'webrick'

# Configure Capybara to use Selenium with headless Chrome
Capybara.register_driver :headless_chrome do |app|
  options = Selenium::WebDriver::Chrome::Options.new
  options.add_argument('--headless=new')
  options.add_argument('--no-sandbox')
  options.add_argument('--disable-gpu')
  options.add_argument('--window-size=1400,900')

  Capybara::Selenium::Driver.new(app, browser: :chrome, options: options)
end

Capybara.default_driver = :headless_chrome
Capybara.javascript_driver = :headless_chrome

# Serve the built Jekyll site directly from this repository.
Capybara.app = Rack::Files.new(File.expand_path('../_site', __dir__))
Capybara.run_server = true
Capybara.register_server :static_webrick do |app, port, host|
  server = WEBrick::HTTPServer.new(
    AccessLog: [],
    BindAddress: host,
    Logger: WEBrick::Log.new(File::NULL),
    Port: port
  )

  server.mount_proc '/' do |request, response|
    rack_env = Rack::MockRequest.env_for(
      request.unparsed_uri,
      'REQUEST_METHOD' => request.request_method,
      'rack.input' => StringIO.new(request.body.to_s)
    )
    rack_env['HTTP_HOST'] = request.host

    status, headers, body = app.call(rack_env)
    response.status = status
    headers.each do |name, value|
      response[name] = value.to_s unless name.downcase.start_with?('rack.')
    end
    response.body = +''
    body.each { |chunk| response.body << chunk }
  ensure
    body.close if body.respond_to?(:close)
  end

  server.start
end
Capybara.server = :static_webrick

RSpec.configure do |config|
  config.expect_with :rspec do |expectations|
    expectations.include_chain_clauses_in_custom_matcher_descriptions = true
  end

  config.mock_with :rspec do |mocks|
    mocks.verify_partial_doubles = true
  end

  config.shared_context_metadata_behavior = :apply_to_host_groups
  config.filter_run_when_matching :focus
  config.disable_monkey_patching!
  config.warnings = true
  config.order = :random
  Kernel.srand config.seed
end
