'use client';

import { useState } from 'react';
import { supabase, Shipment } from '@/lib/supabase';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CircleAlert as AlertCircle, ChevronDown } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

interface EditShipmentDialogProps {
  shipment: Shipment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const STATUS_OPTIONS = [
  'pending',
  'in_transit',
  'customs',
  'out_for_delivery',
  'delivered',
  'delayed',
];

export function EditShipmentDialog({
  shipment,
  open,
  onOpenChange,
  onSuccess,
}: EditShipmentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const slice10 = (v: string | null | undefined) => (v ? String(v).slice(0, 10) : '');
  const [formData, setFormData] = useState({
    tracking_number: shipment.tracking_number ?? '',
    status: shipment.status,
    origin_country: shipment.origin_country ?? '',
    origin_location: shipment.origin_location ?? '',
    destination_country: shipment.destination_country ?? '',
    destination_location: shipment.destination_location ?? '',
    current_location: shipment.current_location ?? '',
    carrier: shipment.carrier ?? '',
    description: shipment.description ?? '',
    estimated_arrival: slice10(shipment.estimated_arrival),
    actual_arrival: slice10(shipment.actual_arrival),
    vendor_ref: shipment.vendor_ref ?? '',
    vendor_supplier_name: shipment.vendor_supplier_name ?? '',
    import_description: shipment.import_description ?? '',
    order_value: shipment.order_value != null ? String(shipment.order_value) : '',
    client: shipment.client ?? '',
    container_no: shipment.container_no ?? '',
    no_40_container: shipment.no_40_container != null ? String(shipment.no_40_container) : '',
    no_20_container: shipment.no_20_container != null ? String(shipment.no_20_container) : '',
    air_cargo: shipment.air_cargo ?? false,
    net_weight: shipment.net_weight ?? '',
    vessel_plane_name: shipment.vessel_plane_name ?? '',
    terminal: shipment.terminal ?? '',
    pfi_num: shipment.pfi_num ?? '',
    pfi_date: slice10(shipment.pfi_date),
    bl_awb: shipment.bl_awb ?? '',
    obl_date: slice10(shipment.obl_date),
    insurance_date: slice10(shipment.insurance_date),
    nepza_approval_date: slice10(shipment.nepza_approval_date),
    agent_pickup_nepza: shipment.agent_pickup_nepza ?? '',
    ets: slice10(shipment.ets),
    tdo: slice10(shipment.tdo),
    loading_date_from_port: slice10(shipment.loading_date_from_port),
    date_arrived_free_zone: slice10(shipment.date_arrived_free_zone),
    refund: shipment.refund ?? '',
    fze_et: slice10(shipment.fze_et),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const base: Record<string, unknown> = {
        tracking_number: formData.tracking_number || null,
        status: formData.status,
        origin_country: formData.origin_country || null,
        origin_location: formData.origin_location || null,
        destination_country: formData.destination_country || null,
        destination_location: formData.destination_location || null,
        current_location: formData.current_location || null,
        carrier: formData.carrier || null,
        description: formData.description || null,
        estimated_arrival: formData.estimated_arrival || null,
        actual_arrival: formData.actual_arrival || null,
        updated_at: new Date().toISOString(),
      };
      if (shipment.type === 'international') {
        Object.assign(base, {
          vendor_ref: formData.vendor_ref || null,
          vendor_supplier_name: formData.vendor_supplier_name || null,
          import_description: formData.import_description || null,
          order_value: formData.order_value ? parseFloat(formData.order_value) : null,
          client: formData.client || null,
          container_no: formData.container_no || null,
          no_40_container: formData.no_40_container ? parseInt(formData.no_40_container, 10) : null,
          no_20_container: formData.no_20_container ? parseInt(formData.no_20_container, 10) : null,
          air_cargo: formData.air_cargo,
          net_weight: formData.net_weight || null,
          vessel_plane_name: formData.vessel_plane_name || null,
          terminal: formData.terminal || null,
          pfi_num: formData.pfi_num || null,
          pfi_date: formData.pfi_date || null,
          bl_awb: formData.bl_awb || null,
          obl_date: formData.obl_date || null,
          insurance_date: formData.insurance_date || null,
          nepza_approval_date: formData.nepza_approval_date || null,
          agent_pickup_nepza: formData.agent_pickup_nepza || null,
          ets: formData.ets || null,
          tdo: formData.tdo || null,
          loading_date_from_port: formData.loading_date_from_port || null,
          date_arrived_free_zone: formData.date_arrived_free_zone || null,
          refund: formData.refund || null,
          fze_et: formData.fze_et || null,
        });
      }
      const { error: updateError } = await supabase
        .from('shipments')
        .update(base)
        .eq('id', shipment.id);

      if (updateError) throw updateError;

      onSuccess();
      onOpenChange(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update shipment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Shipment</DialogTitle>
          <DialogDescription>
            Update shipment details and status
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_tracking_number">Tracking Number</Label>
              <Input
                id="edit_tracking_number"
                value={formData.tracking_number}
                onChange={(e) =>
                  setFormData({ ...formData, tracking_number: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_carrier">Carrier</Label>
              <Input
                id="edit_carrier"
                value={formData.carrier}
                onChange={(e) =>
                  setFormData({ ...formData, carrier: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_origin_country">Origin Country</Label>
              <Input
                id="edit_origin_country"
                value={formData.origin_country}
                onChange={(e) =>
                  setFormData({ ...formData, origin_country: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_origin_location">Origin Location</Label>
              <Input
                id="edit_origin_location"
                value={formData.origin_location}
                onChange={(e) =>
                  setFormData({ ...formData, origin_location: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_destination_country">Destination Country</Label>
              <Input
                id="edit_destination_country"
                value={formData.destination_country}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    destination_country: e.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_destination_location">Destination Location</Label>
              <Input
                id="edit_destination_location"
                value={formData.destination_location}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    destination_location: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_current_location">Current Location</Label>
              <Input
                id="edit_current_location"
                value={formData.current_location}
                onChange={(e) =>
                  setFormData({ ...formData, current_location: e.target.value })
                }
                placeholder="Optional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status
                        .split('_')
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_estimated_arrival">Estimated Arrival</Label>
              <Input
                id="edit_estimated_arrival"
                type="date"
                value={formData.estimated_arrival}
                onChange={(e) =>
                  setFormData({ ...formData, estimated_arrival: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_actual_arrival">Actual Arrival</Label>
              <Input
                id="edit_actual_arrival"
                type="date"
                value={formData.actual_arrival}
                onChange={(e) =>
                  setFormData({ ...formData, actual_arrival: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit_description">Description</Label>
            <Textarea
              id="edit_description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          {shipment.type === 'international' && (
            <Collapsible defaultOpen className="space-y-3">
              <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900">
                <ChevronDown className="h-4 w-4" />
                International shipment details
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4 pt-2 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Vendor ref</Label>
                    <Input value={formData.vendor_ref} onChange={(e) => setFormData({ ...formData, vendor_ref: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Vendor / Supplier Name</Label>
                    <Input value={formData.vendor_supplier_name} onChange={(e) => setFormData({ ...formData, vendor_supplier_name: e.target.value })} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Import Description</Label>
                    <Textarea value={formData.import_description} onChange={(e) => setFormData({ ...formData, import_description: e.target.value })} rows={2} />
                  </div>
                  <div className="space-y-2">
                    <Label>Order Value</Label>
                    <Input type="number" value={formData.order_value} onChange={(e) => setFormData({ ...formData, order_value: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Client</Label>
                    <Input value={formData.client} onChange={(e) => setFormData({ ...formData, client: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Container No</Label>
                    <Input value={formData.container_no} onChange={(e) => setFormData({ ...formData, container_no: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>No of 40&apos; Container</Label>
                    <Input type="number" value={formData.no_40_container} onChange={(e) => setFormData({ ...formData, no_40_container: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>No of 20&apos; Container</Label>
                    <Input type="number" value={formData.no_20_container} onChange={(e) => setFormData({ ...formData, no_20_container: e.target.value })} />
                  </div>
                  <div className="space-y-2 flex items-end pb-2">
                    <div className="flex items-center gap-2">
                      <Checkbox id="edit_air_cargo" checked={formData.air_cargo} onCheckedChange={(c) => setFormData({ ...formData, air_cargo: c === true })} />
                      <Label htmlFor="edit_air_cargo">Air cargo</Label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Net weight</Label>
                    <Input value={formData.net_weight} onChange={(e) => setFormData({ ...formData, net_weight: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Vessel / Plane</Label>
                    <Input value={formData.vessel_plane_name} onChange={(e) => setFormData({ ...formData, vessel_plane_name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Terminal</Label>
                    <Input value={formData.terminal} onChange={(e) => setFormData({ ...formData, terminal: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>PFI Num</Label>
                    <Input value={formData.pfi_num} onChange={(e) => setFormData({ ...formData, pfi_num: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>PFI Date</Label>
                    <Input type="date" value={formData.pfi_date} onChange={(e) => setFormData({ ...formData, pfi_date: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>BL/AWB</Label>
                    <Input value={formData.bl_awb} onChange={(e) => setFormData({ ...formData, bl_awb: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>OBL Date</Label>
                    <Input type="date" value={formData.obl_date} onChange={(e) => setFormData({ ...formData, obl_date: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Insurance Date</Label>
                    <Input type="date" value={formData.insurance_date} onChange={(e) => setFormData({ ...formData, insurance_date: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>NEPZA Approval Date</Label>
                    <Input type="date" value={formData.nepza_approval_date} onChange={(e) => setFormData({ ...formData, nepza_approval_date: e.target.value })} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Agent/pickup NEPZA</Label>
                    <Input value={formData.agent_pickup_nepza} onChange={(e) => setFormData({ ...formData, agent_pickup_nepza: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>ETS</Label>
                    <Input type="date" value={formData.ets} onChange={(e) => setFormData({ ...formData, ets: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>TDO</Label>
                    <Input type="date" value={formData.tdo} onChange={(e) => setFormData({ ...formData, tdo: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Loading Date from Port</Label>
                    <Input type="date" value={formData.loading_date_from_port} onChange={(e) => setFormData({ ...formData, loading_date_from_port: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Date Arrived Free Zone</Label>
                    <Input type="date" value={formData.date_arrived_free_zone} onChange={(e) => setFormData({ ...formData, date_arrived_free_zone: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Refund</Label>
                    <Input value={formData.refund} onChange={(e) => setFormData({ ...formData, refund: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>FZE-ET</Label>
                    <Input type="date" value={formData.fze_et} onChange={(e) => setFormData({ ...formData, fze_et: e.target.value })} />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
