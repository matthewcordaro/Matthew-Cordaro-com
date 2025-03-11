const withNextra = require('nextra')('nextra-theme-blog', './theme.config.js')

/** @type {import('next').NextConfig} */
let nextConfig = {};

if (process.env.NODE_ENV === 'production') {
    nextConfig = {
        distDir: '.next',
        output: 'export',
        images: {
            unoptimized: true
        }
    }
}

module.exports = withNextra(nextConfig)