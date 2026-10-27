-- ============================================================================
-- Migration : introduction des éditions (Edition)
-- ============================================================================
-- Le projet n'utilise pas `prisma migrate` : le schéma est appliqué à la main.
-- `prisma db push` ne sait pas rattacher les lignes existantes à une édition
-- (colonnes NOT NULL sans valeur), d'où ce script transactionnel.
--
-- Effets :
--   1. crée la table "Edition" et l'édition 2026 (ACTIVE) à partir des valeurs
--      de config/site.ts et data/infos-pratiques.json ;
--   2. crée une édition ARCHIVED pour chaque année présente dans la médiathèque
--      (2024, 2025...) ;
--   3. rattache toutes les données existantes à 2026 (photos : à leur année) ;
--   4. rend les slugs / numéros de stand uniques par édition.
--
-- Application (après sauvegarde !) :
--   pg_dump "$DATABASE_URL" > backup-avant-editions.sql
--   npx prisma db execute --file prisma/manual-migrations/2026-10-27_editions.sql --url "$DATABASE_URL"
--   npx prisma migrate diff --from-url "$DATABASE_URL" --to-schema-datamodel prisma/schema.prisma
--     -> doit afficher "No difference detected."
-- ============================================================================

BEGIN;

-- 1. Table Edition -----------------------------------------------------------
CREATE TYPE "EditionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

CREATE TABLE "Edition" (
    "id" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "status" "EditionStatus" NOT NULL DEFAULT 'DRAFT',
    "startAt" TIMESTAMP(3),
    "endAt" TIMESTAMP(3),
    "venueName" TEXT,
    "address" TEXT,
    "city" TEXT,
    "posterUrl" TEXT,
    "ticketingOpenAt" TIMESTAMP(3),
    "ticketingCloseAt" TIMESTAMP(3),
    "standardTicketPrice" DOUBLE PRECISION NOT NULL DEFAULT 15,
    "flexTicketPrice" DOUBLE PRECISION NOT NULL DEFAULT 25,
    "accessTransport" TEXT,
    "accessParking" TEXT,
    "accessInfo" TEXT,
    "ticketInfo" TEXT,
    "archiveSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Edition_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Edition_year_key" ON "Edition"("year");
CREATE INDEX "Edition_status_idx" ON "Edition"("status");

-- 2. Édition 2026 (horaires stockés en UTC : 9h-19h heure de Paris = 8h-18h UTC en mars)
INSERT INTO "Edition" (
    "id", "year", "status", "startAt", "endAt",
    "venueName", "address", "city", "posterUrl",
    "ticketingOpenAt", "ticketingCloseAt", "standardTicketPrice", "flexTicketPrice",
    "accessTransport", "accessParking", "accessInfo", "ticketInfo", "updatedAt"
) VALUES (
    'edition_2026', 2026, 'ACTIVE', '2026-03-28 08:00:00', '2026-03-28 18:00:00',
    'L''Agronaute', '2 Rue du Sénégal, 44200 Nantes', 'Nantes', '/images/affiche-2026.png',
    '2026-01-15 00:00:00', '2026-03-27 23:00:00', 15, 25,
    E'Depuis Gare Sud :\nBusway ligne 5 direction Hangar à Banane.\n\nDepuis Aéroport Nantes Atlantique : \nNavette Direct vers Gare Sud puis Busway 5 direction Hangar à Banane.',
    'Parking Nantes les Nefs',
    'Le lieu est accessible aux personnes à mobilité réduite.',
    'Les billets sont disponibles en ligne. Présentez votre QR code à l''entrée.',
    CURRENT_TIMESTAMP
);

-- Éditions historiques connues uniquement par la médiathèque
INSERT INTO "Edition" ("id", "year", "status", "updatedAt")
SELECT DISTINCT 'edition_' || "edition", "edition"::int, 'ARCHIVED'::"EditionStatus", CURRENT_TIMESTAMP
FROM "Media"
WHERE "edition" ~ '^[0-9]{4}$'
ON CONFLICT ("year") DO NOTHING;

-- 3. Rattachement des données existantes -------------------------------------
ALTER TABLE "Sponsor"   ADD COLUMN "editionId" TEXT;
ALTER TABLE "Stand"     ADD COLUMN "editionId" TEXT;
ALTER TABLE "Ticket"    ADD COLUMN "editionId" TEXT;
ALTER TABLE "PromoCode" ADD COLUMN "editionId" TEXT;
ALTER TABLE "Order"     ADD COLUMN "editionId" TEXT;
ALTER TABLE "Event"     ADD COLUMN "editionId" TEXT;
ALTER TABLE "Media"     ADD COLUMN "editionId" TEXT;

UPDATE "Sponsor"   SET "editionId" = 'edition_2026';
UPDATE "Stand"     SET "editionId" = 'edition_2026';
UPDATE "Ticket"    SET "editionId" = 'edition_2026';
UPDATE "PromoCode" SET "editionId" = 'edition_2026';
UPDATE "Order"     SET "editionId" = 'edition_2026';
UPDATE "Event"     SET "editionId" = 'edition_2026';
UPDATE "Media" m   SET "editionId" = e."id" FROM "Edition" e WHERE m."edition" = e."year"::text;
UPDATE "Media"     SET "editionId" = 'edition_2026' WHERE "editionId" IS NULL;

ALTER TABLE "Sponsor"   ALTER COLUMN "editionId" SET NOT NULL;
ALTER TABLE "Stand"     ALTER COLUMN "editionId" SET NOT NULL;
ALTER TABLE "Ticket"    ALTER COLUMN "editionId" SET NOT NULL;
ALTER TABLE "PromoCode" ALTER COLUMN "editionId" SET NOT NULL;
ALTER TABLE "Order"     ALTER COLUMN "editionId" SET NOT NULL;
ALTER TABLE "Event"     ALTER COLUMN "editionId" SET NOT NULL;
ALTER TABLE "Media"     ALTER COLUMN "editionId" SET NOT NULL;

ALTER TABLE "Media" DROP COLUMN "edition";

-- 4. Unicité par édition -----------------------------------------------------
DROP INDEX "Event_slug_key";
DROP INDEX "Sponsor_slug_key";
DROP INDEX "Stand_code_key";
DROP INDEX "Stand_number_key";

CREATE INDEX "Event_editionId_idx" ON "Event"("editionId");
CREATE UNIQUE INDEX "Event_editionId_slug_key" ON "Event"("editionId", "slug");
CREATE INDEX "Media_editionId_idx" ON "Media"("editionId");
CREATE INDEX "Order_editionId_idx" ON "Order"("editionId");
CREATE INDEX "PromoCode_editionId_idx" ON "PromoCode"("editionId");
CREATE INDEX "Sponsor_editionId_idx" ON "Sponsor"("editionId");
CREATE UNIQUE INDEX "Sponsor_editionId_slug_key" ON "Sponsor"("editionId", "slug");
CREATE UNIQUE INDEX "Stand_editionId_number_key" ON "Stand"("editionId", "number");
CREATE UNIQUE INDEX "Stand_editionId_code_key" ON "Stand"("editionId", "code");
CREATE INDEX "Ticket_editionId_idx" ON "Ticket"("editionId");

ALTER TABLE "Sponsor"   ADD CONSTRAINT "Sponsor_editionId_fkey"   FOREIGN KEY ("editionId") REFERENCES "Edition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Stand"     ADD CONSTRAINT "Stand_editionId_fkey"     FOREIGN KEY ("editionId") REFERENCES "Edition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Ticket"    ADD CONSTRAINT "Ticket_editionId_fkey"    FOREIGN KEY ("editionId") REFERENCES "Edition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PromoCode" ADD CONSTRAINT "PromoCode_editionId_fkey" FOREIGN KEY ("editionId") REFERENCES "Edition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Order"     ADD CONSTRAINT "Order_editionId_fkey"     FOREIGN KEY ("editionId") REFERENCES "Edition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Event"     ADD CONSTRAINT "Event_editionId_fkey"     FOREIGN KEY ("editionId") REFERENCES "Edition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Media"     ADD CONSTRAINT "Media_editionId_fkey"     FOREIGN KEY ("editionId") REFERENCES "Edition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
