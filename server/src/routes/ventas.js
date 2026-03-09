const { Router } = require('express');
const { body, query: queryValidator, validationResult } = require('express-validator');
const db = require('../config/db');
const auth = require('../middleware/auth');
const { sendConfirmationEmail } = require('../services/email');

const router = Router();

function randomNumber() {
  return Math.floor(100000 + Math.random() * 900000);
}

// Público: registrar venta
router.post(
  '/',
  [
    body('rifa_id').isInt({ min: 1 }).withMessage('Rifa requerida'),
    body('nombre_alumno').trim().notEmpty().withMessage('Nombre del alumno requerido'),
    body('apellido_alumno').trim().notEmpty().withMessage('Apellido del alumno requerido'),
    body('nombre_comprador').trim().notEmpty().withMessage('Nombre del comprador requerido'),
    body('apellido_comprador').trim().notEmpty().withMessage('Apellido del comprador requerido'),
    body('dni').trim().notEmpty().withMessage('DNI requerido').matches(/^\d+$/).withMessage('DNI debe contener solo números'),
    body('whatsapp').trim().notEmpty().withMessage('WhatsApp requerido'),
    body('email').isEmail().withMessage('Email inválido'),
    body('metodo_pago').isIn(['efectivo', 'transferencia']).withMessage('Método de pago inválido'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { rifa_id, nombre_alumno, apellido_alumno, nombre_comprador, apellido_comprador, dni, whatsapp, email, metodo_pago } = req.body;

      // Verificar rifa activa
      const { rows: rifas } = await db.query('SELECT id, nombre, descripcion, fecha_sorteo FROM rifas WHERE id = $1 AND activa = true', [rifa_id]);
      if (rifas.length === 0) {
        return res.status(400).json({ error: 'La rifa seleccionada no existe o no está activa' });
      }

      // Generar número con retry
      let numero_rifa;
      let inserted = false;
      for (let i = 0; i < 10; i++) {
        numero_rifa = randomNumber();
        try {
          await db.query(
            `INSERT INTO ventas (rifa_id, numero_rifa, nombre_alumno, apellido_alumno, nombre_comprador, apellido_comprador, dni, whatsapp, email, metodo_pago)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [rifa_id, numero_rifa, nombre_alumno, apellido_alumno, nombre_comprador, apellido_comprador, dni, whatsapp, email, metodo_pago]
          );
          inserted = true;
          break;
        } catch (err) {
          if (err.code !== '23505') throw err;
          // Duplicate number, retry
        }
      }

      if (!inserted) {
        return res.status(500).json({ error: 'No se pudo generar un número único. Intentá de nuevo.' });
      }

      // Fire-and-forget email
      sendConfirmationEmail({
        email,
        nombreComprador: nombre_comprador,
        apellidoComprador: apellido_comprador,
        numeroRifa: numero_rifa,
        nombreRifa: rifas[0].nombre,
        descripcionRifa: rifas[0].descripcion,
        fechaSorteo: rifas[0].fecha_sorteo,
      });

      res.status(201).json({ numero_rifa });
    } catch (err) {
      next(err);
    }
  }
);

// Protegido: listar ventas
router.get('/', auth, async (req, res, next) => {
  try {
    let sql = `
      SELECT v.*, r.nombre AS rifa_nombre
      FROM ventas v
      JOIN rifas r ON r.id = v.rifa_id
    `;
    const params = [];

    if (req.query.rifa_id) {
      sql += ' WHERE v.rifa_id = $1';
      params.push(req.query.rifa_id);
    }

    sql += ' ORDER BY v.created_at DESC';

    const { rows } = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
