/**
 * Headers only - no CSP. The strict one Next needs for its inline bootstrap
 * scripts is a nonce setup, and getting it wrong breaks the page silently, so
 * it is deliberately left out rather than half done.
 *
 * @type {import('next').NextConfig}
 */
export default {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // the site is never meant to be embedded
          {key: "X-Frame-Options", value: "DENY"},
          {key: "X-Content-Type-Options", value: "nosniff"},
          {key: "Referrer-Policy", value: "strict-origin-when-cross-origin"},
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};
