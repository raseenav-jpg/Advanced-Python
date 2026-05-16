-- Create students table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    student_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    gender TEXT NOT NULL,
    course TEXT NOT NULL,
    semester TEXT NOT NULL,
    department TEXT NOT NULL,
    admission_year TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access (Assuming role is checked via profiles table or authenticated users)
-- In a real scenario, you'd restrict this to admin users only based on your auth logic.
-- For now, allowing all authenticated users to do full CRUD as a placeholder for dashboard access.
CREATE POLICY "Enable all operations for authenticated users only" ON public.students
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
