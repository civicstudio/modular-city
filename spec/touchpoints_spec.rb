require 'spec_helper'

# Touchpoints feedback forms and request processes, rendered from build-time data.
# The site links to Touchpoints; it never iframes it or loads its scripts.
RSpec.describe 'Touchpoints feedback and request processes', type: :feature do
  SERVICE_PAGES = %w[
    pothole-report
    business-license
    facility-rental
    public-records
  ].freeze

  SERVICE_PAGES.each do |slug|
    it "shows how a #{slug} request is handled, with no third-party iframe or script" do
      visit "/services/#{slug}.html"

      expect(page).to have_css('h2#request-heading', text: 'How your request is handled')
      expect(page).to have_css('h2#feedback-heading')
      expect(page).to have_css('a[href^="mailto:"]', minimum: 1)
      expect(page).to have_no_css('iframe')
      expect(page).to have_no_css('script[src*="touchpoints"]', visible: :all)
    end
  end

  it 'routes a pothole report through 311 with its Open311 code and expected response' do
    visit '/services/pothole-report.html'

    expect(page).to have_text('MC311-POTHOLE')
    expect(page).to have_text('Inspection within 3 business days')
    expect(page).to have_link('Report it through Modular City 311', href: '/311/#new-request')
  end

  it 'states the public records response deadline' do
    visit '/services/public-records.html'

    expect(page).to have_text('The City responds within 10 business days.')
  end

  it 'asks for park feedback on the facility rental page, naming the parks' do
    visit '/services/facility-rental.html'

    expect(page).to have_css('h2#feedback-heading', text: 'Tell us about your park visit')
    expect(page).to have_css('li', text: 'Central Park')
    expect(page).to have_link('parks@modularcity.org', href: 'mailto:parks@modularcity.org')
  end

  it 'asks for park feedback on the Parks & Recreation department page' do
    visit '/departments/parks-recreation.html'

    expect(page).to have_css('h2#feedback-heading', text: 'Tell us about your park visit')
    expect(page).to have_css('li', text: 'Riverside Park')
  end

  it 'keeps the generic feedback form on other service pages' do
    visit '/services/business-license.html'

    expect(page).to have_css('h2#feedback-heading', text: 'Was this page helpful?')
  end
end
