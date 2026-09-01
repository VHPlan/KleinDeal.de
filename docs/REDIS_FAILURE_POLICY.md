# ⚡ KleinDeal.de – Redis Outage & Failure Policy Matrix

This document defines the server behavior and error handling strategy when the distributed Redis cluster or instance is unreachable or degraded.

---

## 1. Failure Strategy by Endpoint Risk Class

| Endpoint Class | Routes | Production Failure Policy | Rationale | Error Code & Message |
| :--- | :--- | :---: | :--- | :--- |
| **High-Risk Authentication** | `/api/auth/login`<br>`/api/auth/register`<br>`/api/auth/reset-password`<br>`/api/auth/forgot-password` | **FAIL-CLOSED** (Blocked) | Prevents credential stuffing, password spraying, and mass fake registrations during outage. | `429 Too Many Requests`<br>*„Zu viele Anfragen. Bitte versuche es in Kürze erneut.“* |
| **Verification & Recovery** | `/api/auth/resend-verification`<br>`/api/security/2fa` | **FAIL-CLOSED** (Blocked) | Prevents SMS/Email spamming and TOTP replay or brute-force enumeration. | `429 Too Many Requests`<br>*„Sicherheitsüberprüfung temporär eingeschränkt.“* |
| **Handover Codes** | `/api/transactions` (`VERIFY_HANDOVER_CODE`) | **FAIL-CLOSED** (Blocked) | Prevents 6-digit PIN brute-force guessing against pending transactions. | `429 Too Many Requests`<br>*„Zu viele Versuche. Bitte warte kurz.“* |
| **Abuse-Sensitive Actions** | `/api/reports`<br>`/api/blocks`<br>`/api/messages` | **FAIL-CLOSED** (Blocked) | Protects platform moderators from unthrottled message flooding and report denial-of-service. | `429 Too Many Requests`<br>*„Anfrage konnte nicht verarbeitet werden.“* |
| **Transactional Offers** | `/api/offers` | **FAIL-CLOSED** (Blocked) | Prevents automated offer spamming on seller listings. | `429 Too Many Requests`<br>*„Bitte warte kurz vor dem nächsten Angebot.“* |
| **Read-Only Discovery** | `/api/listings` (GET)<br>`/api/seller/[id]` (GET) | **FAIL-OPEN** (Served) | Preserves public marketplace discovery and browsing availability; logs structured warning to observability. | `200 OK` (Standard listing results) |

---

## 2. Server Behavior Rules

1. **No Silent In-Memory Fallback Across Production Instances**: Multi-instance deployments must never silently switch to decoupled local memory maps where an attacker could distribute spam across instances without rate limits.
2. **Strict Timeouts**: Redis connection timeout is capped at 3,000ms; command timeout is capped at 2,000ms with `maxRetriesPerRequest: 1`.
3. **Structured Warning Logs**: Any Redis connection failure is immediately logged as a high-severity alert (`logger.error`) containing correlation ID and endpoint route.
