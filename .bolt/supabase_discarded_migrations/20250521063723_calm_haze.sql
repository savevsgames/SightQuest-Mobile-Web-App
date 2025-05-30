-- First create the enum types if they don't exist
DO $$ BEGIN
    CREATE TYPE stripe_subscription_status AS ENUM (
        'not_started',
        'incomplete',
        'incomplete_expired',
        'trialing',
        'active',
        'past_due',
        'canceled',
        'unpaid',
        'paused'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE stripe_order_status AS ENUM (
        'pending',
        'completed',
        'canceled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create moddatetime extension for updated_at triggers
CREATE EXTENSION IF NOT EXISTS moddatetime;

-- Drop existing views that depend on the tables
DROP VIEW IF EXISTS stripe_user_orders;
DROP VIEW IF EXISTS stripe_user_subscriptions;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS stripe_orders;
DROP TABLE IF EXISTS stripe_subscriptions;
DROP TABLE IF EXISTS stripe_customers;

-- Create stripe_customers with Stripe ID as primary key
CREATE TABLE IF NOT EXISTS stripe_customers (
    customer_id text PRIMARY KEY, -- 'cus_...'
    user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    deleted_at timestamptz
);

-- Create unique index to ensure one customer per user
CREATE UNIQUE INDEX one_customer_per_user ON stripe_customers(user_id) WHERE deleted_at IS NULL;

-- Create updated_at trigger for stripe_customers
CREATE TRIGGER handle_updated_at_stripe_customers
    BEFORE UPDATE ON stripe_customers
    FOR EACH ROW
    EXECUTE PROCEDURE moddatetime(updated_at);

-- Create stripe_subscriptions with Stripe ID as primary key
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
    subscription_id text PRIMARY KEY, -- 'sub_...'
    customer_id text NOT NULL REFERENCES stripe_customers(customer_id) ON DELETE CASCADE,
    price_id text,
    current_period_start bigint,
    current_period_end bigint,
    cancel_at_period_end boolean DEFAULT false,
    payment_method_brand text,
    payment_method_last4 text,
    status stripe_subscription_status NOT NULL,
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    deleted_at timestamptz
);

-- Create updated_at trigger for stripe_subscriptions
CREATE TRIGGER handle_updated_at_stripe_subscriptions
    BEFORE UPDATE ON stripe_subscriptions
    FOR EACH ROW
    EXECUTE PROCEDURE moddatetime(updated_at);

-- Create stripe_orders with Stripe ID as primary key
CREATE TABLE IF NOT EXISTS stripe_orders (
    checkout_session_id text PRIMARY KEY, -- 'cs_...'
    payment_intent_id text NOT NULL,
    customer_id text NOT NULL REFERENCES stripe_customers(customer_id) ON DELETE CASCADE,
    amount_subtotal bigint NOT NULL,
    amount_total bigint NOT NULL,
    currency text NOT NULL,
    payment_status text NOT NULL,
    status stripe_order_status NOT NULL DEFAULT 'pending',
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL,
    deleted_at timestamptz
);

-- Create updated_at trigger for stripe_orders
CREATE TRIGGER handle_updated_at_stripe_orders
    BEFORE UPDATE ON stripe_orders
    FOR EACH ROW
    EXECUTE PROCEDURE moddatetime(updated_at);

-- Enable RLS on all tables
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for stripe_customers
CREATE POLICY "Users can view their own customer data"
    ON stripe_customers
    FOR SELECT
    TO authenticated
    USING (user_id = auth.uid() AND deleted_at IS NULL);

CREATE POLICY "Service role can manage customer data"
    ON stripe_customers
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create policies for stripe_subscriptions
CREATE POLICY "Users can view their own subscription data"
    ON stripe_subscriptions
    FOR SELECT
    TO authenticated
    USING (
        customer_id IN (
            SELECT customer_id
            FROM stripe_customers
            WHERE user_id = auth.uid() AND deleted_at IS NULL
        )
        AND deleted_at IS NULL
    );

CREATE POLICY "Service role can manage subscription data"
    ON stripe_subscriptions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create policies for stripe_orders
CREATE POLICY "Users can view their own order data"
    ON stripe_orders
    FOR SELECT
    TO authenticated
    USING (
        customer_id IN (
            SELECT customer_id
            FROM stripe_customers
            WHERE user_id = auth.uid() AND deleted_at IS NULL
        )
        AND deleted_at IS NULL
    );

CREATE POLICY "Service role can manage order data"
    ON stripe_orders
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_stripe_customers_user_id ON stripe_customers(user_id);
CREATE INDEX idx_stripe_subscriptions_customer_id ON stripe_subscriptions(customer_id);
CREATE INDEX idx_stripe_orders_customer_id ON stripe_orders(customer_id);

-- Create secure view for user subscriptions
CREATE VIEW stripe_user_subscriptions 
WITH (security_invoker = true) 
AS
SELECT
    c.customer_id,
    s.subscription_id,
    s.status as subscription_status,
    s.price_id,
    s.current_period_start,
    s.current_period_end,
    s.cancel_at_period_end,
    s.payment_method_brand,
    s.payment_method_last4
FROM stripe_customers c
LEFT JOIN stripe_subscriptions s ON c.customer_id = s.customer_id
WHERE c.user_id = auth.uid()
AND c.deleted_at IS NULL
AND s.deleted_at IS NULL;

-- Create secure view for user orders
CREATE VIEW stripe_user_orders 
WITH (security_invoker = true) 
AS
SELECT
    c.customer_id,
    o.checkout_session_id as order_id,
    o.payment_intent_id,
    o.amount_subtotal,
    o.amount_total,
    o.currency,
    o.payment_status,
    o.status as order_status,
    o.created_at as order_date
FROM stripe_customers c
LEFT JOIN stripe_orders o ON c.customer_id = o.customer_id
WHERE c.user_id = auth.uid()
AND c.deleted_at IS NULL
AND o.deleted_at IS NULL;

-- Grant access to views
GRANT SELECT ON stripe_user_subscriptions TO authenticated;
GRANT SELECT ON stripe_user_orders TO authenticated;