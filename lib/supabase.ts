import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: 'procurement_officer' | 'supply_chain';
  created_at: string;
  updated_at: string;
};

export type Shipment = {
  id: string;
  tracking_number: string | null;
  type: 'international' | 'domestic';
  status: string;
  origin_country: string | null;
  origin_location: string | null;
  destination_country: string | null;
  destination_location: string | null;
  current_location: string | null;
  carrier: string | null;
  description: string | null;
  estimated_arrival: string | null;
  actual_arrival: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  // International shipment fields (all optional)
  vendor_ref?: string | null;
  vendor_supplier_name?: string | null;
  import_description?: string | null;
  order_value?: number | null;
  client?: string | null;
  container_no?: string | null;
  no_40_container?: number | null;
  no_20_container?: number | null;
  air_cargo?: boolean | null;
  net_weight?: string | null;
  vessel_plane_name?: string | null;
  terminal?: string | null;
  pfi_num?: string | null;
  pfi_date?: string | null;
  obl_date?: string | null;
  insurance_date?: string | null;
  nepza_approval_date?: string | null;
  agent_pickup_nepza?: string | null;
  ets?: string | null;
  tdo?: string | null;
  loading_date_from_port?: string | null;
  date_arrived_free_zone?: string | null;
  refund?: string | null;
  fze_et?: string | null;
  bl_awb?: string | null;
};

export type SupplyChainProcurement = {
  id: string;
  shipment_ref: string | null;
  pfi_no_from_logi: string | null;
  vendor_supplier_name: string | null;
  import_description: string | null;
  order_value_form: number | null;
  gross_weight_quantity: string | null;
  form_m_status: string | null;
  pre_alert_date: string | null;
  form_m_number: string | null;
  paar_submission_date: string | null;
  paar_issued_date: string | null;
  paar_reference: string | null;
  column1: string | null;
  shipment_status: string | null;
  nafdac_2nd_stamping_date: string | null;
  c_number: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type TrackingEvent = {
  id: string;
  shipment_id: string;
  status: string;
  location: string;
  description: string | null;
  event_date: string;
  created_by: string;
  created_at: string;
};

export type ShipmentLeg = {
  id: string;
  shipment_id: string;
  sequence: number;
  mode: 'sea' | 'air' | 'road' | 'rail';
  origin_location_id: string | null;
  destination_location_id: string | null;
  planned_departure: string | null;
  planned_arrival: string | null;
  actual_departure: string | null;
  actual_arrival: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export type ShipmentItem = {
  id: string;
  shipment_id: string;
  line_no: number;
  sku: string | null;
  description: string | null;
  quantity: number | null;
  unit: string | null;
  po_number: string | null;
  created_at: string;
  updated_at: string;
};

export type ShipmentDocument = {
  id: string;
  shipment_id: string;
  category: 'invoice' | 'packing_list' | 'bl_awb' | 'other';
  title: string;
  storage_path: string;
  mime_type: string | null;
  size_bytes: number | null;
  uploaded_by: string | null;
  uploaded_at: string;
};

