import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

const JUDGE_AUTH_DOMAIN = process.env.JUDGE_AUTH_DOMAIN || "judge.hu.local";

export async function updateSession(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const url = request.nextUrl.clone();
  
  if (user) {
    const isJudge = user.email?.endsWith(`@${JUDGE_AUTH_DOMAIN}`);
    
    // Protect organizer routes
    if (url.pathname.startsWith('/organizer') && !url.pathname.startsWith('/organizer/login') && !url.pathname.startsWith('/organizer/signup') && !url.pathname.startsWith('/organizer/auth')) {
      if (isJudge) {
        url.pathname = '/';
        return NextResponse.redirect(url);
      }
    }
    
    // Protect judge routes
    if (url.pathname.startsWith('/judge') && !url.pathname.startsWith('/judge/login')) {
      if (!isJudge) {
        url.pathname = '/';
        return NextResponse.redirect(url);
      }
    }
  } else {
    // Basic redirect for unauthenticated users
    if (url.pathname.startsWith('/organizer') && !url.pathname.startsWith('/organizer/login') && !url.pathname.startsWith('/organizer/signup') && !url.pathname.startsWith('/organizer/auth')) {
      url.pathname = '/organizer/login';
      return NextResponse.redirect(url);
    }
    if (url.pathname.startsWith('/judge') && !url.pathname.startsWith('/judge/login')) {
      url.pathname = '/judge/login';
      return NextResponse.redirect(url);
    }
  }

  return response;
}
