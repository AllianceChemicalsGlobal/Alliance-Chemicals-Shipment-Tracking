'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { ProtectedRoute } from '@/components/protected-route';
import { supabase, Profile } from '@/lib/supabase';
import { AppShell } from '@/components/layout/app-shell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        if (data) {
          setProfile(data);
        }
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login');
      }
    });

    return () => {
      sub.data.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <ProtectedRoute>
      <AppShell
        userName={profile?.full_name}
        userEmail={profile?.email}
        userRole={profile?.role}
      >
        {children}
      </AppShell>
    </ProtectedRoute>
  );
}

