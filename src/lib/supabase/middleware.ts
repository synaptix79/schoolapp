import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

import { getRoleRoute, type Role } from '@/lib/auth';

type CookieOptions = {
  domain?: string;
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  path?: string;
  priority?: 'low' | 'medium' | 'high';
  sameSite?: boolean | 'lax' | 'strict' | 'none';
  secure?: boolean;
};

const protectedPrefixes = ['/admin', '/profesor', '/padre', '/alumno', '/dashboard'];
const rolePrefixes: Record<Role, string[]> = {
  admin: ['/admin'],
  profesor: ['/profesor'],
  padre_encargado: ['/padre'],
  padre: ['/alumno', '/padre']
};

export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options, maxAge: 0 });
        }
      }
    }
  );

  const {
    data: { user }
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (pathname === '/login') {
    if (!user) {
      return response;
    }

    const profile = await getUserProfile(supabase, user.id);
    if (!profile) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.redirect(new URL(getRoleRoute(profile.rol), request.url));
  }

  if (protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const profile = await getUserProfile(supabase, user.id);
    if (!profile || !profile.activo) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const allowedPrefixes = rolePrefixes[profile.rol];
    if (pathname !== '/dashboard' && !allowedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
      return NextResponse.redirect(new URL(allowedPrefixes[0], request.url));
    }
  }

  return response;
}

async function getUserProfile(supabase: ReturnType<typeof createServerClient>, userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('rol, activo')
    .eq('id', userId)
    .maybeSingle();

  return data as { rol: Role; activo: boolean } | null;
}
