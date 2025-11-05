import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/db';
import { enrichTradesWithCalculations } from '@/lib/trades';
import { tradesToCsv, generateCsvFilename } from '@/lib/export';
import { getApiTranslations } from '@/lib/api-translations';

/**
 * GET /api/export/csv
 * Export all trades for the authenticated user as CSV
 */
export async function GET(request: NextRequest) {
  const t = await getApiTranslations(request, 'errors');
  
  try {
    const user = await requireAuth();

    // Fetch all trades for the user with relations needed for CSV (tags)
    const trades = await prisma.trade.findMany({
      where: { userId: user.id },
      include: {
        screenshots: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
      orderBy: { entryDate: 'asc' },
    });

    const enriched = enrichTradesWithCalculations(trades as any);
    const csv = tradesToCsv(enriched, { includeBom: true });
    const filename = generateCsvFilename({ prefix: 'trades' });

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Export CSV error:', error);

    if (error instanceof Error && error.message === 'Authentication required') {
      return new Response(JSON.stringify({ error: t('authenticationRequired') }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: t('failedToExportCsv') }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}


