/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

type D1Database = import('@cloudflare/workers-types').D1Database;
type R2Bucket = import('@cloudflare/workers-types').R2Bucket;

interface CloudflareEnv {
  DB: D1Database;
  MEDIA: R2Bucket;
  SESSION_SECRET: string;   // signs the login cookie
  RECOVERY_KEY: string;     // lets an admin reset a password without email
}

declare namespace App {
  interface Locals {
    user?: { id: number; email: string };
  }
}
