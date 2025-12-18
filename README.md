# TheAkristalGroup - REDEFINING REAL ESTATE

A production-ready real estate marketplace web application built with Next.js, Supabase, and modern web technologies.

## 🏢 Company Information

- **Company Name:** TheAkristalGroup
- **Motto:** REDEFINING REAL ESTATE
- **Email:** info@akristal.com
- **Phone:** +250791900316
- **Address:** KK 15 Rd, Kigali, Rwanda

## 🧱 Tech Stack

- **Frontend:** Next.js 16 (App Router)
- **Backend & Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **Email:** Zoho Mail (SMTP)
- **Styling:** Tailwind CSS
- **Maps:** Leaflet (OpenStreetMap)
- **UI Components:** Custom component library
- **State Management:** Zustand
- **Form Handling:** React Hook Form + Zod
- **Notifications:** React Hot Toast

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account and project
- Zoho Mail account (for email notifications)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd akristal
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory (see `ENV_TEMPLATE.md` for details):
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   SMTP_HOST=smtp.zoho.com
   SMTP_PORT=587
   SMTP_USER=info@akristal.com
   SMTP_PASSWORD=your_zoho_app_password
   BUSINESS_EMAIL=info@akristal.com
   BUSINESS_PHONE=+250791900316
   BUSINESS_ADDRESS=KK 15 Rd, Kigali, Rwanda
   ```
   
   **Important:** The `SUPABASE_SERVICE_ROLE_KEY` is required for profile creation during signup. 
   You can find it in your Supabase Dashboard → Project Settings → API → service_role key (secret).
   ⚠️ **Never commit this key to version control** - it bypasses Row Level Security.

4. **Set up Supabase Database**
   
   Run the SQL schema in `supabase/schema.sql` in your Supabase SQL editor to create all necessary tables, indexes, and policies.

5. **Set up Supabase Storage Buckets**
   
   Create the following storage buckets in Supabase:
   - `images` or `property-images` - For property images
   - `documents` - For payment statements and documents
   - `videos` - For property videos (optional)

6. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

7. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 👥 User Roles & Permissions

The platform supports four user roles with role-based access control (RBAC):

### 1. Buyer
- Browse and search property listings
- Save favorite properties
- Contact sellers/agents
- Send and receive messages
- View payment status
- Manage profile
- **Map-based property search with location filtering**

### 2. Seller
- Create, edit, and delete property listings
- Upload property media (images, videos, documents)
- Respond to buyer messages
- View inquiries
- Manage profile

### 3. Agent
- Manage multiple listings on behalf of sellers
- Act on behalf of sellers
- Communicate with buyers
- Track leads and inquiries
- Manage profile

### 4. Admin
- Full system access
- Approve, suspend, or remove listings
- Manage users and roles
- Access analytics and reports
- Manage payments
- Configure site content (About, Support, etc.)

## 🏠 Core Features

### Property Listings
- Support for residential, commercial, land, and rental properties
- Rich property details (price, location, size, amenities, images, videos)
- Property status management (available, sold, rented, pending, suspended)
- Admin approval workflow for all new listings

### Advanced Search & Filters
- **Location-based search** with interactive map (Leaflet/OpenStreetMap)
- **Map-based property exploration** with markers and popups
- **Radius search** - Filter properties within a specified distance
- Price range filtering
- Property type filtering
- Bedrooms, bathrooms, and size filters
- Availability status filtering
- Keyword search across titles, descriptions, and addresses
- **Map/List view toggle** for flexible browsing

### Authentication & Security
- Email/password authentication via Supabase Auth
- Role-based dashboards
- Protected routes with middleware
- Session persistence
- Secure API access with RLS (Row Level Security)

### Messaging System
- Real-time or near-real-time messaging
- Buyer ↔ Seller / Agent communication
- Admin oversight capabilities
- Message history stored in Supabase
- Unread message indicators

### Payment System
- **Current Implementation:** Bank transfer with statement attachment
- Payment records stored securely
- Payment status tracking (pending, processing, completed, failed, refunded)
- **Future-Ready Architecture:** Designed to support:
  - Credit/debit cards
  - Mobile money
  - International payment gateways

### UI/UX Features
- Mobile-first, fully responsive design
- Clean, modern real estate UI
- Professional corporate look
- Accessible components
- Well-designed dashboards per role
- **Theme Support:** Light and dark modes with persistent user preference
- **Interactive Maps:** Full map integration with property markers

### Static Pages
- About Us (TheAkristalGroup focused)
- Contact Us (with contact form)
- Support / Help Center (with FAQs)
- Privacy Policy
- Terms & Conditions

## 📁 Project Structure

```
akristal/
├── app/                    # Next.js App Router pages
│   ├── about/              # About page
│   ├── admin/              # Admin dashboard and management
│   ├── buyer/              # Buyer dashboard
│   ├── contact/            # Contact page
│   ├── login/              # Login page
│   ├── messages/           # Messaging system
│   ├── payments/           # Payment pages
│   ├── properties/         # Property listings (with map view)
│   ├── register/           # Registration page
│   ├── seller/             # Seller dashboard
│   ├── support/            # Support page
│   ├── privacy/            # Privacy policy
│   ├── terms/              # Terms & conditions
│   └── api/                # API routes
├── components/             # React components
│   ├── ui/                 # Reusable UI components
│   ├── property-map.tsx    # Interactive map component
│   └── ...                 # Feature-specific components
├── lib/                     # Utility libraries
│   ├── supabase/           # Supabase client configuration
│   ├── auth.ts             # Authentication utilities
│   ├── email.ts            # Email service (Zoho)
│   ├── storage.ts          # Storage utilities
│   └── utils.ts            # General utilities
├── supabase/               # Database schema
│   ├── schema.sql          # PostgreSQL schema
│   └── cleanup.sql         # Database cleanup script
├── types/                  # TypeScript type definitions
│   └── database.ts         # Database types
└── app/actions/            # Server actions
    ├── properties.ts       # Property CRUD operations
    ├── messages.ts         # Messaging operations
    └── favorites.ts       # Favorite management
```

## 🗄️ Database Schema

The application uses a comprehensive PostgreSQL schema with the following main tables:

- `profiles` - User profiles extending Supabase auth
- `properties` - Property listings (with lat/lng for map integration)
- `property_favorites` - User favorites
- `conversations` - Message conversations
- `messages` - Individual messages
- `inquiries` - Property inquiries
- `payments` - Payment transactions
- `site_content` - Admin-managed content
- `activity_logs` - System activity tracking

All tables include Row Level Security (RLS) policies for data protection.

## 🗺️ Map Features

The application includes full map integration using Leaflet:

- **Interactive Map View:** Browse properties on an interactive map
- **Property Markers:** Click markers to see property details
- **Location Search:** Click on map to set search center
- **Radius Filtering:** Filter properties within a specified radius (1-50 km)
- **Auto-fit Bounds:** Map automatically adjusts to show all properties
- **List/Map Toggle:** Switch between list and map views seamlessly

## 📧 Email Integration

The application uses Zoho Mail SMTP for sending:
- Welcome emails on account creation
- Listing approval/rejection notifications
- Message notifications
- Payment confirmations
- Support request confirmations

## 🔒 Security Features

- Row Level Security (RLS) on all database tables
- Role-based access control (RBAC)
- Protected API routes
- Secure file uploads via Supabase Storage
- Input validation and sanitization
- CSRF protection via Next.js middleware

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform supporting Next.js:
- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

Make sure to:
- Set all environment variables
- Configure Supabase CORS settings
- Set up proper domain configuration

## 📝 Environment Variables

See `ENV_TEMPLATE.md` for all required environment variables.

## 🧪 Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## 📚 API Documentation

### Server Actions

#### Properties
- `createProperty(formData)` - Create a new property listing
- `updateProperty(id, formData)` - Update a property
- `deleteProperty(id)` - Delete a property
- `approveProperty(id)` - Approve a property (admin only)
- `rejectProperty(id, reason)` - Reject a property (admin only)

#### Messages
- `sendMessage(conversationId, content)` - Send a message
- `createConversation(propertyId, message)` - Start a new conversation

#### Favorites
- `toggleFavorite(propertyId)` - Add/remove favorite
- `getFavorites()` - Get user's favorites

### API Routes

- `GET /api/payments` - Get user payments
- `POST /api/payments` - Create a payment
- `GET /api/payments/[id]` - Get payment details
- `PATCH /api/payments/[id]` - Update payment status

## 🤝 Contributing

This is a company-owned project. For contributions, please contact the development team.

## 📄 License

Copyright © 2024 TheAkristalGroup. All rights reserved.

## 🆘 Support

For support, email info@akristal.com or call +250791900316.

## 🔮 Future Enhancements

- Advanced analytics dashboard
- Mobile app (React Native)
- Multi-language support
- Property comparison feature
- Virtual property tours
- Integration with additional payment providers
- Automated property valuation
- AI-powered property recommendations

---

Built with ❤️ by TheAkristalGroup
