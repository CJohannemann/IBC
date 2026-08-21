const { Router } = require('express')

module.exports = function createAdminRoutes(requireAdmin) {
  const router = Router()

  router.get('/check', requireAdmin, (req, res) => {
    res.json({ authenticated: true })
  })

  return router
}
