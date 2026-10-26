"""Search Console performance snapshot.

Two ways to authenticate — the script picks whichever is available:

A) Your own Google account via OAuth (works today; recommended while Google's
   "email not found" bug blocks adding service accounts to Search Console):
     1. Google Cloud console → project "learn-hieroglyphics" → APIs & Services
        → OAuth consent screen: External; under Test users add the Google
        account that owns the Search Console property (the one listed as
        Owner under Settings → Users and permissions); save.
     2. APIs & Services → Credentials → Create credentials → OAuth client ID
        → Application type "Desktop app" → Download JSON.
     3. Save it as  %USERPROFILE%\\.config\\claude-seo\\gsc-oauth-client.json
     4. Run  python scripts/gsc-report.py  — a browser tab opens, sign in with
        the account that owns the Search Console property. The refresh token is
        cached next to the client file, so later runs don't prompt.

B) The GA4 service account (once Google fixes the bug and you can add
   learn-hieroglyphics-service-ac@learn-hieroglyphics.iam.gserviceaccount.com
   under Search Console → Settings → Users and permissions).

Usage:
    pip install google-auth google-auth-oauthlib requests
    python scripts/gsc-report.py [days]        # default 90
"""
import collections
import datetime as dt
import json
import os
import sys
from pathlib import Path
from urllib.parse import quote

import requests
from google.auth.transport.requests import Request

SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]
SA_KEY = Path(os.environ.get("USERPROFILE", "~")).expanduser() / ".config" / "ga4" / "learn-hieroglyphics-4a259acfb02f.json"
OAUTH_DIR = Path(os.environ.get("USERPROFILE", "~")).expanduser() / ".config" / "claude-seo"
OAUTH_CLIENT = OAUTH_DIR / "gsc-oauth-client.json"
OAUTH_TOKEN = OAUTH_DIR / "gsc-oauth-token.json"
DAYS = int(sys.argv[1]) if len(sys.argv) > 1 else 90
API = "https://www.googleapis.com/webmasters/v3"


def credentials():
    if OAUTH_CLIENT.exists():
        from google.oauth2.credentials import Credentials
        from google_auth_oauthlib.flow import InstalledAppFlow

        creds = None
        if OAUTH_TOKEN.exists():
            creds = Credentials.from_authorized_user_file(str(OAUTH_TOKEN), SCOPES)
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                flow = InstalledAppFlow.from_client_secrets_file(str(OAUTH_CLIENT), SCOPES)
                creds = flow.run_local_server(port=0, prompt="consent")
            OAUTH_TOKEN.write_text(creds.to_json(), encoding="utf-8")
        print(f"auth: OAuth user credentials ({OAUTH_CLIENT.name})")
        return creds
    if SA_KEY.exists():
        from google.oauth2 import service_account

        creds = service_account.Credentials.from_service_account_file(str(SA_KEY), scopes=SCOPES)
        creds.refresh(Request())
        print(f"auth: service account {json.loads(SA_KEY.read_text())['client_email']}")
        return creds
    sys.exit(f"No credentials: put an OAuth desktop client at {OAUTH_CLIENT} or the SA key at {SA_KEY}.")


creds = credentials()
H = {"Authorization": f"Bearer {creds.token}"}

sites = requests.get(f"{API}/sites", headers=H, timeout=30).json().get("siteEntry", [])
if not sites:
    sys.exit(
        "Authenticated, but this identity has no Search Console properties.\n"
        "OAuth: sign in with the account that owns the property.\n"
        "Service account: it must be added as a user in Search Console first."
    )

end = dt.date.today() - dt.timedelta(days=3)  # GSC lags ~3 days
start = end - dt.timedelta(days=DAYS)


def query(site, **body):
    body.setdefault("startDate", start.isoformat())
    body.setdefault("endDate", end.isoformat())
    body.setdefault("type", "web")
    r = requests.post(f"{API}/sites/{quote(site, safe='')}/searchAnalytics/query", headers=H, json=body, timeout=60)
    r.raise_for_status()
    return r.json().get("rows", [])


def table(rows, label):
    print(f"\n== {label}  (clicks / impressions / CTR / position)")
    for row in rows:
        print(f'{row["clicks"]:>5} {row["impressions"]:>7} {row["ctr"]*100:5.1f}%  {row["position"]:5.1f}  {"  ·  ".join(row["keys"])}')


for s in sites:
    site = s["siteUrl"]
    print(f"\n######## {site}  [{s.get('permissionLevel')}]  {start} → {end}")
    table(query(site, dimensions=["query"], rowLimit=50), "Top queries")
    table(query(site, dimensions=["page"], rowLimit=40), "Top pages")

    qw = [r for r in query(site, dimensions=["query", "page"], rowLimit=500) if 4 <= r["position"] <= 15 and r["impressions"] >= 20]
    qw.sort(key=lambda r: -r["impressions"])
    table(qw[:30], "Quick wins (pos 4–15, ≥20 impressions)")

    by_month = collections.defaultdict(lambda: [0, 0])
    for r in query(site, dimensions=["date"], rowLimit=400):
        k = r["keys"][0][:7]
        by_month[k][0] += r["clicks"]
        by_month[k][1] += r["impressions"]
    print("\n== By month (clicks, impressions):", dict(sorted(by_month.items())))

    table(query(site, dimensions=["country"], rowLimit=10), "Countries")
    table(query(site, dimensions=["device"], rowLimit=3), "Devices")
    table(query(site, dimensions=["searchAppearance"], rowLimit=10), "Search appearance (rich results, AI features)")

    sm = requests.get(f"{API}/sites/{quote(site, safe='')}/sitemaps", headers=H, timeout=30).json()
    print("\n== Sitemaps:")
    for m in sm.get("sitemap", []):
        print("  ", m.get("path"), "last downloaded", m.get("lastDownloaded"), "errors", m.get("errors"), m.get("contents"))
