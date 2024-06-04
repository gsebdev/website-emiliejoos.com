/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['localhost'],
      },
      env: {
        IMAGE_BLUR_DATA: process.env.IMAGE_BLUR_DATA
      }
};

export default nextConfig;
