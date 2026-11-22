# Expense Splitter

Track shared costs with friends, flatmates or a trip group, and settle up in as few payments as possible.

- Add expenses paid by anyone, split **equally** or **by exact amounts**
- See each person's running balance and the simplified list of who pays whom
- **Record payments** when money changes hands, so balances get back to zero
- Add people to a group at any time; delete mistaken expenses
- Light and dark themes, works on phones

## Stack

Java 21 / Spring Boot 3 / PostgreSQL / JWT on the backend, React 19 + Vite on the frontend.

## Run it

Prerequisites: **JDK 21** (the build targets Java 21; if `java -version` shows something older, point `JAVA_HOME` at a JDK 21, e.g. `export JAVA_HOME=$(/usr/libexec/java_home -v 21)` on macOS), Maven, Node 20+, PostgreSQL.

```bash
createdb expense_splitter

cd backend && mvn spring-boot:run          # http://localhost:8080

cd frontend && npm install && npm run dev  # http://localhost:5173
```

In development, Vite proxies `/api` to the backend, so the browser only ever talks to one origin.

### Configuration

| Variable | Default | Purpose |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5432/expense_splitter` | Database JDBC URL |
| `DB_USERNAME` / `DB_PASSWORD` | `postgres` / `postgres` | Database credentials |
| `JWT_SECRET` | dev-only placeholder | Token signing key. **Set this (32+ random bytes) anywhere real.** |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://127.0.0.1:5173` | Origins allowed to call the API directly |
| `PORT` | `8080` | Backend port |
| `VITE_API_URL` | `/api` | Frontend: API base URL for builds that don't sit behind the proxy |

## Tests

```bash
cd backend && mvn test     # unit tests + full HTTP flow on in-memory H2
cd frontend && npm test    # Vitest: money formatting and split maths
```

## How the money works

**Splitting.** Amounts are handled in whole cents. An equal split gives everyone `floor(total / n)` cents and hands the leftover cents to the first few people, so $10.00 between three people is 3.34 + 3.33 + 3.33. Shares always add up to exactly what was paid, so no phantom pennies.

**Balances.** For each expense the payer is credited the full amount and each participant is debited their share. A recorded payment is stored the same way (the sender "paid", the receiver owes it), so it moves both balances toward zero without any special cases.

**Settling up.** Instead of paying back every expense individually, the app nets everyone's balance and then greedily matches the person owed the most with the person who owes the most, repeating until everyone is even. Each step settles at least one person, so a group of *n* needs at most *n − 1* payments. Finding the true minimum is NP-hard; the greedy result isn't always the minimum but is usually close. It's the same idea as Splitwise's "simplify debts".

## API

All endpoints except `/api/auth/*` need `Authorization: Bearer <token>`. Group endpoints only work for members of that group (non-members get `404`). Errors come back as `{"error": "message"}`.

| Method | Path | Body |
|---|---|---|
| POST | `/api/auth/register` | `{username, email, password}` |
| POST | `/api/auth/login` | `{username, password}` |
| GET | `/api/groups` | Your groups, with `totalSpent` and `yourBalance` |
| POST | `/api/groups` | `{name, memberUsernames?}` |
| GET | `/api/groups/{id}` | |
| POST | `/api/groups/{id}/members` | `{username}` |
| GET | `/api/groups/{id}/expenses` | Expenses and payments, newest first |
| POST | `/api/groups/{id}/expenses` | `{description, amount, paidByUsername?, splitBetweenUsernames?, exactSplits?}` |
| DELETE | `/api/groups/{id}/expenses/{expenseId}` | Payer, group creator, or a payment's recipient |
| POST | `/api/groups/{id}/payments` | `{fromUsername, toUsername, amount}` |
| GET | `/api/groups/{id}/balances` | `[{username, balance}]` |
| GET | `/api/groups/{id}/settlement` | `[{from, to, amount}]` |
