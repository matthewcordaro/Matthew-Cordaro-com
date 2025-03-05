const withNextra = require('nextra')('nextra-theme-blog', './theme.config.js')

/** @type {import('next').NextConfig} */
let nextConfig;

if (process.env.NODE_ENV === 'production') {
    nextConfig = {
        output: 'export',
        images: {
            unoptimized: true,
        },
        // Add these configurations for proper routing
        trailingSlash: true,
        basePath: '',
        assetPrefix: '/',
    }
}

module.exports = withNextra(nextConfig)