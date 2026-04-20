-- Create sent_emails table for email logging (replaces file-db JSON persistence)
CREATE TABLE IF NOT EXISTS sent_emails (
  id TEXT PRIMARY KEY,
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  template TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'sent'
);

CREATE INDEX IF NOT EXISTS idx_sent_emails_to_email ON sent_emails(to_email);
CREATE INDEX IF NOT EXISTS idx_sent_emails_template ON sent_emails(template);
CREATE INDEX IF NOT EXISTS idx_sent_emails_sent_at ON sent_emails(sent_at DESC);

-- Enable RLS
ALTER TABLE sent_emails ENABLE ROW LEVEL SECURITY;

-- Only service role can insert/read (server-side only)
CREATE POLICY "Service role full access on sent_emails"
  ON sent_emails
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create 'files' storage bucket (public for product images, signed URLs for secure files)
INSERT INTO storage.buckets (id, name, public)
VALUES ('files', 'files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: allow authenticated uploads, public reads for the 'files' bucket
CREATE POLICY "Public read access on files bucket"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'files');

CREATE POLICY "Authenticated users can upload files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'files' AND auth.role() = 'authenticated');

CREATE POLICY "Service role can manage all files"
  ON storage.objects FOR ALL
  USING (bucket_id = 'files' AND auth.role() = 'service_role')
  WITH CHECK (bucket_id = 'files' AND auth.role() = 'service_role');
