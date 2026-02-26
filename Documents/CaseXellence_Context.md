# CaseXellence Project Context
This document contains all decisions and context from our architecture discussions.
Use this as context when starting a new thread for any topic.

---

## Project Names
- Strapi CMS     → casex-cms
- .NET BFF       → casex-bff
- Angular SSR    → casex-portal

---

## Tech Stack
- Frontend: Angular 19 with SSR
- Middle Tier: .NET 10 Minimal API (BFF + Caching Shield)
- CMS: Strapi 5
- Cache: HybridCache (L1 RAM + L2 Redis)
- CDN: Azure CDN (managed by DevOps, not developer)
- Local Dev: Mac, Redis via Homebrew (brew install redis)

---

## Project Goal
Build a high-performance public (anonymous) portal for CaseXellence.
Phase 1 = anonymous public experience only. No authentication.
Performance target: serve millions of users fast using caching layers.

---

## Architecture Overview
Request flow:
User → Azure CDN → Angular SSR → .NET BFF → Redis → Strapi

- Azure CDN caches full HTML (Cache-Control: max-age=60, stale-while-revalidate=30)
- Angular SSR renders HTML server-side and sets Cache-Control header
- .NET BFF is a caching shield - Angular never calls Strapi directly
- HybridCache manages L1 (RAM ~5ms) and L2 (Redis ~10ms) automatically
- Strapi is only called on full cache miss (first request or after purge)
- CDN setup is DevOps responsibility - developer only sets Cache-Control header

---

## .NET BFF Design (casex-bff)

### Core Responsibility
Fetch from Strapi, cache with HybridCache, return raw JSON to Angular.
That is all. No business logic. No content transformation.

### Single Flexible Endpoint (KEY DECISION)
ONE endpoint handles ALL pages and ALL content types.
No endpoint per page. No DTO per component.

  GET /api/content?contentType=pages&slug=home
  GET /api/content?contentType=sports-sections&slug=ipl-2026
  POST /api/webhook/purge  (called by Strapi on publish)

Why: If new page in Strapi required .NET code change = bad design.
Content changes must NEVER require code changes in .NET.

### Flexible JSON (KEY DECISION)
.NET uses JsonElement for the sections field.
.NET does NOT know about HeroBanner, RichText, VideoPlayer etc.
.NET is a courier - delivers the package without opening it.
Angular reads __component field and decides which component to render.

  public class PageResponse {
    public string Title { get; set; }
    public string Slug { get; set; }
    public JsonElement Sections { get; set; }  // raw JSON, no mapping
  }

Why: New Strapi component = only Angular changes. .NET never changes.

### ISR (Incremental Static Regeneration)
ISR is implemented in .NET, NOT Angular. Angular has no role in ISR.
Stale-While-Revalidate pattern:
- Cache expires → serve stale content instantly to current user
- Background Task.Run fetches fresh from Strapi silently
- Next user gets fresh content
- This is NOT OOTB in HybridCache - requires custom Task.Run code

### Webhook Purge
Strapi fires webhook on publish → .NET removes cache key from RAM + Redis
Cache key format: contentType:slug (e.g. pages:home)
Next request after purge triggers fresh fetch from Strapi.

### Caching Layers
L1 = RAM (30 seconds TTL) - per server instance
L2 = Redis (5 minutes TTL) - shared across all instances
Soft TTL = 4 minutes (triggers background refresh)
Hard TTL = 5 minutes (actual expiry)

### NuGet Packages
- Microsoft.Extensions.Caching.Hybrid
- StackExchange.Redis
- Microsoft.Extensions.Caching.StackExchangeRedis

### Design Rules (must follow always)
1. NEVER create one endpoint per page
2. NEVER add typed DTO per component type
3. ALWAYS use JsonElement for sections field
4. ALWAYS build Strapi URL dynamically from request params
5. ALWAYS use HybridCache GetOrCreateAsync
6. Cache key format is always: contentType:slug
7. Webhook purge uses same cache key format
8. .NET must NOT transform or validate content
9. Strapi always called with populate=* query param
10. ISR background refresh fires in Task.Run (user never waits)

### Project Structure
  casex-bff/
    Controllers/
      ContentController.cs     <- GET /api/content
      WebhookController.cs     <- POST /api/webhook/purge
    Services/
      StrapiService.cs         <- HttpClient calls to Strapi
      ContentCacheService.cs   <- HybridCache + ISR logic
    Models/
      PageResponse.cs          <- title, slug, JsonElement sections
      WebhookPayload.cs        <- contentType, slug
    appsettings.json           <- Redis + Strapi URLs
    Program.cs                 <- DI registration

### appsettings.json
  {
    "Strapi": { "BaseUrl": "http://localhost:1337" },
    "Redis": { "Connection": "localhost:6379" },
    "Cache": {
      "L1RamSeconds": 30,
      "L2RedisMinutes": 5,
      "SoftTtlMinutes": 4
    }
  }

---

## Strapi CMS Design (casex-cms)

### Key Concepts
- Content Type = main container / database table (e.g. Page, SportsSection)
- Component = reusable block of fields (e.g. HeroBanner, RichText)
- Dynamic Zone = flexible field inside Content Type where editor picks components
- Content Type CONTAINS Dynamic Zone. Dynamic Zone CONTAINS Components.

### POC Scope (minimal for 10 days)
- 1 Content Type: Page (title, slug, publishedAt, sections Dynamic Zone)
- 3 Components: HeroBanner (title+subtitle+image), RichText (body), ImageGallery (images)
- 2 Pages of content: Home and About
- 1 Dynamic Zone: sections (inside Page content type)

### API
Using REST API (not GraphQL) - decision made.
Why REST:
- Simple URL-based calls, easy to cache in .NET by URL key
- Works out of the box, no plugin needed
- Our use case is fixed pages, not dynamic search
- GraphQL only if dynamic search needed in Phase 2

Always use populate=* to get Dynamic Zone data:
  GET /api/pages?filters[slug][$eq]=home&populate=*

### Webhook Configuration
Settings → Webhooks → Add new
URL: http://localhost:5000/api/webhook/purge
Trigger: Entry Published
Payload should include contentType and slug

### New Component Rule
When new component added in Strapi Dynamic Zone:
- Strapi: create component (5 mins)
- .NET: NO change needed (flexible passthrough)
- Angular: create new component + add @if in DynamicZoneComponent (1-2 hrs)
- Always do Strapi + Angular in same sprint

---

## Angular SSR Design (casex-portal)

### Setup
  ng new casex-portal --ssr

### Key Files
- server.ts = SSR server (almost never changes)
- app.config.server.ts = server providers
- main.server.ts = server entry point

### Cache-Control Header (important)
Set in server.ts to tell Azure CDN to cache HTML:
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=30')

### API Call to .NET
  getContent(contentType: string, slug: string) {
    return this.http.get(`/api/content?contentType=${contentType}&slug=${slug}`);
  }

### Dynamic Zone Pattern
Angular reads __component field from JSON and renders matching component.

  @for(section of sections; track $index) {
    @if(section.__component === 'sections.hero-banner') {
      <app-hero-banner [data]="section" />
    }
    @if(section.__component === 'sections.rich-text') {
      <app-rich-text [data]="section" />
    }
    @if(section.__component === 'sections.video-player') {
      @defer(on viewport) {
        <app-video-player [data]="section" />
      }
    }
    @else {
      <!-- silently skip unknown components -->
    }
  }

### Hydration Strategy
- Static components (HeroBanner, RichText) = NO hydration, stay as static HTML
- Interactive components (VideoPlayer, PollWidget, Comments) = hydrate on viewport using @defer
- This is Incremental Hydration - Angular 19 feature

### Angular never changes for .NET
server.ts does not change when new pages or components are added.
server.ts is infrastructure - set once, forget it.

### TransferState
Prevents double HTTP calls (server fetches data, transfers to browser, browser reuses it).
Must be configured to avoid calling .NET twice.

---

## Local Development Running Order (every day)
  Terminal 1: brew services start redis       (localhost:6379)
  Terminal 2: cd casex-cms && npm run develop (localhost:1337)
  Terminal 3: cd casex-bff && dotnet run      (localhost:5000)
  Terminal 4: cd casex-portal && ng serve     (localhost:4200)

---

## Manager Discussion Points (agreed)

### REST vs GraphQL
- Use REST for all page rendering in Phase 1
- GraphQL only if dynamic search needed in Phase 2
- REST is simpler, cacheable by URL, works OOTB in Strapi

### .NET Flexible vs Strict Typed
- .NET must be flexible passthrough (JsonElement sections)
- Strict DTOs = .NET changes every sprint when new component added
- Flexible = only Angular changes when new component added
- .NET responsibility is cache + proxy, not understand content

---

## 10-Day Task Plan Summary
- Day 0: Learning (Strapi concepts, Dynamic Zones, hands-on)
- Day 1-2: Strapi setup, content types, components, API testing, webhook config
- Day 3-5: .NET BFF, HybridCache, Redis, ISR logic, webhook purge endpoint
- Day 6-8: Angular SSR, components, Dynamic Zone mapper, routing, TransferState
- Day 9: Full integration testing end to end
- Day 10: Bug fixes, performance check, cleanup, demo

---

## Questions Still Open
- TTL per content type or global 60 seconds? (not decided)
- Azure CDN credentials for purge API (need from DevOps)
- Strapi webhook exact payload structure (need to test)
- Phase 2 scope (not discussed yet)
