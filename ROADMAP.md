# InvyEasy SaaS Roadmap & Analysis

## Current State Analysis

### Overall Assessment: **7/10 - Solid MVP, Needs Polish for Production**

InvyEasy is a well-structured Next.js 15 + Supabase liquor inventory management SaaS with:
- Strong multi-tenant architecture with organization-based data isolation
- Role-based access control (Owner, Manager, Staff, Viewer)
- Stripe integration for subscriptions
- Team management with PIN-based authentication for mobile staff
- Real-time inventory tracking with room-based counting

### Architecture Strengths
- Clean separation of concerns (API routes, components, lib utilities)
- Row-Level Security (RLS) policies for data protection
- Service role pattern for admin operations
- Subscription guard for paywall enforcement
- Platform admin system for super-user access

### Areas Needing Improvement
- No two-factor authentication
- Limited user self-service (settings, profile)
- Incomplete subscription lifecycle (no cancel/downgrade UI)
- No automated testing
- No error monitoring (Sentry)
- Limited email notifications

---

## Priority 1: Immediate Implementation (Current Sprint)

### 1.1 User Account Security & Settings

#### Email Change Enhancement
**Status:** Partially implemented (in BillingDashboard)
**Needed:**
- [ ] Dedicated `/settings` page with tabs (Profile, Security, Notifications)
- [ ] Email change with verification flow
- [ ] Password change (not just reset)
- [ ] Account deletion with data export option

#### Two-Factor Authentication (2FA)
**Status:** Not implemented
**Implementation Plan:**
- [ ] Enable Supabase MFA (TOTP-based)
- [ ] 2FA setup wizard with QR code
- [ ] Backup codes generation and storage
- [ ] 2FA verification on login
- [ ] Recovery flow for lost authenticator
- [ ] Admin ability to require 2FA for organization

### 1.2 Subscription & Billing Management

#### Subscription Lifecycle
**Status:** Partial (creation only)
**Needed:**
- [ ] Cancel subscription endpoint and UI
- [ ] Pause subscription option
- [ ] Plan upgrade flow (with proration)
- [ ] Plan downgrade flow (at period end)
- [ ] Reactivate cancelled subscription
- [ ] Exit/cancellation survey

#### Payment Method Management
**Status:** Not implemented
**Needed:**
- [ ] View current payment method
- [ ] Update card details (Stripe Customer Portal or custom)
- [ ] Add backup payment method
- [ ] Payment failure handling with retry UI

#### Invoice Management Enhancement
**Status:** Basic implementation
**Needed:**
- [ ] Invoice search and filtering
- [ ] Date range selection
- [ ] Export invoice history (CSV)
- [ ] Upcoming invoice preview
- [ ] Payment receipt emails

---

## Priority 2: Core Features (Next 2-4 Weeks)

### 2.1 Email Notifications System

#### Transactional Emails
- [ ] Low stock alerts (configurable threshold)
- [ ] Count completion notifications
- [ ] Team member added/removed
- [ ] Role change notifications
- [ ] Subscription status changes
- [ ] Payment success/failure

#### Digest Emails
- [ ] Daily inventory summary (optional)
- [ ] Weekly activity report
- [ ] Monthly usage report

#### Email Preferences
- [ ] Per-user notification settings
- [ ] Email frequency controls
- [ ] Unsubscribe management

### 2.2 Audit Logging & Activity History

#### Comprehensive Audit Trail
- [ ] Track all CRUD operations
- [ ] User action attribution
- [ ] IP address logging
- [ ] Device/browser information
- [ ] Timestamp with timezone

#### Activity Dashboard
- [ ] Filterable activity log
- [ ] Export activity history
- [ ] Activity search
- [ ] User-specific activity view

### 2.3 Data Export & Reporting

#### Export Capabilities
- [ ] Full inventory export (CSV, Excel, PDF)
- [ ] Count history export
- [ ] Activity log export
- [ ] Team roster export
- [ ] Financial reports export

#### Scheduled Reports
- [ ] Configure report schedules
- [ ] Email delivery of reports
- [ ] Report templates

---

## Priority 3: Growth Features (1-2 Months)

### 3.1 Multi-Location Support

- [ ] Organization can have multiple venues/locations
- [ ] Location-specific inventory
- [ ] Location-specific staff assignments
- [ ] Cross-location reporting
- [ ] Location transfer tracking

### 3.2 Advanced Inventory Features

- [ ] Barcode scanner (camera-based)
- [ ] Inventory forecasting
- [ ] Par level suggestions based on history
- [ ] Waste tracking
- [ ] Variance reports
- [ ] Cost analysis

### 3.3 Integrations

#### POS Systems
- [ ] Toast integration
- [ ] Square integration
- [ ] Clover integration

#### Accounting
- [ ] QuickBooks integration
- [ ] Xero integration
- [ ] Export for accounting software

#### API
- [ ] Public REST API
- [ ] API key management
- [ ] Webhook configuration
- [ ] API documentation (Swagger/OpenAPI)

---

## Priority 4: Polish & Scale (2-3 Months)

### 4.1 Performance & Reliability

- [ ] Redis caching layer
- [ ] Database query optimization
- [ ] Image optimization (inventory photos)
- [ ] Lazy loading for large lists
- [ ] Pagination improvements

### 4.2 Monitoring & Observability

- [ ] Sentry error tracking
- [ ] Performance monitoring
- [ ] Uptime monitoring
- [ ] Database health checks
- [ ] API response time tracking

### 4.3 Security Hardening

- [ ] Rate limiting on all APIs
- [ ] CAPTCHA for auth endpoints
- [ ] Session management (view/revoke sessions)
- [ ] Login attempt monitoring
- [ ] Suspicious activity alerts
- [ ] Security headers audit

### 4.4 Compliance

- [ ] GDPR compliance
  - [ ] Data export (user request)
  - [ ] Right to deletion
  - [ ] Consent management
- [ ] Terms of Service page
- [ ] Privacy Policy page
- [ ] Cookie consent banner
- [ ] Data processing agreements

---

## Priority 5: Mobile & Advanced (3+ Months)

### 5.1 Progressive Web App (PWA)

- [ ] Offline counting capability
- [ ] Push notifications
- [ ] Install prompt
- [ ] Background sync

### 5.2 Native Mobile App

- [ ] React Native or Flutter app
- [ ] Barcode scanning
- [ ] Offline-first architecture
- [ ] Push notifications

### 5.3 Advanced Analytics

- [ ] Custom dashboard builder
- [ ] Inventory trends visualization
- [ ] Predictive analytics
- [ ] Benchmark comparisons

---

## Technical Debt & Improvements

### Code Quality
- [ ] Add TypeScript strict mode
- [ ] Implement unit tests (Jest)
- [ ] Implement E2E tests (Playwright)
- [ ] Add Storybook for component documentation
- [ ] Code coverage reporting

### DevOps
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Staging environment
- [ ] Database migrations system
- [ ] Automated backups verification
- [ ] Blue-green deployments

### Documentation
- [ ] API documentation
- [ ] Developer onboarding guide
- [ ] Architecture decision records
- [ ] Runbook for common issues

---

## Database Schema Enhancements Needed

```sql
-- 2FA Support
ALTER TABLE user_profiles ADD COLUMN mfa_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE user_profiles ADD COLUMN mfa_secret TEXT;
ALTER TABLE user_profiles ADD COLUMN backup_codes JSONB;

-- Notification Preferences
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  email_low_stock BOOLEAN DEFAULT TRUE,
  email_count_complete BOOLEAN DEFAULT TRUE,
  email_team_changes BOOLEAN DEFAULT TRUE,
  email_weekly_digest BOOLEAN DEFAULT FALSE,
  email_monthly_report BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Audit Logs Enhancement
ALTER TABLE activity_logs ADD COLUMN ip_address INET;
ALTER TABLE activity_logs ADD COLUMN user_agent TEXT;
ALTER TABLE activity_logs ADD COLUMN request_id UUID;

-- Multi-Location Support (Future)
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Scheduled Reports (Future)
CREATE TABLE scheduled_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  frequency TEXT NOT NULL, -- daily, weekly, monthly
  recipients JSONB,
  last_sent_at TIMESTAMP,
  next_send_at TIMESTAMP,
  config JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoints Needed

### User Settings
- `GET /api/user/settings` - Get user settings
- `PUT /api/user/settings` - Update user settings
- `PUT /api/user/password` - Change password
- `DELETE /api/user/account` - Delete account

### Two-Factor Authentication
- `POST /api/auth/2fa/setup` - Initialize 2FA setup
- `POST /api/auth/2fa/verify` - Verify and enable 2FA
- `POST /api/auth/2fa/disable` - Disable 2FA
- `GET /api/auth/2fa/backup-codes` - Get backup codes
- `POST /api/auth/2fa/regenerate-codes` - Regenerate backup codes

### Subscription Management
- `POST /api/stripe/cancel-subscription` - Cancel subscription
- `POST /api/stripe/pause-subscription` - Pause subscription
- `POST /api/stripe/resume-subscription` - Resume subscription
- `POST /api/stripe/change-plan` - Upgrade/downgrade plan
- `GET /api/stripe/upcoming-invoice` - Preview next invoice
- `POST /api/stripe/update-payment-method` - Update payment method
- `GET /api/stripe/payment-methods` - List payment methods

### Notifications
- `GET /api/notifications/preferences` - Get notification preferences
- `PUT /api/notifications/preferences` - Update preferences
- `POST /api/notifications/test` - Send test notification

---

## Estimated Timeline

| Phase | Features | Duration |
|-------|----------|----------|
| **Phase 1** | 2FA, Settings Page, Subscription Management | 2-3 weeks |
| **Phase 2** | Email Notifications, Audit Logging, Reports | 2-3 weeks |
| **Phase 3** | Multi-Location, Integrations | 3-4 weeks |
| **Phase 4** | Performance, Monitoring, Security | 2-3 weeks |
| **Phase 5** | Mobile App, Advanced Analytics | 4-6 weeks |

---

## Success Metrics

### User Engagement
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Feature adoption rates
- Session duration

### Business Metrics
- Monthly Recurring Revenue (MRR)
- Customer Acquisition Cost (CAC)
- Customer Lifetime Value (LTV)
- Churn rate
- Net Promoter Score (NPS)

### Technical Metrics
- API response times (p50, p95, p99)
- Error rates
- Uptime percentage
- Database query performance

---

## Competitive Analysis Considerations

### Key Differentiators to Maintain
1. PIN-based mobile staff access (unique)
2. Room-based counting system
3. Simple, intuitive UI
4. Affordable pricing for small bars/restaurants

### Features Competitors Have
1. Barcode scanning (BevSpot, Partender)
2. POS integrations (Bar-i, Bevager)
3. Recipe costing (Bevager)
4. Vendor ordering (BevSpot)

---

*Last Updated: January 2026*
*Version: 1.0*
