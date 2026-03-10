'use client';

import { useEffect, useState } from 'react';
import { supabase, Shipment, TrackingEvent } from '@/lib/supabase';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Ship, MapPin, Calendar, Clock, Package, CreditCard as Edit, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { EditShipmentDialog } from './edit-shipment-dialog';
import { AddTrackingEventDialog } from './add-tracking-event-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShipmentDocuments } from '@/components/shipment-documents';

interface ShipmentDetailsDialogProps {
  shipment: Shipment;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function ShipmentDetailsDialog({
  shipment,
  open,
  onOpenChange,
  onUpdate,
}: ShipmentDetailsDialogProps) {
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addEventDialogOpen, setAddEventDialogOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchTrackingEvents();
    }
  }, [open, shipment.id]);

  const fetchTrackingEvents = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('tracking_events')
      .select('*')
      .eq('shipment_id', shipment.id)
      .order('event_date', { ascending: false });

    if (data) {
      setTrackingEvents(data);
    }
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-slate-100 text-slate-800',
      in_transit: 'bg-blue-100 text-blue-800',
      customs: 'bg-yellow-100 text-yellow-800',
      out_for_delivery: 'bg-green-100 text-green-800',
      delivered: 'bg-emerald-100 text-emerald-800',
      delayed: 'bg-red-100 text-red-800',
    };
    return colors[status] || colors.pending;
  };

  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleSuccess = () => {
    onUpdate();
    fetchTrackingEvents();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl">{shipment.tracking_number || '—'}</DialogTitle>
                <p className="text-sm text-slate-500 mt-1">{shipment.carrier || '—'}</p>
              </div>
              <div className="flex gap-2">
                <Badge className={getStatusColor(shipment.status)} variant="secondary">
                  {formatStatus(shipment.status)}
                </Badge>
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="tracking">Tracking Timeline</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Shipment
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Ship className="h-4 w-4" />
                      Origin
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-slate-500">Country</p>
                      <p className="font-medium">{shipment.origin_country || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Location</p>
                      <p className="font-medium">{shipment.origin_location || '—'}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Destination
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm text-slate-500">Country</p>
                      <p className="font-medium">{shipment.destination_country || '—'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Location</p>
                      <p className="font-medium">{shipment.destination_location || '—'}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {shipment.current_location && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Current Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-medium">{shipment.current_location}</p>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                {shipment.estimated_arrival && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Estimated Arrival
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium">
                        {format(new Date(shipment.estimated_arrival), 'MMMM dd, yyyy')}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {shipment.actual_arrival && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Actual Arrival
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="font-medium">
                        {format(new Date(shipment.actual_arrival), 'MMMM dd, yyyy')}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {shipment.description && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700">{shipment.description}</p>
                  </CardContent>
                </Card>
              )}

              {shipment.type === 'international' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">International shipment details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                      {[
                        ['Vendor ref', shipment.vendor_ref],
                        ['Vendor / Supplier', shipment.vendor_supplier_name],
                        ['Import Description', shipment.import_description],
                        ['Order Value', shipment.order_value != null ? String(shipment.order_value) : null],
                        ['Client', shipment.client],
                        ['Container No', shipment.container_no],
                        ["No of 40' Container", shipment.no_40_container != null ? String(shipment.no_40_container) : null],
                        ["No of 20' Container", shipment.no_20_container != null ? String(shipment.no_20_container) : null],
                        ['Air cargo', shipment.air_cargo ? 'Yes' : null],
                        ['Net weight', shipment.net_weight],
                        ['Vessel / Plane', shipment.vessel_plane_name],
                        ['Terminal', shipment.terminal],
                        ['PFI Num', shipment.pfi_num],
                        ['PFI Date', shipment.pfi_date ? format(new Date(shipment.pfi_date), 'dd/MM/yyyy') : null],
                        ['BL/AWB', shipment.bl_awb],
                        ['OBL Date', shipment.obl_date ? format(new Date(shipment.obl_date), 'dd/MM/yyyy') : null],
                        ['Insurance Date', shipment.insurance_date ? format(new Date(shipment.insurance_date), 'dd/MM/yyyy') : null],
                        ['NEPZA Approval Date', shipment.nepza_approval_date ? format(new Date(shipment.nepza_approval_date), 'dd/MM/yyyy') : null],
                        ['Agent/pickup NEPZA', shipment.agent_pickup_nepza],
                        ['ETS', shipment.ets ? format(new Date(shipment.ets), 'dd/MM/yyyy') : null],
                        ['TDO', shipment.tdo ? format(new Date(shipment.tdo), 'dd/MM/yyyy') : null],
                        ['Loading Date from Port', shipment.loading_date_from_port ? format(new Date(shipment.loading_date_from_port), 'dd/MM/yyyy') : null],
                        ['Date Arrived Free Zone', shipment.date_arrived_free_zone ? format(new Date(shipment.date_arrived_free_zone), 'dd/MM/yyyy') : null],
                        ['Refund', shipment.refund],
                        ['FZE-ET', shipment.fze_et ? format(new Date(shipment.fze_et), 'dd/MM/yyyy') : null],
                      ].filter(([, v]) => v != null && v !== '').map(([label, value]) => (
                        <div key={String(label)}>
                          <dt className="text-slate-500">{label}</dt>
                          <dd className="font-medium">{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="tracking" className="space-y-4">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setAddEventDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
                </div>
              ) : trackingEvents.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-lg">
                  <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">No tracking events</h3>
                  <p className="text-slate-600 mb-4">Add tracking events to monitor shipment progress</p>
                  <Button onClick={() => setAddEventDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Event
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                  <div className="space-y-6">
                    {trackingEvents.map((event) => (
                      <div key={event.id} className="relative flex gap-4">
                        <div className="absolute left-4 top-2 w-0.5 h-full bg-slate-200"></div>
                        <div className="relative z-10 flex-shrink-0">
                          <div
                            className={
                              'h-8 w-8 rounded-full flex items-center justify-center ' +
                              (event.status === 'delivered'
                                ? 'bg-emerald-500'
                                : event.status === 'in_transit'
                                ? 'bg-blue-500'
                                : event.status === 'customs'
                                ? 'bg-amber-500'
                                : event.status === 'delayed'
                                ? 'bg-red-500'
                                : 'bg-slate-500')
                            }
                          >
                            <div className="h-3 w-3 rounded-full bg-white" />
                          </div>
                        </div>
                        <Card className="flex-1">
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={getStatusColor(event.status)} variant="secondary">
                                    {formatStatus(event.status)}
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-600">{event.location}</p>
                              </div>
                              <p className="text-sm text-slate-500">
                                {format(new Date(event.event_date), 'MMM dd, yyyy HH:mm')}
                              </p>
                            </div>
                            {event.description && (
                              <p className="text-sm text-slate-700 mt-2">{event.description}</p>
                            )}
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <ShipmentDocuments shipmentId={shipment.id} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <EditShipmentDialog
        shipment={shipment}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleSuccess}
      />

      <AddTrackingEventDialog
        shipmentId={shipment.id}
        open={addEventDialogOpen}
        onOpenChange={setAddEventDialogOpen}
        onSuccess={handleSuccess}
      />
    </>
  );
}
