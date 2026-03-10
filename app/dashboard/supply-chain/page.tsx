'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase, SupplyChainProcurement } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Truck, Plus, PackageSearch, Download, ChevronRight } from 'lucide-react';
import { exportSupplyChainProcurementToExcel } from '@/lib/export-excel';
import { CreateProcurementDialog } from '@/components/create-procurement-dialog';
import { ProcurementDetailsDialog } from '@/components/procurement-details-dialog';

function statusColor(status: string | null) {
  if (!status) return 'bg-slate-100 text-slate-800';
  const map: Record<string, string> = {
    pending: 'bg-slate-100 text-slate-800',
    in_transit: 'bg-blue-100 text-blue-800',
    customs: 'bg-amber-100 text-amber-800',
    out_for_delivery: 'bg-green-100 text-green-800',
    delivered: 'bg-emerald-100 text-emerald-800',
    delayed: 'bg-red-100 text-red-800',
  };
  return map[status] ?? map.pending;
}

export default function SupplyChainViewPage() {
  const [records, setRecords] = useState<SupplyChainProcurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SupplyChainProcurement | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('supply_chain_procurement')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setRecords(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const formatDate = (d: string | null) =>
    d ? format(new Date(d), 'MMM dd, yyyy') : '—';

  const openDetails = (record: SupplyChainProcurement) => {
    setSelectedRecord(record);
    setDetailsOpen(true);
  };

  const closeDetails = (open: boolean) => {
    setDetailsOpen(open);
    if (!open) setSelectedRecord(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
            <Truck className="h-5 w-5 text-slate-500" />
            Supply Chain – Procurement
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Procurement records for supply chain visibility: Form M, PAAR, NAFDAC, etc.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportSupplyChainProcurementToExcel(records)}
            disabled={records.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Excel
          </Button>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Record
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <PackageSearch className="h-4 w-4 text-muted-foreground" />
            Procurement records
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportSupplyChainProcurementToExcel(records)}
            disabled={loading || records.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex justify-center py-10 text-sm text-muted-foreground">
              Loading records…
            </div>
          ) : records.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                No procurement records yet.
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Record
              </Button>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8" />
                    <TableHead>Shipment Ref</TableHead>
                    <TableHead>Vendor / Supplier</TableHead>
                    <TableHead className="hidden md:table-cell">Order Value</TableHead>
                    <TableHead className="hidden lg:table-cell">Form M Status</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Pre-Alert</TableHead>
                    <TableHead className="hidden lg:table-cell">C Number</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((r) => (
                    <TableRow
                      key={r.id}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => openDetails(r)}
                    >
                      <TableCell className="w-8">
                        <ChevronRight className="h-3 w-3 text-slate-400" />
                      </TableCell>
                      <TableCell className="font-medium">{r.shipment_ref || '—'}</TableCell>
                      <TableCell>{r.vendor_supplier_name || '—'}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {r.order_value_form ?? '—'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {r.form_m_status || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColor(r.shipment_status)} variant="secondary">
                          {r.shipment_status
                            ? r.shipment_status
                                .split('_')
                                .map((w) => w[0]?.toUpperCase() + w.slice(1))
                                .join(' ')
                            : '—'}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(r.pre_alert_date)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {r.c_number || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateProcurementDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSuccess={loadRecords}
      />

      {selectedRecord && (
        <ProcurementDetailsDialog
          record={selectedRecord}
          open={detailsOpen}
          onOpenChange={closeDetails}
        />
      )}
    </div>
  );
}
