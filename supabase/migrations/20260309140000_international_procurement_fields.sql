/*
  # International Shipment & Supply Chain Procurement Schema

  ## International Shipments (extend shipments table)
  Adds all international-specific fields - ALL NULLABLE for flexibility.
  Also relaxes existing NOT NULL constraints on shipments.

  ## Supply Chain Procurement Table
  Separate table for Supply Chain view with procurement-specific columns.
  All columns nullable.
*/

-- =============================================================================
-- 1. Make existing shipments columns nullable
-- =============================================================================
ALTER TABLE shipments ALTER COLUMN tracking_number DROP NOT NULL;
ALTER TABLE shipments ALTER COLUMN origin_country DROP NOT NULL;
ALTER TABLE shipments ALTER COLUMN origin_location DROP NOT NULL;
ALTER TABLE shipments ALTER COLUMN destination_country DROP NOT NULL;
ALTER TABLE shipments ALTER COLUMN destination_location DROP NOT NULL;
ALTER TABLE shipments ALTER COLUMN carrier DROP NOT NULL;

-- Drop UNIQUE on tracking_number to allow nulls (or we keep UNIQUE but allow one null - PostgreSQL allows multiple NULLs in UNIQUE)
-- Keep UNIQUE - multiple nulls are allowed in UNIQUE in Postgres

-- =============================================================================
-- 2. Add international shipment columns (all nullable)
-- =============================================================================
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS vendor_ref text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS vendor_supplier_name text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS import_description text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS order_value numeric;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS client text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS container_no text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS no_40_container int;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS no_20_container int;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS air_cargo boolean;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS net_weight text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS vessel_plane_name text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS terminal text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS pfi_num text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS pfi_date date;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS bl_awb text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS obl_date date;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS insurance_date date;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS nepza_approval_date date;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS agent_pickup_nepza text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS ets date;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS tdo date;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS loading_date_from_port date;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS date_arrived_free_zone date;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS refund text;
ALTER TABLE shipments ADD COLUMN IF NOT EXISTS fze_et date;

-- =============================================================================
-- 3. Supply Chain Procurement table (separate from shipments)
-- =============================================================================
CREATE TABLE IF NOT EXISTS supply_chain_procurement (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_ref text,
  pfi_no_from_logi text,
  vendor_supplier_name text,
  import_description text,
  order_value_form numeric,
  gross_weight_quantity text,
  form_m_status text,
  pre_alert_date date,
  form_m_number text,
  paar_submission_date date,
  paar_issued_date date,
  paar_reference text,
  column1 text,
  shipment_status text,
  nafdac_2nd_stamping_date date,
  c_number text,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes for supply_chain_procurement
CREATE INDEX IF NOT EXISTS idx_supply_chain_procurement_shipment_ref ON supply_chain_procurement(shipment_ref);
CREATE INDEX IF NOT EXISTS idx_supply_chain_procurement_status ON supply_chain_procurement(shipment_status);
CREATE INDEX IF NOT EXISTS idx_supply_chain_procurement_created_at ON supply_chain_procurement(created_at);

-- RLS for supply_chain_procurement
ALTER TABLE supply_chain_procurement ENABLE ROW LEVEL SECURITY;

-- Supply chain role can manage procurement records
CREATE POLICY "Supply chain can view procurement records"
  ON supply_chain_procurement FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'supply_chain'
    )
  );

CREATE POLICY "Supply chain can insert procurement records"
  ON supply_chain_procurement FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'supply_chain'
    )
  );

CREATE POLICY "Supply chain can update procurement records"
  ON supply_chain_procurement FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'supply_chain'
    )
  );

CREATE POLICY "Supply chain can delete procurement records"
  ON supply_chain_procurement FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'supply_chain'
    )
  );
