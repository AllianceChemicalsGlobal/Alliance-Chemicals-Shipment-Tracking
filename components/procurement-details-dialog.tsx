'use client';

import { SupplyChainProcurement } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface ProcurementDetailsDialogProps {
  record: SupplyChainProcurement;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const fmt = (d: string | null) => (d ? format(new Date(d), 'MMM dd, yyyy') : '—');

export function ProcurementDetailsDialog({ record, open, onOpenChange }: ProcurementDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Procurement record – {record.shipment_ref || 'No shipment ref'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Reference &amp; Vendor</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
              <Field label="Shipment Ref" value={record.shipment_ref} />
              <Field label="PFI NO FROM LOGI" value={record.pfi_no_from_logi} />
              <Field label="Vendor / Supplier Name" value={record.vendor_supplier_name} />
              <Field label="Order Value (Form)" value={record.order_value_form != null ? String(record.order_value_form) : null} />
              <Field label="Gross weight / Quantity" value={record.gross_weight_quantity} />
              <Field label="Created At" value={fmt(record.created_at)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Form M &amp; PAAR</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
              <Field label="Form M Status" value={record.form_m_status} />
              <Field label="Pre-Alert Date" value={fmt(record.pre_alert_date)} />
              <Field label="FORM M NUMBER" value={record.form_m_number} />
              <Field label="PAAR Submission Date" value={fmt(record.paar_submission_date)} />
              <Field label="PAAR issued Date" value={fmt(record.paar_issued_date)} />
              <Field label="PAAR Reference" value={record.paar_reference} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Status &amp; Other</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
              <Field label="Column1" value={record.column1} />
              <Field label="Shipment Status" value={record.shipment_status} />
              <Field label="NAFDAC 2nd stamping date" value={fmt(record.nafdac_2nd_stamping_date)} />
              <Field label="C Number" value={record.c_number} />
            </CardContent>
          </Card>

          {record.import_description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Import Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">
                  {record.import_description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-medium text-slate-900">{value}</div>
    </div>
  );
}

