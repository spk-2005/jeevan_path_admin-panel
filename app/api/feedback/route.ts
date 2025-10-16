import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Feedback from '@/models/Feedback';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const resourceId = searchParams.get('resourceId');
    const minRating = searchParams.get('minRating');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    let query: any = {};

    if (userId) {
      query.userId = userId;
    }

    if (resourceId) {
      query.resourceId = resourceId;
    }

    if (minRating) {
      query.rating = { $gte: parseInt(minRating) };
    }

    const feedback = await Feedback.find(query)
      .populate('userId', 'name phone firebaseUid')
      .populate('resourceId', 'name type address')
      .sort({ [sortBy]: sortOrder });

    return NextResponse.json({ success: true, data: feedback });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    if (!body.userId || !body.resourceId || !body.rating) {
      return NextResponse.json(
        { success: false, error: 'userId, resourceId, and rating are required' },
        { status: 400 }
      );
    }

    if (body.rating < 1 || body.rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    const feedback = await Feedback.create(body);

    return NextResponse.json({ success: true, data: feedback }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
