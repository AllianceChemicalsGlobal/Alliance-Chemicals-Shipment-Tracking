'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CircleAlert as AlertCircle } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface CreateShipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipmentType: 'international' | 'domestic';
  onSuccess: () => void;
}

const emptyInternationalForm = () => ({
  tracking_number: '',
  vendor_ref: '',
  vendor_supplier_name: '',
  import_description: '',
  order_value: '',
  client: '',
  container_no: '',
  no_40_container: '',
  no_20_container: '',
  air_cargo: false,
  net_weight: '',
  vessel_plane_name: '',
  terminal: '',
  pfi_num: '',
  pfi_date: '',
  bl_awb: '',
  obl_date: '',
  insurance_date: '',
  nepza_approval_date: '',
  agent_pickup_nepza: '',
  ets: '',
  eta: '',
  tdo: '',
  loading_date_from_port: '',
  date_arrived_free_zone: '',
  refund: '',
  fze_et: '',
  origin_country: '',
  origin_location: '',
  destination_country: '',
  destination_location: '',
  carrier: '',
  description: '',
  estimated_arrival: '',
  status: 'pending',
});

const emptyDomesticForm = () => ({
  tracking_number: '',
  origin_country: '',
  origin_location: '',
  destination_country: '',
  destination_location: '',
  carrier: '',
  description: '',
  estimated_arrival: '',
  status: 'pending',
});

export function CreateShipmentDialog({
  open,
  onOpenChange,
  shipmentType,
  onSuccess,
}: CreateShipmentDialogProps) {
  const isInternational = shipmentType === 'international';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(
    isInternational ? emptyInternationalForm() : emptyDomesticForm()
  );

  const setField = (key: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const basePayload: Record<string, unknown> = {
        type: shipmentType,
        created_by: user.id,
        status: formData.status,
        tracking_number: (formData as Record<string, unknown>).tracking_number || null,
        origin_country: (formData as Record<string, unknown>).origin_country || null,
        origin_location: (formData as Record<string, unknown>).origin_location || null,
        destination_country: (formData as Record<string, unknown>).destination_country || null,
        destination_location: (formData as Record<string, unknown>).destination_location || null,
        carrier: (formData as Record<string, unknown>).carrier || null,
        description: (formData as Record<string, unknown>).description || null,
        estimated_arrival: (formData as Record<string, unknown>).estimated_arrival || null,
      };

      if (isInternational) {
        const f = formData as ReturnType<typeof emptyInternationalForm>;
        Object.assign(basePayload, {
          vendor_ref: f.vendor_ref || null,
          vendor_supplier_name: f.vendor_supplier_name || null,
          import_description: f.import_description || null,
          order_value: f.order_value ? parseFloat(f.order_value) : null,
          client: f.client || null,
          container_no: f.container_no || null,
          no_40_container: f.no_40_container ? parseInt(f.no_40_container, 10) : null,
          no_20_container: f.no_20_container ? parseInt(f.no_20_container, 10) : null,
          air_cargo: f.air_cargo,
          net_weight: f.net_weight || null,
          vessel_plane_name: f.vessel_plane_name || null,
          terminal: f.terminal || null,
          pfi_num: f.pfi_num || null,
          pfi_date: f.pfi_date || null,
          bl_awb: f.bl_awb || null,
          obl_date: f.obl_date || null,
          insurance_date: f.insurance_date || null,
          nepza_approval_date: f.nepza_approval_date || null,
          agent_pickup_nepza: f.agent_pickup_nepza || null,
          ets: f.ets || null,
          tdo: f.tdo || null,
          loading_date_from_port: f.loading_date_from_port || null,
          date_arrived_free_zone: f.date_arrived_free_zone || null,
          refund: f.refund || null,
          fze_et: f.fze_et || null,
        });
        if (f.eta) (basePayload as Record<string, unknown>).estimated_arrival = f.eta;
      }

      const { error: insertError } = await supabase.from('shipments').insert([basePayload]);

      if (insertError) throw insertError;

      setFormData(isInternational ? emptyInternationalForm() : emptyDomesticForm());
      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  const dateField = (id: string, label: string, key: string) => (
    <div className="space-y-2" key={id}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="date"
        value={(formData as Record<string, string>)[key] || ''}
        onChange={(e) => setField(key, e.target.value)}
      />
    </div>
  );

  const textField = (id: string, label: string, key: string, placeholder = '') => (
    <div className="space-y-2" key={id}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        value={(formData as Record<string, string>)[key] || ''}
        onChange={(e) => setField(key, e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-t-4 border-brand-dark">
        <DialogHeader>
          <DialogTitle className="text-brand-dark">
            Create New {isInternational ? 'International' : 'Domestic'} Shipment
          </DialogTitle>
          <DialogDescription>
            {isInternational
              ? 'Add a new international shipment. All fields are optional.'
              : 'Add a new shipment to track its journey'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {isInternational ? (
            <>
              {/* Core reference & vendor */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-700">Reference &amp; Vendor</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {textField('tracking_number', 'Tracking Number', 'tracking_number')}
                  {textField('vendor_ref', 'Vendor ref.', 'vendor_ref')}
                  {textField('vendor_supplier_name', 'Vendor / Supplier Name', 'vendor_supplier_name')}
                  {textField('client', 'Client', 'client')}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="import_description">Import Description</Label>
                  <Textarea
                    id="import_description"
                    value={(formData as Record<string, string>).import_description || ''}
                    onChange={(e) => setField('import_description', e.target.value)}
                    placeholder="Description of imported goods..."
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {textField('order_value', 'Order Value', 'order_value', 'e.g. 15000')}
                </div>
              </div>

              {/* Container & cargo */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-700">Container &amp; Cargo</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {textField('container_no', 'CONTAINER No', 'container_no')}
                  {textField('no_40_container', "No of 40' Container", 'no_40_container')}
                  {textField('no_20_container', "No of 20' Container", 'no_20_container')}
                  <div className="space-y-2 flex items-end pb-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="air_cargo"
                        checked={(formData as Record<string, unknown>).air_cargo === true}
                        onCheckedChange={(checked) => setField('air_cargo', checked === true)}
                      />
                      <Label htmlFor="air_cargo">Air cargo</Label>
                    </div>
                  </div>
                  {textField('net_weight', 'Net weight', 'net_weight')}
                </div>
              </div>

              {/* Vessel & terminal */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-700">Vessel &amp; Terminal</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {textField('vessel_plane_name', 'Name of Vessel / Plane', 'vessel_plane_name')}
                  {textField('terminal', 'Terminal', 'terminal')}
                </div>
              </div>

              {/* PFI & BL */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-700">PFI &amp; Documentation</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {textField('pfi_num', 'PFI Num', 'pfi_num')}
                  {dateField('pfi_date', 'PFI Date', 'pfi_date')}
                  {textField('bl_awb', 'BL/AWB', 'bl_awb')}
                  {dateField('obl_date', 'OBL Date', 'obl_date')}
                  {dateField('insurance_date', 'Insurance Date', 'insurance_date')}
                  {dateField('nepza_approval_date', 'NEPZA Approval Date', 'nepza_approval_date')}
                  {textField('agent_pickup_nepza', 'Agent/pickup nepza', 'agent_pickup_nepza')}
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-700">Dates</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dateField('ets', 'ETS', 'ets')}
                  {dateField('eta', 'ETA', 'eta')}
                  {dateField('tdo', 'TDO', 'tdo')}
                  {dateField('loading_date_from_port', 'Loading Date from Port', 'loading_date_from_port')}
                  {dateField('date_arrived_free_zone', 'Date Arrived at the Free Zone', 'date_arrived_free_zone')}
                  {dateField('fze_et', 'FZE-ET', 'fze_et')}
                </div>
              </div>

              {/* Other */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-slate-700">Origin, Destination &amp; Other</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {textField('origin_country', 'Origin Country', 'origin_country')}
                  {textField('origin_location', 'Origin Location', 'origin_location')}
                  {textField('destination_country', 'Destination Country', 'destination_country')}
                  {textField('destination_location', 'Destination Location', 'destination_location')}
                  {textField('carrier', 'Carrier', 'carrier', 'DHL, FedEx, etc.')}
                  {textField('refund', 'Refund (if any)', 'refund')}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={(formData as Record<string, string>).description || ''}
                    onChange={(e) => setField('description', e.target.value)}
                    placeholder="Additional notes..."
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={(formData as Record<string, string>).status}
                      onValueChange={(v) => setField('status', v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_transit">In Transit</SelectItem>
                        <SelectItem value="customs">In Customs</SelectItem>
                        <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="delayed">Delayed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {dateField('estimated_arrival', 'Estimated Arrival', 'estimated_arrival')}
                </div>
              </div>
            </>
          ) : (
            /* Domestic form - simpler */
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {textField('tracking_number', 'Tracking Number', 'tracking_number')}
                {textField('carrier', 'Carrier', 'carrier', 'DHL, FedEx, etc.')}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {textField('origin_country', 'Origin Country', 'origin_country')}
                {textField('origin_location', 'Origin Location', 'origin_location', 'City, Port, etc.')}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {textField('destination_country', 'Destination Country', 'destination_country')}
                {textField('destination_location', 'Destination Location', 'destination_location', 'City, Warehouse, etc.')}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={(formData as Record<string, string>).status}
                    onValueChange={(v) => setField('status', v)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_transit">In Transit</SelectItem>
                      <SelectItem value="customs">In Customs</SelectItem>
                      <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="delayed">Delayed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {dateField('estimated_arrival', 'Estimated Arrival', 'estimated_arrival')}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={(formData as Record<string, string>).description || ''}
                  onChange={(e) => setField('description', e.target.value)}
                  placeholder="Brief description of shipment contents..."
                  rows={3}
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="border-brand-dark text-brand-dark hover:bg-brand-light/10"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-brand-dark hover:bg-brand-light text-white"
            >
              {loading ? 'Creating...' : 'Create Shipment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
