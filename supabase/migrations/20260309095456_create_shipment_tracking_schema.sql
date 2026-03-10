/*
  # Shipment Tracking System Schema

  ## Overview
  Creates a comprehensive shipment tracking system for procurement officers (international shipments)
  and supply chain teams (domestic shipments).

  ## New Tables
  
  ### `profiles`
  - `id` (uuid, primary key) - References auth.users
  - `email` (text, unique) - User email
  - `full_name` (text) - User's full name
  - `role` (text) - Either 'procurement_officer' or 'supply_chain'
  - `created_at` (timestamptz) - Record creation time
  - `updated_at` (timestamptz) - Last update time

  ### `shipments`
  - `id` (uuid, primary key) - Unique shipment identifier
  - `tracking_number` (text, unique) - Shipment tracking number
  - `type` (text) - Either 'international' or 'domestic'
  - `status` (text) - Current shipment status
  - `origin_country` (text) - Country of origin
  - `origin_location` (text) - Specific origin location/port
  - `destination_country` (text) - Destination country
  - `destination_location` (text) - Final destination location
  - `current_location` (text) - Current shipment location
  - `carrier` (text) - Shipping carrier/company
  - `description` (text) - Shipment contents description
  - `estimated_arrival` (timestamptz) - Expected arrival date
  - `actual_arrival` (timestamptz) - Actual arrival date
  - `created_by` (uuid) - User who created the shipment
  - `created_at` (timestamptz) - Record creation time
  - `updated_at` (timestamptz) - Last update time

  ### `tracking_events`
  - `id` (uuid, primary key) - Unique event identifier
  - `shipment_id` (uuid) - References shipments table
  - `status` (text) - Event status
  - `location` (text) - Event location
  - `description` (text) - Event description
  - `event_date` (timestamptz) - When the event occurred
  - `created_by` (uuid) - User who created the event
  - `created_at` (timestamptz) - Record creation time

  ## Security
  - Enable RLS on all tables
  - Procurement officers can manage international shipments
  - Supply chain team can manage domestic shipments
  - Users can only see shipments relevant to their role
  - All users must be authenticated
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('procurement_officer', 'supply_chain')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create shipments table
CREATE TABLE IF NOT EXISTS shipments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tracking_number text UNIQUE NOT NULL,
  type text NOT NULL CHECK (type IN ('international', 'domestic')),
  status text NOT NULL DEFAULT 'pending',
  origin_country text NOT NULL,
  origin_location text NOT NULL,
  destination_country text NOT NULL,
  destination_location text NOT NULL,
  current_location text,
  carrier text NOT NULL,
  description text,
  estimated_arrival timestamptz,
  actual_arrival timestamptz,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tracking_events table
CREATE TABLE IF NOT EXISTS tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id uuid REFERENCES shipments(id) ON DELETE CASCADE,
  status text NOT NULL,
  location text NOT NULL,
  description text,
  event_date timestamptz DEFAULT now(),
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Shipments policies
CREATE POLICY "Procurement officers can view international shipments"
  ON shipments FOR SELECT
  TO authenticated
  USING (
    type = 'international' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'procurement_officer'
    )
  );

CREATE POLICY "Supply chain can view domestic shipments"
  ON shipments FOR SELECT
  TO authenticated
  USING (
    type = 'domestic' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'supply_chain'
    )
  );

CREATE POLICY "Procurement officers can insert international shipments"
  ON shipments FOR INSERT
  TO authenticated
  WITH CHECK (
    type = 'international' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'procurement_officer'
    )
  );

CREATE POLICY "Supply chain can insert domestic shipments"
  ON shipments FOR INSERT
  TO authenticated
  WITH CHECK (
    type = 'domestic' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'supply_chain'
    )
  );

CREATE POLICY "Procurement officers can update international shipments"
  ON shipments FOR UPDATE
  TO authenticated
  USING (
    type = 'international' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'procurement_officer'
    )
  )
  WITH CHECK (
    type = 'international' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'procurement_officer'
    )
  );

CREATE POLICY "Supply chain can update domestic shipments"
  ON shipments FOR UPDATE
  TO authenticated
  USING (
    type = 'domestic' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'supply_chain'
    )
  )
  WITH CHECK (
    type = 'domestic' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'supply_chain'
    )
  );

CREATE POLICY "Procurement officers can delete international shipments"
  ON shipments FOR DELETE
  TO authenticated
  USING (
    type = 'international' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'procurement_officer'
    )
  );

CREATE POLICY "Supply chain can delete domestic shipments"
  ON shipments FOR DELETE
  TO authenticated
  USING (
    type = 'domestic' AND 
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'supply_chain'
    )
  );

-- Tracking events policies
CREATE POLICY "Users can view tracking events for their shipment type"
  ON tracking_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shipments 
      INNER JOIN profiles ON profiles.id = auth.uid()
      WHERE shipments.id = tracking_events.shipment_id
      AND (
        (shipments.type = 'international' AND profiles.role = 'procurement_officer') OR
        (shipments.type = 'domestic' AND profiles.role = 'supply_chain')
      )
    )
  );

CREATE POLICY "Users can insert tracking events for their shipment type"
  ON tracking_events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shipments 
      INNER JOIN profiles ON profiles.id = auth.uid()
      WHERE shipments.id = tracking_events.shipment_id
      AND (
        (shipments.type = 'international' AND profiles.role = 'procurement_officer') OR
        (shipments.type = 'domestic' AND profiles.role = 'supply_chain')
      )
    )
  );

CREATE POLICY "Users can update tracking events for their shipment type"
  ON tracking_events FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shipments 
      INNER JOIN profiles ON profiles.id = auth.uid()
      WHERE shipments.id = tracking_events.shipment_id
      AND (
        (shipments.type = 'international' AND profiles.role = 'procurement_officer') OR
        (shipments.type = 'domestic' AND profiles.role = 'supply_chain')
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM shipments 
      INNER JOIN profiles ON profiles.id = auth.uid()
      WHERE shipments.id = tracking_events.shipment_id
      AND (
        (shipments.type = 'international' AND profiles.role = 'procurement_officer') OR
        (shipments.type = 'domestic' AND profiles.role = 'supply_chain')
      )
    )
  );

CREATE POLICY "Users can delete tracking events for their shipment type"
  ON tracking_events FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM shipments 
      INNER JOIN profiles ON profiles.id = auth.uid()
      WHERE shipments.id = tracking_events.shipment_id
      AND (
        (shipments.type = 'international' AND profiles.role = 'procurement_officer') OR
        (shipments.type = 'domestic' AND profiles.role = 'supply_chain')
      )
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shipments_type ON shipments(type);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_created_by ON shipments(created_by);
CREATE INDEX IF NOT EXISTS idx_tracking_events_shipment_id ON tracking_events(shipment_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_event_date ON tracking_events(event_date);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
