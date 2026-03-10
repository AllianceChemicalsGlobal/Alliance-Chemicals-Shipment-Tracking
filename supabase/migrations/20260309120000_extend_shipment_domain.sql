/*
  # Extend Shipment Domain Schema

  Adds supporting domain tables for a more complete
  procurement + supply chain shipment model.

  New tables:
  - organizations
  - locations
  - suppliers
  - shipment_legs
  - shipment_items
  - documents
*/

-- Organizations (for future multi-business-unit support)
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Locations: ports, warehouses, plants, depots, etc.
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('port', 'warehouse', 'plant', 'depot', 'customer')),
  country text NOT NULL,
  city text,
  code text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Suppliers for international legs
CREATE TABLE IF NOT EXISTS suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id),
  name text NOT NULL,
  code text,
  country text,
  contact_name text,
  contact_email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Shipment legs (international + in-country)
CREATE TABLE IF NOT EXISTS shipment_legs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  sequence int NOT NULL,
  mode text NOT NULL CHECK (mode IN ('sea', 'air', 'road', 'rail')),
  origin_location_id uuid REFERENCES locations(id),
  destination_location_id uuid REFERENCES locations(id),
  planned_departure timestamptz,
  planned_arrival timestamptz,
  actual_departure timestamptz,
  actual_arrival timestamptz,
  status text NOT NULL DEFAULT 'planned',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Shipment items (material lines)
CREATE TABLE IF NOT EXISTS shipment_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  line_no int NOT NULL,
  sku text,
  description text,
  quantity numeric,
  unit text,
  po_number text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Documents metadata (file handling via Supabase Storage)
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('invoice', 'packing_list', 'bl_awb', 'other')),
  title text NOT NULL,
  storage_path text NOT NULL,
  mime_type text,
  size_bytes bigint,
  uploaded_by uuid REFERENCES profiles(id),
  uploaded_at timestamptz DEFAULT now()
);

-- Basic indexes
CREATE INDEX IF NOT EXISTS idx_locations_org ON locations(organization_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_org ON suppliers(organization_id);
CREATE INDEX IF NOT EXISTS idx_shipment_legs_shipment ON shipment_legs(shipment_id);
CREATE INDEX IF NOT EXISTS idx_shipment_items_shipment ON shipment_items(shipment_id);
CREATE INDEX IF NOT EXISTS idx_documents_shipment ON documents(shipment_id);

-- RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_legs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- For now, align access with shipments role model:
-- authenticated users can see/manipulate rows linked to shipments they can see.

CREATE POLICY "Org data readable by authenticated" ON organizations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Locations readable by authenticated" ON locations
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Suppliers readable by authenticated" ON suppliers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Legs follow shipment visibility" ON shipment_legs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shipments
      WHERE shipments.id = shipment_legs.shipment_id
    )
  );

CREATE POLICY "Items follow shipment visibility" ON shipment_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shipments
      WHERE shipments.id = shipment_items.shipment_id
    )
  );

CREATE POLICY "Documents follow shipment visibility" ON documents
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shipments
      WHERE shipments.id = documents.shipment_id
    )
  );

