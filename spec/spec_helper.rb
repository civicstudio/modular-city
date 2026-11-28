require 'capybara/rspec'
require 'selenium-webdriver'
require 'axe-capybara'
require 'axe-rspec'

# Configure Capybara to use Selenium with headless Chrome
Capybara.register_driver :headless_chrome do |app|
  options = Selenium::WebDriver::Chrome::Options.new
  options.add_argument('--headless=new')
  options.add_argument('--no-sandbox')
  options.add_argument('--disable-gpu')
  options.add_argument('--window-size=1400,900')

  Capybara::Selenium::Driver.new(app, browser: :chrome, options: options)
end

# Chrome 158 rejects origin "*" in Storage.clearDataForOrigin, which
# Capybara 3.40.0 (the latest release) sends from reset! between examples
# ("invalid argument: * is not a valid URL").
# Clear every cookie and the test site's own storage instead.
# Remove this once a Capybara release stops sending the wildcard.
module ChromeWildcardOriginReset
  def execute_cdp(cmd, params = {})
    return super unless cmd == "Storage.clearDataForOrigin" && params[:origin] == "*"

    super("Network.clearBrowserCookies")
    origin = Capybara.current_session.server&.base_url || Capybara.app_host
    return unless origin

    super(cmd, params.merge(origin: origin))
  end
end
Capybara::Selenium::Driver::ChromeDriver.prepend(ChromeWildcardOriginReset)

Capybara.default_driver = :headless_chrome
Capybara.javascript_driver = :headless_chrome

# Point Capybara to the built Jekyll site
Capybara.app_host = "http://localhost:4000"
Capybara.run_server = false

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
