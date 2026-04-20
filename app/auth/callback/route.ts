// ✅ OAuth Callback Handler
// This route handles the redirect from Supabase OAuth providers (Google, GitHub)

import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(
      new URL('/auth/login?error=No+authorization+code', request.url)
    );
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  // Exchange the auth code for a session — this sets the session cookie
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('❌ OAuth exchange error:', error);
    return NextResponse.redirect(
      new URL(
        `/auth/login?error=${encodeURIComponent(error.message)}`,
        request.url
      )
    );
  }

  // Ensure user profile exists
  if (data.user) {
    try {
      const { data: existingProfile } = await supabase
        .from('users')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (!existingProfile) {
        const fullName =
          data.user.user_metadata?.full_name ||
          data.user.email?.split('@')[0] ||
          'OAuth User';

        await supabase.from('users').insert([
          {
            id: data.user.id,
            email: data.user.email,
            full_name: fullName,
            role: 'customer',
            avatar_url: data.user.user_metadata?.avatar_url || '',
          },
        ]);
      }
    } catch {
      // Profile creation failure should not block login
    }
  }

  // Redirect to home after successful login
  return NextResponse.redirect(new URL('/', request.url));
}


      if (error) {
        console.error('❌ OAuth exchange error:', error);
        return NextResponse.redirect(
          new URL(
            `/auth/login?error=${encodeURIComponent(error.message)}`,
            request.url
          )
        );
      }

      if (data.user) {
        console.log('✅ OAuth successful, user:', data.user.email);

        // ✅ Check if user profile exists
        try {
          const { data: existingProfile } = await supabase
            .from('users')
            .select('id')
            .eq('id', data.user.id)
            .single();

          // If profile doesn't exist, create one
          if (!existingProfile) {
            console.log('📊 Creating profile for OAuth user...');

            // Get name from OAuth provider metadata
            const fullName = data.user.user_metadata?.full_name || 
                           data.user.email?.split('@')[0] || 
                           'OAuth User';

            const { error: profileError } = await supabase
              .from('users')
              .insert([
                {
                  id: data.user.id,
                  email: data.user.email,
                  full_name: fullName,
                  role: 'customer',
                  avatar_url: data.user.user_metadata?.avatar_url || '',
                },
              ]);

            if (profileError) {
              console.error('⚠️ Could not create profile:', profileError);
              // Continue anyway - user is authenticated
            } else {
              console.log('✅ OAuth user profile created');
            }
          } else {
            console.log('✅ OAuth user profile already exists');
          }
        } catch (profileErr) {
          console.warn('⚠️ Profile check error:', profileErr);
        }
      }

      // Redirect to home page
      return NextResponse.redirect(new URL('/', request.url));
    } catch (err) {
      console.error('❌ OAuth callback error:', err);
      return NextResponse.redirect(
        new URL(
          `/auth/login?error=${encodeURIComponent('OAuth authentication failed')}`,
          request.url
        )
      );
    }
  }

  // No code provided
  return NextResponse.redirect(
    new URL('/auth/login?error=No authorization code', request.url)
  );
}
