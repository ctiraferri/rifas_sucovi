const { Router } = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

const router = Router();

router.post(
  '/login',
  [
    body('user').notEmpty().withMessage('Usuario requerido'),
    body('password').notEmpty().withMessage('Contraseña requerida'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user, password } = req.body;

    if (user !== process.env.ADMIN_USER || password !== process.env.ADMIN_PASS) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ user }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token });
  }
);

module.exports = router;
