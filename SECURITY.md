# Private deployment requirement

Total Rent contains private financial records.

- Do not deploy the dashboard unless every HTML, JSON, API, and asset response is protected by owner authentication.
- A private GitHub repository does not make a deployed website private.
- Verify signed-out access is blocked before sharing a dashboard URL.
- Do not place GitHub, LINE, Cloudflare, or other credentials in repository files.
- Website changes create review requests; they do not directly modify approved financial data.

Cloudflare Access or an equivalent identity-aware gate must be configured and tested separately before production deployment. This branch intentionally does not claim that deployment protection is active.
