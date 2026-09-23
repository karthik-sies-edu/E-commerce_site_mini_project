import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, fullName } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'All fields (Full Name, Email, Password) are required' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email address already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user in PostgreSQL
    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        fullName: fullName.trim(),
        role: Role.USER,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Account created successfully',
        user: newUser,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'An internal error occurred while creating your account' },
      { status: 500 }
    );
  }
}
