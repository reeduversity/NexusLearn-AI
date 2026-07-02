import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function GET() {
  try {
    const hash = await bcrypt.hash('test', 10);
    const uuid = crypto.randomUUID();
    
    let dbStatus = 'not queried';
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'connected';
    } catch (e: any) {
      dbStatus = e.message;
    }

    return NextResponse.json({ 
      status: 'ok', 
      db: dbStatus,
      hash_test: !!hash,
      uuid_test: !!uuid,
      env: {
        DATABASE_URL: !!process.env.DATABASE_URL,
        DIRECT_URL: !!process.env.DIRECT_URL,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ 
      status: 'crash', 
      message: error.message,
      name: error.name,
      stack: error.stack
    }, { status: 500 });
  }
}
