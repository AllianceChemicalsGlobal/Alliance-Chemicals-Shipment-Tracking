'use client';

import { useEffect, useState } from 'react';
import { supabase, Shipment } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Filter, Ship, AlertTriangle, CheckCircle2, Download, ChevronRight } from 'lucide-react';
import { exportProcurementShipmentsToExcel } from '@/lib/export-excel';
import { Button } from '@/components/ui/button';
import { ShipmentDetailsDialog } from '@/components/shipment-details-dialog';

function statusColor(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-slate-100 text-slate-800',
    in_transit: 'bg-blue-100 text-blue-800',
    customs: 'bg-amber-100 text-amber-800',
    delivered: 'bg-emerald-100 text-emerald-800',
    delayed: 'bg-red-100 text-red-800',
  };
  return map[status] ?? map.pending;
}

export default function ProcurementViewPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('shipments')
      .select('*')
      .eq('type', 'international')
      .order('created_at', { ascending: false });
    if (data) setShipments(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openShipmentDetails = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setDetailsOpen(true);
  };

  const handleDetailsClose = (open: boolean) => {
    setDetailsOpen(open);
    if (!open) setSelectedShipment(null);
  };

  const total = shipments.length;
  const inTransit = shipments.filter((s) => s.status === 'in_transit').length;
  const customs = shipments.filter((s) => s.status === 'customs').length;
  const delayed = shipments.filter((s) => s.status === 'delayed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Ship className="h-5 w-5 text-slate-500" />
            Procurement – International Inbound
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Control tower for all inbound international shipments from suppliers.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportProcurementShipmentsToExcel(shipments)}
            disabled={shipments.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Excel
          </Button>
          <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <Filter className="h-3 w-3" />
            Filtered by type = international
          </span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Open shipments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              In transit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{inTransit}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              In customs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{customs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              At risk
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div className="text-2xl font-semibold">{delayed}</div>
            {delayed > 0 ? (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium">International inbound shipments</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex justify-center py-10 text-sm text-muted-foreground">Loading shipments…</div>
          ) : shipments.length === 0 ? (
            <div className="flex justify-center py-10 text-sm text-muted-foreground">No international shipments yet.</div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8" />
                    <TableHead>Tracking #</TableHead>
                    <TableHead>Carrier</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>ETA</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {shipments.map((s) => (
                    <TableRow
                      key={s.id}
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => openShipmentDetails(s)}
                    >
                      <TableCell className="w-8 py-3">
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </TableCell>
                      <TableCell className="font-medium">{s.tracking_number || '—'}</TableCell>
                      <TableCell>{s.carrier || '—'}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {[s.origin_location, s.origin_country].filter(Boolean).join(', ') || '—'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {[s.destination_location, s.destination_country].filter(Boolean).join(', ') || '—'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {s.estimated_arrival
                          ? format(new Date(s.estimated_arrival), 'MMM dd, yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColor(s.status)} variant="secondary">
                          {s.status
                            .split('_')
                            .map((w) => w[0]?.toUpperCase() + w.slice(1))
                            .join(' ')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedShipment && (
        <ShipmentDetailsDialog
          shipment={selectedShipment}
          open={detailsOpen}
          onOpenChange={handleDetailsClose}
          onUpdate={load}
        />
      )}
    </div>
  );
}

