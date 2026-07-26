# Expense Splitter

Track shared group expenses and settle up with the fewest possible payments.

## Stack

Java / Spring Boot / PostgreSQL backend, React (Vite) frontend.

## Run it

```bash
createdb expense_splitter

cd backend && mvn spring-boot:run          # http://localhost:8080

cd frontend && npm install && npm run dev  # http://localhost:5173
```

Default DB credentials are `postgres`/`postgres` — override with `DB_USERNAME` / `DB_PASSWORD` if yours differ.

## How settlement works

Instead of recording every individual debt, the app nets out each person's overall balance and greedily matches whoever's owed the most with whoever owes the most, repeating until everyone's settled — the same idea behind Splitwise's "simplify debts."
