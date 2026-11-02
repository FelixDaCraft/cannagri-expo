-- ============================================================================
-- Migration : newsletter en double opt-in et preuve d'acceptation des CGV
-- ============================================================================
-- Le projet n'utilise pas `prisma migrate` : le schéma est appliqué à la main.
--
-- Effets :
--   1. "Order" : date et version des CGV acceptées (NULL pour les commandes passées) ;
--   2. "NewsletterSubscriber" : jetons de confirmation et de désinscription, date de
--      confirmation, origine et langue. Les inscrits existants gardent leur statut ;
--      chacun reçoit un jeton de désinscription. Les nouveaux inscrits sont inactifs
--      jusqu'à la confirmation (valeur par défaut de "isActive" passée à false).
--
-- Application (après sauvegarde !) :
--   pg_dump "$DATABASE_URL" > backup-avant-newsletter.sql
--   npx prisma db execute --file prisma/manual-migrations/2026-11-03_newsletter-double-optin-cgv.sql --url "$DATABASE_URL"
--   npx prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma
--     -> doit afficher "No difference detected."
-- ============================================================================

BEGIN;

-- 1. Preuve d'acceptation des CGV --------------------------------------------
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "termsAcceptedAt" TIMESTAMP(3);
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "termsVersion" TEXT;

-- 2. Newsletter en double opt-in ---------------------------------------------
ALTER TABLE "NewsletterSubscriber" ADD COLUMN IF NOT EXISTS "confirmToken" TEXT;
ALTER TABLE "NewsletterSubscriber" ADD COLUMN IF NOT EXISTS "confirmTokenExpiresAt" TIMESTAMP(3);
ALTER TABLE "NewsletterSubscriber" ADD COLUMN IF NOT EXISTS "confirmedAt" TIMESTAMP(3);
ALTER TABLE "NewsletterSubscriber" ADD COLUMN IF NOT EXISTS "unsubscribeToken" TEXT;
ALTER TABLE "NewsletterSubscriber" ADD COLUMN IF NOT EXISTS "source" TEXT;
ALTER TABLE "NewsletterSubscriber" ADD COLUMN IF NOT EXISTS "locale" TEXT;

-- Jeton de désinscription aléatoire pour les inscrits existants (64 caractères hexadécimaux)
UPDATE "NewsletterSubscriber"
SET "unsubscribeToken" = replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '')
WHERE "unsubscribeToken" IS NULL;

ALTER TABLE "NewsletterSubscriber" ALTER COLUMN "unsubscribeToken" SET NOT NULL;
ALTER TABLE "NewsletterSubscriber" ALTER COLUMN "isActive" SET DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS "NewsletterSubscriber_confirmToken_key" ON "NewsletterSubscriber"("confirmToken");
CREATE UNIQUE INDEX IF NOT EXISTS "NewsletterSubscriber_unsubscribeToken_key" ON "NewsletterSubscriber"("unsubscribeToken");

COMMIT;
