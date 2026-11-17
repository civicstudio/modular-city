require 'jekyll'

# Renders the Touchpoints includes with ids filled in, as they will be once
# Touchpoints assigns them, without building the site or calling the network.
RSpec.describe 'Touchpoints links' do
  ROOT = File.expand_path('..', __dir__)
  FORM_ID = '11111111-2222-4333-8444-555555555555'.freeze
  STORY_URL = 'https://touchpoints.app/process-models/42/stories/abc123'.freeze

  let(:site) do
    Jekyll::Site.new(Jekyll.configuration('source' => ROOT, 'quiet' => true))
  end

  def render(template, assigns)
    Liquid::Template.parse(template).render!(
      { 'site' => site.config }.merge(assigns),
      registers: { site: site }
    )
  end

  it 'links feedback to the hosted form and pre-fills the page it came from' do
    html = render(
      '{% include touchpoints_feedback.html form=form page_url=url contact_email="feedback@modularcity.org" %}',
      'form' => { 'kind' => 'service', 'id' => FORM_ID },
      'url' => '/services/pothole-report.html'
    )

    expect(site.config['touchpoints_page_param']).to eq('page')
    expect(html).to include(
      %(href="https://touchpoints.app/touchpoints/#{FORM_ID}?page=%2Fservices%2Fpothole-report.html")
    )
    expect(html).not_to include('<iframe')
  end

  it 'links the request section to its intake form and its path-story share link' do
    html = render(
      '{% include touchpoints_request.html request=request %}',
      'request' => {
        'process' => 'public-records',
        'intake_form_id' => FORM_ID,
        'process_model_id' => '42',
        'process_story_url' => STORY_URL,
        'response_deadline_business_days' => 10
      }
    )

    expect(html).to include(%(href="https://touchpoints.app/touchpoints/#{FORM_ID}"))
    expect(html).to include(%(href="#{STORY_URL}"))
    expect(html).to include('Follow one example request through the process')
    expect(html).to include('escalated to a supervisor')
    expect(html).not_to include('being set up')
  end
end
