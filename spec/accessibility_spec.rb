require 'spec_helper'

RSpec.describe 'WCAG AAA Accessibility', type: :feature do
  # All site paths to test (with .html for static file serving)
  PATHS = [
    '/index.html',
    '/services.html',
    '/departments.html',
    '/government.html',
    '/calendar.html',
    '/blog.html',
    '/beta/index.html'
  ].freeze

  # WCAG AAA includes all A, AA, and AAA criteria
  WCAG_AAA_TAGS = [
    'wcag2a',
    'wcag2aa',
    'wcag2aaa',
    'wcag21a',
    'wcag21aa',
    'wcag21aaa',
    'wcag22aa',
    'best-practice'
  ].freeze

  PATHS.each do |path|
    describe "#{path}" do
      before do
        visit path
      end

      it "meets WCAG AAA accessibility standards" do
        expect(page).to be_axe_clean.according_to(*WCAG_AAA_TAGS)
      end

      it "has no critical accessibility violations" do
        expect(page).to be_axe_clean.checking_only(
          'aria-allowed-attr',
          'aria-hidden-body',
          'aria-required-children',
          'aria-required-parent',
          'aria-roles',
          'aria-valid-attr-value',
          'aria-valid-attr',
          'button-name',
          'bypass',
          'color-contrast',
          'document-title',
          'duplicate-id',
          'form-field-multiple-labels',
          'frame-title',
          'html-has-lang',
          'html-lang-valid',
          'image-alt',
          'input-button-name',
          'input-image-alt',
          'label',
          'link-name',
          'list',
          'listitem',
          'meta-refresh',
          'meta-viewport',
          'object-alt',
          'role-img-alt',
          'scrollable-region-focusable',
          'select-name',
          'server-side-image-map',
          'svg-img-alt',
          'td-headers-attr',
          'th-has-data-cells',
          'valid-lang',
          'video-caption'
        )
      end
    end
  end

  describe "color contrast (AAA enhanced)" do
    PATHS.each do |path|
      it "#{path} meets enhanced color contrast ratio (7:1)" do
        visit path
        # AAA requires 7:1 contrast for normal text, 4.5:1 for large text
        expect(page).to be_axe_clean.checking_only('color-contrast-enhanced')
      end
    end
  end
end
