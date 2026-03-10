'use client';

import { useState } from 'react';
import { Shipment } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Ship, MapPin, Calendar, Eye, Package } from 'lucide-react';
import { format } from 'date-fns';
import { ShipmentDetailsDialog } from './shipment-details-dialog';

interface ShipmentCardProps {
  shipment: Shipment;
  onUpdate: () => void;
}

export function ShipmentCard({ shipment, onUpdate }: ShipmentCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

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

  return (
    <>
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setDetailsOpen(true)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-slate-100 p-2 rounded-lg">
                <Package className="h-4 w-4 text-slate-700" />
              </div>
              <div>
                <CardTitle className="text-base">{shipment.tracking_number || '—'}</CardTitle>
                <p className="text-xs text-slate-500">{shipment.carrier || '—'}</p>
              </div>
            </div>
            <Badge className={getStatusColor(shipment.status)} variant="secondary">
              {formatStatus(shipment.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Ship className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-slate-500 text-xs">Origin</p>
                <p className="font-medium text-slate-900">
                  {[shipment.origin_location, shipment.origin_country].filter(Boolean).join(', ') || '—'}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-slate-500 text-xs">Destination</p>
                <p className="font-medium text-slate-900">
                  {[shipment.destination_location, shipment.destination_country].filter(Boolean).join(', ') || '—'}
                </p>
              </div>
            </div>
            {shipment.estimated_arrival && (
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-slate-500 text-xs">Estimated Arrival</p>
                  <p className="font-medium text-slate-900">
                    {format(new Date(shipment.estimated_arrival), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>
            )}
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={(e) => {
            e.stopPropagation();
            setDetailsOpen(true);
          }}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </CardContent>
      </Card>

      <ShipmentDetailsDialog
        shipment={shipment}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        onUpdate={onUpdate}
      />
    </>
  );
}
