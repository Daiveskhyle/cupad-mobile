# CUPAD API v1.2 – deploy to PHP server

Replace the file on your server:

```
/path/to/CUPAD/api/v1/index.php
```

with `v1-index.php` from this folder.

## New endpoints (JWT Bearer token)

| Method | Path | Description |
|--------|------|-------------|
| GET | /clients | List/search clients (scoped by role) |
| GET | /clients/{id}/portfolio | Portfolio |
| GET | /clients/{id}/savings | Savings |
| GET | /clients/{id}/loans | Loans |
| GET | /clients/{id}/transactions | Transactions |
| GET | /dashboard/stats | Role-scoped dashboard numbers |
| GET | /activities | Officer activity history |
| POST | /savings/collect | Record savings deposit |
| POST | /savings/withdraw | Record withdrawal |
| POST | /loans/collect | Record loan repayment |
| POST | /loans/disburse | Disburse loan |
| POST | /clients/register | Register new client |

All previous endpoints remain. Clients endpoints now accept **JWT or API key**.
