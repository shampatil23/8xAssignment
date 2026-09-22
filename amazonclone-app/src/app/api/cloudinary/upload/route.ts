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
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'products';

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<{
      public_id: string;
      secure_url: string;
      url: string;
      width: number;
      height: number;
      format: string;
      bytes: number;
    }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `amazon_clone/${folder}`,
          resource_type: 'image',
        },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error('Upload to Cloudinary failed'));
          } else {
            resolve(result as any);
          }
        },
      );

      uploadStream.end(buffer);
    });

    return NextResponse.json({
      success: true,
      data: {
        publicId: uploadResult.public_id,
        url: uploadResult.url,
        secureUrl: uploadResult.secure_url,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
        bytes: uploadResult.bytes,
      },
    });
  } catch (error: any) {
    console.error('[API /api/cloudinary/upload] error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to upload image to Cloudinary',
      },
      { status: 500 },
    );
  }
}
