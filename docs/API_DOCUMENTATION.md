# API Documentation

Complete reference documentation for all API endpoints in the Trading Journal application.

**Base URL**: `https://trading-journal-eight-tau.vercel.app/api`  
**Local Development**: `http://localhost:3000/api`

---

## Table of Contents

- [Authentication](#authentication)
- [Trades](#trades)
- [Analytics](#analytics)
- [Tags](#tags)
- [Export](#export)
- [Error Responses](#error-responses)
- [Authentication Methods](#authentication-methods)

---

## Authentication

Most endpoints require authentication. Authentication is handled via JWT tokens stored in httpOnly cookies.

### Register User

Register a new user account.

**Endpoint**: `POST /api/auth/register`

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe" // Optional
}
```

**Validation Rules**:
- `email`: Valid email address (required)
- `password`: 
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- `name`: Optional, minimum 1 character if provided

**Success Response** (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Validation failed
  ```json
  {
    "error": "Validation failed",
    "details": {
      "email": ["Invalid email address"],
      "password": ["Password must be at least 8 characters"]
    }
  }
  ```
- `409 Conflict`: User already exists
  ```json
  {
    "error": "User with this email already exists"
  }
  ```
- `500 Internal Server Error`: Server error

**Notes**:
- On successful registration, an authentication cookie is automatically set
- User is immediately authenticated after registration

---

### Login

Authenticate a user and create a session.

**Endpoint**: `POST /api/auth/login`

**Authentication**: Not required

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123"
}
```

**Validation Rules**:
- `email`: Valid email address (required)
- `password`: Non-empty string (required)

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error Responses**:
- `400 Bad Request`: Validation failed
- `401 Unauthorized`: Invalid email or password
  ```json
  {
    "error": "Invalid email or password"
  }
  ```
- `500 Internal Server Error`: Server error

**Notes**:
- On successful login, an authentication cookie is automatically set
- Cookie is httpOnly, secure in production, and expires based on `JWT_EXPIRES_IN` (default: 7 days)

---

### Get Current User

Get the currently authenticated user's information.

**Endpoint**: `GET /api/auth/me`

**Authentication**: Required

**Success Response** (200 OK):
```json
{
  "user": {
    "id": "clx1234567890",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Not authenticated
  ```json
  {
    "error": "Not authenticated"
  }
  ```
- `500 Internal Server Error`: Server error

---

### Logout

Logout the current user and clear session.

**Endpoint**: `POST /api/auth/logout`

**Authentication**: Required (optional - will redirect even if not authenticated)

**Success Response**: HTTP 307 Redirect to `/` (login page)

**Notes**:
- Clears the authentication cookie
- Always redirects to login page (`/`)
- Even if logout fails, redirects to login page

---

## Trades

All trade endpoints require authentication and only return trades belonging to the authenticated user.

### List Trades

Get a paginated list of trades with optional filtering, sorting, and search.

**Endpoint**: `GET /api/trades`

**Authentication**: Required

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `startDate` | ISO date string | No | - | Filter trades from this date |
| `endDate` | ISO date string | No | - | Filter trades until this date |
| `assetType` | `STOCK`, `FOREX`, `CRYPTO`, `OPTIONS` | No | - | Filter by asset type |
| `symbol` | string | No | - | Filter by symbol (exact match) |
| `strategyName` | string | No | - | Filter by strategy name |
| `setupType` | string | No | - | Filter by setup type |
| `tags` | comma-separated string | No | - | Filter by tags (e.g., `tag1,tag2`) |
| `outcome` | `winning`, `losing`, `breakeven` | No | - | Filter by trade outcome |
| `search` | string | No | - | Search in symbol, notes, strategy, tags |
| `sortBy` | `date`, `pnl`, `pnlPercent`, `symbol` | No | `date` | Sort field |
| `sortOrder` | `asc`, `desc` | No | `desc` | Sort order |
| `limit` | number | No | `50` | Number of results per page |
| `offset` | number | No | `0` | Pagination offset |

**Example Request**:
```
GET /api/trades?startDate=2024-01-01&endDate=2024-12-31&assetType=STOCK&sortBy=pnl&sortOrder=desc&limit=25&offset=0
```

**Success Response** (200 OK):
```json
{
  "trades": [
    {
      "id": "clx1234567890",
      "symbol": "AAPL",
      "assetType": "STOCK",
      "currency": "USD",
      "entryDate": "2024-01-15T10:00:00.000Z",
      "entryPrice": 150.00,
      "exitDate": "2024-01-15T15:30:00.000Z",
      "exitPrice": 152.50,
      "quantity": 100,
      "direction": "LONG",
      "setupType": "Breakout",
      "strategyName": "Momentum",
      "stopLoss": 148.00,
      "takeProfit": 155.00,
      "fees": 1.00,
      "timeOfDay": "MARKET_OPEN",
      "marketConditions": "TRENDING",
      "emotionalStateEntry": "Confident",
      "emotionalStateExit": "Satisfied",
      "notes": "Strong breakout with volume",
      "riskRewardRatio": 2.0,
      "calculations": {
        "pnl": 250.00,
        "pnlPercent": 1.67,
        "netPnl": 249.00,
        "entryValue": 15000.00,
        "exitValue": 15250.00,
        "actualRiskReward": 1.25,
        "holdingPeriod": 5.5,
        "holdingPeriodDays": 0.23,
        "isWinner": true,
        "isLoser": false,
        "isBreakeven": false
      },
      "screenshots": [],
      "tags": [
        {
          "tag": {
            "id": "tag123",
            "name": "momentum"
          }
        }
      ],
      "createdAt": "2024-01-15T10:05:00.000Z",
      "updatedAt": "2024-01-15T15:35:00.000Z"
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

**Error Responses**:
- `400 Bad Request`: Invalid filter parameters
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Server error

---

### Get Trade by ID

Get a single trade by ID with all details.

**Endpoint**: `GET /api/trades/[id]`

**Authentication**: Required

**Path Parameters**:
- `id` (string, required): Trade ID

**Example Request**:
```
GET /api/trades/clx1234567890
```

**Success Response** (200 OK):
```json
{
  "trade": {
    "id": "clx1234567890",
    "symbol": "AAPL",
    "assetType": "STOCK",
    "currency": "USD",
    "entryDate": "2024-01-15T10:00:00.000Z",
    "entryPrice": 150.00,
    "exitDate": "2024-01-15T15:30:00.000Z",
    "exitPrice": 152.50,
    "quantity": 100,
    "direction": "LONG",
    "setupType": "Breakout",
    "strategyName": "Momentum",
    "stopLoss": 148.00,
    "takeProfit": 155.00,
    "fees": 1.00,
    "timeOfDay": "MARKET_OPEN",
    "marketConditions": "TRENDING",
    "emotionalStateEntry": "Confident",
    "emotionalStateExit": "Satisfied",
    "notes": "Strong breakout with volume",
    "riskRewardRatio": 2.0,
    "calculations": {
      "pnl": 250.00,
      "pnlPercent": 1.67,
      "netPnl": 249.00,
      "entryValue": 15000.00,
      "exitValue": 15250.00,
      "actualRiskReward": 1.25,
      "holdingPeriod": 5.5,
      "holdingPeriodDays": 0.23,
      "isWinner": true,
      "isLoser": false,
      "isBreakeven": false
    },
    "screenshots": [
      {
        "id": "screenshot123",
        "tradeId": "clx1234567890",
        "url": "https://cloudinary.com/...",
        "filename": "chart.png",
        "fileSize": 1024000,
        "mimeType": "image/png",
        "createdAt": "2024-01-15T10:10:00.000Z"
      }
    ],
    "tags": [
      {
        "tag": {
          "id": "tag123",
          "name": "momentum"
        }
      }
    ],
    "createdAt": "2024-01-15T10:05:00.000Z",
    "updatedAt": "2024-01-15T15:35:00.000Z"
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Trade not found
  ```json
  {
    "error": "Trade not found"
  }
  ```
- `500 Internal Server Error`: Server error

---

### Create Trade

Create a new trade entry.

**Endpoint**: `POST /api/trades`

**Authentication**: Required

**Request Body**:
```json
{
  "symbol": "AAPL",
  "assetType": "STOCK",
  "currency": "USD",
  "entryDate": "2024-01-15T10:00:00.000Z",
  "entryPrice": 150.00,
  "exitDate": "2024-01-15T15:30:00.000Z",
  "exitPrice": 152.50,
  "quantity": 100,
  "direction": "LONG",
  "setupType": "Breakout",
  "strategyName": "Momentum",
  "stopLoss": 148.00,
  "takeProfit": 155.00,
  "riskRewardRatio": 2.0,
  "fees": 1.00,
  "timeOfDay": "MARKET_OPEN",
  "marketConditions": "TRENDING",
  "emotionalStateEntry": "Confident",
  "emotionalStateExit": "Satisfied",
  "notes": "Strong breakout with volume",
  "tags": ["momentum", "breakout"]
}
```

**Required Fields**:
- `symbol` (string): Trading symbol
- `assetType` (`STOCK`, `FOREX`, `CRYPTO`, `OPTIONS`): Asset type
- `currency` (string): Currency code (default: "USD"). Supported currencies include: USD, EUR, GBP, JPY, CAD, AUD, CHF, PLN, and more.
- `entryDate` (ISO date string): Entry date/time
- `entryPrice` (number): Entry price (must be positive)
- `exitDate` (ISO date string): Exit date/time
- `exitPrice` (number): Exit price (must be positive)
- `quantity` (number): Quantity (must be positive)
- `direction` (`LONG`, `SHORT`): Trade direction

**Optional Fields**:
- `setupType` (string): Setup type
- `strategyName` (string): Strategy name
- `stopLoss` (number): Stop loss price
- `takeProfit` (number): Take profit price
- `riskRewardRatio` (number): Risk/reward ratio
- `fees` (number): Trading fees (default: 0)
- `timeOfDay` (`PRE_MARKET`, `MARKET_OPEN`, `MID_DAY`, `MARKET_CLOSE`, `AFTER_HOURS`): Time of day
- `marketConditions` (`TRENDING`, `RANGING`, `VOLATILE`, `CALM`): Market conditions
- `emotionalStateEntry` (string): Emotional state at entry
- `emotionalStateExit` (string): Emotional state at exit
- `notes` (string): Trade notes
- `tags` (array of strings): Tag names (will be created if they don't exist)

**Success Response** (201 Created):
```json
{
  "trade": {
    // Full trade object with calculations
    "id": "clx1234567890",
    // ... (same structure as Get Trade response)
  },
  "message": "Trade created successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Validation failed
  ```json
  {
    "error": "Validation failed",
    "details": {
      "entryPrice": ["Entry price must be positive"],
      "symbol": ["Symbol is required"]
    }
  }
  ```
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Server error

---

### Update Trade

Update an existing trade.

**Endpoint**: `PUT /api/trades/[id]`

**Authentication**: Required

**Path Parameters**:
- `id` (string, required): Trade ID

**Request Body**: Same as Create Trade (all fields optional, but must be valid if provided)

**Success Response** (200 OK):
```json
{
  "trade": {
    // Full updated trade object with calculations
  },
  "message": "Trade updated successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Validation failed
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Trade not found
- `500 Internal Server Error`: Server error

**Notes**:
- Only trades belonging to the authenticated user can be updated
- Tags are replaced (not merged) if provided

---

### Delete Trade

Delete a trade and all associated screenshots.

**Endpoint**: `DELETE /api/trades/[id]`

**Authentication**: Required

**Path Parameters**:
- `id` (string, required): Trade ID

**Example Request**:
```
DELETE /api/trades/clx1234567890
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Trade deleted successfully"
}
```

**Error Responses**:
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Trade not found
- `500 Internal Server Error`: Server error

**Notes**:
- Only trades belonging to the authenticated user can be deleted
- Deletes all associated screenshots (from database and cloud storage)
- Deletes all tag associations

---

### Upload Screenshot

Upload a screenshot/image for a trade.

**Endpoint**: `POST /api/trades/[id]/screenshots`

**Authentication**: Required

**Path Parameters**:
- `id` (string, required): Trade ID

**Request Format**: `multipart/form-data`

**Form Fields**:
- `file` (File, required): Image file

**File Requirements**:
- **Allowed Types**: JPEG, PNG, GIF, WebP
- **Max Size**: 10MB
- **Content-Type**: Must match file extension

**Example Request** (using FormData):
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

fetch(`/api/trades/${tradeId}/screenshots`, {
  method: 'POST',
  body: formData
});
```

**Success Response** (201 Created):
```json
{
  "screenshot": {
    "id": "screenshot123",
    "tradeId": "clx1234567890",
    "url": "https://cloudinary.com/image/upload/v1234/trades/screenshots/abc123.png",
    "filename": "chart.png",
    "fileSize": 1024000,
    "mimeType": "image/png",
    "createdAt": "2024-01-15T10:10:00.000Z"
  },
  "message": "Screenshot uploaded successfully"
}
```

**Error Responses**:
- `400 Bad Request`: 
  - No file provided
  - Invalid file type
  - File too large
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Trade not found
- `500 Internal Server Error`: 
  - Cloud storage not configured
  - Upload failed

**Notes**:
- Requires cloud storage to be configured (Cloudinary or AWS S3)
- Screenshots are stored in cloud storage, URLs stored in database

---

### Delete Screenshot

Delete a screenshot for a trade.

**Endpoint**: `DELETE /api/trades/[id]/screenshots?screenshotId=[screenshotId]`

**Authentication**: Required

**Path Parameters**:
- `id` (string, required): Trade ID

**Query Parameters**:
- `screenshotId` (string, required): Screenshot ID to delete

**Example Request**:
```
DELETE /api/trades/clx1234567890/screenshots?screenshotId=screenshot123
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Screenshot deleted successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Screenshot ID required
- `401 Unauthorized`: Authentication required
- `404 Not Found`: Screenshot not found
- `500 Internal Server Error`: Server error

**Notes**:
- Deletes screenshot from database and cloud storage
- Best-effort deletion (continues even if cloud deletion fails)

---

## Analytics

Analytics endpoints require authentication and return data for the authenticated user's trades.

### Get Dashboard Metrics

Get comprehensive dashboard metrics and KPIs.

**Endpoint**: `GET /api/analytics/dashboard`

**Authentication**: Required

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | ISO date string | No | Filter trades from this date |
| `endDate` | ISO date string | No | Filter trades until this date |

**Example Request**:
```
GET /api/analytics/dashboard?startDate=2024-01-01&endDate=2024-12-31
```

**Success Response** (200 OK):
```json
{
  "totalTrades": 150,
  "winningTrades": 90,
  "losingTrades": 55,
  "breakevenTrades": 5,
  "winRate": 60.0,
  "totalPnl": 15250.00,
  "totalPnlPercent": 10.17,
  "averagePnl": 101.67,
  "averagePnlPercent": 0.68,
  "averageWin": 250.00,
  "averageLoss": -125.00,
  "profitFactor": 2.0,
  "expectancy": {
    "value": 101.67,
    "valuePerDollar": 0.0068
  },
  "sharpeRatio": 1.25,
  "maximumDrawdown": {
    "value": -2500.00,
    "percentage": -12.5,
    "peakDate": "2024-06-15T00:00:00.000Z",
    "troughDate": "2024-07-20T00:00:00.000Z"
  },
  "streaks": {
    "currentWinStreak": 5,
    "currentLossStreak": 0,
    "longestWinStreak": 12,
    "longestLossStreak": 8
  },
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-12-31",
    "filtered": true
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Server error

---

### Get Chart Data

Get chart-ready data for visualizations.

**Endpoint**: `GET /api/analytics/charts`

**Authentication**: Required

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | ISO date string | No | Filter trades from this date |
| `endDate` | ISO date string | No | Filter trades until this date |
| `chartType` | string | No | Specific chart type: `equity`, `distribution`, `breakdown` (returns all if not specified) |

**Example Request**:
```
GET /api/analytics/charts?startDate=2024-01-01&chartType=equity
```

**Success Response** (200 OK):
```json
{
  "equityCurve": [
    {
      "date": "2024-01-15T00:00:00.000Z",
      "cumulativePnl": 250.00,
      "cumulativePnlPercent": 1.67
    }
  ],
  "winLossDistribution": {
    "wins": [100, 200, 300, 250, 150],
    "losses": [-50, -100, -75, -125, -80],
    "bins": [0, 50, 100, 150, 200, 250, 300]
  },
  "pnlBySymbol": [
    {
      "symbol": "AAPL",
      "totalPnl": 15250.00,
      "totalTrades": 45,
      "winRate": 66.67
    }
  ],
  "pnlByStrategy": [
    {
      "strategy": "Momentum",
      "totalPnl": 8500.00,
      "totalTrades": 60,
      "winRate": 65.0
    }
  ],
  "pnlByAssetType": [
    {
      "assetType": "STOCK",
      "totalPnl": 12000.00,
      "totalTrades": 100,
      "winRate": 62.0
    }
  ],
  "pnlBySetupType": [
    {
      "setupType": "Breakout",
      "totalPnl": 6000.00,
      "totalTrades": 40,
      "winRate": 70.0
    }
  ],
  "pnlByTimeOfDay": [
    {
      "timeOfDay": "MARKET_OPEN",
      "totalPnl": 5000.00,
      "totalTrades": 35,
      "winRate": 68.57
    }
  ],
  "pnlByEmotionalState": [
    {
      "emotionalState": "Confident",
      "totalPnl": 8000.00,
      "totalTrades": 50,
      "winRate": 72.0
    }
  ],
  "pnlByMarketConditions": [
    {
      "marketConditions": "TRENDING",
      "totalPnl": 10000.00,
      "totalTrades": 70,
      "winRate": 64.29
    }
  ],
  "pnlByDayOfWeek": [
    {
      "dayOfWeek": "Monday",
      "totalPnl": 2500.00,
      "totalTrades": 20,
      "winRate": 65.0
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Server error

**Notes**:
- If `chartType` is specified, only that chart data is returned
- If `chartType` is not specified, all chart data is returned

---

### Get Performance Breakdowns

Get performance breakdowns by various dimensions.

**Endpoint**: `GET /api/analytics/performance`

**Authentication**: Required

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `startDate` | ISO date string | No | Filter trades from this date |
| `endDate` | ISO date string | No | Filter trades until this date |
| `dimension` | string | No | Specific dimension: `symbol`, `strategy`, `assetType`, `timeOfDay`, `emotionalState`, `marketConditions`, `dayOfWeek` (returns all if not specified) |

**Example Request**:
```
GET /api/analytics/performance?startDate=2024-01-01&dimension=symbol
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "dateRange": {
    "start": "2024-01-01",
    "end": null,
    "filtered": true
  },
  "totalTrades": 150,
  "performance": {
    "bySymbol": [
      {
        "symbol": "AAPL",
        "totalPnl": 15250.00,
        "totalPnlPercent": 10.17,
        "totalTrades": 45,
        "winningTrades": 30,
        "losingTrades": 15,
        "winRate": 66.67,
        "averagePnl": 338.89,
        "averagePnlPercent": 2.26,
        "profitFactor": 2.5
      }
    ],
    "byStrategy": [
      {
        "strategy": "Momentum",
        "totalPnl": 8500.00,
        "totalPnlPercent": 8.5,
        "totalTrades": 60,
        "winningTrades": 39,
        "losingTrades": 21,
        "winRate": 65.0,
        "averagePnl": 141.67,
        "averagePnlPercent": 0.71,
        "profitFactor": 2.1
      }
    ],
    "byAssetType": [
      {
        "assetType": "STOCK",
        "totalPnl": 12000.00,
        "totalPnlPercent": 12.0,
        "totalTrades": 100,
        "winningTrades": 62,
        "losingTrades": 38,
        "winRate": 62.0,
        "averagePnl": 120.00,
        "averagePnlPercent": 1.2,
        "profitFactor": 2.0
      }
    ],
    "byTimeOfDay": [
      {
        "timeOfDay": "MARKET_OPEN",
        "totalPnl": 5000.00,
        "totalPnlPercent": 8.33,
        "totalTrades": 35,
        "winningTrades": 24,
        "losingTrades": 11,
        "winRate": 68.57,
        "averagePnl": 142.86,
        "averagePnlPercent": 1.19,
        "profitFactor": 2.3
      }
    ],
    "byEmotionalState": [
      {
        "emotionalState": "Confident",
        "totalPnl": 8000.00,
        "totalPnlPercent": 10.0,
        "totalTrades": 50,
        "winningTrades": 36,
        "losingTrades": 14,
        "winRate": 72.0,
        "averagePnl": 160.00,
        "averagePnlPercent": 2.0,
        "profitFactor": 2.6
      }
    ],
    "byMarketConditions": [
      {
        "marketConditions": "TRENDING",
        "totalPnl": 10000.00,
        "totalPnlPercent": 11.11,
        "totalTrades": 70,
        "winningTrades": 45,
        "losingTrades": 25,
        "winRate": 64.29,
        "averagePnl": 142.86,
        "averagePnlPercent": 1.59,
        "profitFactor": 2.2
      }
    ],
    "byDayOfWeek": [
      {
        "dayOfWeek": "Monday",
        "totalPnl": 2500.00,
        "totalPnlPercent": 8.33,
        "totalTrades": 20,
        "winningTrades": 13,
        "losingTrades": 7,
        "winRate": 65.0,
        "averagePnl": 125.00,
        "averagePnlPercent": 1.04,
        "profitFactor": 2.1
      }
    ],
    "bySetupType": [
      {
        "setupType": "Breakout",
        "totalPnl": 6000.00,
        "totalPnlPercent": 12.0,
        "totalTrades": 40,
        "winningTrades": 28,
        "losingTrades": 12,
        "winRate": 70.0,
        "averagePnl": 150.00,
        "averagePnlPercent": 3.0,
        "profitFactor": 2.5
      }
    ]
  }
}
```

**Error Responses**:
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Server error

**Notes**:
- If `dimension` is specified, only that dimension's data is returned
- If `dimension` is not specified, all dimensions are returned

---

## Tags

Tag endpoints require authentication.

### List Tags

Get all tags with optional search and usage counts.

**Endpoint**: `GET /api/tags`

**Authentication**: Required

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `search` | string | No | Search tag names (case-insensitive) |

**Example Request**:
```
GET /api/tags?search=momentum
```

**Success Response** (200 OK):
```json
{
  "tags": [
    {
      "id": "tag123",
      "name": "momentum",
      "createdAt": "2024-01-15T10:00:00.000Z",
      "_count": {
        "trades": 25
      }
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Server error

**Notes**:
- Returns top 20 results
- Sorted by usage count (descending), then name (ascending)

---

### Create Tag

Create a new tag.

**Endpoint**: `POST /api/tags`

**Authentication**: Required

**Request Body**:
```json
{
  "name": "momentum"
}
```

**Validation Rules**:
- `name`: 
  - Required
  - 1-50 characters
  - Only letters, numbers, hyphens, and underscores
  - Case-insensitive (converted to lowercase)

**Success Response** (201 Created):
```json
{
  "tag": {
    "id": "tag123",
    "name": "momentum",
    "createdAt": "2024-01-15T10:00:00.000Z"
  },
  "message": "Tag created successfully"
}
```

**Error Responses**:
- `400 Bad Request`: Validation failed
  ```json
  {
    "error": "Validation failed",
    "details": {
      "name": ["Tag name is required"]
    }
  }
  ```
- `409 Conflict`: Tag already exists
  ```json
  {
    "error": "Tag already exists"
  }
  ```
- `401 Unauthorized`: Authentication required
- `500 Internal Server Error`: Server error

**Notes**:
- Tag names are case-insensitive and stored in lowercase
- Creating a tag with the same name (case-insensitive) will return the existing tag

---

## Export

Export endpoints require authentication.

### Export CSV

Export all trades as CSV file.

**Endpoint**: `GET /api/export/csv`

**Authentication**: Required

**Success Response** (200 OK):

**Headers**:
- `Content-Type`: `text/csv; charset=utf-8`
- `Content-Disposition`: `attachment; filename="trades-2024-01-15.csv"`
- `Cache-Control`: `no-store`

**Response Body**: CSV file content

**CSV Columns**:
- Symbol
- Asset Type
- Currency
- Entry Date
- Entry Price
- Exit Date
- Exit Price
- Quantity
- Direction
- Setup Type
- Strategy Name
- Stop Loss
- Take Profit
- Fees
- Time of Day
- Market Conditions
- Emotional State Entry
- Emotional State Exit
- Notes
- Tags (comma-separated)
- P&L
- P&L %
- Net P&L
- Entry Value
- Exit Value
- Holding Period (hours)
- Holding Period (days)
- Is Winner
- Is Loser
- Is Breakeven

**Error Responses**:
- `401 Unauthorized`: Authentication required
  ```json
  {
    "error": "Authentication required"
  }
  ```
- `500 Internal Server Error`: Server error

**Notes**:
- CSV includes BOM (Byte Order Mark) for Excel compatibility
- Filename includes current date
- All trades for authenticated user are included

---

## Error Responses

All endpoints follow consistent error response formats.

### Standard Error Format

```json
{
  "error": "Error message",
  "details": {
    // Optional: Field-specific validation errors
    "fieldName": ["Error message 1", "Error message 2"]
  }
}
```

### HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `307 Temporary Redirect`: Redirect response (logout)
- `400 Bad Request`: Validation failed or invalid request
- `401 Unauthorized`: Authentication required or invalid credentials
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists (e.g., duplicate email)
- `500 Internal Server Error`: Server error

---

## Authentication Methods

### Cookie-Based Authentication

The application uses JWT tokens stored in httpOnly cookies for authentication.

**How It Works**:
1. User registers or logs in via `/api/auth/register` or `/api/auth/login`
2. Server sets an httpOnly cookie containing the JWT token
3. Browser automatically includes the cookie in subsequent requests
4. Server validates the JWT token on protected endpoints

**Cookie Properties**:
- `httpOnly`: true (not accessible via JavaScript)
- `secure`: true in production (HTTPS only)
- `sameSite`: 'lax'
- `maxAge`: Based on `JWT_EXPIRES_IN` environment variable (default: 7 days)

**Authentication Header**:
- Not required for browser-based requests (cookie is automatically sent)
- For API clients: Set `Cookie` header with the authentication cookie value

---

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

---

## CORS

CORS is handled by Next.js. The application is designed for same-origin requests. For cross-origin access, configure CORS headers in `next.config.ts`.

---

## Date/Time Formats

All dates are in ISO 8601 format:
- `2024-01-15T10:00:00.000Z`
- Dates can be sent as strings and will be parsed
- All dates are stored in UTC in the database
- Client should handle timezone conversions for display

---

## Pagination

List endpoints support pagination via `limit` and `offset` query parameters:

- `limit`: Number of results per page (default: 50, max: 100)
- `offset`: Number of results to skip (default: 0)

**Example**:
```
GET /api/trades?limit=25&offset=50
```

Returns results 51-75 (third page with 25 items per page).

---

## Additional Resources

- [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) - Environment variable reference
- [README.md](../README.md) - Project setup and overview
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database configuration

---

**Last Updated**: Complete API endpoint documentation

