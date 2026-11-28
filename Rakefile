require 'rspec/core/rake_task'

RSpec::Core::RakeTask.new(:spec) do |t|
  t.pattern = 'spec/**/*_spec.rb'
end

namespace :accessibility do
  desc 'Build site, start server, and run WCAG AAA accessibility tests'
  task :test do
    require 'webrick'
    require 'fileutils'

    # Build the Jekyll site
    puts "Building Jekyll site..."
    system('bundle exec jekyll build') || abort("Jekyll build failed")

    # Start a WEBrick server in a background thread
    puts "Starting local server on port 4000..."
    server = WEBrick::HTTPServer.new(
      Port: 4000,
      DocumentRoot: File.join(Dir.pwd, '_site'),
      Logger: WEBrick::Log.new("/dev/null"),
      AccessLog: []
    )

    server_thread = Thread.new { server.start }

    # Give the server a moment to start
    sleep 1

    begin
      # Run the accessibility specs
      puts "Running WCAG AAA accessibility and page specs..."
      success = system('bundle exec rspec --format documentation')
      exit(1) unless success
    ensure
      # Shut down the server
      server.shutdown
      server_thread.join
    end
  end
end

desc 'Run accessibility tests (alias for accessibility:test)'
task a11y: 'accessibility:test'

task default: :spec
