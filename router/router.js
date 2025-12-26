const express = require('express');
const router = express.Router();

//middlewares


//handlers


// Middleware para manejar rutas con y sin prefijo /api
router.use((req, res, next) => {
    // Si la ruta viene con /api, la removemos para procesamiento interno
    if (req.path.startsWith('/api')) {
        req.url = req.url.replace('/api', '');
        req.originalUrl = req.originalUrl.replace('/api', '');
    }
    next();
});

router.get('/health', (req, res) => {
    console.log('Health check: OK, time: ', new Date().toISOString());
    return res.json({
      status: 'OK',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  });

  // Middleware para manejar rutas no encontradas
router.use((req, res) => {
    return res.status(404).json({
      error: 'Ruta no encontrada',
      path: req.originalUrl,
      method: req.method
    });
  });

module.exports = router;