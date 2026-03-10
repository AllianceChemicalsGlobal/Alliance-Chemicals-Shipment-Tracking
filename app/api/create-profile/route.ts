import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      user_id?: string;
      email?: string;
      full_name?: string;
      role?: 'procurement_officer' | 'supply_chain';
    };

    const { user_id, email, full_name, role } = body;

    if (!user_id || !email || !full_name || !role) {
      return NextResponse.json(
        { error: 'user_id, email, full_name and role are required' },
        { status: 400 }
      );
    }

    if (role !== 'procurement_officer' && role !== 'supply_chain') {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Verify user exists in auth
    const {
      data: { user },
      error: userError,
    } = await supabaseAdmin.auth.admin.getUserById(user_id);

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.email !== email) {
      return NextResponse.json({ error: 'Email mismatch' }, { status: 403 });
    }

    const { error: insertError } = await supabaseAdmin.from('profiles').upsert(
      { id: user_id, email, full_name, role },
      { onConflict: 'id' }
    );

    if (insertError) {
      console.error('Profile insert error:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('create-profile error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
