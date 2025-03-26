-- Create sleep_records table
CREATE TABLE IF NOT EXISTS public.sleep_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    quality SMALLINT CHECK (quality >= 0 AND quality <= 10),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    version INTEGER DEFAULT 1
);

-- Add RLS policies
ALTER TABLE public.sleep_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own sleep records"
    ON public.sleep_records
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sleep records"
    ON public.sleep_records
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sleep records"
    ON public.sleep_records
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sleep records"
    ON public.sleep_records
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX sleep_records_user_id_idx ON public.sleep_records(user_id);
CREATE INDEX sleep_records_start_time_idx ON public.sleep_records(start_time);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_sleep_records_updated_at
    BEFORE UPDATE ON public.sleep_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 