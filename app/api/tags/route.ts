import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import prisma from '@/lib/db';

/**
 * GET /api/tags
 * Get all tags with optional search filter and usage counts
 */
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {};

    if (search) {
      where.name = {
        contains: search.toLowerCase(),
        mode: 'insensitive',
      };
    }

    // Fetch tags with usage counts
    const tags = await prisma.tag.findMany({
      where,
      include: {
        _count: {
          select: {
            trades: true,
          },
        },
      },
      orderBy: [
        {
          trades: {
            _count: 'desc',
          },
        },
        {
          name: 'asc',
        },
      ],
      take: 20, // Limit to top 20 results
    });

    return NextResponse.json({
      tags,
    });
  } catch (error) {
    console.error('Get tags error:', error);

    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json(
          {
            error: 'Authentication required',
          },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch tags',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tags
 * Create a new tag
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    await requireAuth();

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        {
          error: 'Tag name is required',
        },
        { status: 400 }
      );
    }

    const tagName = name.trim().toLowerCase();

    // Validate tag name
    if (!/^[a-zA-Z0-9-_]+$/.test(tagName)) {
      return NextResponse.json(
        {
          error: 'Tag name can only contain letters, numbers, hyphens, and underscores',
        },
        { status: 400 }
      );
    }

    if (tagName.length < 2 || tagName.length > 50) {
      return NextResponse.json(
        {
          error: 'Tag name must be between 2 and 50 characters',
        },
        { status: 400 }
      );
    }

    // Check if tag already exists
    const existingTag = await prisma.tag.findUnique({
      where: { name: tagName },
    });

    if (existingTag) {
      return NextResponse.json(
        {
          tag: existingTag,
          message: 'Tag already exists',
        },
        { status: 200 }
      );
    }

    // Create new tag
    const tag = await prisma.tag.create({
      data: {
        name: tagName,
      },
    });

    return NextResponse.json(
      {
        tag,
        message: 'Tag created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create tag error:', error);

    if (error instanceof Error) {
      if (error.message === 'Authentication required') {
        return NextResponse.json(
          {
            error: 'Authentication required',
          },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to create tag',
      },
      { status: 500 }
    );
  }
}

