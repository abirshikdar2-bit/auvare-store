import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const MASTER_SUPER_ADMIN_EMAIL = 'abirshikdar2@gmail.com';

// 1. GET: Fetch all admin users and pending access requests
export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('auth_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Admin Users GET] Supabase error:', error);
      throw error;
    }

    return NextResponse.json(
      { success: true, users: data || [] },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 2. POST: Register new user or verify existing user profile on Google OAuth login
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, displayName, avatarUrl } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const isMasterOwner = cleanEmail === MASTER_SUPER_ADMIN_EMAIL;

    const supabase = await createClient();

    // Query existing profile
    const { data: existing, error: queryErr } = await supabase
      .from('auth_users')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (queryErr) {
      console.warn('[Admin Users POST] query error:', queryErr);
    }

    const nowIso = new Date().toISOString();

    if (existing) {
      // If master owner, strictly guarantee super_admin & approved
      const targetRole = isMasterOwner ? 'super_admin' : existing.role;
      const targetStatus = isMasterOwner ? 'approved' : existing.status;

      const { data: updated, error: updErr } = await supabase
        .from('auth_users')
        .update({
          last_sign_in_at: nowIso,
          avatar_url: avatarUrl || existing.avatar_url,
          display_name: existing.display_name || displayName || cleanEmail.split('@')[0],
          role: targetRole,
          status: targetStatus,
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (updErr) {
        console.warn('[Admin Users POST] update error:', updErr);
      }

      return NextResponse.json({
        success: true,
        profile: updated || {
          ...existing,
          role: targetRole,
          status: targetStatus,
        },
      });
    }

    // New User Registration
    const newProfile = {
      email: cleanEmail,
      display_name: displayName || cleanEmail.split('@')[0],
      avatar_url: avatarUrl || '',
      role: isMasterOwner ? 'super_admin' : 'admin',
      status: isMasterOwner ? 'approved' : 'pending',
      request_note: isMasterOwner ? 'Master Owner' : 'Requested admin portal access via Google OAuth',
      last_sign_in_at: nowIso,
    };

    const { data: inserted, error: insErr } = await supabase
      .from('auth_users')
      .insert([newProfile])
      .select()
      .single();

    if (insErr) {
      console.warn('[Admin Users POST] insert error:', insErr);
      throw insErr;
    }

    return NextResponse.json({
      success: true,
      profile: inserted,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 3. PATCH: Super Admin approval, rejection, or edit of user profile and permissions
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, role, display_name } = body;

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Check target user to protect Master Owner
    const { data: targetUser } = await supabase
      .from('auth_users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (targetUser && targetUser.email.toLowerCase().trim() === MASTER_SUPER_ADMIN_EMAIL) {
      if (status && status !== 'approved') {
        return NextResponse.json({ error: 'Cannot modify or block Master Super Admin account' }, { status: 403 });
      }
    }

    const updatePayload: Record<string, any> = {};
    if (status) updatePayload.status = status;
    if (role) updatePayload.role = role;
    if (display_name !== undefined) updatePayload.display_name = display_name;

    const { data, error } = await supabase
      .from('auth_users')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.warn('[Admin Users PATCH] update error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      user: data,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// 4. PUT: Re-apply for access after rejection
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const supabase = await createClient();

    const { data: existing } = await supabase
      .from('auth_users')
      .select('*')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (existing.status === 'blocked') {
      return NextResponse.json({ error: 'BLOCKED_USER', message: 'Account is permanently restricted.' }, { status: 403 });
    }

    const { data: updated, error } = await supabase
      .from('auth_users')
      .update({
        status: 'pending',
        request_note: 'Re-applied for admin access after previous review',
        last_sign_in_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      profile: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

