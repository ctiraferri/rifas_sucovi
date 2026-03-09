const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = Router();

// Público: rifas activas
router.get('/activas', async (req, res, next) => {
  try {
    const { rows } = await db.query('SELECT id, nombre, descripcion, valor, fecha_sorteo FROM rifas WHERE activa = true ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Protegido: todas las rifas
router.get('/', auth, async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT r.*, COALESCE(v.count, 0)::int AS ventas_count
       FROM rifas r
       LEFT JOIN (SELECT rifa_id, COUNT(*) AS count FROM ventas GROUP BY rifa_id) v ON v.rifa_id = r.id
       ORDER BY r.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Crear rifa
router.post(
  '/',
  auth,
  [
    body('nombre').trim().notEmpty().withMessage('Nombre requerido'),
    body('valor').isFloat({ min: 0 }).withMessage('Valor debe ser un número positivo'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { nombre, descripcion, valor, fecha_sorteo } = req.body;
      const { rows } = await db.query(
        'INSERT INTO rifas (nombre, descripcion, valor, fecha_sorteo) VALUES ($1, $2, $3, $4) RETURNING *',
        [nombre, descripcion || null, valor, fecha_sorteo || null]
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      next(err);
    }
  }
);

// Toggle activa
router.patch('/:id/toggle', auth, async (req, res, next) => {
  try {
    const { rows } = await db.query(
      'UPDATE rifas SET activa = NOT activa WHERE id = $1 RETURNING *',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Rifa no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Eliminar rifa (solo si no tiene ventas)
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const { rows: ventas } = await db.query('SELECT COUNT(*) FROM ventas WHERE rifa_id = $1', [req.params.id]);
    if (parseInt(ventas[0].count) > 0) {
      return res.status(400).json({ error: 'No se puede eliminar una rifa con ventas registradas' });
    }

    const { rowCount } = await db.query('DELETE FROM rifas WHERE id = $1', [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Rifa no encontrada' });
    res.json({ message: 'Rifa eliminada' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
