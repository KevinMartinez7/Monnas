-- Create reservations table
CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  selected_date DATE NOT NULL,
  selected_time TIME NOT NULL,
  selected_services TEXT[] NOT NULL,
  comments TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a booking system for clients)
-- Allow anyone to insert reservations (for booking)
CREATE POLICY "Anyone can create reservations" 
  ON public.reservations FOR INSERT 
  WITH CHECK (true);

-- Allow anyone to read reservations (to check availability)
CREATE POLICY "Anyone can view reservations" 
  ON public.reservations FOR SELECT 
  USING (true);

-- Create index for better performance on date/time queries
CREATE INDEX IF NOT EXISTS idx_reservations_date_time 
  ON public.reservations (selected_date, selected_time);
