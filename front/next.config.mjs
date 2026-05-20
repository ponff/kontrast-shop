/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/media/:path*',
        destination: 'http://backend:8000/media/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://backend:8000/api/:path*',
      },
    ]
  },
  images: {
    domains: ['localhost', 'backend', 'nginx'],
    unoptimized: true,
  },
}

export default nextConfig
