'use client';

import { useEffect, useState } from 'react';
import { supabase, Shipment, Profile } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter, Package } from 'lucide-react';
import { ShipmentCard } from '@/components/shipment-card';
import { CreateShipmentDialog } from '@/components/create-shipment-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function DashboardPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      fetchShipments();
    }
  }, [profile]);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setProfile(data);
      }
    }
  };

  const fetchShipments = async () => {
    if (!profile) return;

    setLoading(true);
    const shipmentType = profile.role === 'procurement_officer' ? 'international' : 'domestic';

    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('type', shipmentType)
      .order('created_at', { ascending: false });

    if (data) {
      setShipments(data);
    }

    setLoading(false);
  };

  const filteredShipments = shipments.filter((shipment) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (shipment.tracking_number?.toLowerCase().includes(q)) ||
      (shipment.origin_location?.toLowerCase().includes(q)) ||
      (shipment.destination_location?.toLowerCase().includes(q)) ||
      (shipment.carrier?.toLowerCase().includes(q));

    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_transit', label: 'In Transit' },
    { value: 'customs', label: 'In Customs' },
    { value: 'out_for_delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'delayed', label: 'Delayed' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {profile?.role === 'procurement_officer' ? 'International Shipments' : 'Domestic Shipments'}
          </h1>
          <p className="text-slate-600 mt-1">
            Track and manage your {profile?.role === 'procurement_officer' ? 'international' : 'domestic'} shipments
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Shipment
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by tracking number, location, or carrier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredShipments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
          <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No shipments found</h3>
          <p className="text-slate-600 mb-4">
            {searchQuery || statusFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'Create your first shipment to get started'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Shipment
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredShipments.map((shipment) => (
            <ShipmentCard
              key={shipment.id}
              shipment={shipment}
              onUpdate={fetchShipments}
            />
          ))}
        </div>
      )}

      <CreateShipmentDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        shipmentType={profile?.role === 'procurement_officer' ? 'international' : 'domestic'}
        onSuccess={fetchShipments}
      />
    </div>
  );
}
