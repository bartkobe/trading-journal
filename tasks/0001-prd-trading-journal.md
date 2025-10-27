# Product Requirements Document: Trading Journal Web App

## 1. Introduction/Overview

The Trading Journal Web App is a comprehensive single-user application designed for day and swing traders to systematically record, analyze, and learn from their trades. The application solves three critical problems:

1. **Performance Tracking**: Provides accurate P&L tracking and performance metrics across all trades
2. **Pattern Recognition**: Enables traders to identify recurring patterns in their trading behavior, both positive and negative
3. **Continuous Learning**: Facilitates learning from past mistakes through detailed journaling and retrospective analysis

This tool transforms trading from a reactive activity into a data-driven, continuously improving process by capturing not just trade numbers, but the context, strategy, and emotional state behind each decision.

## 2. Goals

1. **Comprehensive Trade Recording**: Enable capture of all relevant trade data including prices, strategies, emotional states, and visual evidence (screenshots)
2. **Insightful Analytics**: Provide advanced performance metrics (win rate, expectancy, Sharpe ratio, drawdown analysis) to help traders understand their edge
3. **Effortless Organization**: Allow traders to categorize, tag, search, and filter trades to quickly find relevant historical patterns
4. **Behavioral Insights**: Track and correlate emotional states, market conditions, and time-of-day patterns with trading outcomes
5. **Simple User Experience**: Deliver a clean, minimal interface that doesn't overwhelm but provides depth when needed
6. **Reliable Access**: Cloud-based storage ensuring trade data is accessible and backed up

## 3. User Stories

### Core Trading Workflows

**US-1**: As a day trader, I want to quickly log a trade immediately after I close it, so that I capture my thoughts and emotions while they're fresh.

**US-2**: As a swing trader, I want to attach screenshots of my chart analysis to each trade, so that I can review what I saw at the time of entry/exit.

**US-3**: As a trader analyzing my performance, I want to write detailed notes about why I took a trade, what I was thinking, and what I learned, so that I can identify patterns in my decision-making over time.

**US-4**: As a multi-asset trader, I want to tag my trades by strategy type (e.g., "breakout", "mean reversion", "trend following"), so that I can analyze which strategies work best for me.

**US-5**: As a trader reviewing my history, I want to search and filter my trades by symbol, date range, strategy, or outcome, so that I can quickly find relevant examples.

### Analytics & Learning

**US-6**: As a trader evaluating my performance, I want to see advanced metrics like Sharpe ratio, expectancy, and maximum drawdown, so that I can understand my risk-adjusted returns.

**US-7**: As a trader looking for patterns, I want to visualize my P&L over time with charts and graphs, so that I can identify trends and problem areas.

**US-8**: As a trader managing risk, I want to track my emotional state and market conditions for each trade, so that I can identify when I'm most likely to make mistakes.

**US-9**: As a trader trading multiple instruments, I want to see performance broken down by asset type (stocks, forex, crypto, options), so that I can focus on my strongest markets.

## 4. Functional Requirements

### Trade Entry & Management

**FR-1**: The system must allow users to manually create a new trade entry with the following fields:

- Symbol/Ticker (required)
- Asset type (Stock, Forex, Crypto, Options/Derivatives)
- Currency (dropdown: USD, EUR, GBP, JPY, CAD, AUD, CHF, etc.)
- Entry date and time
- Entry price (required)
- Exit date and time
- Exit price (required)
- Quantity/Position size (required)
- Direction (Long/Short)

Note: Each trade supports one entry and one exit only (no scaling in/out of positions).

**FR-2**: The system must capture detailed trade metadata including:

- Setup type (e.g., breakout, pullback, reversal)
- Strategy name (e.g., "Momentum Play", "Support Bounce")
- Stop loss level
- Take profit target
- Risk/reward ratio
- Actual risk/reward outcome

**FR-3**: The system must allow users to record contextual information:

- Time of day (pre-market, market open, mid-day, close)
- Market conditions (trending, ranging, volatile, calm)
- Emotional state at entry (confident, fearful, FOMO, disciplined, etc.)
- Emotional state at exit

**FR-4**: The system must automatically calculate and display:

- P&L (Profit/Loss) in the trade's currency
- P&L percentage
- Net P&L after fees (fees/commissions entered manually by user)

Note: Commissions/fees are entered as a total amount by the user; the system does not calculate them automatically.

**FR-5**: The system must allow users to attach multiple screenshots or chart images to each trade.

**FR-6**: The system must provide a rich text editor for trade notes where users can:

- Write detailed journal entries
- Document pre-trade analysis
- Record post-trade reflections
- Note lessons learned

**FR-7**: The system must allow users to edit and update trade entries after creation.

**FR-8**: The system must allow users to delete trades with a confirmation prompt.

### Organization & Search

**FR-9**: The system must allow users to create and assign custom tags to trades (e.g., "earnings-play", "gap-fill", "revenge-trade").

**FR-10**: The system must provide a search function that searches across:

- Symbol names
- Trade notes/journal content
- Strategy names
- Tags

**FR-11**: The system must provide filtering capabilities by:

- Date range (from/to dates)
- Asset type
- Outcome (winning/losing/breakeven)
- Strategy
- Tags
- Symbol
- Setup type

**FR-12**: The system must allow users to sort trades by:

- Date (newest/oldest)
- P&L (highest/lowest)
- P&L percentage
- Symbol (alphabetical)

### Analytics & Reporting

**FR-13**: The system must display a dashboard with key performance metrics:

- Total P&L (all-time and for selected period)
- Number of trades
- Win rate (percentage of winning trades)
- Loss rate (percentage of losing trades)
- Average win
- Average loss
- Profit factor (gross profit / gross loss)
- Expectancy (average expected profit per trade)

**FR-14**: The system must calculate and display advanced risk metrics:

- Sharpe ratio
- Maximum drawdown (largest peak-to-trough decline)
- Average drawdown
- Risk-adjusted return

**FR-15**: The system must provide visual analytics including:

- Cumulative P&L chart over time (equity curve)
- Win/loss distribution chart
- P&L by asset type
- P&L by strategy
- P&L by time of day
- P&L by day of week

**FR-16**: The system must allow users to filter analytics by date range to view performance for specific periods (e.g., last 30 days, last quarter, year-to-date).

**FR-17**: The system must show performance breakdown by:

- Individual symbols (which stocks/instruments are most profitable)
- Strategy type
- Setup type
- Emotional state (to identify emotional patterns affecting performance)

### Data Storage & Access

**FR-18**: The system must store all trade data in a cloud database with automatic backups.

**FR-19**: The system must upload and store trade screenshots/images in cloud storage.

**FR-20**: The system must work as a single-user application (no multi-user authentication required in initial version).

**FR-21**: The system must be accessible from any desktop web browser.

**FR-22**: The system must provide a simple authentication mechanism (username/password or email/password) to protect the user's trading data.

**FR-23**: The system must allow users to export their trade data to CSV format for external analysis or backup purposes. The export should include all trade fields and calculated metrics.

### User Interface

**FR-24**: The system must feature a clean, minimal design that prioritizes readability and ease of use.

**FR-25**: The system must have a responsive layout optimized for desktop browsers (minimum 1280px width recommended).

**FR-26**: The system must provide clear navigation between:

- Dashboard (analytics overview)
- Trade list (all trades)
- New trade entry form
- Individual trade detail view

**FR-27**: The system must display trade lists in a table/card format with key information visible at a glance (symbol, date, P&L, outcome).

**FR-28**: The system must provide visual indicators for winning (green) and losing (red) trades.

**FR-29**: The system must support both light and dark themes with a user-accessible toggle to switch between them.

## 5. Non-Goals (Out of Scope)

The following features are explicitly **not** included in the initial version:

**NG-1**: **Live Market Data** - The application will not fetch or display real-time stock prices, quotes, or market data from external sources.

**NG-2**: **Automated Trading Execution** - The application will not connect to brokerage APIs or execute trades automatically. It is purely for journaling and analysis.

**NG-3**: **Social Features** - No sharing of trades, community features, following other traders, or social networking capabilities.

**NG-4**: **Advanced Portfolio Management** - Not intended to replace portfolio management software or provide asset allocation, rebalancing, or multi-account aggregation features.

**NG-5**: **Import from Broker Statements** - Initial version will not support CSV import or automatic import from brokerage accounts.

**NG-6**: **Mobile Native App** - Desktop web browser only; no iOS or Android native applications.

**NG-7**: **Multi-User/Team Features** - No user permissions, team accounts, or sharing capabilities.

**NG-8**: **Backtesting** - No backtesting of strategies on historical data.

**NG-9**: **Watchlists or Trade Ideas** - Focus is on recording completed trades, not tracking potential trades.

**NG-10**: **Tax Reporting** - No automated tax forms or integration with tax software (though data can be used manually for taxes).

**NG-11**: **Notifications and Reminders** - No email or push notifications, no reminders to journal trades or review performance.

**NG-12**: **Trade Templates** - No pre-filled templates or presets for common strategy types; all trades entered manually.

## 6. Design Considerations

### Visual Design Principles

- **Minimalism**: Clean interfaces with plenty of white space
- **Data Clarity**: Use clear typography and visual hierarchy to make numbers and metrics easy to scan
- **Color Coding**: Consistent use of green for profits, red for losses, with sufficient contrast for accessibility
- **Focus on Content**: Avoid unnecessary decorative elements; let the data speak

### User Experience

- **Quick Entry**: Trade entry form should be streamlined for fast data input
- **Progressive Disclosure**: Show essential information first, with detailed metrics available on demand
- **Keyboard Shortcuts**: Consider keyboard shortcuts for power users (e.g., "N" for new trade)
- **Confirmation Dialogs**: Require confirmation for destructive actions (delete trade)

### Component Suggestions

- Use a date/time picker for trade entry/exit times
- Rich text editor for notes (e.g., TipTap, Quill, or similar)
- Image upload component with preview for screenshots
- Tag input component with autocomplete for existing tags
- Charting library for analytics (e.g., Chart.js, Recharts, or similar)

## 7. Technical Considerations

### Architecture Suggestions

- **Frontend**: Modern JavaScript framework (React, Vue, or Svelte recommended)
- **Backend**: RESTful API or GraphQL for data operations
- **Database**: Cloud database solution (PostgreSQL, MySQL, or Firebase/Supabase)
- **File Storage**: Cloud object storage for screenshots (AWS S3, Cloudinary, or similar)
- **Authentication**: Simple email/password authentication with session management
- **Hosting**: Deploy frontend and backend to cloud platform (Vercel, Netlify, Railway, or similar)

### Data Model Considerations

- Trade entity should include all fields listed in FR-1, FR-2, and FR-3
- Support for one-to-many relationship: Trade → Screenshots
- Support for many-to-many relationship: Trade → Tags
- Index database on commonly filtered fields (date, symbol, asset type, outcome)

### Security

- All data transmission must use HTTPS
- Passwords must be hashed (bcrypt or similar)
- Image uploads should be validated for file type and size
- Implement basic rate limiting to prevent abuse

### Performance

- Lazy loading for trade lists (pagination or infinite scroll)
- Image optimization for uploaded screenshots (compression, thumbnails)
- Efficient queries for analytics calculations
- Cache frequently accessed metrics

## 8. Success Metrics

The success of this trading journal application will be measured by:

**SM-1**: **User Adoption** - User logs at least 80% of their trades within the application

**SM-2**: **Engagement** - User accesses the application at least 3 times per week

**SM-3**: **Feature Usage** - User utilizes core features:

- 100% of trades include notes/journal entries
- 70%+ of trades include screenshots
- 90%+ of trades are tagged with strategies

**SM-4**: **Analytics Value** - User views analytics dashboard at least once per week

**SM-5**: **Data Completeness** - Average trade entry includes at least 80% of available fields (not just required fields)

**SM-6**: **Performance Improvement** - User demonstrates measurable improvement in win rate or profit factor over 3-month period (indicates they're learning from the data)

**SM-7**: **System Reliability** - Zero data loss incidents; 99.9% uptime

## 9. Requirements Clarifications

The following design decisions were confirmed with the user:

**Currency Support**: Multi-currency support with dropdown selection per trade. Each trade can be in a different currency.

**Position Management**: Simple one-entry, one-exit per trade. No support for scaling in/out of positions.

**Commission Entry**: Manual entry only. User calculates and enters total commission/fee amount; system does not auto-calculate based on formulas.

**Historical Data**: No existing data to import. User is starting fresh with this application.

**Trade Templates**: Not needed. User prefers to enter all trade information manually without pre-filled templates.

**Notifications**: Not required. No email reminders or push notifications for journaling or performance reviews.

**Export Functionality**: CSV export is required for data backup and external analysis. PDF reports and other formats are not needed in initial version.

**Theme Support**: Both light and dark modes required with user toggle to switch between themes.

---

**Document Version**: 2.0  
**Created**: October 27, 2025  
**Last Updated**: October 27, 2025  
**Status**: Final - Ready for Implementation
