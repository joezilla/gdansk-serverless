/** @type {import('next').NextConfig} */

/**const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
}*/

// loggins
// next.config.js - wrap your config withAxiom()
const { withAxiom } = require('next-axiom');

module.exports = withAxiom({
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
})

