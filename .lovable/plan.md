
# Medical Clinic Website — Implementation Plan

## Overview
A public-facing medical clinic website in Uzbek language, with Supabase database for managing tests, doctors, categories, and appointments.

## Database Schema (Supabase Migrations)

### Tables:
1. **categories** — id, name (e.g., Laboratoriya, Diagnostika, Kosmetologiya)
2. **tests** — id, name, price, category_id (FK → categories)
3. **doctors** — id, name, specialization, image_url, bio
4. **appointments** — id, patient_name, phone, doctor_id (FK → doctors), service, date, time, created_at

### Sample Data:
- 3 categories (Laboratoriya, Diagnostika, Kosmetologiya)
- ~12 sample tests with prices across categories
- ~4 sample doctors with specializations
- RLS: tests, categories, doctors readable by everyone; appointments insertable by anyone, readable only by service role

## Pages & Routes

### 1. **Layout** (`__root.tsx`)
- Navbar: Logo, links (Bosh sahifa, Xizmatlar, Shifokorlar, Tahlillar, Qabulga yozilish, Aloqa)
- Footer: clinic info, working hours, phone numbers
- Clean medical design: white/blue/light gray palette

### 2. **Home** (`/`) — Hero section with CTA, brief service highlights, featured doctors, call-to-action for appointments

### 3. **Services** (`/services`) — Card grid of clinic services (Laboratoriya, Diagnostika, Kosmetologiya, etc.)

### 4. **Doctors** (`/doctors`) — Grid of doctor cards (photo, name, specialization). Clickable to profile page.

### 5. **Doctor Profile** (`/doctors/$doctorId`) — Full doctor info with photo, bio, specialization, and "book appointment" button.

### 6. **Laboratory Tests** (`/tests`) — Full test list with:
  - Search bar (filter by name)
  - Category filter tabs
  - Table/card layout showing test name + price

### 7. **Online Appointment** (`/appointment`) — Form: patient name, phone, doctor selection (dropdown from DB), service, date, time picker. Submits via server function to Supabase.

### 8. **Contact** (`/contact`) — Google Maps embed, phone numbers, working hours, clinic address.

## Tech Approach
- **Server functions** to fetch tests, doctors, categories from Supabase
- **TanStack Query** for data fetching with SSR support
- **Responsive design** with Tailwind CSS, mobile-first
- **SEO**: Each route has unique head() metadata in Uzbek
- All UI text in Uzbek language

## Design
- Medical color scheme: blue primary (#2563EB), white background, light gray accents
- Card-based layouts with rounded corners and shadows
- Large, accessible buttons
- Modern navbar with mobile hamburger menu
