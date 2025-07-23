import { NextResponse } from 'next/server';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { R2 } from '@/lib/r2'; 

const BUCKET_NAME = process.env.R2_BUCKET_NAME;
const PUBLIC_URL = process.env.R2_PUBLIC_URL;

export async function POST(request) {
    try {
        const { filename, contentType } = await request.json();

        if (!filename || !contentType) {
            return NextResponse.json({ error: 'Nama file dan tipe konten diperlukan.' }, { status: 400 });
        }

        const uniqueFilename = `${randomUUID()}-${filename}`;

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: uniqueFilename,
            ContentType: contentType,
        });

        const uploadUrl = await getSignedUrl(R2, command, { expiresIn: 600 });
        const publicFileUrl = `${PUBLIC_URL}/${uniqueFilename}`;

        return NextResponse.json({ uploadUrl, publicFileUrl });

    } catch (error) {
        console.error('Error creating pre-signed URL:', error);
        return NextResponse.json({ error: 'Gagal membuat URL upload.' }, { status: 500 });
    }
}