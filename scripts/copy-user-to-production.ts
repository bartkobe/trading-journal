/**
 * Script to copy a user and all their trades from local database to production database
 * 
 * This script will:
 * - Fetch user demo@demo.com from local database (DATABASE_URL)
 * - Copy user to production database (DATABASE_URL_PROD)
 * - Copy all trades, screenshots, and tags associated with the user
 * - Preserve all relationships and data integrity
 * 
 * Usage:
 *   1. Set environment variables in .env file or export them:
 *      DATABASE_URL="postgresql://user:pass@localhost:5432/local_db"
 *      DATABASE_URL_PROD="postgresql://user:pass@host:5432/prod_db"
 * 
 *   2. Run the script:
 *      npx tsx scripts/copy-user-to-production.ts
 * 
 * Or run with inline environment variables:
 *   DATABASE_URL="local-connection-string" \
 *   DATABASE_URL_PROD="production-connection-string" \
 *   npx tsx scripts/copy-user-to-production.ts
 * 
 * Notes:
 * - If user already exists in production, trades will be assigned to existing user
 * - Duplicate trades (same symbol, entryDate, entryPrice) will be skipped
 * - User password hash is preserved (no re-hashing needed)
 */

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const LOCAL_EMAIL = 'demo@demo.com';

async function main() {
  // Validate environment variables
  const localDbUrl = process.env.DATABASE_URL;
  const prodDbUrl = process.env.DATABASE_URL_PROD;

  if (!localDbUrl) {
    console.error('❌ ERROR: DATABASE_URL environment variable is not set');
    console.error('   Please set DATABASE_URL to your local database connection string');
    process.exit(1);
  }

  if (!prodDbUrl) {
    console.error('❌ ERROR: DATABASE_URL_PROD environment variable is not set');
    console.error('   Please set DATABASE_URL_PROD to your production database connection string');
    console.error('   Example: DATABASE_URL_PROD="postgresql://user:pass@host:port/db"');
    process.exit(1);
  }

  console.log('🚀 Starting user migration from local to production...');
  console.log(`📧 Source user: ${LOCAL_EMAIL}`);
  console.log('');

  // Create Prisma clients for both databases
  const localPrisma = new PrismaClient({
    datasources: {
      db: {
        url: localDbUrl,
      },
    },
  });

  const prodPrisma = new PrismaClient({
    datasources: {
      db: {
        url: prodDbUrl,
      },
    },
  });

  try {
    // Step 1: Fetch user from local database
    console.log('📥 Fetching user from local database...');
    const localUser = await localPrisma.user.findUnique({
      where: { email: LOCAL_EMAIL },
      include: {
        trades: {
          include: {
            screenshots: true,
            tags: {
              include: {
                tag: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!localUser) {
      console.error(`❌ ERROR: User with email ${LOCAL_EMAIL} not found in local database`);
      process.exit(1);
    }

    console.log(`✅ Found user: ${localUser.email} (${localUser.name || 'No name'})`);
    console.log(`   User ID: ${localUser.id}`);
    console.log(`   Trades: ${localUser.trades.length}`);
    console.log('');

    // Step 2: Check if user already exists in production
    console.log('🔍 Checking if user exists in production database...');
    const existingProdUser = await prodPrisma.user.findUnique({
      where: { email: LOCAL_EMAIL },
    });

    if (existingProdUser) {
      console.log(`⚠️  WARNING: User ${LOCAL_EMAIL} already exists in production database`);
      console.log(`   Existing user ID: ${existingProdUser.id}`);
      console.log('');
      console.log('   Options:');
      console.log('   1. Delete existing user and all their data, then copy from local');
      console.log('   2. Skip user creation but copy trades (assigning to existing user)');
      console.log('   3. Cancel and exit');
      console.log('');
      console.log('   Since this is a script, we will SKIP user creation and copy trades to existing user.');
      console.log('   If you want to replace the user, delete them first manually.');
      console.log('');
    }

    // Step 3: Create or get user in production
    let prodUserId: string;
    if (existingProdUser) {
      prodUserId = existingProdUser.id;
      console.log(`✅ Using existing user in production: ${prodUserId}`);
    } else {
      console.log('📤 Creating user in production database...');
      const newProdUser = await prodPrisma.user.create({
        data: {
          email: localUser.email,
          password: localUser.password, // Keep the hashed password
          name: localUser.name,
          // Note: We preserve createdAt and updatedAt from local
          createdAt: localUser.createdAt,
        },
      });
      prodUserId = newProdUser.id;
      console.log(`✅ Created user in production: ${prodUserId}`);
    }
    console.log('');

    // Step 4: Copy trades
    if (localUser.trades.length === 0) {
      console.log('ℹ️  No trades to copy.');
    } else {
      console.log(`📤 Copying ${localUser.trades.length} trades to production...`);
      
      let tradesCopied = 0;
      let tradesSkipped = 0;
      let screenshotsCopied = 0;
      let tagsCreated = 0;
      let tradeTagsCreated = 0;

      for (const localTrade of localUser.trades) {
        try {
          // Check if trade already exists (by checking if we have a trade with same symbol, entryDate, and entryPrice)
          // Note: This is a simple check - you might want to use a unique identifier if available
          const existingTrade = await prodPrisma.trade.findFirst({
            where: {
              userId: prodUserId,
              symbol: localTrade.symbol,
              entryDate: localTrade.entryDate,
              entryPrice: localTrade.entryPrice,
            },
          });

          if (existingTrade) {
            console.log(`   ⏭️  Skipping duplicate trade: ${localTrade.symbol} on ${localTrade.entryDate.toISOString()}`);
            tradesSkipped++;
            continue;
          }

          // Collect all unique tag names from this trade
          const tagNames = localTrade.tags.map(tt => tt.tag.name);
          
          // Ensure all tags exist in production (create if needed)
          const tagIdMap = new Map<string, string>();
          for (const tagName of tagNames) {
            let prodTag = await prodPrisma.tag.findUnique({
              where: { name: tagName },
            });
            
            if (!prodTag) {
              prodTag = await prodPrisma.tag.create({
                data: { name: tagName },
              });
              tagsCreated++;
            }
            
            tagIdMap.set(tagName, prodTag.id);
          }

          // Create the trade in production
          const prodTrade = await prodPrisma.trade.create({
            data: {
              userId: prodUserId,
              symbol: localTrade.symbol,
              assetType: localTrade.assetType,
              currency: localTrade.currency,
              entryDate: localTrade.entryDate,
              entryPrice: localTrade.entryPrice,
              exitDate: localTrade.exitDate,
              exitPrice: localTrade.exitPrice,
              quantity: localTrade.quantity,
              direction: localTrade.direction,
              setupType: localTrade.setupType,
              strategyName: localTrade.strategyName,
              stopLoss: localTrade.stopLoss,
              takeProfit: localTrade.takeProfit,
              riskRewardRatio: localTrade.riskRewardRatio,
              actualRiskReward: localTrade.actualRiskReward,
              fees: localTrade.fees,
              timeOfDay: localTrade.timeOfDay,
              marketConditions: localTrade.marketConditions,
              emotionalStateEntry: localTrade.emotionalStateEntry,
              emotionalStateExit: localTrade.emotionalStateExit,
              notes: localTrade.notes,
              createdAt: localTrade.createdAt,
            },
          });

          tradesCopied++;

          // Copy screenshots
          if (localTrade.screenshots.length > 0) {
            await prodPrisma.screenshot.createMany({
              data: localTrade.screenshots.map(screenshot => ({
                tradeId: prodTrade.id,
                url: screenshot.url,
                filename: screenshot.filename,
                fileSize: screenshot.fileSize,
                mimeType: screenshot.mimeType,
                uploadedAt: screenshot.uploadedAt,
              })),
            });
            screenshotsCopied += localTrade.screenshots.length;
          }

          // Create trade-tag relationships
          if (localTrade.tags.length > 0) {
            await prodPrisma.tradeTag.createMany({
              data: localTrade.tags.map(tradeTag => ({
                tradeId: prodTrade.id,
                tagId: tagIdMap.get(tradeTag.tag.name)!,
              })),
              skipDuplicates: true,
            });
            tradeTagsCreated += localTrade.tags.length;
          }

          if (tradesCopied % 10 === 0) {
            console.log(`   📊 Progress: ${tradesCopied}/${localUser.trades.length} trades copied...`);
          }
        } catch (error) {
          console.error(`   ❌ Error copying trade ${localTrade.id}:`, error);
          // Continue with next trade
        }
      }

      console.log('');
      console.log('✅ Migration completed!');
      console.log('');
      console.log('📊 Summary:');
      console.log(`   ✅ Trades copied: ${tradesCopied}`);
      if (tradesSkipped > 0) {
        console.log(`   ⏭️  Trades skipped (duplicates): ${tradesSkipped}`);
      }
      console.log(`   📷 Screenshots copied: ${screenshotsCopied}`);
      console.log(`   🏷️  Tags created: ${tagsCreated}`);
      console.log(`   🔗 Trade-tag relationships created: ${tradeTagsCreated}`);
    }

    console.log('');
    console.log('🎉 User migration completed successfully!');
  } catch (error) {
    console.error('❌ ERROR during migration:', error);
    process.exit(1);
  } finally {
    // Disconnect from both databases
    await localPrisma.$disconnect();
    await prodPrisma.$disconnect();
  }
}

// Run the script
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

