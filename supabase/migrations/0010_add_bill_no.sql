-- Add bill_no field to sale_vendors and purchase_vendors tables
ALTER TABLE sale_vendors ADD COLUMN IF NOT EXISTS bill_no text;
ALTER TABLE purchase_vendors ADD COLUMN IF NOT EXISTS bill_no text;