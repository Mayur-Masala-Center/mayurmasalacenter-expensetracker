-- Fix amount check constraint to allow 0 for payment-only entries
-- This allows recording payments without a total amount (settling previous balances)
ALTER TABLE sale_vendors DROP CONSTRAINT IF EXISTS sale_vendors_amount_check;
ALTER TABLE sale_vendors ADD CONSTRAINT sale_vendors_amount_check CHECK (amount >= 0);

ALTER TABLE purchase_vendors DROP CONSTRAINT IF EXISTS purchase_vendors_amount_check;
ALTER TABLE purchase_vendors ADD CONSTRAINT purchase_vendors_amount_check CHECK (amount >= 0);
