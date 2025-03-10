const withNextra = require('nextra')('nextra-theme-blog', './theme.config.js')

/** @type {import('next').NextConfig} */
let nextConfig;

if (process.env.NODE_ENV === 'production') {
    nextConfig = {
        output: 'export'
    }
}

module.exports = withNextra(nextConfig)