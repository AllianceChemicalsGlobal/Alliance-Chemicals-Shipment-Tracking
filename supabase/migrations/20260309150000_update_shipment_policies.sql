/*
  # Update shipment & procurement RLS policies

  Business rules:
  - Procurement officers can create shipments.
  - Supply chain officers can edit shipments and create/update supply chain procurement records.
  - All authenticated users (both roles) can SEE all shipments and procurement records,
    regardless of who created them.
*/

-- NOTE: Postgres does not support CREATE POLICY IF NOT EXISTS.
-- Make this migration idempotent by checking pg_policies.

DO $$
BEGIN
  -- ===================================================================
  -- 1. Shipments: viewing (all authenticated can see all shipments)
  -- ===================================================================
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'shipments'
      AND policyname = 'All authenticated can view shipments'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "All authenticated can view shipments"
        ON public.shipments FOR SELECT
        TO authenticated
        USING (true);
    $p$;
  END IF;

  -- ===================================================================
  -- 2. Shipments: updates by supply chain (edit any shipment)
  -- ===================================================================
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'shipments'
      AND policyname = 'Supply chain can update any shipment'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "Supply chain can update any shipment"
        ON public.shipments FOR UPDATE
        TO authenticated
        USING (
          EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'supply_chain'
          )
        )
        WITH CHECK (
          EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'supply_chain'
          )
        );
    $p$;
  END IF;

  -- ===================================================================
  -- 3. Supply chain procurement: viewing (both roles can see all records)
  -- ===================================================================
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'supply_chain_procurement'
      AND policyname = 'All roles can view procurement records'
  ) THEN
    EXECUTE $p$
      CREATE POLICY "All roles can view procurement records"
        ON public.supply_chain_procurement FOR SELECT
        TO authenticated
        USING (
          EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role IN ('procurement_officer', 'supply_chain')
          )
        );
    $p$;
  END IF;
END $$;

