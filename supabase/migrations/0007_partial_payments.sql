-- Add partial payment support to vendor tables
ALTER TABLE sale_vendors ADD COLUMN IF NOT EXISTS paid_amount numeric(12,2) DEFAULT 0;
ALTER TABLE purchase_vendors ADD COLUMN IF NOT EXISTS paid_amount numeric(12,2) DEFAULT 0;

-- Update status check constraint to include partial
ALTER TABLE sale_vendors DROP CONSTRAINT IF EXISTS sale_vendors_status_check;
ALTER TABLE sale_vendors ADD CONSTRAINT sale_vendors_status_check CHECK (status IN ('paid', 'unpaid', 'partial'));

ALTER TABLE purchase_vendors DROP CONSTRAINT IF EXISTS purchase_vendors_status_check;
ALTER TABLE purchase_vendors ADD CONSTRAINT purchase_vendors_status_check CHECK (status IN ('paid', 'unpaid', 'partial'));

-- Add partial payment support to lending table
ALTER TABLE lending ADD COLUMN IF NOT EXISTS paid_amount numeric(12,2) DEFAULT 0;
ALTER TABLE lending DROP CONSTRAINT IF EXISTS lending_type_check;
ALTER TABLE lending ADD CONSTRAINT lending_type_check CHECK (type IN ('lend', 'settle'));