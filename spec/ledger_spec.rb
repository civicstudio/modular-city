require 'spec_helper'
require 'digest'
require 'json'
require 'net/http'

# Story: As a resident, I want to check that a published city record is
# unchanged, so that I don't have to take the city's word for it.
# Runs against the built site served on localhost:4000 (see Rakefile).
RSpec.describe 'Check a city record (/ledger/)', type: :feature do
  LEDGER_BASE = 'http://localhost:4000'

  def fetch(path)
    Net::HTTP.get_response(URI("#{LEDGER_BASE}#{path}"))
  end

  # RFC 6962 inclusion check, written independently of scripts/ledger_example.mjs
  # and CivilRegistry.ChainAnchor.Merkle.
  def leaf_hash(text)
    Digest::SHA256.digest("\x00".b + text.b)
  end

  def node_hash(left, right)
    Digest::SHA256.digest("\x01".b + left + right)
  end

  def proof_reaches_root?(leaf, proof, root)
    computed = proof.reduce(leaf_hash(leaf)) do |acc, step|
      sibling = [step.fetch('hash')].pack('H*')
      step.fetch('position') == 'left' ? node_hash(sibling, acc) : node_hash(acc, sibling)
    end
    computed.unpack1('H*') == root.downcase
  end

  let(:example) { JSON.parse(fetch('/ledger/example-proof.json').body) }

  it 'labels the example as fictional and not anchored' do
    expect(example['fictional']).to be(true)
    expect(example['anchored_on_chain']).to be(false)
  end

  it 'publishes a fingerprint that matches the served minutes byte for byte' do
    minutes = fetch(example['artifact']['url'])
    expect(minutes).to be_a(Net::HTTPOK)
    expect(Digest::SHA256.hexdigest(minutes.body)).to eq(example['artifact']['sha256'])
  end

  it 'names that fingerprint in the credential, whose own fingerprint is the leaf' do
    credential = fetch(example['credential']['url']).body
    expect(JSON.parse(credential).dig('credentialSubject', 'sha256')).to eq(example['artifact']['sha256'])
    expect(Digest::SHA256.hexdigest(credential)).to eq(example['inclusion_proof']['leaf'])
    expect(example['period']['leaves'].first['hash']).to eq(example['inclusion_proof']['leaf'])
  end

  it 'has an inclusion proof that reaches the day root' do
    proof = example['inclusion_proof']
    expect(proof['root']).to eq(example['period']['root'])
    expect(proof_reaches_root?(proof['leaf'], proof['proof'], proof['root'])).to be(true)
  end

  it 'rejects the proof for a different leaf' do
    proof = example['inclusion_proof']
    other = example['period']['leaves'][1]['hash']
    expect(proof_reaches_root?(other, proof['proof'], proof['root'])).to be(false)
  end

  it 'shows the fingerprint and root in the HTML itself, with no JavaScript needed' do
    html = fetch('/ledger/').body
    expect(html).to include(example['artifact']['sha256'])
    expect(html).to include(example['period']['root'])
    expect(html).not_to include('<iframe')
  end

  it 'links registry checks only when they are live' do
    visit '/ledger/'
    registry = JSON.parse(File.read(File.expand_path('../_data/public_registry.json', __dir__)))
    registry['checks'].each do |check|
      item = find("[data-registry-check='#{check['id']}']")
      if check['status'] == 'live'
        expect(item).to have_link(check['title'], href: "#{registry['base_url']}#{check['path']}")
      else
        expect(item).not_to have_link(check['title'])
      end
    end
  end

  it 'explains each registry check that carries a note' do
    visit '/ledger/'
    registry = JSON.parse(File.read(File.expand_path('../_data/public_registry.json', __dir__)))
    noted = registry['checks'].select { |check| check['note'] }
    expect(noted.map { |check| check['id'] }).to include('periods', 'anchor-proof')
    noted.each do |check|
      note = find("[data-registry-check='#{check['id']}'] [data-registry-note]")
      check['note'].each { |sentence| expect(note).to have_text(sentence) }
    end
    expect(page).to have_text('Anchor 2 shows as "Pending" until the treasury is funded')
    expect(page).not_to have_text('before the registry\'s signing keys were in place')
  end

  it 'is reachable from the footer on every page' do
    visit '/index.html'
    expect(page).to have_link('Check a City Record', href: '/ledger/')
  end
end
