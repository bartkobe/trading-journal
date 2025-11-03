# Trading Journal - User Guide

Welcome to the Trading Journal! This comprehensive guide will help you get started and make the most of all features available in the application.

**Live Application**: https://trading-journal-eight-tau.vercel.app

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Overview](#dashboard-overview)
3. [Adding Trades](#adding-trades)
4. [Viewing and Managing Trades](#viewing-and-managing-trades)
5. [Analytics and Insights](#analytics-and-insights)
6. [Searching and Filtering](#searching-and-filtering)
7. [Tags](#tags)
8. [Screenshots](#screenshots)
9. [Exporting Data](#exporting-data)
10. [Customization](#customization)
11. [Tips and Best Practices](#tips-and-best-practices)

---

## Getting Started

### Creating Your Account

1. **Navigate to the Application**
   - Visit the Trading Journal at https://trading-journal-eight-tau.vercel.app
   - You'll see the login/registration page

2. **Register a New Account**
   - Click on the **"Create Account"** tab
   - Enter your email address
   - Create a strong password:
     - Minimum 8 characters
     - At least one uppercase letter
     - At least one lowercase letter
     - At least one number
   - (Optional) Enter your name
   - Click **"Create Account"**

3. **Log In**
   - If you already have an account, use the **"Sign In"** tab
   - Enter your email and password
   - Click **"Sign In"**
   - You'll be automatically redirected to your dashboard

### First Steps

After logging in:
- You'll see your **Dashboard** with an overview of your trading performance
- Use the navigation menu at the top to access different sections:
  - **Dashboard**: Analytics and metrics overview
  - **Trades**: View and manage all your trades
  - **New Trade**: Add a new trade entry

---

## Dashboard Overview

The Dashboard is your command center, providing a comprehensive overview of your trading performance at a glance.

### Open Trades Section

At the top of the dashboard, you'll see a dedicated **Open Trades** section that displays:
- All your currently open trades
- Count of open positions
- Quick access to close each trade
- Link to view all open trades

**To Close an Open Trade from Dashboard**:
1. Find the open trade in the Open Trades section
2. Click **"Close Trade"** button
3. Fill in exit date and price
4. Click **"Yes, Close Trade"** to confirm

### Key Metrics Display

Below the Open Trades section, you'll see important performance metrics:

**Note**: All performance metrics (P&L, win rate, etc.) only include **closed trades**. Open trades are excluded from analytics calculations until they are closed. The dashboard also shows a count of your open trades as an informational metric (separate from performance calculations).

- **Total Trades**: Total number of trades recorded
- **Win Rate**: Percentage of winning trades
- **Total P&L**: Total profit/loss across all trades
- **Average P&L**: Average profit/loss per trade
- **Profit Factor**: Ratio of gross profit to gross loss
- **Sharpe Ratio**: Risk-adjusted return measure
- **Maximum Drawdown**: Largest peak-to-trough decline

### Performance Breakdowns

Below the key metrics, you'll find performance breakdowns by:

- **Symbol**: Which stocks/assets are most profitable
- **Strategy**: Performance by trading strategy
- **Asset Type**: Stocks vs Forex vs Crypto vs Options
- **Time of Day**: When you trade most successfully
- **Day of Week**: Which days are most profitable
- **Emotional State**: Correlation between emotions and outcomes
- **Market Conditions**: Performance in different market environments

### Interactive Charts

The dashboard includes visual analytics:

1. **Equity Curve**
   - Shows your cumulative P&L over time
   - Helps visualize your trading progress
   - Identify trends and patterns in performance

2. **Win/Loss Distribution**
   - Histogram showing distribution of winning and losing trades
   - Helps identify typical win/loss sizes

3. **Performance Charts**
   - Visual breakdowns by symbol, strategy, asset type, etc.
   - Easy-to-read bar charts for quick insights

### Date Range Filtering

Use the date range filter at the top of the dashboard to:
- Analyze performance for specific time periods
- Compare different trading periods
- Focus on recent performance

**How to Use**:
1. Click the date range selector
2. Choose a start date
3. Choose an end date
4. All metrics and charts update automatically

---

## Adding Trades

Recording trades is the core function of the journal. Follow these steps to add a new trade.

### Accessing the New Trade Form

1. Click **"New Trade"** in the navigation menu
2. Or click the **"Add Trade"** button from the Trades page

### Required Information

**Basic Trade Details** (Required):

- **Symbol**: Trading symbol (e.g., AAPL, BTC/USD, EUR/USD)
- **Asset Type**: 
  - STOCK (stocks)
  - FOREX (foreign exchange)
  - CRYPTO (cryptocurrency)
  - OPTIONS (options trading)
- **Currency**: Currency for the trade (USD, EUR, GBP, JPY, PLN, etc.)
- **Entry Date**: Date and time of trade entry
- **Entry Price**: Price at which you entered
- **Quantity**: Number of shares/units/contracts
- **Direction**: 
  - LONG (buying/going long)
  - SHORT (selling/going short)

**Exit Information** (Optional - for open trades):

- **Exit Date**: Date and time of trade exit (optional if trade is still open)
- **Exit Price**: Price at which you exited (optional if trade is still open)

### Recording Open Trades

You can record trades **at the moment of opening**, even before they close. This is especially useful for:
- **Day traders**: Capture your emotional state immediately at entry
- **Swing traders**: Record trades as you enter them, then close them later
- **Active monitoring**: Track all your open positions in one place

**To Record an Open Trade:**

1. Fill in all the required information above
2. Check the **"Trade is still open"** checkbox at the top of the Exit Details section
3. Leave Exit Date and Exit Price empty
4. Click **"Save Trade"** or **"Create Trade"**
5. The trade will be marked as **OPEN** with a blue badge

**To Close an Open Trade Later:**

1. Navigate to the open trade's detail page
2. Click **"Edit Trade"** or **"Close Trade"** button
3. Uncheck the **"Trade is still open"** checkbox
4. Fill in the Exit Date and Exit Price
5. Click **"Update Trade"**
6. A confirmation dialog will appear asking to confirm closing the trade
7. Click **"Yes, Close Trade"** to finalize

**Benefits of Recording Open Trades:**

- **Capture Fresh Emotions**: Record how you feel at entry, before outcomes bias your memory
- **Track Active Positions**: See all your open trades in one place on the dashboard
- **Better Analysis**: Analyze your entry decisions separately from exit decisions
- **Complete History**: Maintain a complete record of all trades, including those still in progress

### Optional Information

**Trading Strategy** (Optional but Recommended):

- **Strategy Name**: Your trading strategy (e.g., "Momentum", "Mean Reversion")
- **Setup Type**: Setup pattern (e.g., "Breakout", "Pullback", "Support Bounce")
- **Stop Loss**: Stop loss price level
- **Take Profit**: Take profit target
- **Risk/Reward Ratio**: Planned risk/reward ratio

**Market Context** (Optional but Recommended):

- **Time of Day**:
  - PRE_MARKET
  - MARKET_OPEN
  - MID_DAY
  - MARKET_CLOSE
  - AFTER_HOURS
- **Market Conditions**:
  - TRENDING (clear trend)
  - RANGING (sideways movement)
  - VOLATILE (high volatility)
  - CALM (low volatility)

**Emotional State** (Optional but Recommended):

- **Emotional State at Entry**: How you felt when entering (e.g., "Confident", "Anxious", "Neutral")
- **Emotional State at Exit**: How you felt when exiting

**Additional Details**:

- **Fees**: Trading fees/commissions for this trade
- **Notes**: Rich text notes about the trade
  - Use the rich text editor to format notes
  - Add bullet points, bold text, links, etc.
- **Tags**: Add custom tags to categorize trades (e.g., "momentum", "breakout", "swing-trade")

### Adding Screenshots

To add chart screenshots to your trade:

1. Click **"Upload Screenshot"** or drag and drop an image
2. Select an image file (JPEG, PNG, GIF, or WebP)
3. Maximum file size: 10MB
4. You can upload multiple screenshots per trade
5. Screenshots are stored securely in cloud storage

**Tips for Screenshots**:
- Capture key chart patterns
- Include entry/exit points
- Add annotations if helpful
- Screenshots help with later review and learning

### Submitting the Trade

1. Review all entered information
2. Click **"Save Trade"** or **"Create Trade"**
3. You'll be redirected to the trade detail page
4. The trade is automatically added to your journal

### Automatic Calculations

After saving, the system automatically calculates:

**For Closed Trades**:
- **P&L**: Profit or loss amount
- **P&L %**: Percentage profit/loss
- **Net P&L**: P&L after fees
- **Entry Value**: Entry price × quantity
- **Exit Value**: Exit price × quantity
- **Holding Period**: Duration of the trade (hours and days)
- **Actual Risk/Reward**: Calculated from actual outcome

**For Open Trades**:
- **Entry Value**: Entry price × quantity
- P&L, Exit Value, and Holding Period are not calculated until the trade is closed
- These fields will show "—" or "N/A" until exit information is added

---

## Viewing and Managing Trades

### Trade List View

Access all your trades from the **"Trades"** page in the navigation.

**Trade Cards Display**:
- Symbol and asset type
- Entry and exit dates (or "In Progress" for open trades)
- Entry and exit prices (or "In Progress" for open trades)
- Quantity and direction (LONG/SHORT)
- **Status Badge**: Blue "OPEN" badge for open trades
- Calculated P&L (highlighted in green for wins, red for losses, or "—" for open trades)
- Tags (as badges)
- Quick access to view, edit, or delete

**Open Trades**:
- Display a blue **"OPEN"** status badge
- Show "In Progress" instead of exit date/price
- P&L shows "—" since the trade hasn't closed yet
- Have a blue border highlight for easy identification

### Trade Detail View

Click on any trade card to view full details:

**Information Displayed**:
- All trade information
- **Status**: Shows "Open Trade" with blue badge or "Closed Trade"
- Calculated metrics (P&L, percentages, holding period - shown as "N/A" or "Ongoing" for open trades)
- Associated screenshots (with ability to delete)
- Tags
- Rich text notes (formatted)

**Actions Available**:
- **Edit**: Modify the trade details
- **Close Trade**: For open trades, quickly access the edit form to add exit information
- **Delete**: Remove the trade (with confirmation)
- **View Screenshots**: Click to view full-size images

**Open Trade Details**:
- Exit section shows "Not yet closed" instead of exit date/price
- P&L metrics show "N/A" since calculations require exit information
- Holding period shows "Ongoing" instead of duration

### Editing Trades

1. Navigate to the trade detail page
2. Click **"Edit Trade"** button
3. The trade form opens with all fields pre-filled
4. Make your changes
5. Click **"Update Trade"** to save

**Note**: All calculations automatically update when you save changes.

### Deleting Trades

1. Navigate to the trade detail page
2. Click **"Delete Trade"** button
3. Confirm deletion in the dialog
4. The trade and all associated screenshots are permanently deleted

**Warning**: Deletion cannot be undone. Make sure you want to delete before confirming.

---

## Analytics and Insights

The Trading Journal provides powerful analytics to help you understand your trading performance.

### Dashboard Metrics

**Overview Metrics**:
- **Total Trades**: Count of all trades
- **Winning Trades**: Number of profitable trades
- **Losing Trades**: Number of unprofitable trades
- **Breakeven Trades**: Trades with zero P&L
- **Win Rate**: Percentage of winning trades

**Performance Metrics**:
- **Total P&L**: Sum of all profits and losses
- **Total P&L %**: Percentage return
- **Average P&L**: Average profit/loss per trade
- **Average P&L %**: Average percentage return per trade
- **Average Win**: Average profit on winning trades
- **Average Loss**: Average loss on losing trades
- **Profit Factor**: Gross profit ÷ gross loss

**Advanced Metrics**:
- **Expectancy**: Expected value per trade
  - Shows expected profit/loss per dollar risked
- **Sharpe Ratio**: Risk-adjusted return measure
  - Higher is better (indicates better risk-adjusted returns)
- **Maximum Drawdown**: Largest decline from peak to trough
  - Shows peak date and trough date
  - Important for risk assessment

**Streaks**:
- Current win streak
- Current loss streak
- Longest win streak
- Longest loss streak

### Performance Breakdowns

Analyze your performance by different dimensions:

**By Symbol**:
- See which stocks/assets are most profitable
- Identify best and worst performers
- Win rate by symbol

**By Strategy**:
- Compare performance across different strategies
- Identify which strategies work best for you
- Win rate by strategy

**By Asset Type**:
- Compare Stocks vs Forex vs Crypto vs Options
- Understand where you perform best
- Diversification insights

**By Setup Type**:
- Which chart patterns/setups work best
- Identify reliable setups
- Focus on high-probability patterns

**By Time of Day**:
- When do you trade most successfully?
- Identify optimal trading hours
- Avoid trading during low-performance periods

**By Day of Week**:
- Which days are most profitable?
- Identify weekly patterns
- Plan trading schedule accordingly

**By Emotional State**:
- Correlation between emotions and outcomes
- Identify emotional patterns
- Learn when to trade and when to avoid

**By Market Conditions**:
- Performance in different market environments
- Trending vs Ranging markets
- Volatile vs Calm conditions

### Using Date Range Filters

To analyze specific time periods:

1. Click the date range selector (on Dashboard)
2. Choose start and end dates
3. All metrics and charts update automatically
4. Compare different periods to track improvement

**Use Cases**:
- Monthly performance reviews
- Quarterly analysis
- Year-over-year comparisons
- Focus on recent performance

---

## Searching and Filtering

Powerful search and filter capabilities help you find trades quickly and analyze specific subsets.

### Quick Search

Use the search box to find trades by:
- **Symbol**: Trading symbol
- **Notes**: Content in trade notes
- **Strategy**: Strategy name
- **Tags**: Tag names

**How to Use**:
1. Type in the search box
2. Results filter in real-time as you type
3. Search is case-insensitive

### Advanced Filters

Click **"Filters"** to access advanced filtering options:

**Status Filter**:
- **All Trades**: Show both open and closed trades
- **Open**: Show only open trades (trades without exit information)
- **Closed**: Show only closed trades (trades with exit date and price)

**Date Range Filter**:
- Filter trades within a specific date range
- Useful for monthly/quarterly analysis
- Both start and end dates optional

**Asset Type Filter**:
- Filter by STOCK, FOREX, CRYPTO, or OPTIONS
- Useful for focusing on specific markets

**Outcome Filter**:
- **Winning**: Only profitable trades
- **Losing**: Only unprofitable trades
- **Breakeven**: Only zero P&L trades
- **Note**: Open trades are not included in outcome filtering (they don't have outcomes yet)

**Symbol Filter**:
- Filter by specific trading symbol
- Exact match (case-insensitive)

**Strategy Filter**:
- Filter by strategy name
- Useful for strategy-specific analysis

**Tags Filter**:
- Select one or more tags
- Shows trades with ANY of the selected tags
- Useful for finding related trades

### Sorting

Sort trades by different criteria:

- **Date** (default): Most recent first or oldest first
- **P&L**: Highest profit first or highest loss first
- **P&L %**: Highest percentage first or lowest first
- **Symbol**: Alphabetical order

**How to Use**:
1. Click the sort dropdown
2. Select sort field
3. Choose ascending or descending order

### Combining Filters

You can combine multiple filters:
- Date range + Asset Type + Outcome
- Symbol + Strategy + Tags
- Any combination to find specific trade subsets

**Example**: Find all winning STOCK trades from last month tagged "momentum"

### Pagination

When you have many trades:
- Use pagination controls at the bottom
- Adjust items per page (if available)
- Navigate through pages of results

---

## Tags

Tags help you organize and categorize your trades for easy retrieval and analysis.

### Creating Tags

**Method 1: When Creating/Editing a Trade**:
1. In the trade form, find the "Tags" field
2. Type a tag name and press Enter
3. Tag is created automatically if it doesn't exist
4. Add multiple tags by repeating

**Method 2: Using the Tags API** (if available):
- Tags can be created independently

### Tag Naming Rules

- 1-50 characters
- Only letters, numbers, hyphens (-), and underscores (_)
- Case-insensitive (stored in lowercase)
- Examples: "momentum", "breakout", "swing-trade", "high_volume"

### Using Tags

**Benefits**:
- **Organization**: Group related trades
- **Search**: Quickly find trades with specific tags
- **Analysis**: Filter and analyze tagged trades
- **Pattern Recognition**: Identify common patterns

**Tag Ideas**:
- **Strategy**: "momentum", "mean-reversion", "scalping"
- **Setup**: "breakout", "pullback", "support-bounce"
- **Market**: "bull-market", "bear-market", "volatile"
- **Emotion**: "confident", "anxious", "patient"
- **Timeframe**: "day-trade", "swing-trade", "position-trade"
- **Custom**: Any category relevant to your trading

### Managing Tags

- View all tags with usage counts
- Tags are created automatically when used
- Tags persist across all trades
- Delete unused tags (if feature available)

### Best Practices

1. **Consistency**: Use consistent naming (e.g., always "momentum" not "momentum" and "Momentum")
2. **Relevance**: Tag with information not already captured in other fields
3. **Simplicity**: Keep tag names simple and clear
4. **Categories**: Develop a tagging system that works for you
5. **Review**: Periodically review and consolidate similar tags

---

## Screenshots

Adding screenshots to trades provides visual context and helps with later analysis.

### Adding Screenshots

**Method 1: When Creating a Trade**:
1. In the trade form, find the screenshot upload area
2. Click "Upload Screenshot" or drag and drop
3. Select image file from your computer
4. Image uploads automatically
5. Repeat for multiple screenshots

**Method 2: Adding to Existing Trade**:
1. Navigate to trade detail page
2. Find the screenshots section
3. Click "Upload Screenshot"
4. Select and upload image

### File Requirements

- **Supported Formats**: JPEG, PNG, GIF, WebP
- **Maximum Size**: 10MB per image
- **Recommended**: PNG or JPEG for best quality

### Screenshot Best Practices

**What to Capture**:
- Chart patterns showing entry/exit points
- Key support/resistance levels
- Indicators used for decision-making
- Volume patterns
- Multiple timeframes (if relevant)
- News events or catalysts

**Tips**:
- Use annotations to mark important levels
- Include relevant indicators
- Capture the context, not just the chart
- Screenshots help recall the thought process later

### Viewing Screenshots

- Click on any screenshot thumbnail to view full size
- Screenshots are displayed in the trade detail view
- Easy to review when analyzing past trades

### Deleting Screenshots

1. Navigate to trade detail page
2. Find the screenshot you want to delete
3. Click delete button (trash icon)
4. Confirm deletion
5. Screenshot is removed from cloud storage and database

---

## Exporting Data

Export your trade data to CSV format for external analysis or backup.

### Exporting to CSV

1. Navigate to the **Trades** page
2. Look for **"Export CSV"** button (usually in navigation or filters area)
3. Click the button
4. CSV file downloads automatically

### CSV Contents

The exported CSV includes:

**Trade Information**:
- Symbol, Asset Type, Currency
- Entry/Exit dates and prices
- Quantity, Direction
- Setup Type, Strategy Name
- Stop Loss, Take Profit
- Fees, Notes, Tags

**Calculated Metrics**:
- P&L (profit/loss) - shows empty for open trades
- P&L % (percentage) - shows empty for open trades
- Net P&L (after fees) - shows empty for open trades
- Entry Value, Exit Value - shows empty for open trades
- Holding Period (hours and days) - shows empty for open trades
- Is Winner, Is Loser, Is Breakeven - false for open trades
- **Status**: "Open" or "Closed" column indicates trade status

**Note**: Open trades are included in CSV exports. Their exit-related fields (exitDate, exitPrice, P&L, etc.) will be empty in the CSV until the trade is closed.

### Using Exported Data

**Excel/Google Sheets**:
- Open CSV in Excel or Google Sheets
- Create custom pivot tables
- Build additional analysis
- Create custom charts

**External Analysis**:
- Import into other tools
- Use for tax reporting
- Share with accountant (if needed)
- Create custom reports

**Backup**:
- Save CSV files for backup
- Archive historical data
- Maintain local copies

### Export Tips

- Export regularly for backup
- Use date filters before exporting to export specific periods
- CSV includes all visible trades (respects current filters)

---

## Customization

### Theme Selection

Switch between light and dark themes:

1. Look for the theme toggle button (usually in top-right corner)
2. Click to switch between light and dark modes
3. Your preference is saved automatically
4. Theme persists across sessions

**Light Theme**:
- Clean, bright interface
- Good for well-lit environments
- Professional appearance

**Dark Theme**:
- Easy on the eyes
- Good for low-light environments
- Reduces eye strain

### Navigation

The main navigation provides quick access to:
- **Dashboard**: Analytics overview
- **Trades**: All your trades
- **New Trade**: Add new trade
- **Logout**: Sign out

### Responsive Design

The application is designed for desktop use:
- Optimized for screens 1280px and wider
- Responsive on smaller screens (tablets, mobile)
- Best experience on desktop browsers

---

## Tips and Best Practices

### Recording Trades

1. **Record Immediately**: Log trades as soon as they close to capture fresh thoughts and emotions
2. **Be Consistent**: Use consistent terminology for strategies, setups, and emotional states
3. **Add Context**: Include notes about why you entered, what happened, and what you learned
4. **Use Tags**: Develop a tagging system and use it consistently
5. **Add Screenshots**: Visual context is invaluable for later review

### Using Analytics

1. **Regular Review**: Check your dashboard regularly to track progress
2. **Date Ranges**: Use date range filters to analyze specific periods
3. **Pattern Recognition**: Look for patterns in performance breakdowns
4. **Identify Strengths**: Focus on what's working (best symbols, strategies, times)
5. **Address Weaknesses**: Identify and work on areas of poor performance

### Search and Filter

1. **Use Filters**: Combine filters to find specific trade subsets
2. **Tag System**: Develop and use a consistent tagging system
3. **Search Regularly**: Use search to find similar past trades for reference
4. **Learn from History**: Review past trades before making similar decisions

### Notes and Journaling

1. **Be Honest**: Record your true emotional state, not what you wish it was
2. **Include Context**: Note market conditions, news, or other relevant factors
3. **What Worked**: Note what went well
4. **What Didn't**: Note mistakes and what to avoid
5. **Lessons Learned**: Extract lessons for future trades

### Performance Improvement

1. **Review Regularly**: Weekly or monthly reviews of performance
2. **Compare Periods**: Compare current period to previous periods
3. **Focus on Metrics**: Pay attention to win rate, profit factor, and Sharpe ratio
4. **Emotional Patterns**: Analyze emotional state correlations
5. **Time Analysis**: Identify best times to trade
6. **Strategy Refinement**: Use analytics to refine strategies

### Data Management

1. **Regular Backups**: Export CSV regularly for backup
2. **Keep It Updated**: Don't let trades pile up - record them promptly
3. **Clean Data**: Use consistent naming and avoid typos
4. **Organize**: Use tags and filters to keep data organized

### Getting the Most Value

1. **Consistency**: The more trades you record, the more valuable the insights
2. **Honesty**: Accurate data leads to accurate insights
3. **Regular Use**: Make the journal part of your trading routine
4. **Learn and Adapt**: Use insights to improve your trading
5. **Patience**: Building a meaningful dataset takes time

---

## Troubleshooting

### Common Issues

**Can't Log In**:
- Verify email and password are correct
- Check for typos
- Password is case-sensitive
- If forgotten, you'll need to contact support (if password reset available)

**Trades Not Saving**:
- Check that all required fields are filled
- Verify dates are valid
- Ensure numbers are positive (prices, quantities)
- Check browser console for errors

**Screenshots Not Uploading**:
- Verify file size is under 10MB
- Check file format (JPEG, PNG, GIF, WebP)
- Ensure cloud storage is configured (contact support if issue persists)

**Charts Not Loading**:
- Check internet connection
- Refresh the page
- Ensure you have trades recorded
- Date range might not have trades

**Data Not Updating**:
- Refresh the page
- Clear browser cache
- Check internet connection

### Getting Help

- **Documentation**: Check this user guide and API documentation
- **Support**: Contact support through the application (if available)
- **Browser Issues**: Try a different browser or clear cache

---

## Keyboard Shortcuts

Currently, keyboard shortcuts are limited, but the application is designed for mouse/keyboard navigation:

- **Tab**: Navigate between form fields
- **Enter**: Submit forms
- **Escape**: Close dialogs/modals
- **Browser Back/Forward**: Navigate between pages

---

## Privacy and Security

- **Your Data**: All trade data is private to your account
- **Secure Storage**: Data is stored securely in the cloud
- **Backups**: Regular backups are maintained
- **HTTPS**: All connections are encrypted
- **Cookies**: Authentication uses secure httpOnly cookies

---

## Frequently Asked Questions

**Q: Can I import trades from my broker?**
A: Currently, manual entry is required. CSV import may be available in future versions.

**Q: Can I share my trades with others?**
A: The application is designed for single-user use. Sharing features are not currently available.

**Q: Is there a mobile app?**
A: The application is web-based and accessible from mobile browsers, but there's no dedicated mobile app.

**Q: How long is my data stored?**
A: Data is stored indefinitely unless you delete your account or individual trades.

**Q: Can I export data in other formats?**
A: Currently, CSV export is available. Additional formats may be added in the future.

**Q: How do I delete my account?**
A: Contact support if account deletion is needed (if feature not available in UI).

**Q: Can I use multiple currencies?**
A: Yes! Each trade can use a different currency. P&L is calculated in the trade's currency.

**Q: What if I make a mistake entering a trade?**
A: You can edit any trade at any time from the trade detail page.

---

## Conclusion

The Trading Journal is a powerful tool for tracking, analyzing, and improving your trading performance. The key to success is:

1. **Consistency**: Record trades regularly and completely
2. **Honesty**: Accurate data leads to accurate insights
3. **Review**: Regularly analyze your performance
4. **Learn**: Use insights to refine your trading approach

Start by recording your trades, and over time, you'll build a valuable dataset that provides insights to help you become a better trader.

**Happy Trading! 📈**

---

**Last Updated**: Complete user guide for Trading Journal application

