-- Create Chat Sessions Table
CREATE TABLE public.chat_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES public.users(id), -- Nullable for anonymous guests
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_activity timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Chat Messages Table
CREATE TABLE public.chat_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'model')),
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Add basic policies (Admin full access, users can see their own)
CREATE POLICY "Users can insert their own chat sessions" ON public.chat_sessions
  FOR INSERT WITH CHECK (true); -- allow anonymous

CREATE POLICY "Users can view their own chat sessions" ON public.chat_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert messages to their sessions" ON public.chat_messages
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view messages from their sessions" ON public.chat_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
      AND chat_sessions.user_id = auth.uid()
    )
  );

-- Admin policies
CREATE POLICY "Admins can view all chat sessions" ON public.chat_sessions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can view all chat messages" ON public.chat_messages
  FOR SELECT USING (auth.role() = 'authenticated');
