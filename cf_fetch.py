#!/usr/bin/env python3
"""
cf_fetch.py — standalone Cloudflare-bypassing fetcher (Playwright Chromium).

WHY: some sources (e.g. SofaScore) sit behind Cloudflare and return HTTP 403 to
plain urllib/curl. A real browser engine passes the challenge. This tool opens a
headless browser, fetches ONE url, prints the body, and exits.

SCOPE — this is a PURE FETCH TOOL. It has NO messaging, NO channels, NO cron, NO
agent loop, NO persistent service. It cannot contact WhatsApp/iMessage/anything —
there is simply no such code here. It does one thing: GET a url via a browser.

Usage (CLI):
  .venv/bin/python cf_fetch.py "<url>" [origin]
    url    : the page/API to fetch
    origin : optional — visit this first for Cloudflare clearance, then fetch
             <url> via the browser's own fetch() (best for JSON APIs).

Usage (import):
  from cf_fetch import cf_fetch
  data = cf_fetch("https://www.sofascore.com/api/v1/...", origin="https://www.sofascore.com")
"""
import sys, time
from playwright.sync_api import sync_playwright

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36")
CF_MARKERS = ("just a moment", "checking your browser", "enable javascript and cookies",
              "verifying you are human", "cf-browser-verification", "needs to review the security")

def _body_text(page):
    try: return (page.inner_text("body") or "")
    except Exception: return ""

def _wait_past_cf(page, timeout_ms):
    deadline = time.monotonic() + timeout_ms / 1000
    while time.monotonic() < deadline:
        blob = ((page.title() or "") + " " + _body_text(page)[:600]).lower()
        if not any(m in blob for m in CF_MARKERS):
            return
        page.wait_for_timeout(1000)

def cf_fetch(url, origin=None, timeout_ms=35000, headed=False):
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=not headed,
                                    args=["--disable-blink-features=AutomationControlled"])
        ctx = browser.new_context(user_agent=UA, locale="en-US",
                                  viewport={"width": 1280, "height": 800})
        ctx.add_init_script("Object.defineProperty(navigator,'webdriver',{get:()=>undefined})")
        page = ctx.new_page()
        try:
            if origin:
                page.goto(origin, wait_until="domcontentloaded", timeout=timeout_ms)
                page.wait_for_timeout(1500)
                _wait_past_cf(page, timeout_ms)
                return page.evaluate(
                    "async (u) => { const r = await fetch(u, {credentials:'include'}); return await r.text(); }",
                    url)
            page.goto(url, wait_until="domcontentloaded", timeout=timeout_ms)
            _wait_past_cf(page, timeout_ms)
            return _body_text(page)
        finally:
            browser.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("usage: cf_fetch.py <url> [origin]", file=sys.stderr); sys.exit(2)
    url = sys.argv[1]
    origin = sys.argv[2] if len(sys.argv) > 2 else None
    try:
        sys.stdout.write(cf_fetch(url, origin=origin))
    except Exception as e:
        print(f"cf_fetch error: {e}", file=sys.stderr); sys.exit(1)
