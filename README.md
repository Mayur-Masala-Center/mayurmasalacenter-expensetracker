# 🌶️ Mayur Masala Center

A **progressive web app (PWA)** for managing daily business operations of a masala (spice) wholesale/retail business — sales, expenses, purchases, attendance, lending, and vendor tracking — all with **WhatsApp integration** and a **Telegram bot** for quick logging.

Built with **Next.js 14 (App Router)**, **Supabase**, **Tailwind CSS**, and deployed via **GitHub Actions → Vercel**.

---

## ✨ Features

### 📊 Dashboard
- KPI cards showing today's sales, expenses, and net profit
- Monthly trend chart (sales, purchases, expenses)
- Recent transactions table with edit/delete
- Quick-add FAB for fast entry

### 💰 Sales / Expenses / Purchases
- Add, edit, delete transactions
- Filter by month, year, financial year, or all time
- Category-based tracking
- Running totals per period

### 📋 Attendance
- Monthly calendar grid view
- Mark staff as Present / Absent / Half-day
- Add/remove staff members
- Monthly summary with present count per staff

### 📈 Profit & Loss
- Monthly and yearly P&L breakdown
- Net profit/loss calculation (Sales - Purchases - Expenses)
- Color-coded positive/negative values

### 🤝 Lending Tracker
- Track money lent to and settled by people
- Person-wise summary with remaining balance
- WhatsApp reminders for pending amounts
- Days since last transaction per person

### 🏪 Sale Vendors
- Track sales made to vendors
- Vendor-wise summary with total, paid, remaining
- WhatsApp notifications for new entries
- Follow-up reminders via WhatsApp
- Bill number tracking
- Partial payment support

### 🛒 Purchase Vendors
- Track purchases made from vendors
- Vendor-wise summary with total, paid, remaining
- Bill number tracking
- Partial payment support

### 🤖 Telegram Bot
- Quick log sales via Telegram: `/sale 500 Item description`
- Daily summary: `/summary`
- Webhook auto-registered on deploy

### 📱 PWA
- Installable on mobile home screen
- Offline-capable (static export)
- Apple touch icon & splash screen support
- Portrait-optimized

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + custom design system |
| **Backend / Auth** | Supabase (PostgreSQL, Auth, REST API) |
| **Charts** | Recharts |
| **Icons** | Lucide React |
| **Deployment** | Vercel (static export) |
| **CI/CD** | GitHub Actions |
| **Bot** | Telegram Bot API |
| **Infrastructure** | Terraform (optional) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project (free tier works)
- A Telegram bot token (from @BotFather)

### 1. Clone & install
```bash
git clone https://github.com/Prasadpb77/mayurmasala.git
cd mayurmasala
npm install
```

### 2. Environment variables
Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_DB_URL=your_supabase_database_connection_string
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
```

### 3. Database setup
Run the migration files in `supabase/migrations/` in order:
1. `0001_init.sql` — core tables (sales, purchases, expenses)
2. `0002_attendance.sql` — staff & attendance tables
3. `0003_lending.sql` — lending/borrowing tables
4. `0004_add_whatsapp.sql` — WhatsApp number columns
5. `0005_sale_vendors.sql` — sale vendors table
6. `0006_purchase_vendors.sql` — purchase vendors table
7. `0007_partial_payments.sql` — partial payment support
8. `0008_fix_amount_check.sql` — amount validation fix
9. `0009_update_views_for_purchase_vendors.sql` — DB views
10. `0010_add_bill_no.sql` — bill number tracking

### 4. Run dev server
```bash
npm run dev
```

### 5. Build for production
```bash
npm run build
```

---

## 🗺️ Project Structure

```
mayurmasala/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (PWA meta tags)
│   ├── page.tsx                  # Root redirect
│   ├── globals.css               # Global styles + design system
│   ├── manifest.ts               # PWA manifest
│   ├── login/                    # Login page
│   ├── dashboard/                # Main dashboard
│   ├── sales/                    # Sales transactions
│   ├── expenses/                 # Expense transactions
│   ├── attendance/               # Staff attendance
│   ├── profit-loss/              # P&L reports
│   ├── lending/                  # Lending tracker
│   ├── sale-vendors/             # Sale vendor management
│   └── purchase-vendors/         # Purchase vendor management
├── components/                   # Reusable UI components
│   ├── Nav.tsx                   # Navigation (desktop sidebar + mobile bottom bar)
│   ├── TxnPage.tsx               # Shared transaction page (sales/expenses)
│   ├── DataTable.tsx             # Reusable data table
│   ├── KpiCard.tsx               # KPI metric card
│   ├── TrendChart.tsx            # Monthly trend line chart
│   ├── QuickAdd.tsx              # Floating quick-add button + form
│   └── NameDropdown.tsx          # Autocomplete dropdown for names
├── lib/                          # Utility libraries
│   ├── finance.ts                # Financial year & INR formatting
│   └── supabase/                 # Supabase client (client & server)
├── supabase/
│   └── migrations/               # Database migration files
├── terraform/                    # Optional Terraform config
└── .github/workflows/deploy.yml  # CI/CD pipeline
```

---

## 🎨 Design System

The app uses a custom "Masala" design system inspired by spice packet colors:

| Token | Value | Usage |
|-------|-------|-------|
| `masala-red` | `#B4182A` | Primary brand color |
| `masala-redBright` | `#E8283F` | Active states, glows |
| `masala-gold` | `#F2B90B` | Accent, highlights |
| `masala-brown` | `#3B1F14` | Text, dark surfaces |
| `masala-cream` | `#FDF6E3` | Page background |

### Components
- **Card** — Glassmorphism with backdrop blur
- **KPI Card** — Gradient with icon overlay
- **Bottom Nav** — Floating glass tab bar (mobile)
- **Sheet** — Bottom sheet modal system
- **Segmented Button** — Pill-style toggle groups

---

## 🤖 Telegram Bot Commands

| Command | Description |
|---------|-------------|
| `/sale <amount> <description>` | Log a sale |
| `/summary` | Get today's summary |
| `/start` | Welcome message |

The bot webhook is automatically registered on each deploy.

---

## 🚢 Deployment

### CI/CD Pipeline (GitHub Actions → Vercel)
Every push to `main` triggers:
1. **Lint & Build** — TypeScript check + Next.js build
2. **Deploy to Vercel** — Static export to production
3. **DB Migration** — `supabase db push` for new migrations
4. **Telegram Webhook** — Re-registers bot webhook

Pull requests get a preview deployment with auto-comment.

### Manual Deploy
```bash
npm run build
npx vercel --prod
```

---

## 🔧 Configuration

### Supabase
- Auth: Email/password authentication
- RLS: Row-level security enabled on all tables
- Migrations: Version-controlled in `supabase/migrations/`

### PWA
- Manifest: `app/manifest.ts`
- Service worker: Handled by Next.js static export
- Icons: Inline SVG data URIs (no external image files needed)

---

## 📄 License

Private — internal business tool.

---

## 👤 Author

**Prasad Bhavsar**
