# Clarifying Questions - Request #0001

## Understanding Your Need

Based on your request to add PLN (Polish Złoty) currency support, I'd like to understand the situation better using the Jobs To Be Done framework. This helps us ensure the implementation fully addresses your needs.

## Questions

### A) The Job (What progress are you trying to make?)
1. What specific outcome are you trying to achieve by having PLN available?
   - a) Record trades made in PLN
   - b) Track performance in PLN
   - c) Both of the above
   - d) Other (please specify)

2. Why is adding PLN important to you right now?
   - a) You're starting to trade Polish assets
   - b) You already have PLN trades to record
   - c) Planning for future PLN trading
   - d) Other (please specify)

### B) The Context (When and where does this need arise?)
3. When do you need to use PLN currency?
   - a) For trades on Polish stock exchange
   - b) For Forex pairs involving PLN (e.g., USD/PLN, EUR/PLN)
   - c) For other financial instruments denominated in PLN
   - d) Multiple of the above

### C) The Desired Outcome (What does success look like?)
4. How will you know if PLN support successfully addresses your need?
   - a) I can select PLN from the currency dropdown when creating/editing trades
   - b) PLN trades are displayed correctly with proper formatting (zł symbol)
   - c) All existing features (analytics, export, etc.) work with PLN trades
   - d) All of the above

5. Are there any specific formatting requirements for PLN amounts?
   - a) Standard formatting (e.g., "zł 1,234.56") is fine
   - b) Polish locale formatting (e.g., "1 234,56 zł")
   - c) No preference - default formatting is acceptable

### D) Current Alternatives (How do you solve this today?)
6. How are you currently handling PLN trades?
   - a) Not recording them yet
   - b) Recording them with a different currency (e.g., EUR or USD) as a workaround
   - c) Using a different tool/external spreadsheet
   - d) Other (please specify)

7. What limitations or frustrations do you experience with the current approach?
   - [Open text response]

### E) Barriers (What prevents progress?)
8. Are there any constraints or requirements we should be aware of?
   - a) None - standard implementation is fine
   - b) Need PLN symbol (zł) to display correctly
   - c) Need specific formatting requirements
   - d) Other (please specify)

## Additional Context

I've identified that PLN needs to be added to:
- The currency list in the CurrencySelector component
- The TradeForm dropdown (which currently has a hardcoded list)

## Next Steps

Please respond to these questions (you can use the letter/number format for easy reference, e.g., "A1: c, A2: a"). Once I understand your needs, I'll create a comprehensive requirements document and solution proposals.

**Note**: If you'd prefer to proceed quickly with a standard implementation (adding PLN with zł symbol and standard formatting), I can do that as well - just let me know!

1c, 2a, 3d, 4d, 5C and use PLN not zł, 6a, 7: most of my trades will be in PLN, 8a