# New Green Star Eniyadi

This is the production-ready Vercel version of the New Green Star Eniyadi Arts & Sports Club website.

It includes the public club website, secure admin session, persistent members, monthly payments, achievements, certificate gallery, program budget tracker, CSV statements, and Gmail email sending.

## 1. Create the database

Create a Supabase project and open its SQL editor.

Paste the complete contents of `supabase.sql` and run it.

The database contains members, monthly payments, achievements, budgets, messages, and the monthly fee setting.

## 2. Configure Vercel environment variables

Add these variables in the Vercel project settings.

`SUPABASE_URL`

Your Supabase project URL.

`SUPABASE_SERVICE_ROLE_KEY`

Your Supabase service-role key. Keep this secret and only use it as a Vercel server environment variable.

`ADMIN_PASSWORD`

The password used by the club admin login.

`SESSION_SECRET`

A long random secret used to sign the admin session cookie.

`GMAIL_USER`

The Gmail address that sends club emails.

`GMAIL_APP_PASSWORD`

A Google App Password for that Gmail account. Do not put the normal Gmail password here.

`CLUB_EMAIL_FROM`

Optional. The visible From address. Leave this empty to use `GMAIL_USER`.

## 3. Gmail setup

Turn on two-step verification for the Gmail account and create a Google App Password for the website. Put the generated app password into `GMAIL_APP_PASSWORD`.

The website sends messages using Gmail SMTP from the Vercel server. Members are placed in BCC so their addresses are not exposed to one another.

## 4. Deploy to Vercel

Upload this folder to the GitHub repository connected to Vercel.

The important homepage file is `index.html` at the repository root.

Vercel does not need a framework preset for this project. Use the default static/Other configuration and keep the Root Directory at the repository root.

## 5. Admin features

The admin panel can:

- Add members with name, role, mobile number, and email.
- Remove members.
- Set the monthly subscription fee.
- Select any payment month.
- Mark members paid or pending for that month.
- Add and remove achievements.
- Add programs with cost, received amount, date, and notes.
- Delete budget records.
- Send email to all members, paid members, pending members, or selected members.
- Download a monthly payment statement as CSV.
- Download a full club report as CSV.

## 6. Public features

The public website displays:

- Club identity and details.
- Member count and member list.
- Current-month payment status.
- Achievements.
- The four supplied certificates.
- Program costs and funds received.
- Club registration and affiliation details.

## 7. Club details included

Reg no : 395/09

Society, NYK, KSYWB & Fit India affiliated

Bandhadka Post, Chengala (via), Kasaragod Dt 671 541

## 8. Monthly fee

The database starts with a monthly fee of ₹100 because that was the amount used in the previous website version. The admin can change it from the Fee settings section before recording payments.

## 9. Security

The admin password is stored in Vercel environment variables and is never placed in the HTML. Admin sessions use an HTTP-only signed cookie. Supabase service credentials stay server-side in Vercel.
