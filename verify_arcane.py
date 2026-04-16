from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    # 1. Landing and Exploration
    page.goto("http://localhost:5173")
    page.wait_for_timeout(4000) # Wait for loader to finish
    page.screenshot(path="/home/jules/verification/screenshots/landing.png")

    # 2. Search for a specific book
    page.get_by_placeholder("Seek forbidden knowledge...").fill("Kybalion")
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/search_results.png")

    # 3. View Details
    page.get_by_label("View Details").first.click()
    page.wait_for_timeout(1500) # Wait for animation
    page.screenshot(path="/home/jules/verification/screenshots/book_details.png")

    # 4. Close Details
    page.get_by_role("button", name="Close", exact=True).click()
    page.wait_for_timeout(1000) # Wait for animation

    # 5. Open Reading View
    page.get_by_role("button", name="Study").first.click()
    page.wait_for_timeout(2000) # Wait for long animation
    page.screenshot(path="/home/jules/verification/screenshots/reading_view.png")

    # 6. Close Reading View
    page.get_by_label("Close reading view").click()
    page.wait_for_timeout(1000)

    # 7. Final State: Clear search
    page.get_by_role("button", name="Clear").click()
    page.wait_for_timeout(1000)
    page.screenshot(path="/home/jules/verification/screenshots/final_state.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos",
            viewport={'width': 1280, 'height': 800}
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
