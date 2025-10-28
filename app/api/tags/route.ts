import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/db';

/**
 * GET /api/tags
 * Get all tags with optional search
 */
export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const where: any = {};

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const tags = await prisma.tag.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
      include: {
        _count: {
          select: {
            trades: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      tags,
    });
  } catch (error) {
    console.error('Get tags error:', error);

    if (error instanceof Error && error.message === 'Authentication required') {
      return NextResponse.json(
        {
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch tags',
      },
      { status: 500 }
    );
  }
}

