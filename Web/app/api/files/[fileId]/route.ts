import { NextRequest, NextResponse } from 'next/server';
import { getUser } from '@/lib/db/queries';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const { fileId } = resolvedParams;

    if (!fileId) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    // Find file in uploads directory
    const uploadDir = join(process.cwd(), 'uploads');
    const files = await readdir(uploadDir).catch(() => []);
    
    const fileName = files.find(f => f.startsWith(fileId));
    if (!fileName) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const filePath = join(uploadDir, fileName);
    
    try {
      const fileBuffer = await readFile(filePath);
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      
      // Set appropriate content type
      const contentTypes: { [key: string]: string } = {
        'pdf': 'application/pdf',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      };
      
      const contentType = contentTypes[fileExtension || ''] || 'application/octet-stream';
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
      });
    } catch (error) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

  } catch (error) {
    console.error('File access error:', error);
    return NextResponse.json({ 
      error: 'Failed to access file' 
    }, { status: 500 });
  }
}

async function readdir(path: string): Promise<string[]> {
  const { readdir } = await import('fs/promises');
  return readdir(path);
}