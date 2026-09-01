# 🧪 KleinDeal.de - Post-Deployment Smoke Test Checklist

Execute these 20 manual checks on your staging or production domain immediately following a release:

- [ ] **1. Service Readiness**: Run `curl https://kleindeal.de/api/ready` and ensure all checks return `ok: true`.
- [ ] **2. Register Account A (Seller)**: Register with a new email on `/registrieren`.
- [ ] **3. Email Verification**: Receive real verification email, click link, confirm redirect to `/verifizieren` with success state.
- [ ] **4. Password Reset Request**: Submit `/passwort-vergessen`, receive email with reset token.
- [ ] **5. Password Reset Execution**: Open `/passwort-zuruecksetzen`, update password, verify login with new password.
- [ ] **6. Create Draft Listing**: Open `/create`, create a listing and click *"Als Entwurf speichern"*.
- [ ] **7. Image Upload**: Upload multiple product images (JPEG, PNG, WebP) and verify fast S3/R2 upload.
- [ ] **8. Image Persistence**: Re-open listing in a new browser window and confirm images load reliably from CDN/S3 URL.
- [ ] **9. Publish Listing**: Transition draft to `ACTIVE`.
- [ ] **10. Public Discovery**: Open homepage and search bar; confirm listing appears without private seller email/phone.
- [ ] **11. Register Account B (Buyer)**: Register a second account in private browsing mode.
- [ ] **12. Favorite Listing**: Add Account A's listing to favorites on `/listing/[id]`, verify it appears on `/profile` under Favoriten.
- [ ] **13. Contact Seller**: Send a message to Account A via listing detail page.
- [ ] **14. Receive & Reply**: Log in as Account A, check in-app notification, open `/messages`, and reply to Account B.
- [ ] **15. Cross-Account Security**: Attempt to manually access Account A's edit endpoint with Account B's session; confirm `403 Forbidden`.
- [ ] **16. Rate Limiting Check**: Send rapid repeated requests to auth or messaging endpoints; confirm `429 Too Many Requests`.
- [ ] **17. Mark as Sold**: As Account A, mark listing as `SOLD` and verify status badge updates.
- [ ] **18. SEO Check**: Inspect page source of `/profile`, `/messages`, and `/verifizieren` to confirm `noindex, nofollow` tag.
- [ ] **19. Demo Isolation**: Ensure `NEXT_PUBLIC_DEMO_MODE=false` in production and demo items do not pollute real listings.
- [ ] **20. Monitoring Verification**: Check Sentry or log aggregation dashboard to confirm zero unexpected unhandled exceptions.
