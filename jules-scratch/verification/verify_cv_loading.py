import os
from playwright.sync_api import sync_playwright, expect

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Go to the local server
        page.goto('http://localhost:8000')

        # Wait for the "About" section to be populated.
        # We can check if the 'hdr' (header) span inside the about card is visible.
        about_header = page.locator('#about .card .hdr')
        expect(about_header).to_be_visible(timeout=5000)

        # Give a little extra time for all content to render, just in case.
        page.wait_for_timeout(500)

        # Take a screenshot
        page.screenshot(path='jules-scratch/verification/verification.png')

        browser.close()

if __name__ == '__main__':
    run()
