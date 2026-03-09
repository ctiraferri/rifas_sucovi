CREATE TABLE IF NOT EXISTS rifas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  valor NUMERIC(10,2) NOT NULL DEFAULT 0,
  fecha_sorteo DATE,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TYPE metodo_pago_enum AS ENUM ('efectivo', 'transferencia');

CREATE TABLE IF NOT EXISTS ventas (
  id SERIAL PRIMARY KEY,
  rifa_id INTEGER NOT NULL REFERENCES rifas(id) ON DELETE RESTRICT,
  numero_rifa INTEGER NOT NULL CHECK (numero_rifa BETWEEN 100000 AND 999999),
  nombre_alumno VARCHAR(255) NOT NULL,
  apellido_alumno VARCHAR(255) NOT NULL,
  nombre_comprador VARCHAR(255) NOT NULL,
  apellido_comprador VARCHAR(255) NOT NULL,
  dni VARCHAR(20) NOT NULL,
  whatsapp VARCHAR(30) NOT NULL,
  email VARCHAR(255) NOT NULL,
  metodo_pago metodo_pago_enum NOT NULL,
  estado VARCHAR(50) DEFAULT 'confirmada',
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(rifa_id, numero_rifa)
);

CREATE TABLE IF NOT EXISTS sorteos (
  id SERIAL PRIMARY KEY,
  rifa_id INTEGER NOT NULL REFERENCES rifas(id) ON DELETE RESTRICT,
  venta_id INTEGER NOT NULL REFERENCES ventas(id) ON DELETE RESTRICT,
  created_at TIMESTAMP DEFAULT NOW()
);
