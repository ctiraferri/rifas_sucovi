const { Router } = require('express');
const db = require('../config/db');
const auth = require('../middleware/auth');

const router = Router();

// Sortear: elegir ganador random entre ventas confirmadas
router.post('/:rifaId', auth, async (req, res, next) => {
  try {
    const { rifaId } = req.params;

    // Verificar que la rifa existe
    const { rows: rifas } = await db.query('SELECT id, nombre FROM rifas WHERE id = $1', [rifaId]);
    if (rifas.length === 0) {
      return res.status(404).json({ error: 'Rifa no encontrada' });
    }

    // Elegir venta random entre confirmadas
    const { rows } = await db.query(
      `SELECT v.id, v.numero_rifa, v.nombre_comprador, v.apellido_comprador, v.dni
       FROM ventas v
       WHERE v.rifa_id = $1 AND v.estado = 'confirmada'
       ORDER BY RANDOM()
       LIMIT 1`,
      [rifaId]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'No hay ventas confirmadas para esta rifa' });
    }

    const ganador = rows[0];

    // Guardar sorteo
    await db.query(
      'INSERT INTO sorteos (rifa_id, venta_id) VALUES ($1, $2)',
      [rifaId, ganador.id]
    );

    res.json({
      numero_rifa: ganador.numero_rifa,
      nombre_comprador: ganador.nombre_comprador,
      apellido_comprador: ganador.apellido_comprador,
      dni: ganador.dni,
      rifa_nombre: rifas[0].nombre,
    });
  } catch (err) {
    next(err);
  }
});

// Historial de sorteos de una rifa
router.get('/:rifaId', auth, async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT s.id, s.created_at, v.numero_rifa, v.nombre_comprador, v.apellido_comprador, v.dni
       FROM sorteos s
       JOIN ventas v ON v.id = s.venta_id
       WHERE s.rifa_id = $1
       ORDER BY s.created_at DESC`,
      [req.params.rifaId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
