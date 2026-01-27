import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Beskytt dashboard
  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Redirect innloggede brukere
  if (user && (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register")) {
    // Sjekk om bruker har school_id
    const { data: userData } = await supabase
      .from("users")
      .select("school_id")
      .eq("id", user.id)
      .single();

    const url = request.nextUrl.clone();
    if (!userData?.school_id) {
      url.pathname = "/setup-school";
    } else {
      url.pathname = "/dashboard";
    }
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
