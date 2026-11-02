-- Logos des stands et sponsors hébergés sur le site (public/images/logos/), au lieu de i.ibb.co,
-- postimg, wixstatic, gstatic… ou d'images base64 dans la base. À rejouer en prod APRÈS le déploiement
-- des fichiers public/images/logos/*.webp. Idempotent.
-- Non rapatriés (i.ibb.co indisponible le 03/11/2026) : Cali Botanics Development, Ty Kanna, FM Concept,
-- Noé RIOULT Photographie (stands 2026). Le site affiche leur initiale tant que le logo n'est pas hébergé.
BEGIN;
-- Bural'Zen
UPDATE "Sponsor" SET "logoUrl" = '/images/logos/bural-zen.webp' WHERE id = 'cmkv8uf8d001lleypm4n6wdjb';
-- Sativa Créations
UPDATE "Sponsor" SET "logoUrl" = '/images/logos/sativa-creations.webp' WHERE id = 'cmkv8sex1001hleyp36bf527x';
-- Matsu Genetics
UPDATE "Sponsor" SET "logoUrl" = '/images/logos/matsu-genetics.webp' WHERE id = 'cmkv94ipi001qleyp82x2hp0l';
-- Beuz / Panoramiks
UPDATE "Sponsor" SET "logoUrl" = '/images/logos/beuz-panoramiks.webp' WHERE id = 'cmkyg00ui000r5lfepx185g3d';
-- Deuwi
UPDATE "Sponsor" SET "logoUrl" = '/images/logos/deuwi.webp' WHERE id = 'cml9vuvrd00602nzcr2bgequh';
-- Spectral FingerPrints
UPDATE "Sponsor" SET "logoUrl" = '/images/logos/spectral-fingerprints.webp' WHERE id = 'cml9vwk6f00632nzc2qzo5yi5';
-- Ripple
UPDATE "Sponsor" SET "logoUrl" = '/images/logos/ripple.webp' WHERE id = 'cmm3qc4i2001kg4byh5uyk8ar';
-- Terra Aquatica
UPDATE "Sponsor" SET "logoUrl" = '/images/logos/terra-aquatica.webp' WHERE id = 'cmkv8kvos0016leyp5q3lax7m';
-- Hollyweed
UPDATE "Sponsor" SET "logoUrl" = '/images/logos/hollyweed.webp' WHERE id = 'cmmdmbybt00mig4bygagl94aj';
-- Les Chanvrier Normands
UPDATE "Stand" SET "exhibitorLogo" = '/images/logos/les-chanvrier-normands.webp' WHERE id = 'cmkx7lecm0007d7oe0nvm7kjo';
-- Charent'haze
UPDATE "Stand" SET "exhibitorLogo" = '/images/logos/charent-haze.webp' WHERE id = 'cmkx7le6x0002d7oe6gcrrp0r';
-- Cbd-druides
UPDATE "Stand" SET "exhibitorLogo" = '/images/logos/cbd-druides.webp' WHERE id = 'cmkx7lefx000ad7oemdirwmn8';
-- France Cannabis
UPDATE "Stand" SET "exhibitorLogo" = '/images/logos/france-cannabis.webp' WHERE id = 'cmkx7lei6000cd7oeujxsxibk';
-- Cannaïa - NL Distribution
UPDATE "Stand" SET "exhibitorLogo" = '/images/logos/cannaia-nl-distribution.webp' WHERE id = 'cmkx7levg000od7oezaec74vc';
-- Le Potagéant
UPDATE "Stand" SET "exhibitorLogo" = '/images/logos/le-potageant.webp' WHERE id = 'cmkx7le5s0001d7oer1po3uwo';
-- AFPC
UPDATE "Stand" SET "exhibitorLogo" = '/images/logos/afpc.webp' WHERE id = 'cmkx7leac0005d7oe5fmbwzr0';
-- La Ferme Du Rial
UPDATE "Stand" SET "exhibitorLogo" = '/images/logos/la-ferme-du-rial.webp' WHERE id = 'cmkx7ler1000kd7oec8o0pkew';
-- Chanvrier Lotois
UPDATE "Stand" SET "exhibitorLogo" = '/images/logos/chanvrier-lotois.webp' WHERE id = 'cmkx7lf25000ud7oeqnpxaemd';
-- Brume
UPDATE "Stand" SET "exhibitorLogo" = '/images/logos/brume.webp' WHERE id = 'cmkx7leuc000nd7oe07cdu7eh';
-- Mr Rod
UPDATE "Stand" SET "exhibitorLogo" = '/images/logos/mr-rod.webp' WHERE id = 'cmkx7lepy000jd7oevrg62th9';
-- NORML
UPDATE "Stand" SET "exhibitorLogo" = '/images/logos/norml.webp' WHERE id = 'cmkx7le960004d7oemv857taa';
-- Ctgrow
UPDATE "Stand" SET "exhibitorLogo" = '/images/logos/ctgrow.webp' WHERE id = 'cmkx7lf5j000xd7oeabe5bym2';
-- Third Eye Stone (copie de web.archive.org, i.ibb.co en panne)
UPDATE "Sponsor" SET "logoUrl" = '/images/logos/third-eye-stone.webp' WHERE id = 'cmmc7q73a00hsg4byo2hbk99o';
COMMIT;
