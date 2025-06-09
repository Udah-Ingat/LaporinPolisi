# LaporinPolisi - Platform Pelaporan Pelanggaran Hukum

Platform mobile-first untuk melaporkan segala bentuk pelanggaran hukum di Indonesia. Pengguna dapat membuat laporan, memberikan like, berkomentar, dan berbagi laporan pelanggaran.

## 🚀 Fitur Utama

- **Authentication**: Login dengan Google OAuth
- **Laporan**: Buat laporan dengan judul, deskripsi, foto, lokasi, dan tags
- **Interaksi Sosial**: Like, komentar, dan share laporan
- **Pencarian & Filter**: Cari berdasarkan judul, deskripsi, lokasi, atau tags
- **Profil Pengguna**: Lihat profil dengan bio, komunitas, dan riwayat laporan
- **Moderasi**: Laporkan konten yang melanggar
- **Admin Panel**: Kelola laporan yang dilaporkan oleh pengguna

## 🛠️ Tech Stack

- **Framework**: Next.js 15 dengan App Router
- **Database**: PostgreSQL dengan Drizzle ORM
- **Authentication**: NextAuth.js dengan Google Provider
- **API**: tRPC untuk type-safe API
- **Styling**: Tailwind CSS
- **State Management**: Zustand + React Query
- **File Storage**: Supabase Storage (opsional)
- **Deployment**: Vercel/Railway

## 📋 Prerequisites

- Node.js 18+ dan npm/yarn/pnpm
- PostgreSQL database
- Google Cloud Console account untuk OAuth
- Supabase account (opsional, untuk storage)

## 🔧 Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/Udah-Ingat/LaporinPolisi.git
cd laporinpolisi
npm install
```

### 2. Setup Database

Buat database PostgreSQL baru:

```sql
CREATE DATABASE laporinpolisi;
```

### 3. Environment Variables

Copy `.env.example` ke `.env`:

```bash
cp .env.example .env
```

Edit `.env` dengan credentials Anda:

```env
# Auth Secret (generate dengan: npx auth secret)
AUTH_SECRET="your-generated-secret"

# Google OAuth (dari Google Cloud Console)
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/laporinpolisi"

# Supabase (opsional)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### 4. Google OAuth Setup

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih existing project
3. Enable Google+ API
4. Buat OAuth 2.0 Client ID
5. Set Authorized redirect URIs:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`

### 5. Database Migration

Push schema ke database:

```bash
npm run db:push
```

Atau generate dan run migrations:

```bash
npm run db:generate
npm run db:migrate
```

### 6. Supabase Storage Setup (Opsional)

Jika menggunakan Supabase untuk image storage:

1. Buat bucket bernama `images` di Supabase Storage
2. Set bucket ke public
3. Tambahkan policy untuk authenticated users:

```sql
-- Allow authenticated users to upload
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow public to view
CREATE POLICY "Allow public viewing" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'images');
```

### 7. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## 📱 Mobile Optimization

Aplikasi ini dioptimalkan untuk mobile devices:
- Responsive design untuk screens 320px - 768px
- Touch-friendly interface
- Bottom navigation
- Gesture support
- PWA ready

## 🗂️ Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Auth pages
│   ├── admin/             # Admin pages
│   ├── create/            # Create report page
│   ├── profile/           # Profile pages
│   └── report/            # Report detail pages
├── components/            # Reusable components
│   ├── layout/           # Layout components
│   ├── report/           # Report-related components
│   └── ui/               # UI components
├── server/               # Server-side code
│   ├── api/              # tRPC routers
│   ├── auth/             # Auth configuration
│   └── db/               # Database schema
├── styles/               # Global styles
└── trpc/                 # tRPC setup
```

## 🚀 Deployment

### Deploy ke Vercel

1. Push code ke GitHub
2. Import project di Vercel
3. Set environment variables
4. Deploy

### Deploy Database ke Railway

1. Buat PostgreSQL database di Railway
2. Copy database URL
3. Update DATABASE_URL di Vercel

## 🔐 Admin Access

Untuk memberikan admin access:

1. Login dengan Google
2. Akses database dan update user:

```sql
UPDATE laporinpolisi_user 
SET "isAdmin" = true 
WHERE email = 'admin@example.com';
```

3. Admin dapat mengakses `/admin` untuk moderasi

## 📝 API Routes

Aplikasi menggunakan tRPC untuk type-safe API:

- `report.create` - Buat laporan baru
- `report.getAll` - Get semua laporan dengan filter
- `report.getById` - Get detail laporan
- `report.toggleLike` - Like/unlike laporan
- `report.addComment` - Tambah komentar
- `report.reportViolation` - Laporkan pelanggaran
- `user.getProfile` - Get profil user
- `user.updateProfile` - Update profil
- `admin.getViolations` - Get laporan pelanggaran
- `admin.reviewViolation` - Review pelanggaran

## 🤝 Contributing

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buka Pull Request

## 📄 License

Distributed under the MIT License.

## 👥 Contact

Udah Ingat