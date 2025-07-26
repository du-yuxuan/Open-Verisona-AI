import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type and size
    const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Allowed types: ' + allowedTypes.join(', ') 
      }, { status: 400 });
    }
    
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size: 5MB' 
      }, { status: 400 });
    }

    // Generate unique filename
    const fileId = uuidv4();
    const fileName = `${fileId}${fileExtension}`;
    
    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    // Save file
    const filePath = join(uploadDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    await writeFile(filePath, buffer);
    
    console.log('File saved:', filePath, 'Size:', buffer.length, 'bytes');

    // Return file information
    const fileInfo = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      url: `/api/files/${fileId}`,
      uploadedAt: new Date().toISOString(),
      userId: user.id
    };

    return NextResponse.json({
      success: true,
      file: fileInfo
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ 
      error: 'Failed to upload file' 
    }, { status: 500 });
  }
}