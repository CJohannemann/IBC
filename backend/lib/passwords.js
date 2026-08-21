const crypto = require('crypto')
const { promisify } = require('util')

const scrypt = promisify(crypto.scrypt)

// scrypt is memory-hard and built into Node, so password hashing costs us no
// dependency and no native build toolchain on the VPS.
// N=16384/r=8 needs ~16 MB per hash and takes ~50-100ms - painful to brute
// force, unnoticeable when five people log in a few times a day.
const PARAMS = { N: 16384, r: 8, p: 1 }
const KEY_LEN = 64
const SALT_LEN = 16
// Node's default maxmem (32 MB) is uncomfortably close to what N=16384 needs.
const MAXMEM = 128 * PARAMS.N * PARAMS.r * 4

/** Hash a plaintext password into a self-describing string safe to store. */
async function hashPassword(password) {
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('password must be a non-empty string')
  }

  const salt = crypto.randomBytes(SALT_LEN)
  const derived = await scrypt(password, salt, KEY_LEN, { ...PARAMS, maxmem: MAXMEM })

  // Parameters travel with the hash so they can be raised later without
  // invalidating existing passwords.
  return [
    'scrypt',
    PARAMS.N,
    PARAMS.r,
    PARAMS.p,
    salt.toString('base64'),
    derived.toString('base64'),
  ].join('$')
}

/** Verify a plaintext password against a stored hash. Never throws. */
async function verifyPassword(password, stored) {
  if (typeof password !== 'string' || typeof stored !== 'string') return false

  const parts = stored.split('$')
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false

  const [, n, r, p, saltB64, hashB64] = parts
  const params = { N: Number(n), r: Number(r), p: Number(p) }
  if (!Number.isInteger(params.N) || !Number.isInteger(params.r) || !Number.isInteger(params.p)) {
    return false
  }

  try {
    const salt = Buffer.from(saltB64, 'base64')
    const expected = Buffer.from(hashB64, 'base64')
    const maxmem = Math.max(MAXMEM, 128 * params.N * params.r * 4)
    const derived = await scrypt(password, salt, expected.length, { ...params, maxmem })

    return crypto.timingSafeEqual(derived, expected)
  } catch {
    return false
  }
}

module.exports = { hashPassword, verifyPassword }
