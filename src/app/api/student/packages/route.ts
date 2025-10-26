import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/student/packages - Get student's packages
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a student
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json(
        { error: 'Only students can view packages' },
        { status: 403 }
      );
    }

    // Get all packages for the student
    const packages = await prisma.package.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        validUntil: 'desc',
      },
    });

    return NextResponse.json({ packages });
  } catch (error) {
    console.error('Error fetching student packages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packages' },
      { status: 500 }
    );
  }
}