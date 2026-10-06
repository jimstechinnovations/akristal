-- Broker companies get their own accounts: sign up as a broker, manage the company page,
-- post listings and see the taps and sales recorded for the company.
-- Additive only. The enum value is added on its own first (Postgres needs it committed
-- before policies can use it).

ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'broker';

BEGIN;

-- The account that runs a broker company.
ALTER TABLE public.brokers ADD COLUMN IF NOT EXISTS owner_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL;

DROP POLICY IF EXISTS "Public reads published brokers" ON public.brokers;
CREATE POLICY "Public reads published brokers" ON public.brokers FOR SELECT USING (is_published OR owner_id = auth.uid() OR public.is_admin());

-- Brokers post listings like sellers and agents.
DROP POLICY IF EXISTS "Sellers can create properties" ON public.properties;
CREATE POLICY "Sellers can create properties" ON public.properties FOR INSERT WITH CHECK (
  auth.uid() = seller_id
  AND EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('seller', 'agent', 'broker', 'admin'))
);

-- A broker sees the taps and sales recorded for their company.
DROP POLICY IF EXISTS "Agents and admins read contact clicks" ON public.contact_events;
CREATE POLICY "Agents and admins read contact clicks" ON public.contact_events FOR SELECT USING (
  agent_id = auth.uid() OR public.is_admin() OR broker_id IN (SELECT id FROM public.brokers WHERE owner_id = auth.uid())
);
DROP POLICY IF EXISTS "Agents read their sales" ON public.agent_sales;
CREATE POLICY "Agents read their sales" ON public.agent_sales FOR SELECT USING (
  agent_id = auth.uid() OR public.is_admin() OR broker_id IN (SELECT id FROM public.brokers WHERE owner_id = auth.uid())
);

COMMIT;

-- Articles are signed with the full name and short form.
ALTER TABLE public.articles ALTER COLUMN author_name SET DEFAULT 'The Akristal Group (TAG)';
UPDATE public.articles SET author_name = 'The Akristal Group (TAG)' WHERE author_name = 'The Akristal Group';
