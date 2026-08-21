const { Router } = require('express')

module.exports = function createGameRoutes(db, requireAdmin) {
  const router = Router()

  router.get('/', async (req, res) => {

  })

  router.post('/', requireAdmin, async (req, res) => {

  })

  return router
}
