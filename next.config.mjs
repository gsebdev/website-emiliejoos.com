/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'http',
            hostname: 'localhost',
            port: '3000',
            pathname: '/images/**',
          },
        ],
      },
      env: {
        IMAGE_BLUR_DATA: process.env.IMAGE_BLUR_DATA
      }
};

export default nextConfig;
