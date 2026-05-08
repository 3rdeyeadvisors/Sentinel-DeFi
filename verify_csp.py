import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        errors = []
        page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)

        await page.goto("http://localhost:8080/")
        await asyncio.sleep(2)

        print("Console Errors:")
        for error in errors:
            print(f"- {error}")

        # Check if CSP meta tag exists and doesn't contain forbidden directives
        csp_content = await page.evaluate("document.querySelector('meta[http-equiv=\"Content-Security-Policy\"]').content")
        print(f"\nCSP Content: {csp_content}")

        forbidden = ["frame-ancestors", "X-Frame-Options", "Permissions-Policy"]
        for f in forbidden:
            if f in csp_content:
                print(f"FAILED: Found forbidden directive {f} in CSP meta tag")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
