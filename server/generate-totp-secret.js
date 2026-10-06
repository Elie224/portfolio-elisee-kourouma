#!/usr/bin/env node

/**
 * Generate a TOTP secret for admin MFA.
 *
 * Usage:
 *   node generate-totp-secret.js [accountEmail]
 *
 * Output:
 * - ADMIN_TOTP_SECRET value to set in environment
 * - otpauth URL (can be converted to QR by any trusted local tool)
 */

const otplib = require('otplib');

function main() {
  const account = (process.argv[2] || process.env.ADMIN_EMAIL || 'admin@portfolio.local').trim();
  const issuer = (process.env.TOTP_ISSUER || 'Portfolio Admin').trim();

  const secret = otplib.generateSecret();
  const otpauth = otplib.generateURI({
    label: account,
    issuer,
    secret
  });

  console.log('TOTP secret generated successfully.');
  console.log('');
  console.log(`ADMIN_TOTP_SECRET=${secret}`);
  console.log('');
  console.log('otpauth URI:');
  console.log(otpauth);
  console.log('');
  console.log('Next steps:');
  console.log('1) Add ADMIN_TOTP_SECRET to backend secrets (.env/Fly.io/Render).');
  console.log('2) Restart backend.');
  console.log('3) Open admin login and enter OTP from your authenticator app.');
}

main();
