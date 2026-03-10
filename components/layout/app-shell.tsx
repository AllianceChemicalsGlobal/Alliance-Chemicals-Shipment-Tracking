'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import { Package, Ship, Truck, BarChart2, Search, LogOut, Menu } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Sheet, SheetContent, SheetClose } from '@/components/ui/sheet';
import { supabase, Shipment } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type AppShellProps = {
  children: ReactNode;
  userName?: string;
  userEmail?: string;
  userRole?: 'procurement_officer' | 'supply_chain';
};

const navItems = [
  {
    href: '/dashboard',
    label: 'Shipments',
    icon: Package,
  },
  {
    href: '/dashboard/procurement',
    label: 'Procurement View',
    icon: Ship,
  },
  {
    href: '/dashboard/supply-chain',
    label: 'Supply Chain View',
    icon: Truck,
  },
  {
    href: '/dashboard/analytics',
    label: 'Analytics',
    icon: BarChart2,
  },
];

export function AppShell({ children, userName, userEmail, userRole }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [commandOpen, setCommandOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };
  const [shipments, setShipments] = useState<Shipment[]>([]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const fetchShipments = async () => {
      const { data: profileUser } = await supabase.auth.getUser();
      if (!profileUser.user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', profileUser.user.id)
        .maybeSingle();

      const type = profile?.role === 'procurement_officer' ? 'international' : 'domestic';

      const { data } = await supabase
        .from('shipments')
        .select('*')
        .eq('type', type)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        setShipments(data);
      }
    };

    fetchShipments();
  }, []);

  return (
    <div className="min-h-screen bg-brand-light/10 text-slate-900 flex flex-col md:flex-row">
      <aside className="hidden md:flex w-64 bg-brand-dark text-slate-50 flex-col border-r border-brand-dark">
        <div className="h-16 px-4 border-b border-brand-dark flex items-center bg-white">
          <div className="relative h-10 w-40">
            <Image
              src="/ALLIANCE CHEM logo.png"
              alt="Alliance Chemicals"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium cursor-pointer transition-colors',
                    active
                      ? 'bg-slate-800 text-slate-50'
                      : 'text-slate-200 hover:bg-slate-800/60 hover:text-slate-50'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-brand-dark px-4 py-3 space-y-3">
          <div className="text-xs text-slate-100 space-y-1">
            {userName && <div className="font-medium">{userName}</div>}
            {userEmail && <div className="text-slate-300 truncate">{userEmail}</div>}
            {userRole && (
              <div className="text-slate-300">
                {userRole === 'procurement_officer' ? 'Procurement · International' : 'Supply Chain · Domestic'}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-slate-200 hover:text-white hover:bg-brand-light/20"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Log out
          </Button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="border-b border-slate-200 bg-white px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center md:hidden">
              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-2"
                  onClick={() => setMobileNavOpen(true)}
                  aria-label="Open navigation"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                <SheetContent side="left" className="p-0">
                  <div className="h-16 px-4 border-b border-brand-dark flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                      <div className="relative h-8 w-36">
                        <Image
                          src="/ALLIANCE CHEM logo.png"
                          alt="Alliance Chemicals"
                          fill
                          className="object-contain"
                        />
                      </div>
                    </div>
                    {/* <SheetClose asChild>
                      <Button variant="ghost" size="icon" aria-label="Close navigation">
                        <span className="text-lg leading-none">&times;</span>
                      </Button>
                    </SheetClose> */}
                  </div>
                  <div className="bg-brand-dark text-slate-50 flex flex-col h-[calc(100vh-4rem)]">
                    <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        const active = pathname === item.href;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileNavOpen(false)}
                          >
                            <div
                              className={cn(
                                'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium cursor-pointer transition-colors',
                                active
                                  ? 'bg-slate-800 text-slate-50'
                                  : 'text-slate-200 hover:bg-slate-800/60 hover:text-slate-50'
                              )}
                            >
                              <Icon className="h-4 w-4" />
                              <span>{item.label}</span>
                            </div>
                          </Link>
                        );
                      })}
                    </nav>
                    <div className="border-t border-brand-dark px-4 py-3 space-y-3">
                      <div className="text-xs text-slate-100 space-y-1">
                        {userName && <div className="font-medium">{userName}</div>}
                        {userEmail && <div className="text-slate-300 truncate">{userEmail}</div>}
                        {userRole && (
                          <div className="text-slate-300">
                            {userRole === 'procurement_officer'
                              ? 'Procurement · International'
                              : 'Supply Chain · Domestic'}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2 text-slate-200 hover:text-white hover:bg-brand-light/20"
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-4 w-4" />
                        Log out
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Control Tower</span>
              <span className="hidden sm:block text-xs text-slate-600 mt-1">
                Press <span className="px-1.5 py-0.5 rounded border border-slate-300 bg-slate-50 text-[10px] sm:text-xs font-mono">⌘K</span> to search shipments
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-xs"
              onClick={() => setCommandOpen(true)}
            >
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Quick search</span>
              <span className="sm:hidden">Search</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 px-4 md:px-6 py-4 md:py-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Search shipments by tracking number, origin, destination..." />
        <CommandList>
          <CommandEmpty>No matching shipments.</CommandEmpty>
          <CommandGroup heading="Shipments">
            {shipments.map((shipment) => (
              <CommandItem
                key={shipment.id}
                value={shipment.tracking_number}
                onSelect={() => {
                  window.location.href = `/dashboard?focus=${shipment.id}`;
                }}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium">{shipment.tracking_number}</span>
                  <span className="text-xs text-muted-foreground">
                    {shipment.origin_location} → {shipment.destination_location}
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}

