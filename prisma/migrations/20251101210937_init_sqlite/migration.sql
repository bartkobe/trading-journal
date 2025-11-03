-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "trades" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "assetType" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "entryDate" DATETIME NOT NULL,
    "entryPrice" REAL NOT NULL,
    "exitDate" DATETIME NOT NULL,
    "exitPrice" REAL NOT NULL,
    "quantity" REAL NOT NULL,
    "direction" TEXT NOT NULL,
    "setupType" TEXT,
    "strategyName" TEXT,
    "stopLoss" REAL,
    "takeProfit" REAL,
    "riskRewardRatio" REAL,
    "actualRiskReward" REAL,
    "fees" REAL DEFAULT 0,
    "timeOfDay" TEXT,
    "marketConditions" TEXT,
    "emotionalStateEntry" TEXT,
    "emotionalStateExit" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "trades_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "screenshots" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tradeId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "screenshots_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "trades" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "trade_tags" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tradeId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "trade_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "trade_tags_tradeId_fkey" FOREIGN KEY ("tradeId") REFERENCES "trades" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "trades_userId_idx" ON "trades"("userId");

-- CreateIndex
CREATE INDEX "trades_symbol_idx" ON "trades"("symbol");

-- CreateIndex
CREATE INDEX "trades_assetType_idx" ON "trades"("assetType");

-- CreateIndex
CREATE INDEX "trades_entryDate_idx" ON "trades"("entryDate");

-- CreateIndex
CREATE INDEX "trades_strategyName_idx" ON "trades"("strategyName");

-- CreateIndex
CREATE INDEX "screenshots_tradeId_idx" ON "screenshots"("tradeId");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE INDEX "trade_tags_tradeId_idx" ON "trade_tags"("tradeId");

-- CreateIndex
CREATE INDEX "trade_tags_tagId_idx" ON "trade_tags"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "trade_tags_tradeId_tagId_key" ON "trade_tags"("tradeId", "tagId");
