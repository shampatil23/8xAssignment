import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with user credentials
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'djaieji0g',
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '625284495946884',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'Z3cIz5CO9OaGW3AQY9hCqjsBhf8',
  secure: true,
});

export async function POST(req: NextRequest) {
  try {
    const { publicId } = await req.json();
    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'publicId is required' },
        { status: 400 },
      );
    }

    const result = await cloudinary.uploader.destroy(publicId);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('[API /api/cloudinary/delete] error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete from Cloudinary' },
      { status: 500 },
    );
  }
}
