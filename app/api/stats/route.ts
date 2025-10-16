import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Resource from '@/models/Resource';
import Feedback from '@/models/Feedback';

export async function GET() {
  try {
    await connectDB();

    const [totalUsers, totalResources, totalFeedback, resourcesByType, avgRatings] = await Promise.all([
      User.countDocuments(),
      Resource.countDocuments(),
      Feedback.countDocuments(),
      Resource.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
      Feedback.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating' } } },
      ]),
    ]);

    const recentActivity = await Feedback.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name')
      .populate('resourceId', 'name');

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalResources,
        totalFeedback,
        resourcesByType,
        avgRating: avgRatings[0]?.avgRating || 0,
        recentActivity,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
