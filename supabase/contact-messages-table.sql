-- =====================================================
-- TABLA PARA MENSAJES DE CONTACTO
-- Ejecutar en Supabase SQL Editor
-- =====================================================

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  subject VARCHAR(255) NOT NULL,
  order_number VARCHAR(50),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'read', 'responded', 'closed', 'spam')),
  response_text TEXT,
  responded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contact_email ON contact_messages(email);
CREATE INDEX idx_contact_status ON contact_messages(status);
CREATE INDEX idx_contact_order ON contact_messages(order_number);
CREATE INDEX idx_contact_created ON contact_messages(created_at DESC);

-- RLS (Row Level Security) - Permitir lectura pública
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for contact form" ON contact_messages
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow select for own messages" ON contact_messages
  FOR SELECT
  USING (email = current_user_email() OR auth.uid() IN (
    SELECT auth_user_id FROM admin_users
  ));

-- Comentario
COMMENT ON TABLE contact_messages IS 'Tabla para almacenar mensajes de contacto del formulario public';
