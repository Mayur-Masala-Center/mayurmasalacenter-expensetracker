-- Add whatsapp_number column to lending table
ALTER TABLE lending ADD COLUMN IF NOT EXISTS whatsapp_number text;