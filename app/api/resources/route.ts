import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Resource from '@/models/Resource';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const language = searchParams.get('language');
    const minRating = searchParams.get('minRating');

    let query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    if (type) {
      query.type = type;
    }

    if (language) {
      query.languages = language;
    }

    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    const resources = await Resource.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: resources });
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

    if (!body.name || !body.type || !body.location) {
      return NextResponse.json(
        { success: false, error: 'name, type, and location are required' },
        { status: 400 }
      );
    }

    const resource = await Resource.create(body);

    return NextResponse.json({ success: true, data: resource }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
