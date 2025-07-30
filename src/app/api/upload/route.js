import { NextResponse } from 'next/server';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import R2 from '@/lib/r2';

export async function POST(request) {
    try {
        const { filename, contentType } = await request.json();
        const uniqueFilename = `${crypto.randomUUID()}-${filename}`;
        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: uniqueFilename,
            ContentType: contentType,
        });
        const uploadUrl = await getSignedUrl(R2, command, { expiresIn: 600 });
        const publicFileUrl = `${process.env.R2_PUBLIC_URL}/${uniqueFilename}`;
        return NextResponse.json({ uploadUrl, publicFileUrl });
    } catch (error) {
        console.error("Error creating presigned URL:", error);
        return NextResponse.json({ message: "Gagal membuat URL upload." }, { status: 500 });
    }
}