# Terraform — Mayur Masala infra

Provisions:
- A Supabase project (`supabase_project`)
- A Vercel project linked to your GitHub repo, with env vars wired automatically from the Supabase project's own outputs (`vercel_project_environment_variable`)

## Notes / honest caveats
- The community Terraform providers for **Vercel** and **Supabase** cover project-level infra (creating the project, setting env vars, linking GitHub) — they do **not** apply Postgres schema/DDL. After `terraform apply`, run the SQL in `../supabase/migrations/0001_init.sql` once via the Supabase SQL editor or `supabase db push` (Supabase CLI). This is standard practice — Terraform for infra, SQL migrations for schema.
- Vercel's GitHub integration (used here) auto-deploys on every push to `main` on the **free/hobby tier** — no extra config needed beyond linking the repo.
- Get `supabase_access_token` from https://supabase.com/dashboard/account/tokens and `vercel_api_token` from https://vercel.com/account/tokens.
- `supabase_org_id`: find it in your Supabase dashboard URL when viewing your organization.

## Usage
```bash
terraform init
terraform apply \
  -var="vercel_api_token=xxx" \
  -var="github_repo=yourname/mayur-masala" \
  -var="supabase_access_token=xxx" \
  -var="supabase_org_id=xxx" \
  -var="supabase_db_password=xxx" \
  -var="telegram_bot_token=xxx"
```

Then:
```bash
# apply schema (one-time, and again whenever schema changes)
supabase link --project-ref <ref-from-output>
supabase db push
```
