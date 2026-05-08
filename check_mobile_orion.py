import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        # iPhone 12 Pro dimensions
        device = p.devices['iPhone 12 Pro']
        context = await browser.new_context(**device)
        page = await context.new_page()

        await page.goto("http://localhost:8080/")
        # Wait for Orion to appear (it has a delay in AnimatePresence usually)
        await asyncio.sleep(5)

        await page.screenshot(path="mobile_home_orion.png")
        print("Screenshot saved to mobile_home_orion.png")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
