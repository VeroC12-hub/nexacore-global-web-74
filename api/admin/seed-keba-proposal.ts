// api/admin/seed-keba-proposal.ts
// One-time endpoint to seed the KEBA proposal into the proposals table.
// Call via POST /api/admin/seed-keba-proposal with admin auth header.

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { created_by } = req.body || {};
  if (!created_by) return res.status(400).json({ error: 'created_by (admin user id) is required' });

  const today = new Date();
  const startDate = '2025-05-01';
  const endDate = '2025-09-30'; // Phase 1 MVP ~5 months
  const validUntil = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const proposalData = {
    client_name: 'Keba Platform',
    client_email: 'founder@keba.com.gh',
    client_company: 'Keba Ghana Limited',
    client_phone: null,
    title: 'KEBA — Multi-Category Delivery Platform: Full MVP Build',
    service_type: 'Software Development',
    status: 'draft',
    total_price: 430000,
    currency: 'GHS',
    timeline: '28–42 weeks (Phase 1 MVP: Months 1–4)',
    estimated_start_date: startDate,
    estimated_end_date: endDate,
    valid_until: validUntil,
    version_number: '1.0',
    is_latest_version: true,
    project_created: false,
    created_by,
    internal_notes: 'Sourced from Keba client brief — Ghana market 2025. Branch-selection + QR dine-in differentiators. Budget based on Ghana-based team at mid-range rates.',
    use_custom_branding: false,
    branding_config: {
      colors: { primary: '#0098A6', secondary: '#1E3A5F', accent: '#CDDC39' },
      logo_url: null,
      company_name: 'NexaCore Innovations',
    },

    executive_summary: {
      overview: 'Keba is a mobile-first, multi-category delivery platform built specifically for the Ghanaian market. The name "Keba" means "bring it" in Ga — embodying the platform\'s core promise. Keba solves two problems no existing delivery app in Ghana addresses: (1) Branch Loyalty — Ghanaians are loyal to specific branches of a chain (e.g. the Melcom on Spintex Road, not the one in Osu). Keba lets customers select the exact branch that serves their order. (2) QR Dine-In Kiosk — restaurant customers currently flag down a waiter to order. Keba replaces this with a QR code on every table that opens a self-service mobile kiosk directly on the customer\'s phone — no app download needed. The platform serves three user types: consumers (Flutter iOS + Android app), riders (Flutter Android app), and vendors (React/Next.js web dashboard), backed by a Node.js + PostgreSQL API with real-time websockets.',
      key_benefits: [
        'Branch-aware ordering — customers pick their preferred branch by GPS proximity, not auto-assigned',
        'Multi-category in one app — food, pharmacy, grocery, and specialty shops under one cart',
        'QR Dine-In Kiosk — table-side ordering via PWA; no app download, no waiter required',
        'Ghana-native payments — Paystack + Flutterwave supporting MoMo, cards, and COD',
        'Real-time order tracking — live rider GPS map and 3-stage dine-in progress tracker',
        'Vendor SaaS dashboard — branch management, product upload, QR code generation, and analytics',
        'Smart auto-dispatch — proximity-ranked rider assignment with 45-second acceptance window',
        'Offline resilience — rider app caches active order and queues status updates for 10 minutes',
      ],
      investment_summary: 'MVP build cost: GHS 318,500 – 547,000 (Ghana-based team, 3–4 developers, 28–42 weeks). Mid-range estimate: GHS 430,000. Year 1 total investment including hosting, APIs, and operational costs: approximately GHS 547,332. Revenue model: 7.5% vendor commission + delivery fee + QR dine-in SaaS fee. At 150 orders/day and an average order value of GHS 120, projected monthly GMV of GHS 540,000 yields approximately GHS 40,500/month in commission revenue.',
    },

    scope_of_work: {
      description: 'NexaCore Innovations will design, build, test, and deploy the full Keba MVP — comprising four interconnected systems: the consumer mobile app, the rider mobile app, the QR dine-in PWA web view, and the vendor + admin web dashboards. The backend API, real-time infrastructure, payment integrations, and maps/geolocation services are included in scope.',
      inclusions: [
        'Customer App (Flutter — iOS + Android): OTP registration, GPS location detection, category browsing (Food / Pharmacy / Grocery), brand + branch search with distance-sorted results, product catalogue, cart and checkout, real-time order tracking with rider GPS map, order history with re-order shortcut, QR dine-in flow entry point',
        'QR Dine-In PWA (React/Next.js — mobile web): Scan-to-open table kiosk, live menu browse, item add/quantity, MoMo/card payment, 3-stage live order progress tracker (Received → Being Prepared → Ready)',
        'Rider App (Flutter — Android): Registration + Ghana Card verification, online/offline toggle, push notifications with 45-second countdown, accept/reject orders, in-app navigation to vendor then customer, status updates (Arrived → Picked Up → Delivered), earnings dashboard',
        'Vendor Dashboard (React/Next.js — web): Branch management, product/menu upload with bulk CSV, stock availability toggle, live order queue (delivery + dine-in), QR code generation per table with printable PDF download, dine-in kitchen status updates, basic analytics',
        'Admin Panel (web): Vendor approval and management, rider approval and management, manual dispatch control and override, financial reconciliation and payout management',
        'Backend API (Node.js + Express + PostgreSQL): All CRUD operations for orders, users, vendors, branches, products, riders, deliveries, tables, payments',
        'Real-Time Infrastructure (Socket.io): Rider GPS updates every 5 seconds, dine-in status push, order queue live updates',
        'Auto-Dispatch Algorithm: GPS-ranked rider selection, 45-second window, radius expansion on failure, manual fallback queue',
        'Payment Integration: Paystack + Flutterwave — Ghana MoMo, Visa/Mastercard, COD flag support',
        'Google Maps Integration: Distance Matrix API for branch proximity sorting, Maps SDK for rider tracking',
        'Firebase Cloud Messaging: Push notifications for rider app and customer app',
        'DevOps: CI/CD pipeline, server configuration on Render (start) or DigitalOcean, SSL, domain setup',
        'Testing + QA: Unit tests, integration tests, end-to-end flows for all critical paths',
      ],
      exclusions: [
        'Phase 2 features: ratings & reviews, scheduled orders, multi-stop orders, COD cash reconciliation, branch analytics heatmap, vendor self-onboarding, split bills',
        'Phase 3 features: loyalty programme, Kumasi/Tema expansion, Twi language localisation, enterprise vendor API',
        'Physical POS hardware or receipt printers',
        'Third-party logistics fleet management (Keba uses its own rider network)',
        'Content population — vendor menus, product images, and branch data are entered by vendors',
        'Marketing, social media, or growth activities',
        'Legal, regulatory, or Ghana Data Protection Act compliance filings (client responsibility)',
      ],
    },

    methodology: {
      approach: 'Keba will be built using an agile, sprint-based delivery model with two-week sprints and continuous integration. Development runs in parallel streams — mobile (Flutter), backend (Node.js), and web (React/Next.js) — coordinated through weekly cross-team standups. Each sprint delivers testable, deployable increments. The QR dine-in PWA is treated as a standalone sub-product with its own performance budget (< 2s load on 3G). All real-time features are built and tested against concurrent load from Day 1, not retrofitted. Ghana-specific considerations — MoMo payment flows, OTP via Hubtel/Arkesel, GPS accuracy in Accra — are addressed in the first sprint.',
      phases: [
        {
          phase_number: 1,
          title: 'Discovery & Architecture',
          duration: '2 weeks',
          description: 'Finalise technical architecture, database schema, API contract, and UI/UX wireframes. Set up CI/CD pipeline, staging environment, and project management tooling. Validate Paystack sandbox and Google Maps API keys.',
          deliverables: [
            'Technical architecture document',
            'PostgreSQL schema (all 10 entities)',
            'API contract (OpenAPI spec)',
            'UI/UX wireframes — customer app, rider app, vendor dashboard',
            'CI/CD pipeline (GitHub Actions → Render)',
            'Staging environment live',
          ],
        },
        {
          phase_number: 2,
          title: 'Core Backend + Auth',
          duration: '3 weeks',
          description: 'Build the Node.js API foundation: user authentication (OTP via SMS), vendor/branch/product CRUD, order creation and status machine, GPS-based branch search with Distance Matrix API, and PostgreSQL database with all entities.',
          deliverables: [
            'OTP authentication API (Hubtel/Arkesel integration)',
            'Vendor, branch, product, and order APIs',
            'Branch proximity search (Distance Matrix API)',
            'Order status state machine',
            'PostgreSQL database — all entities seeded with test data',
          ],
        },
        {
          phase_number: 3,
          title: 'Customer App (Flutter)',
          duration: '6 weeks',
          description: 'Build the full customer-facing Flutter app: onboarding, location detection, category + brand + branch browsing, product catalogue, cart, checkout (Paystack MoMo + card), real-time order tracking with Maps SDK, and order history.',
          deliverables: [
            'Flutter app — iOS + Android builds',
            'OTP registration and login',
            'GPS location detection + manual address',
            'Category, brand, and branch browsing with distance sort',
            'Product catalogue and cart',
            'Paystack checkout (MoMo + card)',
            'Real-time order tracking with rider GPS',
            'Order history + re-order',
          ],
        },
        {
          phase_number: 4,
          title: 'QR Dine-In PWA',
          duration: '2 weeks',
          description: 'Build the QR dine-in web kiosk as a React PWA. Unique QR token per table opens a branded mobile web page — no app download. Customer browses live menu, adds items, pays via MoMo or card, and sees 3-stage progress tracker powered by websocket push.',
          deliverables: [
            'PWA — mobile-optimised, < 2s load on 3G',
            'QR token → table + branch resolution',
            'Live menu (synced from vendor dashboard)',
            'Cart + Paystack MoMo/card checkout',
            '3-stage live progress tracker (Socket.io)',
          ],
        },
        {
          phase_number: 5,
          title: 'Rider App (Flutter) + Auto-Dispatch',
          duration: '3 weeks',
          description: 'Build the rider-facing Flutter Android app and the server-side auto-dispatch algorithm. Rider receives FCM push with 45-second countdown, accepts/rejects, navigates to vendor then customer, and updates status at each step.',
          deliverables: [
            'Rider Flutter Android app',
            'Registration + Ghana Card ID verification flow',
            'FCM push notifications with countdown',
            'Accept/reject and navigation screens',
            'Status update taps (Arrived → Picked Up → Delivered)',
            'Earnings dashboard',
            'Auto-dispatch algorithm (proximity ranking, radius expansion, manual fallback)',
          ],
        },
        {
          phase_number: 6,
          title: 'Vendor Dashboard + Admin Panel',
          duration: '3 weeks',
          description: 'Build the React/Next.js vendor web dashboard and admin panel. Vendors manage branches, products, stock, and see live order queues for both delivery and dine-in. QR code generation with printable PDF. Admins manage vendors, riders, and dispatch.',
          deliverables: [
            'Vendor dashboard — branch, product, and stock management',
            'Live order queue (delivery + dine-in split)',
            'QR code generator with PDF download',
            'Kitchen dine-in status update flow',
            'Basic analytics — orders/day, revenue, top items',
            'Admin panel — vendor and rider approval, manual dispatch, financial overview',
          ],
        },
        {
          phase_number: 7,
          title: 'Integration, QA & Launch Prep',
          duration: '3 weeks',
          description: 'End-to-end integration testing across all four apps. Performance testing against SLA targets (< 300ms API, < 500ms branch search, 5s rider location updates). App Store + Google Play submission. Production deployment with monitoring.',
          deliverables: [
            'End-to-end test suite (all critical flows)',
            'Performance benchmark report',
            'iOS App Store submission',
            'Google Play submission',
            'Production environment (DigitalOcean or Render)',
            'Monitoring and alerting setup',
            'Handover documentation + source code + server credentials',
          ],
        },
      ],
      tools_technologies: [
        'Flutter (Dart) — customer and rider mobile apps',
        'React + Next.js — vendor dashboard, admin panel, QR dine-in PWA',
        'Node.js + Express — backend REST API',
        'Socket.io — real-time websocket (rider tracking, dine-in status)',
        'PostgreSQL — primary relational database',
        'Paystack — Ghana MoMo, Visa/Mastercard payments',
        'Flutterwave — alternative/international card payments',
        'Google Maps Platform — Distance Matrix API, Maps SDK',
        'Firebase Cloud Messaging (FCM) — push notifications',
        'Hubtel / Arkesel — Ghana SMS OTP delivery',
        'AWS S3 / Cloudflare R2 — product images, QR code assets',
        'Render / DigitalOcean — hosting (start), AWS (scale)',
        'GitHub Actions — CI/CD pipeline',
      ],
    },

    deliverables: {
      items: [
        { id: '1', title: 'Customer Mobile App (iOS + Android)', description: 'Flutter app with OTP auth, GPS branch discovery, multi-category ordering, Paystack checkout, real-time rider tracking, and order history. Submitted to App Store and Google Play.', format: 'Mobile App (iOS .ipa + Android .apk)', delivery_date: '2025-08-01', status: 'pending' },
        { id: '2', title: 'QR Dine-In PWA', description: 'React progressive web app accessible via QR code scan. No app download required. Live menu, cart, Paystack payment, and Socket.io 3-stage progress tracker.', format: 'Web Application (PWA)', delivery_date: '2025-07-15', status: 'pending' },
        { id: '3', title: 'Rider Mobile App (Android)', description: 'Flutter Android app with registration, FCM push notifications, 45-second countdown, navigation, status updates, and earnings dashboard.', format: 'Mobile App (Android .apk)', delivery_date: '2025-08-15', status: 'pending' },
        { id: '4', title: 'Vendor Web Dashboard', description: 'React/Next.js web app for branch management, product upload (with bulk CSV), stock control, live order queue, QR code PDF generation, and kitchen dine-in status updates.', format: 'Web Application', delivery_date: '2025-09-01', status: 'pending' },
        { id: '5', title: 'Admin Panel', description: 'Web dashboard for vendor/rider approval and management, manual dispatch override, active order map, and financial reconciliation.', format: 'Web Application', delivery_date: '2025-09-01', status: 'pending' },
        { id: '6', title: 'Backend API + Database', description: 'Node.js + Express REST API with PostgreSQL. All 10 entities: users, vendors, branches, products, orders, tables, dine-in sessions, riders, deliveries, payments. Auto-dispatch algorithm and real-time Socket.io layer.', format: 'API (deployed, documented)', delivery_date: '2025-07-01', status: 'pending' },
        { id: '7', title: 'Payment Integration', description: 'Paystack + Flutterwave integration supporting Ghana MoMo, Visa/Mastercard, and COD flag. Webhook-based order confirmation.', format: 'Integrated module', delivery_date: '2025-07-15', status: 'pending' },
        { id: '8', title: 'Source Code + Documentation', description: 'Full source code handover via GitHub (private repo transfer). API documentation (OpenAPI), deployment guide, server credentials, and app store accounts.', format: 'GitHub repository + PDF documentation', delivery_date: '2025-09-30', status: 'pending' },
      ],
    },

    risk_analysis: {
      risks: [
        {
          id: 'r1',
          title: 'Google Maps Distance Matrix API costs exceed budget',
          description: 'Branch proximity search calls the Distance Matrix API for each search. At high volume (500+ searches/day) costs can escalate quickly at $5 per 1,000 calls.',
          impact: 'medium',
          probability: 'medium',
          mitigation_strategy: 'Implement aggressive caching — cache branch distances per 500m GPS cell for 15 minutes. Batch API calls where multiple branches share the same origin. Set hard daily spend cap in Google Cloud Console with alerting.',
        },
        {
          id: 'r2',
          title: 'Paystack MoMo approval delays for platform-type transactions',
          description: 'Paystack requires additional approval for marketplace/platform disbursements (split payments). Approval can take 1–3 weeks.',
          impact: 'high',
          probability: 'medium',
          mitigation_strategy: 'Initiate Paystack Business verification and marketplace feature application at project kick-off — before development begins. Maintain Flutterwave as a ready fallback. Implement COD as a bridge payment method during approval period.',
        },
        {
          id: 'r3',
          title: 'GPS accuracy in Accra low-signal areas',
          description: 'Parts of East Legon, Labone, and Airport Residential have inconsistent GPS signal. Branch-sorting accuracy degrades without clean GPS coordinates.',
          impact: 'medium',
          probability: 'high',
          mitigation_strategy: 'Implement manual address entry as primary fallback — pre-load a list of Accra landmarks and zones. Use network-based location (cell tower triangulation) when GPS is unavailable. Show user their detected location and allow correction before searching.',
        },
        {
          id: 'r4',
          title: 'Rider supply shortage at launch',
          description: 'The dispatch algorithm requires a minimum density of online riders to function. If fewer than 8–10 riders are online in the pilot corridor, average wait times will breach SLA.',
          impact: 'high',
          probability: 'medium',
          mitigation_strategy: 'Pre-recruit and verify 25–30 riders before launch (target 15 active at pilot). Offer launch bonus incentive for riders who complete 30+ orders in Month 1. Build admin manual-dispatch screen for early-stage fallback. Track rider density in real-time on admin map.',
        },
        {
          id: 'r5',
          title: 'QR dine-in PWA performance on low-end Android devices',
          description: 'Budget Android devices (Tecno, Itel) on 3G connections represent a significant portion of the Ghana market. Heavy JS bundles can cause the dine-in kiosk to load slowly.',
          impact: 'medium',
          probability: 'high',
          mitigation_strategy: 'Set hard performance budget: < 2s LCP on 3G (Lighthouse CI enforced in CI/CD pipeline). Use React Server Components for menu rendering. Lazy-load images. Serve WebP from Cloudflare R2 with correct cache headers. Test on physical Tecno Spark device throughout development.',
        },
      ],
      mitigation_strategies: [
        'All third-party integrations (Paystack, Google Maps, FCM) initiated at project kick-off, not deferred',
        'Performance budgets enforced in CI/CD — builds fail if Lighthouse score drops below threshold',
        'Offline-first design for rider app — active order cached locally, status updates queued for up to 10 minutes',
        'Ghana Data Protection Act 2012 compliance: explicit location consent prompt, data processing disclosure in onboarding, right to delete account',
        'Fixed-price contract with clear milestone payment schedule — 30% upfront, 30% at mid-point (backend + rider app), 40% on launch',
      ],
    },

    success_metrics: {
      kpis: [
        { id: 'k1', name: 'Delivery orders per day', description: 'Total paid delivery orders completed across all vendors in the pilot corridor', target: '30 by Month 1 → 150 by Month 3 → 400 by Month 6', measurement_method: 'Orders table in database, status = delivered, aggregated daily' },
        { id: 'k2', name: 'Dine-in sessions per day', description: 'Total QR dine-in sessions where payment was completed', target: '20 by Month 1 → 100 by Month 3 → 300 by Month 6', measurement_method: 'Dine-in sessions table, status = paid, aggregated daily' },
        { id: 'k3', name: 'Active vendors (Accra)', description: 'Vendors with at least 1 order in the past 7 days', target: '20 at launch → 50 by Month 3 → 100 by Month 6', measurement_method: 'Vendor dashboard active count, 7-day rolling window' },
        { id: 'k4', name: 'Median delivery time', description: 'Time from order confirmed to delivered (50th percentile)', target: '< 45 min at launch → < 38 min by Month 3 → < 32 min by Month 6', measurement_method: 'Deliveries table: delivered_at minus order confirmed_at, P50 daily' },
        { id: 'k5', name: '30-day customer retention', description: 'Customers who place at least 2 orders within 30 days of their first order', target: '25% Month 1 → 38% Month 3 → 45% Month 6', measurement_method: 'Cohort analysis on users table by first_order_date vs second_order_date' },
        { id: 'k6', name: 'Order completion rate', description: 'Orders that reach status = delivered / total orders placed (excludes cancellations before prep)', target: '85% at launch → 90% Month 3 → 94% Month 6', measurement_method: 'Orders table: count(delivered) / count(confirmed) daily' },
        { id: 'k7', name: 'Rider acceptance rate', description: 'Percentage of order broadcasts accepted within 45 seconds', target: '> 80% within 60 days of launch', measurement_method: 'Dispatch log: accepted events / total broadcast events' },
        { id: 'k8', name: 'App Store / Play Store rating', description: 'Average user rating across both stores', target: '> 4.0 stars by Month 3 → > 4.3 stars by Month 6', measurement_method: 'App Store Connect + Google Play Console monthly rating' },
      ],
      measurement_approach: 'All primary metrics are instrumented at the database level — no reliance on third-party analytics for core business KPIs. An admin analytics dashboard surfaces daily/weekly cohort reports. Google Analytics 4 + Firebase Analytics are used for funnel and retention analysis. Weekly metric review by the client and NexaCore project manager against the targets above. Escalation protocol triggers if any KPI falls more than 20% below target for 2 consecutive weeks.',
    },

    custom_sections: [
      {
        id: 'cs1',
        title: 'About the Keba Name',
        content: '"Keba" means "bring it" in Ga — one of the primary languages of Accra. The name is short, memorable, and carries a command that perfectly describes the platform\'s purpose. The tagline — "Your branch. Your table. Your order." — reinforces the three core differentiators: branch loyalty, dine-in kiosk, and personal control.',
        order: 1,
        type: 'text',
      },
      {
        id: 'cs2',
        title: 'Competitive Landscape — Ghana',
        content: 'Current delivery apps operating in Ghana include Bolt Food, Jumia Food, and Glovo. None offers: (1) branch-level selection — all auto-assign the nearest branch algorithmically, generating frequent complaints from Ghanaian users who are loyal to specific locations; (2) QR dine-in — no competitor offers a table-based ordering kiosk; (3) full multi-category in one cart — competitors are restaurant-only or have limited grocery coverage. Keba\'s two primary differentiators are uncontested in the Ghana market as of 2025.',
        order: 2,
        type: 'text',
      },
      {
        id: 'cs3',
        title: 'Revenue Model Breakdown',
        content: '7.5% vendor commission on all orders (delivery and dine-in). Delivery fee paid by customer (GHS 8–20 depending on distance, shown at checkout). QR Dine-In SaaS fee: GHS 150–300/month per restaurant for table QR management, analytics, and the dine-in order system. At 150 delivery orders/day at average GHS 120 order value: GMV = GHS 540,000/month → Commission = GHS 40,500/month. At 100 dine-in sessions/day at GHS 80 average: GMV = GHS 240,000/month → Commission = GHS 18,000/month. Combined Month 3 projection: ~GHS 58,500/month gross commission before payment fees and ops costs.',
        order: 3,
        type: 'text',
      },
      {
        id: 'cs4',
        title: 'Developer Questions — Recommended Screening',
        content: 'When evaluating developers for this project, require answers to: (1) Have you built a Flutter app with real-time GPS tracking? Show a live example. (2) Have you integrated Paystack MoMo specifically — not just card? (3) Can the QR dine-in PWA work offline if the customer\'s signal drops mid-order? (4) How would you cache Distance Matrix API calls to control costs? (5) How would you handle the Socket.io websocket for 500 concurrent active orders? Red flags: cannot show a live previous project; asks for full payment upfront; cannot explain their approach to real-time or the Distance Matrix API; does not ask clarifying questions about this spec.',
        order: 4,
        type: 'text',
      },
    ],

    terms_and_conditions: `1. PAYMENT SCHEDULE
Payment is structured across three milestones on a fixed-price contract:
• Milestone 1 — 30% (GHS 129,000) due upon contract signing and project kick-off.
• Milestone 2 — 30% (GHS 129,000) due upon delivery and client acceptance of: backend API, rider app, and QR dine-in PWA.
• Milestone 3 — 40% (GHS 172,000) due upon delivery and client acceptance of: customer app, vendor dashboard, admin panel, and production deployment.

2. SCOPE CHANGES
Changes to the agreed MVP scope will be handled via a formal change request process. Each change request will be scoped, priced, and approved in writing before work begins. NexaCore reserves the right to adjust the timeline for scope additions.

3. INTELLECTUAL PROPERTY
Upon final payment, all intellectual property — source code, database schema, design assets, and documentation — is transferred in full to the client. NexaCore retains no licence or ongoing ownership.

4. SOURCE CODE HANDOVER
Source code is delivered via GitHub private repository transfer. Server credentials, App Store/Play Console access, and API keys are documented and transferred within 5 business days of final payment.

5. POST-LAUNCH SUPPORT
NexaCore provides 60 days of bug-fix support at no additional cost following production launch. Support covers bugs in the agreed MVP scope. Feature requests, new integrations, and Phase 2 items are outside this support window and will be quoted separately.

6. DATA PROTECTION
Both parties agree to comply with the Ghana Data Protection Act 2012. The client is responsible for registering as a data controller with the Data Protection Commission of Ghana. NexaCore will implement technical controls as specified in the non-functional requirements (explicit consent, location disclosure, right to delete).

7. CONFIDENTIALITY
Both parties agree to keep the terms of this proposal, the technical architecture, and all project documentation confidential for a period of 3 years following project completion.`,
  };

  try {
    const { data, error } = await supabaseAdmin
      .from('proposals')
      .insert([proposalData] as any)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      proposal_id: data.id,
      proposal_number: data.proposal_number,
      message: 'KEBA proposal seeded successfully',
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to seed proposal' });
  }
}
