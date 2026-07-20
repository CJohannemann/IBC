# Independence Baseball Club (IBC) — Platform Implementation Plan

**Version**: 1.0  
**Author**: Chris Johannemann  
**Created**: July 2026  
**Repository**: CJohannemann/IBC  
**Classification**: Internal — Development Reference

---

## Executive Summary

### Project Scope
Build a centralized web platform for the Independence Baseball Club (IBC) to manage teams, players, schedules, statistics, news, and sponsorships. The platform serves three distinct audiences: the general public (fans, prospective players), coaches and administrators (internal club operations), and future growth use cases (tournament hosting, online registration).

This is a **greenfield project**. The only existing asset is `split_pot_tracker.html` — a standalone fundraiser tracker that will be preserved as-is and optionally linked from the new platform.

### Goals
| Goal | Metric |
|------|--------|
| Replace manual/scattered club management | All teams, rosters, and schedules in one system |
| Public-facing club presence | Live site with player profiles, stats, and news |
| Reduce stat-entry burden | GameChanger CSV import replaces manual entry |
| Scale from 3–4 teams today to 10+ tomorrow | Architecture supports 200+ players, multi-season history |

### Total Estimated Duration
| Scenario | Timeline |
|----------|----------|
| **Solo developer (part-time, ~10–15 hrs/week)** | **8–11 months** |
| Small team (2–3 developers) | 3–4 months |

### Team Size
Planned for **1 developer** (Chris Johannemann), building on evenings and weekends. All estimates reflect this reality. A 25% time buffer is baked into every phase.

### Key Risks (Summary)
1. **Solo bandwidth** — the single largest risk; mitigated by strict MVP scoping
2. **GameChanger CSV format drift** — format is not publicly documented; mitigated by defensive parsing + import preview UI
3. **Schema evolution pain** — mitigated by adopting Flyway from day one
4. **Photo/media storage** — local volume doesn't scale; use Cloudflare R2 from the start
5. **JWT security implementation** — Spring Security handles the heavy lifting; risk is misconfiguration

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Technical Architecture Breakdown](#2-technical-architecture-breakdown)
   - 2.1 [System Architecture Diagram](#21-system-architecture-diagram)
   - 2.2 [Docker Compose Service Layout](#22-docker-compose-service-layout)
   - 2.3 [Spring Boot Project Structure](#23-spring-boot-project-structure)
   - 2.4 [Vue Frontend Structure](#24-vue-frontend-structure)
   - 2.5 [Database Schema and Relationships](#25-database-schema-and-relationships)
   - 2.6 [Security Architecture — JWT and RBAC](#26-security-architecture--jwt-and-rbac)
   - 2.7 [GameChanger CSV Import Data Flow](#27-gamechanger-csv-import-data-flow)
   - 2.8 [split_pot_tracker.html Integration Strategy](#28-split_pot_trackerhtml-integration-strategy)
3. [Development Phases and Milestones](#3-development-phases-and-milestones)
   - Sprint 1: Foundation
   - Sprint 2: Core Data Modules
   - Sprint 3: Public-Facing Frontend
   - Sprint 4: Statistics and GameChanger Import
   - Sprint 5: Admin Portal and Content Management
4. [Resource Allocation and Estimates](#4-resource-allocation-and-estimates)
5. [Risk Assessment and Mitigation](#5-risk-assessment-and-mitigation)
6. [Dependencies and Blockers](#6-dependencies-and-blockers)
7. [Testing Strategy](#7-testing-strategy)
8. [Infrastructure Setup Checklist](#8-infrastructure-setup-checklist)
9. [Key Technical Decisions and Recommendations](#9-key-technical-decisions-and-recommendations)

---

## 2. Technical Architecture Breakdown

### 2.1 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PUBLIC INTERNET                              │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ HTTPS (443)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE (DNS + SSL/CDN)                       │
│   independencebaseball.com → Hetzner VPS IP                         │
│   - SSL termination (Cloudflare-issued cert)                        │
│   - DDoS protection, caching static assets                         │
│   - R2 object storage for photos/media (optional CDN edge)          │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ proxied HTTP (80/443)
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    HETZNER VPS (Ubuntu 24.04 LTS)                   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                  Docker Compose Stack                        │   │
│  │                                                             │   │
│  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │   │
│  │  │    NGINX     │    │  Vue 3 SPA   │    │  Spring Boot │  │   │
│  │  │  (Reverse    │───▶│  (Static     │    │  3 + Java 21 │  │   │
│  │  │   Proxy)     │    │   files via  │    │  REST API    │  │   │
│  │  │  :80/:443    │    │   nginx)     │    │  :8080       │  │   │
│  │  └──────┬───────┘    └──────────────┘    └──────┬───────┘  │   │
│  │         │                                        │          │   │
│  │         │ /api/* → :8080                         │          │   │
│  │         └────────────────────────────────────────┘          │   │
│  │                                                             │   │
│  │                         ┌──────────────────────────────┐   │   │
│  │                         │     PostgreSQL 16             │   │   │
│  │                         │     :5432 (internal only)     │   │   │
│  │                         │     /var/lib/postgresql/data  │   │   │
│  │                         └──────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │  split_pot_tracker.html (served directly by nginx at        │    │
│  │  /fundraiser — standalone, no framework dependency)         │    │
│  └────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘

External Services:
  ┌──────────────────┐    ┌──────────────────┐
  │  Cloudflare R2   │    │  GameChanger     │
  │  (Photo/Media    │    │  (CSV export     │
  │   Object Store)  │    │   uploaded by    │
  └──────────────────┘    │   admin)         │
                          └──────────────────┘
```

### 2.2 Docker Compose Service Layout

```yaml
# docker-compose.yml (production outline)
services:
  nginx:
    image: nginx:alpine
    ports: ["80:80", "443:443"]
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./frontend/dist:/usr/share/nginx/html:ro          # Vue build output
      - ./static/fundraiser:/usr/share/nginx/fundraiser:ro # split_pot_tracker.html
    depends_on: [api]

  api:
    build: ./backend
    expose: ["8080"]
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_HOST=db
      - DB_PASSWORD=${DB_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - R2_ACCESS_KEY=${R2_ACCESS_KEY}
      - R2_SECRET_KEY=${R2_SECRET_KEY}
    depends_on: [db]
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./db/init:/docker-entrypoint-initdb.d:ro
    environment:
      - POSTGRES_DB=ibc
      - POSTGRES_USER=ibc_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    expose: ["5432"]
    restart: unless-stopped

volumes:
  postgres_data:

# docker-compose.dev.yml (local development override)
services:
  api:
    volumes:
      - ./backend:/app   # hot reload via spring-boot-devtools
    ports: ["8080:8080"]
  db:
    ports: ["5432:5432"] # expose to host for local DBeaver/psql access
```

**Nginx route delegation** (key routing rules):
```nginx
# /etc/nginx/nginx.conf (simplified)
server {
  listen 80;
  server_name independencebaseball.com;

  # Vue SPA — serve index.html for all non-asset routes
  location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
  }

  # REST API — proxy to Spring Boot
  location /api/ {
    proxy_pass http://api:8080;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  # Fundraiser tracker — standalone static file
  location /fundraiser/ {
    alias /usr/share/nginx/fundraiser/;
  }
}
```

---

### 2.3 Spring Boot Project Structure

```
backend/
├── pom.xml
└── src/
    ├── main/
    │   ├── java/com/ibc/platform/
    │   │   ├── IbcPlatformApplication.java
    │   │   │
    │   │   ├── config/
    │   │   │   ├── SecurityConfig.java          # Spring Security + JWT filter chain
    │   │   │   ├── CorsConfig.java              # CORS for Vue dev server
    │   │   │   ├── SwaggerConfig.java           # OpenAPI / Springdoc config
    │   │   │   └── R2StorageConfig.java         # Cloudflare R2 S3-compatible client
    │   │   │
    │   │   ├── security/
    │   │   │   ├── JwtTokenProvider.java        # Generate + validate JWTs
    │   │   │   ├── JwtAuthenticationFilter.java # Per-request token validation
    │   │   │   ├── UserDetailsServiceImpl.java  # Load user from DB for Spring Security
    │   │   │   └── Role.java                    # Enum: SUPER_ADMIN, BOARD_MEMBER, COACH, STAT_MANAGER, PUBLIC_USER
    │   │   │
    │   │   ├── controllers/
    │   │   │   ├── AuthController.java          # POST /api/auth/login, /refresh, /logout
    │   │   │   ├── TeamController.java          # /api/teams
    │   │   │   ├── PlayerController.java        # /api/players
    │   │   │   ├── GameController.java          # /api/games
    │   │   │   ├── StatsController.java         # /api/stats
    │   │   │   ├── NewsController.java          # /api/news
    │   │   │   ├── SponsorController.java       # /api/sponsors
    │   │   │   ├── GalleryController.java       # /api/gallery
    │   │   │   ├── ImportController.java        # /api/admin/import (CSV upload)
    │   │   │   └── AdminController.java         # /api/admin/dashboard
    │   │   │
    │   │   ├── services/
    │   │   │   ├── TeamService.java
    │   │   │   ├── PlayerService.java
    │   │   │   ├── GameService.java
    │   │   │   ├── StatsService.java
    │   │   │   ├── NewsService.java
    │   │   │   ├── SponsorService.java
    │   │   │   ├── GalleryService.java
    │   │   │   ├── PhotoStorageService.java     # Upload/delete to Cloudflare R2
    │   │   │   ├── SlugService.java             # "Luke Smith" → "luke-smith" (unique)
    │   │   │   └── gamechanger/
    │   │   │       ├── GameChangerImportService.java
    │   │   │       ├── GameChangerCsvParser.java
    │   │   │       ├── GameChangerPlayerMatcher.java
    │   │   │       └── ImportResult.java        # Summary DTO
    │   │   │
    │   │   ├── repositories/
    │   │   │   ├── SeasonRepository.java
    │   │   │   ├── TeamRepository.java
    │   │   │   ├── PlayerRepository.java
    │   │   │   ├── TeamPlayerRepository.java
    │   │   │   ├── GameRepository.java
    │   │   │   ├── PlayerStatsRepository.java
    │   │   │   ├── CoachRepository.java
    │   │   │   ├── SponsorRepository.java
    │   │   │   ├── NewsRepository.java
    │   │   │   ├── GalleryRepository.java
    │   │   │   └── UserRepository.java
    │   │   │
    │   │   ├── entities/
    │   │   │   ├── Season.java
    │   │   │   ├── Team.java
    │   │   │   ├── Player.java
    │   │   │   ├── TeamPlayer.java              # Join table with extra fields
    │   │   │   ├── Coach.java
    │   │   │   ├── Game.java
    │   │   │   ├── PlayerStats.java
    │   │   │   ├── Sponsor.java
    │   │   │   ├── News.java
    │   │   │   ├── Gallery.java
    │   │   │   └── User.java                   # Auth users (admin portal)
    │   │   │
    │   │   ├── dto/
    │   │   │   ├── request/
    │   │   │   │   ├── LoginRequest.java
    │   │   │   │   ├── CreateTeamRequest.java
    │   │   │   │   ├── CreatePlayerRequest.java
    │   │   │   │   └── ... (one per write operation)
    │   │   │   └── response/
    │   │   │       ├── AuthResponse.java        # { token, refreshToken, expiresAt }
    │   │   │       ├── TeamResponse.java
    │   │   │       ├── PlayerProfileResponse.java
    │   │   │       ├── StatsLeaderboardResponse.java
    │   │   │       └── ImportResultResponse.java
    │   │   │
    │   │   └── util/
    │   │       ├── SlugUtils.java
    │   │       └── CsvParserUtils.java
    │   │
    │   └── resources/
    │       ├── application.yml                  # Base config
    │       ├── application-dev.yml              # Local overrides
    │       ├── application-prod.yml             # Prod overrides
    │       └── db/migration/                   # Flyway migrations
    │           ├── V1__create_initial_schema.sql
    │           ├── V2__add_seasons_table.sql
    │           └── ... (one file per schema change)
    │
    └── test/
        └── java/com/ibc/platform/
            ├── services/                       # Unit tests (JUnit 5 + Mockito)
            ├── controllers/                    # MockMvc integration tests
            ├── repositories/                  # @DataJpaTest with TestContainers
            └── gamechanger/                   # CSV import unit + integration tests
```

---

### 2.4 Vue Frontend Structure

```
frontend/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── package.json
└── src/
    ├── main.ts                              # App bootstrap, plugin registration
    ├── App.vue                              # Root component, router-view
    │
    ├── assets/
    │   ├── css/
    │   │   ├── main.css                     # Tailwind directives + global resets
    │   │   └── variables.css                # CSS custom properties for IBC colors
    │   └── images/
    │       └── ibc-logo.svg                 # Club logo
    │
    ├── types/
    │   ├── team.ts
    │   ├── player.ts
    │   ├── game.ts
    │   ├── stats.ts
    │   ├── news.ts
    │   ├── sponsor.ts
    │   └── auth.ts
    │
    ├── services/                            # Axios API wrappers
    │   ├── api.ts                           # Base Axios instance + interceptors
    │   ├── teamService.ts
    │   ├── playerService.ts
    │   ├── gameService.ts
    │   ├── statsService.ts
    │   ├── newsService.ts
    │   ├── authService.ts
    │   └── importService.ts
    │
    ├── stores/                              # Pinia stores
    │   ├── authStore.ts                     # JWT token, user role, login/logout
    │   ├── teamStore.ts
    │   ├── playerStore.ts
    │   ├── gameStore.ts
    │   ├── statsStore.ts
    │   └── uiStore.ts                       # Loading states, notifications
    │
    ├── router/
    │   └── index.ts                         # Vue Router + auth guards
    │
    ├── layouts/
    │   ├── PublicLayout.vue                 # Nav, footer for public pages
    │   └── AdminLayout.vue                  # Sidebar nav for /admin
    │
    ├── components/
    │   ├── common/
    │   │   ├── NavBar.vue
    │   │   ├── Footer.vue
    │   │   ├── LoadingSpinner.vue
    │   │   ├── ErrorMessage.vue
    │   │   └── PageHero.vue                 # Reusable hero banner
    │   ├── teams/
    │   │   ├── TeamCard.vue
    │   │   └── TeamRosterTable.vue
    │   ├── players/
    │   │   ├── PlayerCard.vue
    │   │   └── StatLine.vue
    │   ├── games/
    │   │   ├── GameRow.vue
    │   │   └── ScheduleFilter.vue
    │   ├── stats/
    │   │   ├── LeaderboardTable.vue
    │   │   └── StatCategory.vue
    │   └── admin/
    │       ├── ImportUploader.vue
    │       ├── ImportPreview.vue
    │       └── DashboardStat.vue
    │
    └── pages/
        ├── public/
        │   ├── HomePage.vue
        │   ├── TeamsPage.vue
        │   ├── TeamDetailPage.vue           # /teams/:id
        │   ├── PlayerProfilePage.vue        # /players/:slug
        │   ├── SchedulePage.vue
        │   ├── StatsPage.vue
        │   ├── SponsorsPage.vue
        │   └── NewsPage.vue
        └── admin/
            ├── AdminDashboard.vue
            ├── AdminTeams.vue
            ├── AdminPlayers.vue
            ├── AdminSchedule.vue
            ├── AdminStats.vue               # Import GameChanger CSV
            ├── AdminNews.vue
            └── LoginPage.vue
```

**Tailwind color configuration (tailwind.config.ts)**:
```typescript
theme: {
  extend: {
    colors: {
      'ibc-navy':  '#1e3a8a',
      'ibc-red':   '#ef4444',
      'ibc-cream': '#f5f1e8',
    }
  }
}
```

---

### 2.5 Database Schema and Relationships

```
seasons ──────────────────────────────────────────────────────────────
  id               BIGSERIAL PRIMARY KEY
  name             VARCHAR(100) NOT NULL          -- "2026 Spring"
  start_date       DATE NOT NULL
  end_date         DATE NOT NULL
  is_active        BOOLEAN DEFAULT false
  created_date     TIMESTAMPTZ DEFAULT now()

teams ────────────────────────────────────────────────────────────────
  id               BIGSERIAL PRIMARY KEY
  season_id        BIGINT REFERENCES seasons(id)
  team_name        VARCHAR(100) NOT NULL           -- "IBC 12U Blue"
  age_group        VARCHAR(10)                     -- "12U"
  level            VARCHAR(50)                     -- "Travel", "Rec"
  head_coach       VARCHAR(100)
  assistant_coach  VARCHAR(100)
  team_photo_url   TEXT
  created_date     TIMESTAMPTZ DEFAULT now()
  INDEX: (season_id), (age_group)

players ──────────────────────────────────────────────────────────────
  id               BIGSERIAL PRIMARY KEY
  first_name       VARCHAR(50) NOT NULL
  last_name        VARCHAR(50) NOT NULL
  slug             VARCHAR(120) UNIQUE NOT NULL    -- "luke-smith", "luke-smith-2"
  jersey_number    SMALLINT
  date_of_birth    DATE
  graduation_year  SMALLINT
  primary_position VARCHAR(10)
  secondary_position VARCHAR(10)
  height           VARCHAR(10)                     -- "5'8\""
  weight           SMALLINT
  bats             CHAR(1)                         -- 'R','L','S'
  throws           CHAR(1)                         -- 'R','L'
  photo_url        TEXT
  active           BOOLEAN DEFAULT true
  created_date     TIMESTAMPTZ DEFAULT now()
  INDEX: (slug), (last_name), (active), (graduation_year)

team_players ─────────────────────────────────────────────────────────
  id               BIGSERIAL PRIMARY KEY
  team_id          BIGINT NOT NULL REFERENCES teams(id)
  player_id        BIGINT NOT NULL REFERENCES players(id)
  season_id        BIGINT NOT NULL REFERENCES seasons(id)
  created_date     TIMESTAMPTZ DEFAULT now()
  UNIQUE: (team_id, player_id, season_id)
  INDEX: (player_id), (team_id), (season_id)

coaches ──────────────────────────────────────────────────────────────
  id               BIGSERIAL PRIMARY KEY
  first_name       VARCHAR(50) NOT NULL
  last_name        VARCHAR(50) NOT NULL
  email            VARCHAR(150)
  phone            VARCHAR(20)
  role             VARCHAR(50)                     -- "Head Coach", "Assistant"
  bio              TEXT
  photo_url        TEXT

games ────────────────────────────────────────────────────────────────
  id               BIGSERIAL PRIMARY KEY
  season_id        BIGINT NOT NULL REFERENCES seasons(id)
  team_id          BIGINT NOT NULL REFERENCES teams(id)
  game_date        TIMESTAMPTZ NOT NULL
  opponent         VARCHAR(100) NOT NULL
  location         VARCHAR(200)
  home_away        CHAR(1)                         -- 'H','A'
  game_type        VARCHAR(20) NOT NULL            -- 'League','Tournament','Scrimmage'
  status           VARCHAR(20) DEFAULT 'Scheduled' -- 'Scheduled','Final','Cancelled','Postponed'
  team_score       SMALLINT
  opponent_score   SMALLINT
  notes            TEXT
  INDEX: (team_id, game_date), (season_id), (status)

player_stats ─────────────────────────────────────────────────────────
  id               BIGSERIAL PRIMARY KEY
  player_id        BIGINT NOT NULL REFERENCES players(id)
  season_id        BIGINT NOT NULL REFERENCES seasons(id)
  -- Batting
  games_played     SMALLINT DEFAULT 0
  plate_appearances SMALLINT DEFAULT 0
  at_bats          SMALLINT DEFAULT 0
  runs             SMALLINT DEFAULT 0
  hits             SMALLINT DEFAULT 0
  doubles          SMALLINT DEFAULT 0
  triples          SMALLINT DEFAULT 0
  home_runs        SMALLINT DEFAULT 0
  rbi              SMALLINT DEFAULT 0
  walks            SMALLINT DEFAULT 0
  strikeouts       SMALLINT DEFAULT 0
  -- Computed batting (stored for query performance)
  avg              NUMERIC(4,3)                    -- .325
  obp              NUMERIC(4,3)
  slg              NUMERIC(4,3)
  ops              NUMERIC(4,3)
  -- Pitching
  innings_pitched  NUMERIC(4,1) DEFAULT 0
  wins             SMALLINT DEFAULT 0
  losses           SMALLINT DEFAULT 0
  saves            SMALLINT DEFAULT 0
  era              NUMERIC(5,2)
  strikeouts_pitched SMALLINT DEFAULT 0
  updated_date     TIMESTAMPTZ DEFAULT now()
  UNIQUE: (player_id, season_id)
  INDEX: (season_id, avg DESC), (season_id, ops DESC), (season_id, era ASC)

sponsors ─────────────────────────────────────────────────────────────
  id               BIGSERIAL PRIMARY KEY
  name             VARCHAR(150) NOT NULL
  website          TEXT
  logo_url         TEXT
  sponsor_level    VARCHAR(10) NOT NULL            -- 'Gold','Silver','Bronze'
  description      TEXT
  active           BOOLEAN DEFAULT true
  INDEX: (active, sponsor_level)

news ─────────────────────────────────────────────────────────────────
  id               BIGSERIAL PRIMARY KEY
  title            VARCHAR(250) NOT NULL
  summary          TEXT
  content          TEXT NOT NULL
  category         VARCHAR(50)                     -- 'Announcement','Tournament','Article'
  author           VARCHAR(100)
  publish_date     TIMESTAMPTZ
  featured_image   TEXT
  active           BOOLEAN DEFAULT true
  INDEX: (active, publish_date DESC)

gallery ──────────────────────────────────────────────────────────────
  id               BIGSERIAL PRIMARY KEY
  title            VARCHAR(200)
  photo_url        TEXT NOT NULL
  season_id        BIGINT REFERENCES seasons(id)
  team_id          BIGINT REFERENCES teams(id)
  upload_date      TIMESTAMPTZ DEFAULT now()
  INDEX: (team_id), (season_id)

users ────────────────────────────────────────────────────────────────
  id               BIGSERIAL PRIMARY KEY
  username         VARCHAR(50) UNIQUE NOT NULL
  email            VARCHAR(150) UNIQUE NOT NULL
  password_hash    VARCHAR(255) NOT NULL           -- bcrypt
  role             VARCHAR(20) NOT NULL            -- matches Role enum
  active           BOOLEAN DEFAULT true
  created_date     TIMESTAMPTZ DEFAULT now()
  last_login       TIMESTAMPTZ
  INDEX: (username), (email)
```

**Entity Relationship Summary**:
```
seasons ──< teams ──< team_players >── players
seasons ──< games
seasons ──< player_stats >── players
teams ──< games
```

**Indexing Rationale**:
- `players.slug` — unique index for `/players/:slug` lookups
- `player_stats (season_id, ops DESC)` — powers leaderboard queries without full scan
- `games (team_id, game_date)` — team schedule page queries
- `news (active, publish_date DESC)` — homepage and news page list queries

---

### 2.6 Security Architecture — JWT and RBAC

```
Login Flow:
─────────────────────────────────────────────────────────────────
  Browser          Vue/Pinia           Spring Boot           DB
     │                │                     │                 │
     │──POST /api/auth/login ──────────────▶│                 │
     │                │   {username,password}│                 │
     │                │                     │──SELECT user──▶ │
     │                │                     │◀── User entity ─│
     │                │                     │  bcrypt.verify() │
     │                │                     │  generateJWT()   │
     │◀──── 200 {accessToken, refreshToken} ┤                 │
     │                │                     │                 │
     │  Store in      │                     │                 │
     │  authStore     │                     │                 │
     │  (memory only) │                     │                 │

Token Storage Strategy:
  - accessToken:  Pinia store (memory) — short-lived, 15 minutes
  - refreshToken: httpOnly cookie — longer-lived, 7 days
  ⚠️  NEVER store JWT in localStorage (XSS risk)

Subsequent API Requests:
  Vue Axios interceptor → adds Authorization: Bearer <accessToken>
  If 401 received → call /api/auth/refresh (sends cookie automatically)
  If refresh fails → redirect to login

Role-Based Access Control Matrix:
┌───────────────────────┬─────────────┬──────────────┬───────┬──────────────┬─────────────┐
│ Operation             │ SUPER_ADMIN │ BOARD_MEMBER │ COACH │ STAT_MANAGER │ PUBLIC_USER │
├───────────────────────┼─────────────┼──────────────┼───────┼──────────────┼─────────────┤
│ View public pages     │      ✓      │      ✓       │   ✓   │      ✓       │      ✓      │
│ View admin dashboard  │      ✓      │      ✓       │       │              │             │
│ Create/edit teams     │      ✓      │      ✓       │       │              │             │
│ Create/edit players   │      ✓      │      ✓       │   ✓   │              │             │
│ Create/edit games     │      ✓      │      ✓       │   ✓   │              │             │
│ Import GameChanger    │      ✓      │              │       │      ✓       │             │
│ Correct stat errors   │      ✓      │              │       │      ✓       │             │
│ Manage news           │      ✓      │      ✓       │       │              │             │
│ Manage sponsors       │      ✓      │      ✓       │       │              │             │
│ Manage users          │      ✓      │              │       │              │             │
└───────────────────────┴─────────────┴──────────────┴───────┴──────────────┴─────────────┘
```

**Spring Security Configuration Approach**:
- Use `@PreAuthorize("hasRole('COACH')")` annotations on service methods (method-level security)
- Configure `SecurityFilterChain` to permit `/api/news`, `/api/teams`, `/api/players`, `/api/games`, `/api/stats`, `/api/sponsors` as public GET endpoints
- All `/api/admin/**` and POST/PUT/DELETE endpoints require authentication

---

### 2.7 GameChanger CSV Import Data Flow

```
Admin uploads CSV file
        │
        ▼
┌───────────────────────┐
│  ImportController     │
│  POST /api/admin/     │
│  import/preview       │
│  (MultipartFile)      │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ GameChangerCsvParser  │  → Reads each row
│                       │  → Maps column headers to internal fields
│                       │  → Handles missing/extra columns gracefully
│                       │  → Returns List<RawStatRow>
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ GameChangerPlayer     │  → For each row, attempts to match by:
│    Matcher            │    1. First name + Last name (exact)
│                       │    2. First name + Last name (fuzzy, Levenshtein ≤ 2)
│                       │    3. Jersey number fallback
│                       │  → Classifies each row as:
│                       │    MATCHED, NEW_PLAYER, or AMBIGUOUS
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ ImportResult (DTO)    │
│  - matched: 15        │
│  - newPlayers: 2      │
│  - ambiguous: 1       │
│  - errors: []         │
│  - previewRows: [...]  │
└───────────┬───────────┘
            │
            ▼ (returned to admin UI for review)
┌───────────────────────┐
│  AdminStats.vue       │
│  ImportPreview.vue    │  Admin sees summary + row-by-row preview
│                       │  Can resolve AMBIGUOUS rows manually
│                       │  "Approve Import" → confirms
└───────────┬───────────┘
            │ POST /api/admin/import/confirm
            ▼
┌───────────────────────┐
│ GameChangerImport     │
│    Service            │  → Upserts player_stats rows
│                       │  → Creates player records for NEW_PLAYER rows
│                       │  → Recalculates AVG, OBP, SLG, OPS
│                       │  → Writes import log entry
│                       │  → Returns ImportSummary
└───────────────────────┘
```

**Defensive CSV parsing principles**:
- Never assume column order — always match by header name
- Capture the raw GameChanger column-to-field mapping in a configuration map so it can be updated if GameChanger changes their export format
- Log all unrecognized column headers as warnings (don't fail the import)
- Store the original CSV in R2 object storage for audit purposes

---

### 2.8 split_pot_tracker.html Integration Strategy

**Recommendation: Keep it separate — serve it at `/fundraiser/`**

The existing `split_pot_tracker.html` is a fully functional, self-contained page with its own styling that uses the IBC color palette. Migrating it into the Vue app would add significant complexity for negligible user-facing benefit.

**Proposed approach**:
1. Move `split_pot_tracker.html` to `static/fundraiser/index.html` in the repo
2. Nginx serves it at `https://independencebaseball.com/fundraiser/`
3. Add a "Fundraiser" or "Split the Pot" link in the Vue app's navigation bar pointing to `/fundraiser/`
4. When the Vue app is eventually ready for it, the fundraiser logic can optionally be ported to a proper Vue page backed by a backend API — but this is **not a Sprint 1–5 priority**

**Future migration path** (Sprint 6+):
- Create a `fundraiser_drawings` table in PostgreSQL
- Port tracker UI to Vue with real persistence (currently state is browser-session only)
- Add admin controls for opening/closing a drawing period

---

## 3. Development Phases and Milestones

> **MVP Definition**: The minimum needed to go live publicly is Sprints 1–3.
> After Sprint 3, the club has a live site with team pages, rosters, schedules, and player profiles.
> Sprints 4–5 add statistics import and the full admin portal.

---

### Sprint 1 — Foundation: Hosting, Auth, and Skeleton Apps
**Estimated Duration**: 4 weeks core + 1 week buffer = **5 weeks**  
**Solo developer calendar time (part-time)**: 6–7 weeks

#### Deliverables
- [ ] Hetzner VPS provisioned and secured (SSH keys, UFW firewall, fail2ban)
- [ ] Docker + Docker Compose installed and verified
- [ ] Cloudflare DNS configured for `independencebaseball.com`
- [ ] Nginx container serving a "Coming Soon" or static holding page
- [ ] Spring Boot 3 project created (Maven, Java 21), builds and runs in Docker
- [ ] Vue 3 + TypeScript + Vite + Tailwind project created, builds to `/dist`
- [ ] PostgreSQL container running with persistent volume; connection verified from Spring Boot
- [ ] Flyway configured; first migration (`V1__create_users_table.sql`) runs on startup
- [ ] JWT authentication implemented: `POST /api/auth/login` returns access + refresh tokens
- [ ] Spring Security configured with role enum and method-level `@PreAuthorize`
- [ ] Vue `authStore` (Pinia) with login/logout; `LoginPage.vue` working end-to-end
- [ ] Environment variable management: `.env.dev` and `.env.prod` files; secrets not in git
- [ ] `split_pot_tracker.html` served at `/fundraiser/` via Nginx
- [ ] OpenAPI/Swagger UI accessible at `/api/swagger-ui.html`
- [ ] Spring Boot Actuator health endpoint at `/api/actuator/health`
- [ ] Basic CI: GitHub Actions workflow that builds and tests on push to `main`

#### Success Criteria / Definition of Done
- Admin can log in at `https://independencebaseball.com/admin/login` with credentials
- JWT token issued, stored in Pinia (memory) + httpOnly cookie for refresh token
- `GET /api/actuator/health` returns `{"status":"UP"}`
- `GET /api/swagger-ui.html` loads the API spec
- `/fundraiser/` loads the existing split pot tracker
- All secrets are in `.env` files excluded from git (`.gitignore` verified)

#### Phase Dependencies
- None — this is the foundation sprint

---

### Sprint 2 — Core Data: Teams, Players, and Schedules
**Estimated Duration**: 5 weeks core + 1.5 weeks buffer = **6.5 weeks**  
**Solo developer calendar time (part-time)**: 8–9 weeks

#### Deliverables
- [ ] Flyway migrations for all 10 core tables (seasons through gallery)
- [ ] JPA entities for all tables, with proper relationship annotations
- [ ] Repositories for all entities (Spring Data JPA)
- [ ] Service + Controller layer for:
  - `GET/POST /api/seasons`
  - `GET/POST /api/teams`, `GET/PUT/DELETE /api/teams/{id}`
  - `GET/POST /api/players`, `GET/PUT/DELETE /api/players/{id}`
  - `GET /api/players/{slug}` — slug-based lookup for profile pages
  - `GET/POST /api/games`, `GET /api/games/team/{teamId}`, `PUT /api/games/{id}`
  - `GET/POST /api/sponsors`
  - `GET/POST /api/news`, `PUT /api/news/{id}`
  - `GET /api/gallery`
- [ ] `SlugService` — generates unique slugs on player create (e.g., "luke-smith", "luke-smith-2")
- [ ] `PhotoStorageService` — uploads to Cloudflare R2, returns public URL; wired into player and team create/update
- [ ] DTOs for all request/response objects (no entity leakage through API)
- [ ] Seed data script or Flyway migration for: 1 active season, 4 teams (9U–12U), 5–10 sample players
- [ ] All POST/PUT/DELETE endpoints protected by role (`@PreAuthorize`)
- [ ] All GET endpoints for public data open (no auth required)
- [ ] Unit tests for all service classes (80% coverage target)
- [ ] Integration tests for all controllers using MockMvc

#### Success Criteria / Definition of Done
- `GET /api/teams` returns the 4 IBC teams with correct season association
- `GET /api/players/luke-smith` returns full player profile DTO
- Photo upload to R2 works; URL is persisted in the database
- All protected endpoints return 403 when called without a valid JWT
- Flyway migration history shows clean sequential versioning
- No entity objects returned directly from any controller (only DTOs)

#### Phase Dependencies
- Sprint 1 must be complete (auth, DB connection, Flyway setup)

---

### Sprint 3 — Public Frontend: The Club's Public Face
**Estimated Duration**: 5 weeks core + 1.5 weeks buffer = **6.5 weeks**  
**Solo developer calendar time (part-time)**: 8–9 weeks

#### Deliverables
- [ ] `PublicLayout.vue` — NavBar (IBC branding, navy/red/cream), footer
- [ ] `HomePage.vue` — hero banner, upcoming games widget, latest news cards, sponsor logos, tryout announcement section
- [ ] `TeamsPage.vue` — grid of team cards (9U/10U/11U/12U), each linking to team detail
- [ ] `TeamDetailPage.vue` (`/teams/:id`) — season record, roster table, upcoming schedule, coaches section, gallery preview
- [ ] `PlayerProfilePage.vue` (`/players/:slug`) — photo, name, jersey #, vitals (age, height, weight, bats/throws), batting stats table, pitching stats table, season history
- [ ] `SchedulePage.vue` — full schedule table, filter by team and season, shows H/A, score for completed games
- [ ] `StatsPage.vue` — leaderboard tables: BA leaders, OPS leaders, HR leaders, ERA leaders, K leaders; filter by team/season
- [ ] `SponsorsPage.vue` — Gold/Silver/Bronze tiers, logos, links
- [ ] `NewsPage.vue` — article list, category filter
- [ ] Vue Router configured with all public routes + lazy loading
- [ ] Axios services wired to all public API endpoints
- [ ] Pinia stores for teams, players, games, stats
- [ ] Mobile-responsive layouts (Tailwind breakpoints: sm/md/lg)
- [ ] Loading states and error handling in all pages
- [ ] 404 page
- [ ] "Fundraiser" link in navigation pointing to `/fundraiser/`
- [ ] Lighthouse score ≥ 85 for performance, accessibility, SEO

#### Success Criteria / Definition of Done
- All 8 public pages render with real data from the API
- Player profile accessible at `/players/luke-smith` (slug routing works)
- Schedule page filters by team and returns correct games
- Leaderboard tables sort correctly and link to player profiles
- Pages are visually consistent with IBC brand colors (navy, red, cream)
- No console errors; all API calls handle loading and error states gracefully
- Site is live at `https://independencebaseball.com` with real club data

> **This is the MVP launch point.** After Sprint 3, the site is publicly usable.

#### Phase Dependencies
- Sprint 2 must be complete (all API endpoints available)
- Photo storage must be working (player photos display from R2 URLs)

---

### Sprint 4 — Statistics System and GameChanger Import
**Estimated Duration**: 5 weeks core + 1.5 weeks buffer = **6.5 weeks**  
**Solo developer calendar time (part-time)**: 8–9 weeks

#### Deliverables
- [ ] `GameChangerCsvParser.java` — header-name-based column parsing, tolerant of missing/extra columns
- [ ] `GameChangerPlayerMatcher.java` — exact name match → fuzzy match → jersey number fallback
- [ ] `GameChangerImportService.java` — orchestration: parse → match → preview → confirm → upsert stats
- [ ] `POST /api/admin/import/preview` — accepts multipart CSV, returns `ImportResultResponse`
- [ ] `POST /api/admin/import/confirm` — accepts confirmed preview, writes to database
- [ ] `ImportResultResponse` DTO — matched count, new players found, ambiguous rows, error list
- [ ] Recalculation of AVG, OBP, SLG, OPS after stat import (stored computed columns)
- [ ] Import log table (`import_logs`) — timestamp, filename, user, summary JSON, stored in DB
- [ ] Original CSV archived to R2 for audit trail
- [ ] `AdminStats.vue` — file upload UI, import preview table, approve/reject controls
- [ ] `ImportPreview.vue` component — row-by-row preview, inline resolution of AMBIGUOUS matches
- [ ] `GET /api/stats/leaders` endpoint — returns top-N per stat category, filterable by season/team
- [ ] `GET /api/stats/player/{id}` — returns all seasons for a player
- [ ] `GET /api/stats/team/{teamId}` — returns all player stats for a team in a season
- [ ] Fixture CSV files for testing (2 known files: one clean, one with edge cases)
- [ ] Unit tests for `GameChangerCsvParser` (10+ test cases covering edge cases)
- [ ] Unit tests for `GameChangerPlayerMatcher` (fuzzy match, jersey fallback, duplicates)
- [ ] Integration test: upload fixture CSV → verify DB state

#### Success Criteria / Definition of Done
- Upload a real GameChanger CSV export → preview shows correct match results
- Approve import → `player_stats` table updated; computed stats recalculated correctly
- Ambiguous player match can be manually resolved in the UI before confirming
- New player found during import is flagged for review (not auto-created without confirmation)
- Import log entry created with full summary; original CSV stored in R2
- Leaderboard on `StatsPage.vue` updates after import

#### Phase Dependencies
- Sprint 2 (player and stats entities must exist)
- Sprint 3 (admin UI shell must be available for the import interface)

---

### Sprint 5 — Admin Portal and Content Management
**Estimated Duration**: 5 weeks core + 1.5 weeks buffer = **6.5 weeks**  
**Solo developer calendar time (part-time)**: 8–9 weeks

#### Deliverables
- [ ] `AdminLayout.vue` — sidebar with navigation for all admin sections, role-aware menu items
- [ ] `AdminDashboard.vue` — summary cards: total players, teams, upcoming games, recent imports, last news post
- [ ] `AdminTeams.vue` — create/edit team form, assign coaches, upload team photo, list teams with season filter
- [ ] `AdminPlayers.vue` — create player form (all fields), photo upload, team assignment, edit/deactivate
- [ ] `AdminSchedule.vue` — create/edit game form, update scores for completed games, add locations
- [ ] `AdminNews.vue` — rich text editor (Vue Quill or Tiptap), publish/unpublish, featured image upload, category tagging
- [ ] Admin route guard in Vue Router — redirect to `/admin/login` if not authenticated or insufficient role
- [ ] Role-specific UI — COACH sees player/game management but not news/sponsors; STAT_MANAGER sees only import
- [ ] `POST /api/admin/gallery/upload` — bulk photo upload for season galleries
- [ ] `AdminGallery.vue` — drag-and-drop photo upload, tag with season/team, delete
- [ ] User management (SUPER_ADMIN only): create/edit admin user accounts, assign roles
- [ ] `POST /api/admin/users`, `PUT /api/admin/users/{id}` endpoints
- [ ] Form validation in all admin forms (Vuelidate or custom composables)
- [ ] Toast notifications for success/error feedback on admin actions
- [ ] Cypress E2E tests for critical admin flows:
  - Admin login → team create → verify on public teams page
  - Admin login → game create → verify on public schedule page
  - Admin login → upload GameChanger CSV → approve → verify stats updated

#### Success Criteria / Definition of Done
- A coach can log in and update a game score without being able to access news management
- SUPER_ADMIN can create a new admin user, assign them the STAT_MANAGER role
- New article created in admin is immediately visible on the public news page
- All admin forms validate inputs and show clear error messages
- Admin portal is not accessible to unauthenticated users (router guard confirmed by E2E test)

#### Phase Dependencies
- Sprint 1 (auth roles, JWT)
- Sprint 2 (all API endpoints)
- Sprint 4 (GameChanger import UI)

---

## 4. Resource Allocation and Estimates

### Time Estimates by Phase

| Sprint | Core Weeks | +25% Buffer | Solo Part-Time Calendar | 2–3 Dev Team |
|--------|-----------|-------------|------------------------|--------------|
| Sprint 1: Foundation | 4 | 5 | 6–7 weeks | 2–3 weeks |
| Sprint 2: Core Data + API | 5 | 6.5 | 8–9 weeks | 3–4 weeks |
| Sprint 3: Public Frontend | 5 | 6.5 | 8–9 weeks | 3–4 weeks |
| Sprint 4: Stats + Import | 5 | 6.5 | 8–9 weeks | 3–4 weeks |
| Sprint 5: Admin Portal | 5 | 6.5 | 8–9 weeks | 3–4 weeks |
| **Total** | **24** | **31** | **38–43 weeks** | **14–19 weeks** |
| **Calendar estimate** | | | **~9–11 months** | **~3.5–5 months** |

> **Reality check for solo part-time**: At 10–15 hours per week (evenings/weekends), 38–43 weeks is approximately **8–10 months of actual calendar time** accounting for life interruptions, vacation, and baseball season itself competing for time. Budget for up to **11 months** as the realistic outer bound.

### Critical Path

```
Sprint 1 (Auth + Infra)
    │
    ▼
Sprint 2 (API + Database)    ← longest dependency chain
    │
    ├──────────────────────────────────────────────────┐
    ▼                                                  ▼
Sprint 3 (Public Frontend)              Sprint 4 (Stats + Import)
    │                                                  │
    └──────────────────────┬────────────────────────────┘
                           ▼
                  Sprint 5 (Admin Portal)
```

**Critical path**: Sprint 1 → Sprint 2 → Sprint 3 (MVP launch) → Sprint 5

Sprint 4 can overlap with the tail end of Sprint 3 if bandwidth allows.

### Skill Requirements

| Skill Area | Sprint(s) | Complexity |
|------------|-----------|------------|
| Linux/VPS administration | 1 | Medium — one-time setup |
| Docker + Docker Compose | 1, all | Low after setup |
| Spring Boot 3 / Java 21 | 1–5 | High |
| Spring Security / JWT | 1 | High — security-sensitive |
| PostgreSQL / Flyway | 1–5 | Medium |
| Vue 3 + TypeScript | 2–5 | High |
| Tailwind CSS | 3–5 | Low-Medium |
| Cloudflare R2 / S3 API | 2+ | Low |
| CSV parsing / data matching | 4 | Medium |
| Cypress E2E testing | 5 | Medium |

All of these are learnable by a full-stack developer. The steepest learning curves are Spring Security (JWT configuration has many gotchas) and the GameChanger CSV matching logic (requires careful fuzzy-matching strategy).

---

## 5. Risk Assessment and Mitigation

### High Impact Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|------------|--------|------------|
| H1 | **Solo developer bandwidth** — life events, burnout, baseball season consuming the dev's own time | High | High | Strict MVP scoping; Sprint 3 is the launch gate, not Sprint 5. Communicate to club that full admin portal is post-launch. |
| H2 | **GameChanger CSV format changes** — GC updates their export format, breaking import silently | Medium | High | Build CSV parser using header-name mapping, not column index. Store raw CSVs. Add column-coverage logging. Abstract the field mapping into a config map so it can be updated without code changes. |
| H3 | **JWT security misconfiguration** — improper token validation, secret exposure, or missing CSRF protections | Low | High | Use Spring Security's built-in JWT support (spring-security-oauth2-resource-server). Never store tokens in localStorage. Use httpOnly cookie for refresh token. Code review every security config change. |
| H4 | **PostgreSQL schema evolution** — adding columns or renaming tables causes downtime or data loss | Medium | High | Use Flyway from day one. Never modify existing migration files. Test each migration against a staging DB before applying to production. Maintain a `db/migration/` directory in git. |

### Medium Impact Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|------------|--------|------------|
| M1 | **Photo/media storage at scale** — storing photos locally on the VPS runs out of disk, or photos are lost if the VPS is rebuilt | High (if ignored) | Medium | Use Cloudflare R2 from Sprint 2 (not local disk). R2 free tier is 10GB storage / 1M Class A ops per month — more than sufficient for years of club photos. |
| M2 | **Cloudflare/VPS infrastructure failure** — VPS provider outage or accidental data deletion | Low | Medium | Enable Hetzner automated backups (cheap add-on). Export PostgreSQL dump weekly via cron job to R2. Document rebuild steps. |
| M3 | **Slug collisions** — two players with identical names (e.g., two "Alex Johnson"s) cause routing conflicts | Medium | Medium | `SlugService` must enforce uniqueness: first "alex-johnson" is fine; the second becomes "alex-johnson-2". Slug is immutable after creation. |
| M4 | **Player name fuzzy matching errors in CSV import** — wrong player gets stats credited | Medium | Medium | Never auto-confirm ambiguous matches. Always require admin review for AMBIGUOUS status. Provide explicit diff before commit. Include rollback: store pre-import stats snapshot for easy reversal. |
| M5 | **Future expansion breaking current schema** — adding tournament support later requires significant joins or schema rework | Low | Medium | Design current schema with expansion in mind: avoid assumptions that a `game` belongs to exactly one season (already done via `season_id`). Leave room for `tournament_id` as nullable FK. |

### Low Impact Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|------------|--------|------------|
| L1 | **Vue 3 ecosystem churn** — minor library version incompatibilities | Low | Low | Pin dependency versions in `package.json`. Run `npm audit` on every dependency update. |
| L2 | **Cloudflare R2 API changes** — S3-compatible API should be stable, but Cloudflare policies evolve | Very Low | Low | Use the standard AWS S3 SDK (not Cloudflare-specific client). Can swap to any S3-compatible store. |
| L3 | **Tailwind CSS major version** — Tailwind v4 changed config format significantly | Low | Low | Use Tailwind v3 (stable) for this project. Upgrade after full launch. |

---

## 6. Dependencies and Blockers

### External Dependencies

| Dependency | Sprint | Blocker? | Action Required |
|------------|--------|----------|-----------------|
| Domain name (`independencebaseball.com` or similar) | 1 | Yes | Purchase via Cloudflare Registrar or Namecheap. ~$12/year |
| Hetzner VPS (CX22 — 2 vCPU, 4GB RAM, 40GB SSD) | 1 | Yes | Provision at hetzner.com. ~$5–6/month |
| Cloudflare account (free tier) | 1 | Yes | Configure DNS nameservers; enable proxy |
| Cloudflare R2 bucket | 2 | Yes (for photos) | Create bucket; generate Access Key ID + Secret |
| GameChanger CSV export sample | 4 | Yes | Obtain a real export from a coach. Needed to verify column names. |
| Player photo assets | 3 | No (can use placeholders) | Club to gather headshots. Photos can be added incrementally. |

### Internal Dependencies

| Task | Depends On |
|------|-----------|
| Any API endpoint | PostgreSQL + Flyway (Sprint 1) |
| Any admin portal | JWT auth (Sprint 1) |
| Photo upload anywhere | Cloudflare R2 configured (Sprint 2) |
| Player profile page | `slug` generation logic (Sprint 2) |
| GameChanger import UI | Import API endpoints (Sprint 4) |
| Stats leaderboard page | At least one CSV import completed (Sprint 4) |
| Role-aware admin menu | Role enum + RBAC configured (Sprint 1) |
| Full admin portal | All API endpoints (Sprint 2) |

### Dependency Graph

```
 EXTERNAL                    INTERNAL (Sprint order)
 ────────                    ───────────────────────

 Domain ──────┐
 VPS ─────────┼──▶ Sprint 1: Auth + Infra + Skeleton
 Cloudflare ──┘         │
                        │
                        ▼
              Sprint 2: DB Schema + All API Endpoints
                        │
              ┌─────────┴──────────┐
              ▼                    ▼
  Sprint 3: Public UI    Sprint 4: Stats + CSV Import
  (MVP Launch ✓)                   │
              │                    │
              └─────────┬──────────┘
                        ▼
              Sprint 5: Full Admin Portal
              (Post-launch enhancement)
```

---

## 7. Testing Strategy

### Backend — Spring Boot (Java)

**Unit Tests** — JUnit 5 + Mockito
- Location: `src/test/java/com/ibc/platform/services/`
- Scope: all service classes; mock repository layer
- Target coverage: **80% line coverage on service layer**
- Key test classes:
  - `GameChangerCsvParserTest` — 10+ test cases (clean CSV, missing columns, extra columns, empty rows, name with special chars)
  - `GameChangerPlayerMatcherTest` — exact match, fuzzy match (one typo), jersey fallback, no match, duplicate name
  - `SlugServiceTest` — unique slug generation, collision handling
  - `StatsServiceTest` — AVG/OBP/SLG/OPS calculation correctness

**Integration Tests** — Spring Boot Test + TestContainers (PostgreSQL)
- Location: `src/test/java/com/ibc/platform/controllers/`
- Scope: `@SpringBootTest` + `MockMvc` for controller layer; `@DataJpaTest` for repositories
- TestContainers spins up a real PostgreSQL instance for repository tests
- Key test scenarios:
  - Full login flow: POST `/api/auth/login` → JWT returned → protected endpoint accessed
  - Role enforcement: COACH cannot call `POST /api/news` (expect 403)
  - Game CRUD: create game → verify in DB → update score → verify schedule response
  - Player slug uniqueness: create two players with same name → verify second slug has `-2` suffix

**GameChanger Import Integration Tests**
- Load fixture CSV from `src/test/resources/fixtures/gamechanger/`
- Provide test fixture files:
  - `gc_clean_import.csv` — 15 players, all match existing players
  - `gc_new_player.csv` — 2 new players mixed in
  - `gc_ambiguous.csv` — one player with slightly misspelled name
  - `gc_missing_columns.csv` — missing optional columns (should not fail)
- Assert: matched count, new player detection, ambiguous flagging, DB state after confirm

### Frontend — Vue 3 (TypeScript)

**Unit Tests** — Vitest + Vue Test Utils
- Location: `frontend/src/__tests__/`
- Scope: Pinia stores, service functions, utility composables
- Target coverage: **70% line coverage on stores and services**
- Key test files:
  - `authStore.test.ts` — login, logout, token refresh, role-based getters
  - `statsService.test.ts` — leaderboard data fetching and transformation
  - `SlugUtils.test.ts` — slug generation edge cases

**Component Tests** — Vitest + Vue Test Utils
- `LeaderboardTable.test.ts` — renders correct columns, sorts correctly
- `ImportPreview.test.ts` — displays matched/new/ambiguous rows; approve button enables only when no ambiguous rows remain
- `AdminRouteGuard.test.ts` — unauthenticated user redirected to login

**E2E Tests** — Cypress
- Location: `frontend/cypress/e2e/`
- Run against staging environment (Docker Compose with test seed data)
- Critical flows to automate:
  1. **Public visitor views player profile**: Navigate to `/players/luke-smith` → verify photo, stats, season history
  2. **Admin creates a team**: Login → `/admin/teams` → Create Team form → Submit → Verify on `/teams` public page
  3. **Admin updates a game score**: Login → `/admin/schedule` → Find game → Enter score → Verify on public schedule
  4. **Admin uploads GameChanger CSV**: Login → `/admin/stats` → Upload fixture CSV → Review preview → Approve → Verify stats on leaderboard
  5. **Role enforcement**: Login as COACH → Attempt to navigate to `/admin/news` → Verify redirect or 403

### Testing Timeline

| Sprint | Testing Work |
|--------|-------------|
| Sprint 1 | Set up JUnit + TestContainers; write auth service unit tests |
| Sprint 2 | Unit tests for all services; controller integration tests; set up Vitest |
| Sprint 3 | Component tests for public pages; set up Cypress with seed data |
| Sprint 4 | Full GameChanger import test suite (unit + integration + fixture CSVs) |
| Sprint 5 | Cypress E2E for all critical admin flows; final coverage audit |

### Coverage Targets Summary

| Layer | Tool | Target |
|-------|------|--------|
| Backend service layer | JUnit 5 / JaCoCo | 80% |
| Backend controller layer | MockMvc integration | All endpoints covered |
| Frontend stores | Vitest | 70% |
| Frontend services | Vitest | 70% |
| Critical user flows | Cypress E2E | 5 flows automated |

---

## 8. Infrastructure Setup Checklist

### Step 1: VPS Provisioning (Hetzner CX22)

```bash
# 1. Create server at hetzner.com
#    Type: CX22 (2 vCPU, 4GB RAM, 40GB SSD) — ~$5.50/month
#    Image: Ubuntu 24.04 LTS
#    Location: Ashburn, VA (or closest to your users)
#    Add your SSH public key during creation

# 2. Initial server hardening (run as root)
apt update && apt upgrade -y
useradd -m -s /bin/bash ibc
usermod -aG sudo ibc
# Copy SSH key to new user
mkdir -p /home/ibc/.ssh
cp /root/.ssh/authorized_keys /home/ibc/.ssh/
chown -R ibc:ibc /home/ibc/.ssh
chmod 700 /home/ibc/.ssh
chmod 600 /home/ibc/.ssh/authorized_keys

# 3. Configure UFW firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# 4. Install fail2ban
apt install fail2ban -y
systemctl enable fail2ban --now

# 5. Disable root SSH login
sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
systemctl restart ssh
```

### Step 2: Docker + Docker Compose

```bash
# Install Docker (official script)
curl -fsSL https://get.docker.com | sh
usermod -aG docker ibc

# Install Docker Compose plugin
apt install docker-compose-plugin -y

# Verify
docker --version           # Docker version 26+
docker compose version     # Docker Compose version v2+
```

### Step 3: Cloudflare DNS Configuration

1. Add domain to Cloudflare (free plan)
2. Update nameservers at your registrar to Cloudflare's NS records
3. Add DNS records:
   ```
   Type  Name    Content          Proxy
   A     @       <Hetzner IP>     Proxied (orange cloud)
   A     www     <Hetzner IP>     Proxied
   CNAME api     @                DNS Only (or same A record)
   ```
4. SSL/TLS mode: **Full (strict)** — requires origin certificate

### Step 4: SSL/TLS Setup

```bash
# Option A: Cloudflare Origin Certificate (recommended — free, 15-year cert)
# 1. In Cloudflare dashboard: SSL/TLS → Origin Server → Create Certificate
# 2. Save cloudflare-origin.crt and cloudflare-origin.key to VPS:
mkdir -p /etc/nginx/ssl
# Upload files via scp
chmod 600 /etc/nginx/ssl/cloudflare-origin.key

# Option B: Let's Encrypt (if not using Cloudflare proxy)
apt install certbot python3-certbot-nginx -y
certbot --nginx -d independencebaseball.com -d www.independencebaseball.com
```

### Step 5: Nginx Reverse Proxy Configuration

```nginx
# /etc/nginx/sites-available/ibc (or in nginx container volume)

server {
    listen 80;
    server_name independencebaseball.com www.independencebaseball.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name independencebaseball.com www.independencebaseball.com;

    ssl_certificate     /etc/nginx/ssl/cloudflare-origin.crt;
    ssl_certificate_key /etc/nginx/ssl/cloudflare-origin.key;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Vue SPA — all routes fall back to index.html
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, must-revalidate";
    }

    # Static assets — aggressive caching (Vite adds content hash to filenames)
    location ~* \.(js|css|png|jpg|svg|ico|woff2)$ {
        root /usr/share/nginx/html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # REST API — proxy to Spring Boot
    location /api/ {
        proxy_pass http://api:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
        client_max_body_size 50M;  # For CSV and photo uploads
    }

    # Fundraiser tracker — standalone static file
    location /fundraiser/ {
        alias /usr/share/nginx/fundraiser/;
        try_files $uri $uri/ =404;
    }
}
```

### Step 6: Environment Variable Management

```bash
# Project directory structure on VPS
/opt/ibc/
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.prod              # ← NOT in git; manual creation on VPS
├── nginx/
│   └── nginx.conf
└── static/
    └── fundraiser/
        └── index.html     # split_pot_tracker.html (renamed)
```

```bash
# /opt/ibc/.env.prod
# NEVER commit this file — add .env.prod to .gitignore

DB_PASSWORD=<strong-random-password>
JWT_SECRET=<256-bit-random-hex>
JWT_EXPIRATION_MS=900000          # 15 minutes
JWT_REFRESH_EXPIRATION_MS=604800000 # 7 days

R2_ACCOUNT_ID=<cloudflare-account-id>
R2_ACCESS_KEY=<r2-access-key-id>
R2_SECRET_KEY=<r2-secret-access-key>
R2_BUCKET_NAME=ibc-media
R2_PUBLIC_BASE_URL=https://media.independencebaseball.com

SPRING_PROFILES_ACTIVE=prod
```

```bash
# Generate a strong JWT secret
openssl rand -hex 32
```

### Step 7: PostgreSQL Initialization

```sql
-- db/init/01_init.sql (runs once on first container start)
-- Database and user are created via POSTGRES_DB/POSTGRES_USER env vars
-- This file handles post-creation setup

-- Enable UUID extension (future use)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE ibc TO ibc_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ibc_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ibc_user;
```

> **Flyway handles all table creation** via `db/migration/V1__*.sql` files — do NOT create tables in `init/`. The init script is for extensions and grants only.

### Step 8: Automated Backups

```bash
# Cron job on VPS — daily PostgreSQL backup to R2
# Add to /etc/cron.d/ibc-backup

0 3 * * * ibc docker exec ibc_db_1 pg_dump -U ibc_user ibc | \
  gzip > /tmp/ibc-$(date +%Y%m%d).sql.gz && \
  aws s3 cp /tmp/ibc-$(date +%Y%m%d).sql.gz \
    s3://ibc-backups/db/ \
    --endpoint-url https://<account-id>.r2.cloudflarestorage.com && \
  rm /tmp/ibc-$(date +%Y%m%d).sql.gz
```

---

## 9. Key Technical Decisions and Recommendations

### Decision 1: Photo Storage — Cloudflare R2 (Not Local Volume)

**Decision**: Store all photos (player headshots, team photos, gallery, news images) in **Cloudflare R2**.

**Rationale**:
- R2 free tier: 10 GB storage, 1M Class A operations/month, 10M Class B operations/month — sufficient for years of club photos at no cost
- Local VPS storage (40 GB) is finite; rebuilding the VPS would lose local files
- R2 is S3-compatible, so the standard AWS S3 Java SDK works without any Cloudflare-specific library
- Photos served via Cloudflare CDN edge nodes — faster page load worldwide
- Can set up a custom subdomain: `media.independencebaseball.com → R2 bucket`

**Implementation**: Use `software.amazon.awssdk:s3` (AWS SDK v2) with a custom endpoint pointing at R2:
```java
S3Client s3 = S3Client.builder()
    .endpointOverride(URI.create("https://<account-id>.r2.cloudflarestorage.com"))
    .credentialsProvider(StaticCredentialsProvider.create(
        AwsBasicCredentials.create(accessKey, secretKey)))
    .region(Region.of("auto"))
    .build();
```

---

### Decision 2: split_pot_tracker.html — Keep Separate

**Decision**: Serve `split_pot_tracker.html` as a standalone file at `/fundraiser/` via Nginx. Do **not** migrate it into the Vue app for Sprints 1–5.

**Rationale**:
- It already works. Migrating it introduces risk with zero user-facing benefit in the near term.
- The file is self-contained; it requires no backend, no build pipeline, no framework.
- A link in the Vue NavBar (`/fundraiser/`) makes it discoverable from the main site.

**Future migration** (post Sprint 5, when bandwidth allows): Port the tracker to a proper Vue page backed by a `fundraiser_drawings` PostgreSQL table. This unlocks persistence across sessions and admin controls for opening/closing drawings.

---

### Decision 3: Use Flyway for All Database Migrations

**Decision**: All schema changes happen via **Flyway migration scripts**. Raw DDL in `application.yml` (`spring.jpa.hibernate.ddl-auto=validate` in production) is strictly forbidden.

**Implementation pattern**:
```
db/migration/
  V1__create_users_table.sql
  V2__create_seasons_and_teams.sql
  V3__create_players_and_team_players.sql
  V4__create_games.sql
  V5__create_player_stats.sql
  V6__create_sponsors_and_news.sql
  V7__create_gallery.sql
  V8__add_player_slug_column.sql    ← Example of additive migration
```

**Rules**:
- Never modify an existing migration file after it has been run
- Always test migrations against a staging DB before production
- Use `ddl-auto=validate` in production so Hibernate verifies schema matches entities without modifying it
- Use `ddl-auto=none` in production; let Flyway own all DDL

---

### Decision 4: OpenAPI/Swagger from Day One

**Decision**: Configure `springdoc-openapi-starter-webmvc-ui` from Sprint 1.

**Rationale**: An auto-generated Swagger UI at `/api/swagger-ui.html` is an enormous development accelerator — it lets you test API endpoints without writing a frontend first, and it serves as living documentation.

```xml
<!-- pom.xml -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.x.x</version>
</dependency>
```

```java
// SwaggerConfig.java
@Bean
public OpenAPI ibcOpenAPI() {
    return new OpenAPI()
        .info(new Info().title("IBC Platform API").version("1.0"))
        .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
        .components(new Components().addSecuritySchemes("Bearer Authentication",
            new SecurityScheme().type(HTTP).scheme("bearer").bearerFormat("JWT")));
}
```

---

### Decision 5: Player Profile Slugs

**Decision**: Slugs are generated once at player creation and are **immutable**.

**Generation algorithm** (`SlugService.java`):
```
"Luke Smith"   → "luke-smith"
"Luke Smith"   → "luke-smith-2"   (second player with same name)
"O'Brien, Pat" → "obrien-pat"     (strip special chars)
```

**Why immutable**: Player profile URLs (`/players/luke-smith`) may be shared on social media or bookmarked. Changing a slug breaks those links. If a player's name is corrected, the slug stays the same. The slug is separate from the display name.

**Implementation note**: Store slug in `players.slug` with a `UNIQUE` constraint. The `SlugService` checks for collision and appends `-2`, `-3`, etc. as needed.

---

### Decision 6: Spring Boot Actuator for Health Checks

**Decision**: Enable Spring Boot Actuator with a health endpoint from Sprint 1.

```yaml
# application.yml
management:
  endpoints:
    web:
      base-path: /api/actuator
      exposure:
        include: health, info
  endpoint:
    health:
      show-details: when-authorized
```

**Use cases**:
- Docker health check: `healthcheck: test: ["CMD", "curl", "-f", "http://localhost:8080/api/actuator/health"]`
- Nginx upstream health: can be used to temporarily remove the backend from rotation
- Monitoring: simple uptime check from a free service like UptimeRobot pointing at the health endpoint

---

### Decision 7: Future Expansion Schema Compatibility

The following tables are **not being built now**, but the current schema accommodates them without breaking changes:

| Future Feature | Accommodation in Current Schema |
|----------------|--------------------------------|
| Tournament management | `games.game_type` already includes `'Tournament'`; add `tournaments` table with FK later |
| Facility management | `games.location` is a free-text field now; migrate to `field_id FK` later with an additive Flyway migration |
| Online registration | `players` table already has all necessary demographic fields; `registrations` table can FK to `players.id` |
| Multiple seasons per player | `team_players` + `player_stats` already have `season_id` — historical data is already supported |

---

### Decision 8: Recommended Hetzner Plan vs. Alternatives

| Provider | Plan | Monthly Cost | Notes |
|----------|------|-------------|-------|
| **Hetzner** (recommended) | CX22 | ~$5.50 | Best price/performance; EU and US datacenters |
| DigitalOcean | Basic Droplet 2GB | ~$12 | More expensive; good docs for beginners |
| Vultr | Cloud Compute 2GB | ~$10 | Solid alternative; good US locations |
| Linode/Akamai | Nanode 2GB | ~$12 | Solid but pricier than Hetzner |

**Recommendation**: Start with **Hetzner CX22**. If the site grows significantly (10+ teams, active during tournament season), upgrade to CX32 (4 vCPU, 8GB RAM) — still only ~$12/month. PostgreSQL and Spring Boot are well within the CX22's capacity for IBC's expected load.

---

*End of Implementation Plan — IBC Platform 2026*  
*Next step: Review this plan, then use `ra-tasks-from-plan` to generate GitHub Issues for Sprint 1.*
