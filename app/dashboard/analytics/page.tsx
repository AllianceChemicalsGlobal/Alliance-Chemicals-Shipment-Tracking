'use client';

import { useEffect, useState } from 'react';
import { supabase, Shipment, TrackingEvent } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegendContent } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from 'recharts';

type ModeKpi = {
  mode: string;
  count: number;
};

export default function AnalyticsPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [events, setEvents] = useState<TrackingEvent[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: shipmentsData } = await supabase
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false });
      const { data: eventsData } = await supabase
        .from('tracking_events')
        .select('*')
        .order('event_date', { ascending: false });

      if (shipmentsData) setShipments(shipmentsData);
      if (eventsData) setEvents(eventsData);
    };
    load();
  }, []);

  const total = shipments.length;
  const delivered = shipments.filter((s) => s.status === 'delivered').length;
  const delayed = shipments.filter((s) => s.status === 'delayed').length;

  const onTimeRate =
    delivered + delayed === 0 ? 0 : Math.round((delivered / (delivered + delayed)) * 100);

  const byType = [
    {
      label: 'International',
      count: shipments.filter((s) => s.type === 'international').length,
    },
    {
      label: 'Domestic',
      count: shipments.filter((s) => s.type === 'domestic').length,
    },
  ];

  const byStatus = [
    'pending',
    'in_transit',
    'customs',
    'out_for_delivery',
    'delivered',
    'delayed',
  ].map((status) => ({
    status,
    count: shipments.filter((s) => s.status === status).length,
  }));

  const byMode: ModeKpi[] = [
    { mode: 'sea', count: 0 },
    { mode: 'air', count: 0 },
    { mode: 'road', count: 0 },
    { mode: 'rail', count: 0 },
  ];
  // For now derive mode from description or carrier hints if needed later.

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Network analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          High-level KPIs to understand performance of international and in-country movements.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total shipments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Delivered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{delivered}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Delayed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{delayed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              On-time rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{onTimeRate}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Shipments by type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <ChartContainer
                config={{
                  international: { label: 'International', color: 'hsl(220 70% 50%)' },
                  domestic: { label: 'Domestic', color: 'hsl(160 60% 45%)' },
                }}
                className="h-64 min-w-[280px]"
              >
                <BarChart data={byType}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Legend content={<ChartLegendContent />} />
                  <Bar dataKey="count" name="Shipments" fill="var(--color-international)" />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Shipments by status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full overflow-x-auto">
              <ChartContainer
                config={{
                  pending: { label: 'Pending', color: 'hsl(210 20% 85%)' },
                  in_transit: { label: 'In transit', color: 'hsl(220 70% 50%)' },
                  customs: { label: 'Customs', color: 'hsl(40 85% 60%)' },
                  out_for_delivery: { label: 'Out for delivery', color: 'hsl(150 60% 45%)' },
                  delivered: { label: 'Delivered', color: 'hsl(160 60% 45%)' },
                  delayed: { label: 'Delayed', color: 'hsl(0 70% 55%)' },
                }}
                className="h-64 min-w-[320px]"
              >
                <BarChart data={byStatus}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis allowDecimals={false} />
                  <Tooltip content={<ChartTooltipContent labelKey="status" />} />
                  <Legend content={<ChartLegendContent />} />
                  <Bar dataKey="count" name="Shipments" fill="var(--color-in_transit)" />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

