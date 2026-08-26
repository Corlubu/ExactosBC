You can save objects using the S3-compatible client exported from `src/server/minio.ts` (`minioClient`, `minioBaseUrl`). It is backed by Supabase Storage's S3-compatible API (configured via the `S3_*` env vars), not by a local Docker container.

Make sure to set up bucket creation logic in `src/server/scripts/setup.ts` for any buckets that you plan to use.

When users need to be able to GET files directly (without a presigned URL), mark the bucket as public from the Supabase dashboard (Storage -> bucket -> Make public) and upload the object under a prefix like `public/` to make it clear which files are publicly available. `minioClient.setBucketPolicy` is a no-op here (Supabase doesn't support classic S3 bucket policies) — public access is controlled at the bucket level in Supabase, not per-prefix.

When you need the storage base URL on the client side, do not try to reconstruct it there manually. Instead, expose it via a tRPC query to the client (see `getMinioBaseUrl`).
