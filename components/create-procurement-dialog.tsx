'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CircleAlert as AlertCircle } from 'lucide-react';

interface CreateProcurementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const emptyForm = () => ({
  shipment_ref: '',
  pfi_no_from_logi: '',
  vendor_supplier_name: '',
  import_description: '',
  order_value_form: '',
  gross_weight_quantity: '',
  form_m_status: '',
  pre_alert_date: '',
  form_m_number: '',
  paar_submission_date: '',
  paar_issued_date: '',
  paar_reference: '',
  column1: '',
  shipment_status: '',
  nafdac_2nd_stamping_date: '',
  c_number: '',
});

export function CreateProcurementDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateProcurementDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(emptyForm());

  const setField = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error: insertError } = await supabase.from('supply_chain_procurement').insert([
        {
          shipment_ref: formData.shipment_ref || null,
          pfi_no_from_logi: formData.pfi_no_from_logi || null,
          vendor_supplier_name: formData.vendor_supplier_name || null,
          import_description: formData.import_description || null,
          order_value_form: formData.order_value_form ? parseFloat(formData.order_value_form) : null,
          gross_weight_quantity: formData.gross_weight_quantity || null,
          form_m_status: formData.form_m_status || null,
          pre_alert_date: formData.pre_alert_date || null,
          form_m_number: formData.form_m_number || null,
          paar_submission_date: formData.paar_submission_date || null,
          paar_issued_date: formData.paar_issued_date || null,
          paar_reference: formData.paar_reference || null,
          column1: formData.column1 || null,
          shipment_status: formData.shipment_status || null,
          nafdac_2nd_stamping_date: formData.nafdac_2nd_stamping_date || null,
          c_number: formData.c_number || null,
          created_by: user.id,
        },
      ]);

      if (insertError) throw insertError;

      setFormData(emptyForm());
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create procurement record');
    } finally {
      setLoading(false);
    }
  };

  const textField = (id: string, label: string, key: string) => (
    <div className="space-y-2" key={id}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={formData[key]}
        onChange={(e) => setField(key, e.target.value)}
      />
    </div>
  );

  const dateField = (id: string, label: string, key: string) => (
    <div className="space-y-2" key={id}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="date"
        value={formData[key]}
        onChange={(e) => setField(key, e.target.value)}
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Procurement Record</DialogTitle>
          <DialogDescription>
            Add a new procurement record for supply chain. All fields are optional.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-700">Reference &amp; Vendor</h4>
            <div className="grid grid-cols-2 gap-4">
              {textField('shipment_ref', 'Shipment Ref', 'shipment_ref')}
              {textField('pfi_no_from_logi', 'PFI NO FROM LOGI', 'pfi_no_from_logi')}
              {textField('vendor_supplier_name', 'Vendor / Supplier Name', 'vendor_supplier_name')}
            </div>
            <div className="space-y-2">
              <Label htmlFor="import_description">Import Description</Label>
              <Textarea
                id="import_description"
                value={formData.import_description}
                onChange={(e) => setField('import_description', e.target.value)}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {textField('order_value_form', 'Order Value (Form)', 'order_value_form')}
              {textField('gross_weight_quantity', 'Gross weight / Quantity', 'gross_weight_quantity')}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-700">Form M &amp; PAAR</h4>
            <div className="grid grid-cols-2 gap-4">
              {textField('form_m_status', 'Form M Status', 'form_m_status')}
              {dateField('pre_alert_date', 'Pre-Alert Date', 'pre_alert_date')}
              {textField('form_m_number', 'FORM M NUMBER', 'form_m_number')}
              {dateField('paar_submission_date', 'PAAR Submission Date', 'paar_submission_date')}
              {dateField('paar_issued_date', 'PAAR issued Date', 'paar_issued_date')}
              {textField('paar_reference', 'PAAR Reference', 'paar_reference')}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-slate-700">Status &amp; Other</h4>
            <div className="grid grid-cols-2 gap-4">
              {textField('column1', 'Column1', 'column1')}
              {textField('shipment_status', 'Shipment Status', 'shipment_status')}
              {dateField('nafdac_2nd_stamping_date', 'NAFDAC 2nd stamping date', 'nafdac_2nd_stamping_date')}
              {textField('c_number', 'C Number', 'c_number')}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Record'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
