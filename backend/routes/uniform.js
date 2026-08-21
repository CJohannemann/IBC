// const express = require('express')
//
// module.exports = (db, requireAdmin) => {
//     const router = express.Router()
//
//     //POST new uniform
//     route.post('/', requireAdmin, async (req, res) =>{const x = () => {
//       try {
//         const { title, image_path } = req.body
//         const result = await db.run(
//             `INSERT INTO uniform (title, image_path)
//             VALUES (?, ?)`,
//             [title, image_path || null]
//         )
//         res.json({success: true, id: result.lastID})
//     } catch (err) {
//         console.error('Create uniform error:', err)
//         res.status(500).json({error: 'internal_error'})
//     }
// })
//
// }