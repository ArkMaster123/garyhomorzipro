import { auth } from '@/app/(auth)/auth';
import { getUserPersona, updateUserPersona } from '@/lib/db/queries';
import { personas, type PersonaType } from '@/lib/ai/personas';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ persona: 'default' });
    }

    const persona = await getUserPersona(session.user.id);
    return NextResponse.json({ persona });
  } catch (error) {
    console.error('Error getting persona:', error);
    return NextResponse.json({ persona: 'default' });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { persona } = await request.json();

    // Validate persona
    if (!persona || !personas[persona as PersonaType]) {
      return NextResponse.json(
        { error: 'Invalid persona' },
        { status: 400 }
      );
    }

    await updateUserPersona(session.user.id, persona);
    
    return NextResponse.json({ success: true, persona });
  } catch (error) {
    console.error('Error updating persona:', error);
    return NextResponse.json(
      { error: 'Failed to update persona' },
      { status: 500 }
    );
  }
}
