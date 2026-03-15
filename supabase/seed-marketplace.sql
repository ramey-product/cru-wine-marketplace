-- =============================================================================
-- Seed: LA Wine Marketplace — Retailers, Producers, and Wines
--
-- Auto-generated from real wine data scraped from LA wine retailers.
-- Creates 12 retailer organizations, ~50 producers, and ~200 wines.
-- Idempotent: uses ON CONFLICT (slug) DO UPDATE for upserts.
--
-- USAGE:
--   psql $DATABASE_URL -f supabase/seed-marketplace.sql
-- =============================================================================

SET search_path TO 'public', 'extensions';

DO $$
DECLARE
  _org_id UUID;
  _producer_id UUID;
BEGIN

  -- =========================================================================
  -- RETAILER 1: Helen's Wines
  -- Location: Fairfax, Los Angeles
  -- =========================================================================

  INSERT INTO public.organizations (id, name, slug, metadata)
  VALUES (
    gen_random_uuid(),
    'Helen''s Wines',
    'helens-wines',
    '{"location":"Fairfax, Los Angeles","tagline":"The dopest wine shop in LA — organic, biodynamic, and natural wines"}'::jsonb
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, metadata = EXCLUDED.metadata
  RETURNING id INTO _org_id;

  -- Producer: A. Lamblot
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'A. Lamblot',
    'a-lamblot-helens-wines',
    'Champagne',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Mouvance 21, Champagne, France, Pinot Noir/ Chardonnay/ Meunier, 2021',
    'a-lamblot-mouvance-21-champagne-france-pinot-noir-chardonnay-meunier-2021',
    'Pinot Noir',
    'Champagne',
    'France',
    2021,
    'Notes of crisp pear and orchard fruit, citrus, saline, and creaminess. Serving temp: Fridge cold! Keep it ice ice baby! Pairing: Fresh crudite; seafood; prosciutto and grissini!',
    'Notes of crisp pear and orchard fruit, citrus, saline, and creaminess. Serving temp: Fridge cold! Keep it ice ice baby! Pairing: Fresh crudite; seafood; prosciutto and grissini!',
    '["Fresh crudite","seafood","prosciutto and grissini","brunch dishes","charcuterie board"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/FullSizeRender_e755ccbb-1760-4985-bd8e-49a2458ea124.jpg',
    146.00,
    146.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Adega Pedralonga
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Adega Pedralonga',
    'adega-pedralonga-helens-wines',
    'Galicia',
    'Spain',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Terra de Godos, Rias Baixas, Galicia, Albarino, 2024',
    'adega-pedralonga-terra-de-godos-rias-baixas-galicia-albarino-2024',
    'Albarino',
    'Galicia',
    'Spain',
    2024,
    NULL,
    NULL,
    '["brunch dishes","charcuterie board","grilled meats","grilled fish"]'::jsonb,
    '{"body":2,"sweetness":1,"tannin":1,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/FullSizeRender_4_b120c27b-cbe8-440a-9cb9-bca1a8959c08.jpg',
    25.00,
    25.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Agnanum
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Agnanum',
    'agnanum-helens-wines',
    'Campania',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Sabbia Vulcanica Vino Rosso, Campania, Italy, Piedirosso, 2023',
    'agnanum-sabbia-vulcanica-vino-rosso-campania-italy-piedirosso-2023',
    'Piedirosso',
    'Campania',
    'Italy',
    2023,
    NULL,
    NULL,
    '["charcuterie board"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/IMG_6113.jpg',
    22.00,
    22.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Agrapart & Fils
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Agrapart & Fils',
    'agrapart-fils-helens-wines',
    'Champagne',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '7 Crus, Avize, Champagne, Chardonnay/Pinot Noir, NV',
    'agrapart-fils-7-crus-avize-champagne-chardonnay-pinot-noir-nv',
    'Pinot Noir',
    'Champagne',
    'France',
    NULL,
    NULL,
    NULL,
    '["charcuterie board","grilled fish"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/IMG_1570.jpg',
    104.00,
    104.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Alessandra Divella
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alessandra Divella',
    'alessandra-divella-helens-wines',
    'Lombardia',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'NiNi, Riserva, Franciacorta, Lombardia, Chardonnay/Pinot Noir, 2019',
    'alessandra-divella-nini-riserva-franciacorta-lombardia-chardonnay-pinot-noir-2019',
    'Pinot Noir',
    'Lombardia',
    'Italy',
    2019,
    'Crafted from 50% Chardonnay and 50% Pinot Noir, this sparkling wine offers a complex, savory profile with notes of bruised fruit, minerality and an elegant finish. Serving temp: Fridge cold!',
    'Crafted from 50% Chardonnay and 50% Pinot Noir, this sparkling wine offers a complex, savory profile with notes of bruised fruit, minerality and an elegant finish. Serving temp: Fridge cold!',
    '["brunch dishes"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/DSC07452.jpg',
    92.00,
    92.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Amorotti
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Amorotti',
    'amorotti-helens-wines',
    'Abruzzo',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Montepulciano d''Abruzzo, 2020',
    'amorotti-montepulciano-dabruzzo-2020',
    'Montepulciano',
    'Abruzzo',
    'Italy',
    2020,
    'Did you ever know that you''re my heroooooo? That''s the song this wine sings when it see''s a bowl of pasta. Just kidding but also SO SERIOUS! Very classic but very well make Montepulciano by the Amorotti family. Brambly, herby, dense fruit with a touch of menthol and good acidity.',
    'Did you ever know that you''re my heroooooo? That''s the song this wine sings when it see''s a bowl of pasta. Just kidding but also SO SERIOUS! Very classic but very well make Montepulciano by the Amorotti family. Brambly, herby, dense fruit with a touch of menthol and good acidity.',
    '["grilled meats"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/IMG_3201.jpg',
    74.00,
    74.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Ampeleia
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Ampeleia',
    'ampeleia-helens-wines',
    'Tuscany',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Bianco Di Ampeleia, Tuscany, Italy, Trebbiano, 2022',
    'ampeleia-bianco-di-ampeleia-tuscany-italy-trebbiano-2022',
    'Trebbiano',
    'Tuscany',
    'Italy',
    2022,
    'Bianco Di Ampeleia displays a superior expression of the territory''s identity and the way harmony arises from diversity. A brief maceration yields a golden-hued wine with notes of chamomile, rosemary and citrusy acidity. Serving temp: Fridge cold! Food pairings: Mediterranean style appetizers!',
    'Bianco Di Ampeleia displays a superior expression of the territory''s identity and the way harmony arises from diversity. A brief maceration yields a golden-hued wine with notes of chamomile, rosemary and citrusy acidity. Serving temp: Fridge cold! Food pairings: Mediterranean style appetizers!',
    '["charcuterie board","grilled fish"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/DSC06398.jpg',
    29.00,
    29.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'UnLitro, Toscana, Alicante Nero/Carignano/Sangiovese/Mourvedre/Alicante Bouschet, 1L, 2021',
    'ampeleia-unlitro-toscana-alicante-nero-carignano-sangiovese-mourvedre-alicante-bouschet-1l-2021',
    'Sangiovese',
    NULL,
    'Italy',
    2021,
    NULL,
    NULL,
    '["grilled meats"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":4,"acidity":5}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/DSC07478.jpg',
    27.00,
    27.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Anthony Thevenet
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Anthony Thevenet',
    'anthony-thevenet-helens-wines',
    'Beaujolais',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Morgon Vieilles Vignes, Beaujolais, France, Gamay, 2022',
    'anthony-thevenet-morgon-vieilles-vignes-beaujolais-france-gamay-2022',
    'Gamay',
    'Beaujolais',
    'France',
    2022,
    NULL,
    NULL,
    '["charcuterie board","grilled meats"]'::jsonb,
    '{"body":2,"sweetness":1,"tannin":2,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/IMG_2234.jpg',
    64.00,
    64.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Antoine Arena
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Antoine Arena',
    'antoine-arena-helens-wines',
    'Corsica',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Hauts de Carco, Corsica, France, Vermentinu, 2024',
    'antoine-arena-hauts-de-carco-corsica-france-vermentinu-2024',
    NULL,
    'Corsica',
    'France',
    2024,
    NULL,
    NULL,
    '["charcuterie board","grilled meats","grilled fish"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/FullSizeRender_3_ddb8b805-8cca-4a15-8112-ba6e25fd822e.jpg',
    51.00,
    51.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Memoria, Patrimonio, Corsica, Nielluccio, 2024',
    'antoine-arena-memoria-patrimonio-corsica-nielluccio-2024',
    NULL,
    'Corsica',
    'France',
    2024,
    NULL,
    NULL,
    '["charcuterie board"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/IMG_0319.jpg',
    93.00,
    93.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Artuke
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Artuke',
    'artuke-helens-wines',
    'Rioja',
    'Spain',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Tinto, Rioja, Spain, Tempranillo/Viura, 2024',
    'artuke-tinto-rioja-spain-tempranillo-viura-2024',
    'Tempranillo',
    'Rioja',
    'Spain',
    2024,
    NULL,
    NULL,
    '["charcuterie board","grilled meats","grilled fish"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/IMG_1071.jpg',
    20.00,
    20.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Benjamin Leroux
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Benjamin Leroux',
    'benjamin-leroux-helens-wines',
    'Burgundy',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '1er Cru, La Piece Sous Le Bois, Meursault, Chardonnay, 2021',
    'benjamin-leroux-1er-cru-la-piece-sous-le-bois-meursault-chardonnay-2021',
    'Chardonnay',
    'Burgundy',
    'France',
    2021,
    'Born and raised in the heart of Burgundy, France, Leroux''s winemaking philosophy revolves around respect for nature and minimal intervention. Crisp and lively with notes of bright citrus and pear!',
    'Born and raised in the heart of Burgundy, France, Leroux''s winemaking philosophy revolves around respect for nature and minimal intervention. Crisp and lively with notes of bright citrus and pear!',
    '["charcuterie board","grilled meats","grilled fish"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":1,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/IMG-6948.jpg',
    280.00,
    280.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Gevrey-Chambertin, Pinot Noir, 2021',
    'benjamin-leroux-gevrey-chambertin-pinot-noir-2021',
    'Pinot Noir',
    'Burgundy',
    'France',
    2021,
    NULL,
    NULL,
    '["grilled meats","grilled fish"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/IMG_1921.heic',
    152.00,
    152.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Amelie Berthaut
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Amelie Berthaut',
    'amelie-berthaut-helens-wines',
    'Burgundy',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Berthaut-Gerbet, Les Clos, Fixin, Cotes de Nuits, Burgundy, France, Pinot Noir, 2023',
    'berthaut-gerbet-les-clos-fixin-cotes-de-nuits-burgundy-france-pinot-noir-2023',
    'Pinot Noir',
    'Burgundy',
    'France',
    2023,
    NULL,
    NULL,
    '["grilled meats","grilled fish"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/berthautlesclos18.jpg',
    92.00,
    92.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Berthaut-Gerbet, Les Crais, Fixin, Cotes de Nuits, Burgundy, France, Pinot Noir, 2023',
    'berthaut-gerbet-les-crais-fixin-cotes-de-nuits-burgundy-france-pinot-noir-2023',
    'Pinot Noir',
    'Burgundy',
    'France',
    2023,
    NULL,
    NULL,
    '["grilled meats","grilled fish"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/AmelieLesCrais.jpg',
    94.00,
    94.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Bisson
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Bisson',
    'bisson-helens-wines',
    'Veneto',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Glera, Vino Frizzante, Marca Trevigiana, Veneto, Italy, 2024',
    'bisson-glera-vino-frizzante-marca-trevigiana-veneto-italy-2024',
    'Glera',
    'Veneto',
    'Italy',
    2024,
    'Hand-harvested from steep hillside vineyards in the Veneto region of Italy, this is a beautifully-refreshing Prosecco! Bone-dry, clean and bright with hints of white flowers, honey, tart nectarines and subtle minerality! Serving temp: Fridge cold!',
    'Hand-harvested from steep hillside vineyards in the Veneto region of Italy, this is a beautifully-refreshing Prosecco! Bone-dry, clean and bright with hints of white flowers, honey, tart nectarines and subtle minerality! Serving temp: Fridge cold!',
    '["brunch dishes","charcuterie board"]'::jsonb,
    '{"body":1,"sweetness":2,"tannin":1,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/IMG_07052.heic',
    28.00,
    28.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Paglianetto
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Paglianetto',
    'paglianetto-helens-wines',
    'Marche',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Borgo Paglianetto, Terravignata, Marche, Italy Verdicchio, 2024',
    'borgo-paglianetto-terravignata-marche-italy-verdicchio-2024',
    'Verdicchio',
    'Marche',
    'Italy',
    2024,
    'Sometimes a perfectly zippy white wine comes into your life at just the right moment. Grown in the picturesque rolling hills of the Marche, where green is popping off Green, this wine grows and is made. The vines are a little bit above sea level and the grapes are picked at varying levels of ripeness. The clay-calcarious soils do no wrong as far as terroir is concerned and honestly expressed such a delicious and linear verdicchio, it''s everything that I want in a white wine and more. Serving tem',
    'Sometimes a perfectly zippy white wine comes into your life at just the right moment. Grown in the picturesque rolling hills of the Marche, where green is popping off Green, this wine grows and is made. The vines are a little bit above sea level and the grapes are picked at varying levels of ripeness. The clay-calcarious soils do no wrong as far as terroir is concerned and honestly expressed such a delicious and linear verdicchio, it''s everything that I want in a white wine and more. Serving tem',
    '["charcuterie board","grilled meats","grilled fish"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/FullSizeRender_1_5fd3c30a-337a-4150-8b47-5e0bdd040bf6.jpg',
    25.00,
    25.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Bret Brothers
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Bret Brothers',
    'bret-brothers-helens-wines',
    'Beaujolais',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Brouilly Cuvee Zen, Beaujolais, France, Gamay, 2022',
    'bret-brothers-brouilly-cuvee-zen-beaujolais-france-gamay-2022',
    'Gamay',
    'Beaujolais',
    'France',
    2022,
    NULL,
    NULL,
    '["charcuterie board"]'::jsonb,
    '{"body":2,"sweetness":1,"tannin":2,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/622B7E1C-D7F9-4300-B591-11BCF41E3988_1_201_a.jpg',
    61.00,
    61.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Cantine Benvenuto
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Cantine Benvenuto',
    'cantine-benvenuto-helens-wines',
    NULL,
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Mare, Calabria, Italy, Malvasia/Zibibbo, 2024',
    'cantine-benvenuto-mare-calabria-italy-malvasia-zibibbo-2024',
    NULL,
    NULL,
    'Italy',
    2024,
    NULL,
    NULL,
    '["charcuterie board","grilled fish"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/5A68DB09-849A-49B9-9AB9-F5CE3E94CC27_1_201_a.jpg',
    30.00,
    30.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Caparsa
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Caparsa',
    'caparsa-helens-wines',
    NULL,
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Doccio a Matteo Riserva, Chianti Classico, Italy, Chianti Blend, 2016',
    'caparsa-doccio-a-matteo-riserva-chianti-classico-italy-chianti-blend-2016',
    NULL,
    NULL,
    'Italy',
    2016,
    NULL,
    NULL,
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/IMG-4060.jpg',
    94.00,
    94.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Caroline Bellavoine
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Caroline Bellavoine',
    'caroline-bellavoine-helens-wines',
    'Burgundy',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Cote Chalonnaise France, Chardonnay, 2022',
    'caroline-bellavoine-cote-chalonnaise-france-chardonnay-2022',
    'Chardonnay',
    'Burgundy',
    'France',
    2022,
    'Elegant and mineraly! Serving temp: Fridge cold! Food pairings: Grilled lobster, grilled asparagus with lemon, olive oil and sea salt!',
    'Elegant and mineraly! Serving temp: Fridge cold! Food pairings: Grilled lobster, grilled asparagus with lemon, olive oil and sea salt!',
    '["charcuterie board","grilled meats","grilled fish"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":1,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/298DD1A6-DE16-4832-9216-4505DE1DD54C_1_201_a.jpg',
    36.00,
    36.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Cascina Fèipu dei Massaretti
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Cascina Fèipu dei Massaretti',
    'cascina-feipu-dei-massaretti-helens-wines',
    'Liguria',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Cascina Feipu dei Massaretti, Pigato, Liguria, Pigato, 2023',
    'cascina-feipu-dei-massaretti-pigato-liguria-pigato-2023',
    NULL,
    'Liguria',
    'Italy',
    2023,
    'A dry, fresh and balanced white from the Ligurian Riviera... With notes of white stone fruit and dried Mediterranean herbs, this is one of the most suitable wines for seafood dishes! Serving temp: fridge cold! Pairing: pesto pasta; focaccia with olive oil and rosemary',
    'A dry, fresh and balanced white from the Ligurian Riviera... With notes of white stone fruit and dried Mediterranean herbs, this is one of the most suitable wines for seafood dishes! Serving temp: fridge cold! Pairing: pesto pasta; focaccia with olive oil and rosemary',
    '["pesto pasta","focaccia with olive oil and rosemary","charcuterie board","grilled meats"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/IMG_0336.heic',
    36.00,
    36.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Caveau des Byards
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Caveau des Byards',
    'caveau-des-byards-helens-wines',
    'Jura',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Cremant du Jura Rose, Jura, Pinot Noir/Trousseau/Poulsard, NV',
    'caveau-des-byards-cremant-du-jura-rose-jura-pinot-noir-trousseau-poulsard-nv',
    'Pinot Noir',
    'Jura',
    'France',
    NULL,
    'This Pinot Noir-dominant Crémant du Jura Rosé is dry and crisp, with notes of red fruit. Serving temp: Fridge cold!',
    'This Pinot Noir-dominant Crémant du Jura Rosé is dry and crisp, with notes of red fruit. Serving temp: Fridge cold!',
    '["brunch dishes"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/IMG_8697.jpg',
    42.00,
    42.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Chartogne-Taillet
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Chartogne-Taillet',
    'chartogne-taillet-helens-wines',
    'Champagne',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Sainte Anne, Chardonnay/Pinot Noir/Pinot Meunier, NV',
    'chartogne-taillet-sainte-anne-chardonnay-pinot-noir-pinot-meunier-nv',
    'Champagne',
    'Champagne',
    'France',
    NULL,
    NULL,
    NULL,
    '["brunch dishes"]'::jsonb,
    '{"body":2,"sweetness":1,"tannin":1,"acidity":5}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/1486C645-A660-478D-827C-BD4DFACBEA47_1_201_a.jpg',
    112.00,
    112.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Chateau de Miniere
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Chateau de Miniere',
    'chateau-de-miniere-helens-wines',
    NULL,
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Bulles de Miniere Rose, Bourgueil, Cabernet Franc, NV',
    'chateau-de-miniere-bulles-de-miniere-rose-bourgueil-cabernet-franc-nv',
    'Cabernet Franc',
    NULL,
    'France',
    NULL,
    NULL,
    NULL,
    '["charcuterie board"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/IMG_1304.jpg',
    26.00,
    26.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Châaeau la Croix Toulifaut
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Châaeau la Croix Toulifaut',
    'chaaeau-la-croix-toulifaut-helens-wines',
    'Bordeaux',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Chateau la Croix Toulifaut, Pomerol, Bordeaux, Merlot/ Cabernet Franc, 2007',
    'chateau-la-croix-toulifaut-pomerol-bordeaux-merlot-cabernet-franc-2007',
    'Merlot',
    'Bordeaux',
    'France',
    2007,
    NULL,
    NULL,
    '["charcuterie board"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":3,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/IMG_9782.jpg',
    92.00,
    92.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Chateau La Grolet
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Chateau La Grolet',
    'chateau-la-grolet-helens-wines',
    'Bordeaux',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Cotes de Bourg, Bordeaux, France, Merlot/Cabernet Sauvignon/Cabernet Franc/Malbec, 2022',
    'chateau-la-grolet-cotes-de-bourg-bordeaux-france-merlot-cabernet-sauvignon-cabernet-franc-malbec-2022',
    'Cabernet Sauvignon',
    'Bordeaux',
    'France',
    2022,
    'Grolet is a biodynamic producer in Bordeaux, more specifically in the Cotes de Bourg and the wine is made from a classic combination of Cabernet Sauvignon, Merlot and Cabernet Franc. Also a touch of malbec!! The wine is medium to full bodied, but maintains an awesome back bone and amazing nuance. What''s also cool about this wine is that part of its dynamic energy comes from the fact that the vines are planted in deeper clay soil with gravel on top. Serving temp: Cellar temp around 65 degrees, st',
    'Grolet is a biodynamic producer in Bordeaux, more specifically in the Cotes de Bourg and the wine is made from a classic combination of Cabernet Sauvignon, Merlot and Cabernet Franc. Also a touch of malbec!! The wine is medium to full bodied, but maintains an awesome back bone and amazing nuance. What''s also cool about this wine is that part of its dynamic energy comes from the fact that the vines are planted in deeper clay soil with gravel on top. Serving temp: Cellar temp around 65 degrees, st',
    '["charcuterie board","grilled meats","grilled fish"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/IMG_1769.jpg',
    23.00,
    23.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Chateau le Puy
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Chateau le Puy',
    'chateau-le-puy-helens-wines',
    'Bordeaux',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Emilien, Cotes de Bordeaux, Merlot/Cabernet Sauv/Carmenere, 2022',
    'chateau-le-puy-emilien-cotes-de-bordeaux-merlot-cabernet-sauv-carmenere-2022',
    'Cabernet Sauvignon',
    'Bordeaux',
    'France',
    2022,
    'Full-bodied and suuuuper silky, this garnet-red wine exudes aromatic notes of ripe red fruit with hints of wild undergrowth. The palate is well-rounded and complex possessing notes of ripe currants, bell pepper, plum and olive.',
    'Full-bodied and suuuuper silky, this garnet-red wine exudes aromatic notes of ripe red fruit with hints of wild undergrowth. The palate is well-rounded and complex possessing notes of ripe currants, bell pepper, plum and olive.',
    '["charcuterie board","grilled meats"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/lepuyemilien2017.jpg',
    87.00,
    87.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Champagne Chavost
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Champagne Chavost',
    'champagne-chavost-helens-wines',
    'Champagne',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Chavost, Blanc d'' Assemblage, Brut Nature, Pinot Meunier/Pinot Noir/Chardonnay, NV',
    'chavost-blanc-d-assemblage-brut-nature-pinot-meunier-pinot-noir-chardonnay-nv',
    'Pinot Noir',
    'Champagne',
    'France',
    NULL,
    'What is unique about the Chavost project is that it is a co-op of 20 different growers all together. Once Fabian took over, he convinced all of these tiny wine growers to trust in turning their grapes into wines made without any additives or sulphites. This should not be taken lightly as the traditions in Champagne, the older generation''s mindset have been some of the most resistant to change but the result has been absolutely astounding. Zippy, bright and fresh! Chavost just hits differently!!!',
    'What is unique about the Chavost project is that it is a co-op of 20 different growers all together. Once Fabian took over, he convinced all of these tiny wine growers to trust in turning their grapes into wines made without any additives or sulphites. This should not be taken lightly as the traditions in Champagne, the older generation''s mindset have been some of the most resistant to change but the result has been absolutely astounding. Zippy, bright and fresh! Chavost just hits differently!!!',
    '["charcuterie board","grilled fish"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/IMG_2026.jpg',
    82.00,
    82.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Clos des Mourres
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Clos des Mourres',
    'clos-des-mourres-helens-wines',
    'Rhone',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Pompette, Vin de France, Aubun/Counoise/Cinsault/Tempranillo, 2022',
    'clos-des-mourres-pompette-vin-de-france-aubun-counoise-cinsault-tempranillo-2022',
    'Syrah',
    'Rhone',
    'France',
    2022,
    NULL,
    NULL,
    '["grilled meats"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/DSC07352.jpg',
    38.00,
    38.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Clos Saint Joseph
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Clos Saint Joseph',
    'clos-saint-joseph-helens-wines',
    'Provence',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Blanc de Blancs, Cotes de provence, France, Rolle/ Ugni Blanc, 2022',
    'clos-saint-joseph-blanc-de-blancs-cotes-de-provence-france-rolle-ugni-blanc-2022',
    NULL,
    'Provence',
    'France',
    2022,
    NULL,
    NULL,
    '["charcuterie board","grilled meats","grilled fish"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/IMG_0312.jpg',
    40.00,
    40.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Closerie des Moussis
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Closerie des Moussis',
    'closerie-des-moussis-helens-wines',
    'Bordeaux',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Closeries Des moussis, Haut-Médoc, Bordeaux,France, Cabernet Sauvignon/ Merlot/ Cabernet Franc, 2021',
    'closeries-des-moussis-haut-medoc-bordeaux-france-cabernet-sauvignon-merlot-cabernet-franc-2021',
    'Cabernet Sauvignon',
    'Bordeaux',
    'France',
    2021,
    NULL,
    NULL,
    '["charcuterie board","grilled meats","grilled fish"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/moussis.jpg',
    59.00,
    59.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Comtes Lafon
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Comtes Lafon',
    'comtes-lafon-helens-wines',
    'Burgundy',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '1er Cru, Meursault-Porusots, Chardonnay, 2019',
    'comtes-lafon-1er-cru-meursault-porusots-chardonnay-2019',
    'Chardonnay',
    'Burgundy',
    'France',
    2019,
    'Vibrant and full-bodied, while balanced with natural acidity. Flavor notes of ripe peaches, apricot and lemon curd. Pairs beautifully with broiled lobster tails and soft cheeses! Serving temp: Fridge cold! Food pairing: King prawns in garlic butter sauce or Creamy butternut squash risotto!',
    'Vibrant and full-bodied, while balanced with natural acidity. Flavor notes of ripe peaches, apricot and lemon curd. Pairs beautifully with broiled lobster tails and soft cheeses! Serving temp: Fridge cold! Food pairing: King prawns in garlic butter sauce or Creamy butternut squash risotto!',
    '["charcuterie board"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":1,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/ComtesLafonPorusot.jpg',
    610.00,
    610.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: COZs
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'COZs',
    'cozs-helens-wines',
    NULL,
    'Portugal',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Pop, Vinho Branco Macerado, Lisbon, Portugal, Vital, 2023',
    'cozs-pop-vinho-branco-macerado-lisbon-portugal-vital-2023',
    NULL,
    NULL,
    'Portugal',
    2023,
    '100% Vital, from Serra de Montejunto, not far from Lisbon and the salty Atlantic Ocean. Serving temp: Fridge cold! Pairing: Ruben sandwich; Grilled cheese and soup',
    '100% Vital, from Serra de Montejunto, not far from Lisbon and the salty Atlantic Ocean. Serving temp: Fridge cold! Pairing: Ruben sandwich; Grilled cheese and soup',
    '["Ruben sandwich","Grilled cheese and soup","brunch dishes"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/C25E377F-F07D-4056-8FD4-0EE437D2A20E_1_201_a.jpg',
    40.00,
    40.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Cume do Avia
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Cume do Avia',
    'cume-do-avia-helens-wines',
    NULL,
    'Spain',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Colleita 10, Tinto, Ribeiro, Caino Longo/Souson/Brancellao, 2022',
    'cume-do-avia-colleita-10-tinto-ribeiro-caino-longo-souson-brancellao-2022',
    NULL,
    NULL,
    'Spain',
    2022,
    NULL,
    NULL,
    '["charcuterie board"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/FullSizeRender_017f505c-b3c9-4080-bdce-dd8f80782137.jpg',
    28.00,
    28.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Domaine La Calmette
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Domaine La Calmette',
    'domaine-la-calmette-helens-wines',
    NULL,
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Domaine Calmette, Trespotz, Cahors, Malbec/Merlot, 2022',
    'domaine-calmette-trespotz-cahors-malbec-merlot-2022',
    'Malbec',
    NULL,
    'France',
    2022,
    'Made by a super cool couple, growing grapes at high elevation vineyards in Cahors, surrounded by forest energy. It all adds up to the magic that is the wines from Domaine La Calmette. This is the Trespotz which translates to "three wells" but references the fact that this wine is a blend of grapes grown in three different types of soil: red clay, marl & Kimmeridgian. The wine is mostly Malbec with a touch of Merlot, its inky dark complexion gives way to a super balanced and luscious red wine tha',
    'Made by a super cool couple, growing grapes at high elevation vineyards in Cahors, surrounded by forest energy. It all adds up to the magic that is the wines from Domaine La Calmette. This is the Trespotz which translates to "three wells" but references the fact that this wine is a blend of grapes grown in three different types of soil: red clay, marl & Kimmeridgian. The wine is mostly Malbec with a touch of Merlot, its inky dark complexion gives way to a super balanced and luscious red wine tha',
    '["grilled meats"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/trespotz.jpg',
    42.00,
    42.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Domaine Clos des Rocs
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Domaine Clos des Rocs',
    'domaine-clos-des-rocs-helens-wines',
    'Burgundy',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'En Pres Foret, Macon-Loche, Burgundy, France, Chardonnay, 2024',
    'domaine-clos-des-rocs-en-pres-foret-macon-loche-burgundy-france-chardonnay-2024',
    'Chardonnay',
    'Burgundy',
    'France',
    2024,
    NULL,
    NULL,
    '["charcuterie board","grilled meats","grilled fish"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":1,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/FullSizeRender_2_48d34c5a-ad18-4c01-ab82-ea7c06aa241b.jpg',
    41.00,
    41.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Domaine Del Leone
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Domaine Del Leone',
    'domaine-del-leone-helens-wines',
    'Veneto',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Veneto Rosso, IGT, Merlot/ Cabernet, NV',
    'domaine-del-leone-veneto-rosso-igt-merlot-cabernet-nv',
    'Merlot',
    'Veneto',
    'Italy',
    NULL,
    NULL,
    NULL,
    '["charcuterie board"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":3,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/FullSizeRender_2_504b7527-8832-4cb7-8810-638a7f5f1419.jpg',
    18.00,
    18.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Domaine des Hauts Baigneux
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Domaine des Hauts Baigneux',
    'domaine-des-hauts-baigneux-helens-wines',
    'Loire Valley',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Domaine des Hauts Baigneux, Les Moulins, Loire Valley, France, Cabernet Franc, 2023',
    'domaine-des-hauts-baigneux-les-moulins-loire-valley-france-cabernet-franc-2023',
    'Cabernet Franc',
    'Loire Valley',
    'France',
    2023,
    NULL,
    NULL,
    '["charcuterie board"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/IMG_6953.jpg',
    26.00,
    26.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Domaine du Jaugaret
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Domaine du Jaugaret',
    'domaine-du-jaugaret-helens-wines',
    'Bordeaux',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Saint-Julien, Cabernet Sauvignon/Petit Verdot/Malbec, 2019',
    'domaine-du-jaugaret-saint-julien-cabernet-sauvignon-petit-verdot-malbec-2019',
    'Cabernet Sauvignon',
    'Bordeaux',
    'France',
    2019,
    'The estate of Domaine du Jaugaret has been in the Fillastre family since 1654 (!!!), and Jean-François Fillastre is dedicated to preserving it''s traditions! With it''s savory, black-fruit layered, tobacco-rich earth, and herbal bouquet, this wine is a pure and poetic expression of it''s terroir! Serve with braised thighs, mushroom risotto or aged cheeses.',
    'The estate of Domaine du Jaugaret has been in the Fillastre family since 1654 (!!!), and Jean-François Fillastre is dedicated to preserving it''s traditions! With it''s savory, black-fruit layered, tobacco-rich earth, and herbal bouquet, this wine is a pure and poetic expression of it''s terroir! Serve with braised thighs, mushroom risotto or aged cheeses.',
    '["grilled meats"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/Jaugart.jpg',
    216.00,
    216.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Domaine du Kre
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Domaine du Kre',
    'domaine-du-kre-helens-wines',
    NULL,
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Plongeon, Savoie, France, Gamay, 2023',
    'domaine-du-kre-plongeon-savoie-france-gamay-2023',
    'Gamay',
    NULL,
    'France',
    2023,
    NULL,
    NULL,
    '["versatile pairing"]'::jsonb,
    '{"body":2,"sweetness":1,"tannin":2,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/80DCB787-AFE5-40C8-8D58-3519511F9A95_1_201_a.jpg',
    23.00,
    23.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Domaine Fourrier
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Domaine Fourrier',
    'domaine-fourrier-helens-wines',
    'Burgundy',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '1er Cru, La Combe Aux Moines, Gevrey-Chambertin, Vieille Vigne, Burgundy, Pinot Noir, 2023',
    'domaine-fourrier-1er-cru-la-combe-aux-moines-gevrey-chambertin-vieille-vigne-burgundy-pinot-noir-2023',
    'Pinot Noir',
    'Burgundy',
    'France',
    2023,
    NULL,
    NULL,
    '["charcuterie board"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/IMG_7417.jpg',
    398.00,
    398.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '1er Cru, Les Goulots, Gevrey-Chambertin, Vieille Vigne, Burgundy, Pinot Noir, 2023',
    'domaine-fourrier-1er-cru-les-goulots-gevrey-chambertin-vieille-vigne-burgundy-pinot-noir-2023',
    'Pinot Noir',
    'Burgundy',
    'France',
    2023,
    NULL,
    NULL,
    '["charcuterie board"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/IMG_7418.jpg',
    356.00,
    356.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Domaine Landron Chartier
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Domaine Landron Chartier',
    'domaine-landron-chartier-helens-wines',
    NULL,
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Melon B, Vin de France, Melon de Bourgogne, 2023',
    'domaine-landron-chartier-melon-b-vin-de-france-melon-de-bourgogne-2023',
    NULL,
    NULL,
    'France',
    2023,
    'This is from an area called Muscadet and made from a grape called Melon de Bourgogne. It''s literally the perfect oyster wine: Hence the label. Fresh, zippy, bright, mineral-rich and palette wetting. It''s a wine you always want to take another sip of, especially when you are downing briny little treats. The subtle, but not sweet, notes of pear, apple and honeydew are coupled with a dubstep beat of minerals and brightness. This is a third generation winemaker and is one of few in Muscadet who appr',
    'This is from an area called Muscadet and made from a grape called Melon de Bourgogne. It''s literally the perfect oyster wine: Hence the label. Fresh, zippy, bright, mineral-rich and palette wetting. It''s a wine you always want to take another sip of, especially when you are downing briny little treats. The subtle, but not sweet, notes of pear, apple and honeydew are coupled with a dubstep beat of minerals and brightness. This is a third generation winemaker and is one of few in Muscadet who appr',
    '["grilled fish"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/landronchartier.jpg',
    27.00,
    27.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Domaine Les Enfants Sauvages
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Domaine Les Enfants Sauvages',
    'domaine-les-enfants-sauvages-helens-wines',
    'Roussillon',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Côtes Catalanes Bouche du Soleil, Roussillon, France, Muscat of Alexandria, 2024',
    'domaine-les-enfants-sauvages-cotes-catalanes-bouche-du-soleil-roussillon-france-muscat-of-alexandria-2024',
    NULL,
    'Roussillon',
    'France',
    2024,
    'A complex bouquet featuring aromatic notes of ripe stone fruits and citrus, as well as subtle hints of jasmine, with herbal undertones. The palate is rich and textured, highlighting flavors of dried fruits, a touch of spice, and refreshing acidity.',
    'A complex bouquet featuring aromatic notes of ripe stone fruits and citrus, as well as subtle hints of jasmine, with herbal undertones. The palate is rich and textured, highlighting flavors of dried fruits, a touch of spice, and refreshing acidity.',
    '["brunch dishes","charcuterie board"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/IMG_8698.jpg',
    36.00,
    36.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- =========================================================================
  -- RETAILER 2: Merchant of Wine
  -- Location: Mid-City, Los Angeles
  -- =========================================================================

  INSERT INTO public.organizations (id, name, slug, metadata)
  VALUES (
    gen_random_uuid(),
    'Merchant of Wine',
    'merchant-of-wine',
    '{"location":"Mid-City, Los Angeles","tagline":"Curated wines delivered to your door across Los Angeles"}'::jsonb
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, metadata = EXCLUDED.metadata
  RETURNING id INTO _org_id;

  -- Producer: 00 Wines
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    '00 Wines',
    '00-wines-merchant-of-wine',
    'Willamette Valley',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '''VGR'', Pinot Noir, Willamette Valley, Oregon, 2022',
    '00-wines-vgr-pinot-noir-willamette-valley-oregon-2022',
    'Pinot Noir',
    'Willamette Valley',
    'United States',
    2022,
    'Overview of the Wine Double Zero Wines is a daring journey exploring the potential of cool-climate Chardonnay and Pinot Noir by wine industry pioneer Chris Hermann and entrepreneur Kathryn Hermann. 00 Wines was founded in 2015, emerging from a fusion of family heritage and winemaking ambition. The vision was born from Chris Hermann, an attorney specializing in international wine law, and his late father, Dr. Richard Hermann, a distinguished botanist and Douglas Fir geneticist at Oregon State Uni',
    'Overview of the Wine Double Zero Wines is a daring journey exploring the potential of cool-climate Chardonnay and Pinot Noir by wine industry pioneer Chris Hermann and entrepreneur Kathryn Hermann. 00 Wines was founded in 2015, emerging from a fusion of family heritage and winemaking ambition. The vision was born from Chris Hermann, an attorney specializing in international wine law, and his late father, Dr. Richard Hermann, a distinguished botanist and Douglas Fir geneticist at Oregon State Uni',
    '["versatile pairing"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/00_Wines_VGR_Pinot_Noir_Willamette_Valley_Oregon_2022.jpg',
    102.95,
    102.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: 001 Vintners
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    '001 Vintners',
    '001-vintners-merchant-of-wine',
    'Napa Valley',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Cabernet Sauvignon, Ecotone Vineyard, Napa Valley, 2021 (Graeme MacDonald)',
    '001-vintners-cabernet-sauvignon-ecotone-vineyard-napa-valley-2021-graeme-macdonald',
    'Cabernet Sauvignon',
    'Napa Valley',
    'United States',
    2021,
    'Overview of the Wine Following the repeal of Prohibition, in 1933, Carmine Martignetti was granted retail license number 001 for Martignetti Grocery Company in Boston''s North End. Since the late 1970''s, a passion for wine led our family to introduce numerous Napa Valley wines to New England. Inspired by those classic vintages, third-generation principals Carmine and Beth Martignetti and their sons Freddie, Philip and Michael have created their own wine, sourced from thirty-three-year-old hillsid',
    'Overview of the Wine Following the repeal of Prohibition, in 1933, Carmine Martignetti was granted retail license number 001 for Martignetti Grocery Company in Boston''s North End. Since the late 1970''s, a passion for wine led our family to introduce numerous Napa Valley wines to New England. Inspired by those classic vintages, third-generation principals Carmine and Beth Martignetti and their sons Freddie, Philip and Michael have created their own wine, sourced from thirty-three-year-old hillsid',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/001_Vintners_Ecotone_Vineyard_Cabernet_Sauvignon_Napa_Valley_California_2021.jpg',
    214.79,
    214.79,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: 10 Ninths
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    '10 Ninths',
    '10-ninths-merchant-of-wine',
    'Santa Barbara',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Chardonnay, Sta. Rita Hills, Santa Barbara, California, 2022',
    '10-ninths-chardonnay-sta-rita-hills-santa-barbara-california-2022',
    'Chardonnay',
    'Santa Barbara',
    'United States',
    2022,
    'Overview of the Wine Our vineyards are located in the sloping, sandy soils at the westernmost edge of the Sta. Rita Hills, where a cool maritime influence results in a slow, deliberate ripening of the grapes. Through minimal intervention viticultural practices, we aim to bring out the vibrant, balanced, and distinctive qualities of our 10 Ninths wines. At 10 Ninths, craftsmanship is our art form. Our team strives to create exceptional wines that harmonize with nature. Through regenerative method',
    'Overview of the Wine Our vineyards are located in the sloping, sandy soils at the westernmost edge of the Sta. Rita Hills, where a cool maritime influence results in a slow, deliberate ripening of the grapes. Through minimal intervention viticultural practices, we aim to bring out the vibrant, balanced, and distinctive qualities of our 10 Ninths wines. At 10 Ninths, craftsmanship is our art form. Our team strives to create exceptional wines that harmonize with nature. Through regenerative method',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":1,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/10_Ninths_Chardonnay_Santa_Barbara_California_2022.jpg',
    49.95,
    49.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Radius, Pinot Noir, Sta. Rita Hills, Santa Barbara, California, 2021',
    '10-ninths-radius-pinot-noir-sta-rita-hills-santa-barbara-california-2021',
    'Pinot Noir',
    'Santa Barbara',
    'United States',
    2021,
    'Overview of the Wine Our vineyards are located in the sloping, sandy soils at the westernmost edge of the Sta. Rita Hills, where a cool maritime influence results in a slow, deliberate ripening of the grapes. Through minimal intervention viticultural practices, we aim to bring out the vibrant, balanced, and distinctive qualities of our 10 Ninths wines. At 10 Ninths, craftsmanship is our art form. Our team strives to create exceptional wines that harmonize with nature. Through regenerative method',
    'Overview of the Wine Our vineyards are located in the sloping, sandy soils at the westernmost edge of the Sta. Rita Hills, where a cool maritime influence results in a slow, deliberate ripening of the grapes. Through minimal intervention viticultural practices, we aim to bring out the vibrant, balanced, and distinctive qualities of our 10 Ninths wines. At 10 Ninths, craftsmanship is our art form. Our team strives to create exceptional wines that harmonize with nature. Through regenerative method',
    '["versatile pairing"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/10_Ninths_Radius_Pinot_Noir_Santa_Barbara_California_2021.jpg',
    44.95,
    44.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: 50 by 50
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    '50 by 50',
    '50-by-50-merchant-of-wine',
    'Napa Valley',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Rose of Pinot Noir, Carneros, California, 2023',
    '50-by-50-rose-of-pinot-noir-carneros-california-2023',
    'Pinot Noir',
    'Napa Valley',
    'United States',
    2023,
    'Overview of the Wine "The 50 by 50 -- what''s in a name? To start it''s the fusion of two passions - architecture and wine, the latter one dominating as I drank my way to knowledge traveling around the globe performing with my band, Devi, through 7 world tours and countless music festivals. From consumer, to respectful student to devoted Pinot Noir producer. My love of Pinot Noir came later in life. When my band, Devo, signed with Warner Brothers Records in 1978, we left Ohio for the promise of Ca',
    'Overview of the Wine "The 50 by 50 -- what''s in a name? To start it''s the fusion of two passions - architecture and wine, the latter one dominating as I drank my way to knowledge traveling around the globe performing with my band, Devi, through 7 world tours and countless music festivals. From consumer, to respectful student to devoted Pinot Noir producer. My love of Pinot Noir came later in life. When my band, Devo, signed with Warner Brothers Records in 1978, we left Ohio for the promise of Ca',
    '["versatile pairing"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/50_by_50_Carneros_Rose_of_Pinot_Noir_Carneros_California_2023.jpg',
    18.95,
    18.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: A&D Wines
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'A&D Wines',
    'a-d-wines-merchant-of-wine',
    NULL,
    'Portugal',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Esculpido White, Vinho Verde, Portugal, 2019',
    'a-d-wines-esculpido-white-vinho-verde-portugal-2019',
    NULL,
    NULL,
    'Portugal',
    2019,
    'Overview of the Wine Located in Baião, the properties Casa do Arrabalde, Quinta dos Espinhosos and Quinta de Santa Teresa are made up of parcels of vineyards from low to medium production, organically cared for and in predominant granitic soils, performing a total of 45 ha of vineyard. The three properties, although all located in the same sub-region, possess special, quite different features: The vineyard of Casa do Arrabalde, exposed to the Marão foothills at 490m above sea level, produces lat',
    'Overview of the Wine Located in Baião, the properties Casa do Arrabalde, Quinta dos Espinhosos and Quinta de Santa Teresa are made up of parcels of vineyards from low to medium production, organically cared for and in predominant granitic soils, performing a total of 45 ha of vineyard. The three properties, although all located in the same sub-region, possess special, quite different features: The vineyard of Casa do Arrabalde, exposed to the Marão foothills at 490m above sea level, produces lat',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/A_DWines_EsculpidoWhite_VinhoVerde_Portugal_2019.jpg',
    30.95,
    30.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Aaron
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Aaron',
    'aaron-merchant-of-wine',
    'Paso Robles',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Wines, Sand & Stone (Grenache, Petite, Syrah, Graciano), Paso Robles, California, 2022',
    'aaron-wines-sand-stone-grenache-petite-syrah-graciano-paso-robles-california-2022',
    'Grenache',
    'Paso Robles',
    'United States',
    2022,
    'Overview of the Wine Aaron began in 2002 with a focus on producing powerful, age-worthy wines from the rugged hillsides of westside Paso Robles.Utilizing vineyards from the most amazing sites their boots could find, they source intense yet balanced fruit from the Willow Creek, Adelaida, and Templeton Gap districts. From Ian Blackburn - I was really blown away by the quality, texture, and complexity. I buy massive scoring wines from Paso at much higher price points that don''t have the charm and d',
    'Overview of the Wine Aaron began in 2002 with a focus on producing powerful, age-worthy wines from the rugged hillsides of westside Paso Robles.Utilizing vineyards from the most amazing sites their boots could find, they source intense yet balanced fruit from the Willow Creek, Adelaida, and Templeton Gap districts. From Ian Blackburn - I was really blown away by the quality, texture, and complexity. I buy massive scoring wines from Paso at much higher price points that don''t have the charm and d',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":3,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/AaronWines_Sand_Stone_PasoRobles_California_2022_7f5fa4c6-e942-4574-8078-445068401ea9.jpg',
    48.95,
    48.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Abadia Retuerta
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Abadia Retuerta',
    'abadia-retuerta-merchant-of-wine',
    NULL,
    'Spain',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Pago Negralada, Tempranillo, Castilla y León, Spain, 2015',
    'abadia-retuerta-pago-negralada-tempranillo-castilla-y-leon-spain-2015',
    'Tempranillo',
    NULL,
    'Spain',
    2015,
    'Overview of the Wine The Abadía Retuerta Estate occupies over 700 hectares of terrain, and its name comes from the combination of two words that define and describe the territory: Rívula (river bank) and Torta (twisting, winding). Over 204 hectares of vineyards are spread out on hillsides ranging in altitude from a maximum 850 metres down to the southern bank of the Duero River. Most of the world''s best varieties of soil are represented. Designed by famous French enologist, Pascal Delbeck, in 19',
    'Overview of the Wine The Abadía Retuerta Estate occupies over 700 hectares of terrain, and its name comes from the combination of two words that define and describe the territory: Rívula (river bank) and Torta (twisting, winding). Over 204 hectares of vineyards are spread out on hillsides ranging in altitude from a maximum 850 metres down to the southern bank of the Duero River. Most of the world''s best varieties of soil are represented. Designed by famous French enologist, Pascal Delbeck, in 19',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Abadia_Retuerta_Pago_Negralada_Tempranillo_Castilla_y_Leon_Spain_2015.jpg',
    94.95,
    94.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Aborigen
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Aborigen',
    'aborigen-merchant-of-wine',
    NULL,
    'Mexico',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '''Clandestino'' Blanco, Mexico, 2024',
    'aborigen-clandestino-blanco-mexico-2024',
    'Chenin Blanc',
    NULL,
    'Mexico',
    2024,
    'Overview of the Wine The Aboriginal Winery is part of a project to rescue vineyards in the Baja California area, traditionally wine, whose process carries out actions of environmental responsibility such as the sustainable exploitation of the resource, management of production under organic practices, promotion of biological variability and prohibition of intensive and cultural exploitation. In Aborigen, there are small production scales, the care of every detail and the different characters tha',
    'Overview of the Wine The Aboriginal Winery is part of a project to rescue vineyards in the Baja California area, traditionally wine, whose process carries out actions of environmental responsibility such as the sustainable exploitation of the resource, management of production under organic practices, promotion of biological variability and prohibition of intensive and cultural exploitation. In Aborigen, there are small production scales, the care of every detail and the different characters tha',
    '["versatile pairing"]'::jsonb,
    '{"body":3,"sweetness":2,"tannin":1,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Aborigen_Clandestino_Blanco_Queretaro_Mexico_2024.jpg',
    25.95,
    25.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Acrata Tinta del Valle Rouge, Valle de Guadalupe, Baja, Mexico, 2021 (Recommended)',
    'aborigen-acrata-tinta-del-valle-rouge-valle-de-guadalupe-baja-mexico-2021-recommended',
    'Grenache',
    NULL,
    'Mexico',
    2021,
    'Overview of the Wine The Aboriginal Winery is part of a project to rescue vineyards in the Baja California area, traditionally wine, whose process carries out actions of environmental responsibility such as the sustainable exploitation of the resource, management of production under organic practices, promotion of biological variability and prohibition of intensive and cultural exploitation. In Aborigen, there are small production scales, the care of every detail and the different characters tha',
    'Overview of the Wine The Aboriginal Winery is part of a project to rescue vineyards in the Baja California area, traditionally wine, whose process carries out actions of environmental responsibility such as the sustainable exploitation of the resource, management of production under organic practices, promotion of biological variability and prohibition of intensive and cultural exploitation. In Aborigen, there are small production scales, the care of every detail and the different characters tha',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":3,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Aborigen-Acrata-Tinta-del-Valle-Rouge-Valle-de-Guadalupe-Baja-Mexico-2021.jpg',
    24.95,
    24.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Ad Vivum
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Ad Vivum',
    'ad-vivum-merchant-of-wine',
    'Napa Valley',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Cabernet Sauvignon, Sleeping Lady Vineyard, Napa Valley, 2016',
    'ad-vivum-cabernet-sauvignon-sleeping-lady-vineyard-napa-valley-2016',
    'Cabernet Sauvignon',
    'Napa Valley',
    'United States',
    2016,
    'Winemaker Chris Phelps - (Former winemaker at Dominus) About The Producer AD VIVUM is a story of a special vineyard, a seasoned winemaker, a meticulous farmer, and Mother Nature. AD VIVUM is a single-vineyard, 100% Cabernet Sauvignon wine crafted by Chris Phelps, a long-time Napa Valley winemaker who has earned a reputation for his ability to consistently produce unique wines that honestly reflect the terroir of their vineyard origin. After many years of searching, Chris was introduced to Sleepi',
    'Winemaker Chris Phelps - (Former winemaker at Dominus) About The Producer AD VIVUM is a story of a special vineyard, a seasoned winemaker, a meticulous farmer, and Mother Nature. AD VIVUM is a single-vineyard, 100% Cabernet Sauvignon wine crafted by Chris Phelps, a long-time Napa Valley winemaker who has earned a reputation for his ability to consistently produce unique wines that honestly reflect the terroir of their vineyard origin. After many years of searching, Chris was introduced to Sleepi',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/products/Ad-Vivium-Cabernet-Sauvignon-Napa-Valley-California-2016.jpg',
    189.95,
    189.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Adami
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Adami',
    'adami-merchant-of-wine',
    NULL,
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '"Cartizze", Brut Prosecco, Valdobbiadene Superiore, Italy, NV',
    'adami-cartizze-brut-prosecco-valdobbiadene-superiore-italy-nv',
    'Prosecco',
    NULL,
    'Italy',
    NULL,
    'Overview of the Wine Love and commitment to our life-project cannot, at the same time, prevent us from being aware that we are indeed quite fortunate. Fortunate to be able to love and contribute to the beauty of this unique corner of earth, both through the work we do every day as well as through our preservation and protection of the places in our Alta Marca Trevigiana, which continue to surprise us as we see them each day. Sustainable Winemaker Adriano Adami Grape / Blend 95% Glera, 5% Chardon',
    'Overview of the Wine Love and commitment to our life-project cannot, at the same time, prevent us from being aware that we are indeed quite fortunate. Fortunate to be able to love and contribute to the beauty of this unique corner of earth, both through the work we do every day as well as through our preservation and protection of the places in our Alta Marca Trevigiana, which continue to surprise us as we see them each day. Sustainable Winemaker Adriano Adami Grape / Blend 95% Glera, 5% Chardon',
    '["versatile pairing"]'::jsonb,
    '{"body":1,"sweetness":2,"tannin":1,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Adami_Cartizze_Brut_Prosecco_Valdobbiadene_Superiore_Italy_NV.jpg',
    37.95,
    37.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Addax
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Addax',
    'addax-merchant-of-wine',
    'Napa Valley',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Cabernet Sauvignon, Napa Valley, California, 2019',
    'addax-cabernet-sauvignon-napa-valley-california-2019',
    'Cabernet Sauvignon',
    'Napa Valley',
    'United States',
    2019,
    'About the Producer Crafted by Russell Bevan, one of the most sought-after winemakers in California today, Addax is an artisan winery founded by Brian Kearney and Josh Peeples. What began with a few friends and a few barrels of Cabernet in 2009 has evolved into a phenomenal portfolio of wines, including Oakville Cabernet Sauvignon, Petaluma Gap and Sta. Rita Pinot Noir, and a selection of Sonoma Chardonnays. After more than a decade, we continue our quest to work with exceptional vineyard sites t',
    'About the Producer Crafted by Russell Bevan, one of the most sought-after winemakers in California today, Addax is an artisan winery founded by Brian Kearney and Josh Peeples. What began with a few friends and a few barrels of Cabernet in 2009 has evolved into a phenomenal portfolio of wines, including Oakville Cabernet Sauvignon, Petaluma Gap and Sta. Rita Pinot Noir, and a selection of Sonoma Chardonnays. After more than a decade, we continue our quest to work with exceptional vineyard sites t',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/products/Addax-Cabernet-Sauvignon-Napa-Valley-California-2019.jpg',
    129.95,
    129.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Pinot Noir, Sonoma Coast, California, 2021',
    'addax-pinot-noir-sonoma-coast-california-2021',
    'Pinot Noir',
    'Sonoma',
    'United States',
    2021,
    'About the Producer Crafted by Russell Bevan, one of the most sought-after winemakers in California today, Addax is an artisan winery founded by Brian Kearney and Josh Peeples. What began with a few friends and a few barrels of Cabernet in 2009 has evolved into a phenomenal portfolio of wines, including Oakville Cabernet Sauvignon, Petaluma Gap and Sta. Rita Pinot Noir, and a selection of Sonoma Chardonnays. After more than a decade, we continue our quest to work with exceptional vineyard sites t',
    'About the Producer Crafted by Russell Bevan, one of the most sought-after winemakers in California today, Addax is an artisan winery founded by Brian Kearney and Josh Peeples. What began with a few friends and a few barrels of Cabernet in 2009 has evolved into a phenomenal portfolio of wines, including Oakville Cabernet Sauvignon, Petaluma Gap and Sta. Rita Pinot Noir, and a selection of Sonoma Chardonnays. After more than a decade, we continue our quest to work with exceptional vineyard sites t',
    '["versatile pairing"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Addax_PinotNoir_SonomaCoast_California_2021.jpg',
    72.95,
    72.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Adversity Cellars
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Adversity Cellars',
    'adversity-cellars-merchant-of-wine',
    'Napa Valley',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Melanson Vineyard Cabernet Sauvignon, Napa Valley, California, 2023',
    'adversity-cellars-melanson-vineyard-cabernet-sauvignon-napa-valley-california-2023',
    'Cabernet Sauvignon',
    'Napa Valley',
    'United States',
    2023,
    'About the Producer Crafted by Russell Bevan, one of the most sought-after winemakers in California today, Addax is an artisan winery founded by Brian Kearney and Josh Peeples. What began with a few friends and a few barrels of Cabernet in 2009 has evolved into a phenomenal portfolio of wines, including Oakville Cabernet Sauvignon, Petaluma Gap and Sta. Rita Pinot Noir, and a selection of Sonoma Chardonnays. After more than a decade, we continue our quest to work with exceptional vineyard sites t',
    'About the Producer Crafted by Russell Bevan, one of the most sought-after winemakers in California today, Addax is an artisan winery founded by Brian Kearney and Josh Peeples. What began with a few friends and a few barrels of Cabernet in 2009 has evolved into a phenomenal portfolio of wines, including Oakville Cabernet Sauvignon, Petaluma Gap and Sta. Rita Pinot Noir, and a selection of Sonoma Chardonnays. After more than a decade, we continue our quest to work with exceptional vineyard sites t',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Adversity_Cellars_Melanson_Vineyard_Cabernet_Sauvignon_Napa_Valley_California_2023.jpg',
    219.95,
    219.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Aether
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Aether',
    'aether-merchant-of-wine',
    'Santa Barbara',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '''La Rinconada'' Chardonnay, Sta. Rita Hills, California, 2021',
    'aether-la-rinconada-chardonnay-sta-rita-hills-california-2021',
    'Chardonnay',
    'Santa Barbara',
    'United States',
    2021,
    'Top find! Overview of the Wine We have all the instruments and algorithms that modern vintners use, and these are helpful for making the wine hold together in the bottle. We see to the technical components, the raw materials, fruit, sourcing, uniqueness of terroir; all of the observational, empirical inputs that can be captured in a spreadsheet. But wine has ideas of its own. What begins as naked elements puts on character with age. Wine has culture that can be cultivated or interrupted from mom',
    'Top find! Overview of the Wine We have all the instruments and algorithms that modern vintners use, and these are helpful for making the wine hold together in the bottle. We see to the technical components, the raw materials, fruit, sourcing, uniqueness of terroir; all of the observational, empirical inputs that can be captured in a spreadsheet. But wine has ideas of its own. What begins as naked elements puts on character with age. Wine has culture that can be cultivated or interrupted from mom',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":1,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Aether_LaRinconada_Chardonnay_Sta.RitaHills_California_2021_5125316b-40c8-4691-aaf8-561fb468edc8.jpg',
    37.95,
    37.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Pinot Noir, Sanford & Benedict, Sta Rita Hills, California, 2019',
    'aether-pinot-noir-sanford-benedict-sta-rita-hills-california-2019',
    'Pinot Noir',
    'Santa Barbara',
    'United States',
    2019,
    'Overview of the Wine We have all the instruments and algorithms that modern vintners use, and these are helpful for making the wine hold together in the bottle. We see to the technical components, the raw materials, fruit, sourcing, uniqueness of terroir; all of the observational, empirical inputs that can be captured in a spreadsheet. But wine has ideas of its own. What begins as naked elements puts on character with age. Wine has culture that can be cultivated or interrupted from moment to mom',
    'Overview of the Wine We have all the instruments and algorithms that modern vintners use, and these are helpful for making the wine hold together in the bottle. We see to the technical components, the raw materials, fruit, sourcing, uniqueness of terroir; all of the observational, empirical inputs that can be captured in a spreadsheet. But wine has ideas of its own. What begins as naked elements puts on character with age. Wine has culture that can be cultivated or interrupted from moment to mom',
    '["versatile pairing"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/products/Aether-Sanford-Benedict-Pinot-Noir-Sta-Rita-Hills-California-2019.jpg',
    62.95,
    62.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Agricola Punica
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Agricola Punica',
    'agricola-punica-merchant-of-wine',
    'Sardinia',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Barrua Isola dei Nuraghi IGT, Sardinia, Italy, 2020',
    'agricola-punica-barrua-isola-dei-nuraghi-igt-sardinia-italy-2020',
    'Merlot',
    'Sardinia',
    'Italy',
    2020,
    'Overview of the Wine An undertaking between world renowned names in the winemaking business, Agricola Punica is a joint venture between Dr. Sebastiano Rosa, Sardinian winery Cantina Sociale di Santadi, Tenuta San Guido, Santadi President Antonello Pilloni and legendary Tuscan consulting oenologist Giacomo Tachis. Sebastiano Rosa, oenologist and winemaker at Tenuta San Guido since 2000 and Santadi, the highly respected Sardinian cooperative, represent the majority ownership, with forty percent ea',
    'Overview of the Wine An undertaking between world renowned names in the winemaking business, Agricola Punica is a joint venture between Dr. Sebastiano Rosa, Sardinian winery Cantina Sociale di Santadi, Tenuta San Guido, Santadi President Antonello Pilloni and legendary Tuscan consulting oenologist Giacomo Tachis. Sebastiano Rosa, oenologist and winemaker at Tenuta San Guido since 2000 and Santadi, the highly respected Sardinian cooperative, represent the majority ownership, with forty percent ea',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":3,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Agricola_Punica_Barrua_Isola_dei_Nuraghi_IGT_Sardinia_Italy_2020.jpg',
    48.95,
    48.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Aia Vecchia
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Aia Vecchia',
    'aia-vecchia-merchant-of-wine',
    'Bordeaux',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Lagone, Toscana IGT, Italy, 2023 (Top Value)',
    'aia-vecchia-lagone-toscana-igt-italy-2023-top-value',
    'Merlot',
    'Bordeaux',
    'Italy',
    2023,
    'TOP VALUE! Overview of the Wine The Pellegrini family, Aia Vecchia''s owners, have been grape growers in the Bolgheri area for several generations and have sold their grapes to many of the most notable wineries in the region for decades. After replanting their original vineyards in 1995, the following year they took the plunge and established their own winery with the goal of creating a portfolio of small-lot, high-quality Super Tuscan blends focusing on Bordeaux grape varieties. With the help of',
    'TOP VALUE! Overview of the Wine The Pellegrini family, Aia Vecchia''s owners, have been grape growers in the Bolgheri area for several generations and have sold their grapes to many of the most notable wineries in the region for decades. After replanting their original vineyards in 1995, the following year they took the plunge and established their own winery with the goal of creating a portfolio of small-lot, high-quality Super Tuscan blends focusing on Bordeaux grape varieties. With the help of',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":3,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Aia_Vecchia_Lagone_Toscana_IGT_Italy_2023.jpg',
    20.95,
    20.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Alain Courreges
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alain Courreges',
    'alain-courreges-merchant-of-wine',
    'Corsica',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Domaine de Vaccelli, Granit Rouge, Corsica, France, 2022',
    'alain-courreges-domaine-de-vaccelli-granit-rouge-corsica-france-2022',
    NULL,
    'Corsica',
    'France',
    2022,
    'Overview of the Wine Domaine de Vaccelli is a leading producer of modern Corsican wines, with a focus on typical Corsican grape varieties that form the pillars of the Ajaccio appellation and terroir. The vineyard is committed to manual harvesting and organic farming, and was certified as organic in 2019. The vineyard''s 25 hectares of vines are planted on hillsides with granite arenas, producing exceptional wines like the Chioso Novo cuvée and Aja Donica, crafted from a parcel selection of Vermen',
    'Overview of the Wine Domaine de Vaccelli is a leading producer of modern Corsican wines, with a focus on typical Corsican grape varieties that form the pillars of the Ajaccio appellation and terroir. The vineyard is committed to manual harvesting and organic farming, and was certified as organic in 2019. The vineyard''s 25 hectares of vines are planted on hillsides with granite arenas, producing exceptional wines like the Chioso Novo cuvée and Aja Donica, crafted from a parcel selection of Vermen',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Alain_Courreges_Domaine_de_Vaccelli_Granit_Rouge_Corsica_France_2022.jpg',
    96.95,
    96.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Domaine de Vaccelli, Quartz Blanc, Corsica, France, 2023',
    'alain-courreges-domaine-de-vaccelli-quartz-blanc-corsica-france-2023',
    NULL,
    'Corsica',
    'France',
    2023,
    'Overview of the Wine Domaine de Vaccelli is a leading producer of modern Corsican wines, with a focus on typical Corsican grape varieties that form the pillars of the Ajaccio appellation and terroir. The vineyard is committed to manual harvesting and organic farming, and was certified as organic in 2019. The vineyard''s 25 hectares of vines are planted on hillsides with granite arenas, producing exceptional wines like the Chioso Novo cuvée and Aja Donica, crafted from a parcel selection of Vermen',
    'Overview of the Wine Domaine de Vaccelli is a leading producer of modern Corsican wines, with a focus on typical Corsican grape varieties that form the pillars of the Ajaccio appellation and terroir. The vineyard is committed to manual harvesting and organic farming, and was certified as organic in 2019. The vineyard''s 25 hectares of vines are planted on hillsides with granite arenas, producing exceptional wines like the Chioso Novo cuvée and Aja Donica, crafted from a parcel selection of Vermen',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Alain_Courreges_Domaine_de_Vaccelli_Quartz_Blanc_Corsica_France_2023.jpg',
    95.95,
    95.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Alain Graillot
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alain Graillot',
    'alain-graillot-merchant-of-wine',
    'Rhone',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Crozes Hermitage Rouge, Rhône Valley, France, 2020',
    'alain-graillot-crozes-hermitage-rouge-rhone-valley-france-2020',
    'Syrah',
    'Rhone',
    'France',
    2020,
    'Overview of the Brand Northern Rhône native, Alain Graillot, is recognized for his passion of Syrah. Prior to starting his own domaine, Alain worked in Burgundy, where he received guidance from the reputable Jacques Seysses of Domaine Dujac. In 1985, Alain founded Domaine Alain Graillot just outside the village of Pont de l''Isère, about 6 km south of Tain-l''Hermitage. He is now considered one of the most highly sought-after producers in the Northern Rhône due to his exuberant, robust and impecca',
    'Overview of the Brand Northern Rhône native, Alain Graillot, is recognized for his passion of Syrah. Prior to starting his own domaine, Alain worked in Burgundy, where he received guidance from the reputable Jacques Seysses of Domaine Dujac. In 1985, Alain founded Domaine Alain Graillot just outside the village of Pont de l''Isère, about 6 km south of Tain-l''Hermitage. He is now considered one of the most highly sought-after producers in the Northern Rhône due to his exuberant, robust and impecca',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/products/Alain-Graillot-Crozes-Hermitage-Rouge-Rhone-Valley-France-2020.jpg',
    44.95,
    44.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Alban Vineyards
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alban Vineyards',
    'alban-vineyards-merchant-of-wine',
    'Rhone',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Patrina Estate Syrah, Central Coast, California, 2021',
    'alban-vineyards-patrina-estate-syrah-central-coast-california-2021',
    'Syrah',
    'Rhone',
    'United States',
    2021,
    'Overview of the Wine Alban Vineyards is the first America winery and vineyard established exclusively for Rhone varieties. Conceived at a time when there were virtually only two "flavors" of wine produced in the U.S., they set out to introduce wine grapes that would offer oenephiles a new world of possibilities. Pioneering Roussanne, Grenache Noir and Viognier to go along with meticulously selected clones of Syrah, Alban Vineyards has guided consumers and producers to the enormous potential of R',
    'Overview of the Wine Alban Vineyards is the first America winery and vineyard established exclusively for Rhone varieties. Conceived at a time when there were virtually only two "flavors" of wine produced in the U.S., they set out to introduce wine grapes that would offer oenephiles a new world of possibilities. Pioneering Roussanne, Grenache Noir and Viognier to go along with meticulously selected clones of Syrah, Alban Vineyards has guided consumers and producers to the enormous potential of R',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Alban_Vineyards_Patrina_Estate_Syrah_Central_Coast_California_2021.jpg',
    65.95,
    65.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Alban
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alban',
    'alban-merchant-of-wine',
    'Rhone',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Viognier, Central Coast, California, 2023',
    'alban-viognier-central-coast-california-2023',
    'Viognier',
    'Rhone',
    'United States',
    2023,
    'Overview of the Wine Alban Vineyards is the first America winery and vineyard established exclusively for Rhone varieties. Conceived at a time when there were virtually only two "flavors" of wine produced in the U.S., they set out to introduce wine grapes that would offer oenephiles a new world of possibilities. Pioneering Roussanne, Grenache Noir and Viognier to go along with meticulously selected clones of Syrah, Alban Vineyards has guided consumers and producers to the enormous potential of R',
    'Overview of the Wine Alban Vineyards is the first America winery and vineyard established exclusively for Rhone varieties. Conceived at a time when there were virtually only two "flavors" of wine produced in the U.S., they set out to introduce wine grapes that would offer oenephiles a new world of possibilities. Pioneering Roussanne, Grenache Noir and Viognier to go along with meticulously selected clones of Syrah, Alban Vineyards has guided consumers and producers to the enormous potential of R',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":1,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Alban_Viognier_CentralCoast_California_2023.jpg',
    31.95,
    31.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Aldo Conterno
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Aldo Conterno',
    'aldo-conterno-merchant-of-wine',
    'Piedmont',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Barolo Bussia, Piedmont, Italy, 2008',
    'aldo-conterno-barolo-bussia-piedmont-italy-2008',
    'Nebbiolo',
    'Piedmont',
    'Italy',
    2008,
    'Overview of the Wine The story of Poderi Aldo Conterno, one of the elite, historic Barolo producers, is a tale of great passion for winemaking that winds back across generations and crosses international borders. While the Langhe Rosso, Chardonnay "Bussiador", Barbera d''Alba "Conca Tre Pile" and Nebbiolo "Favot" represent a nod to modern winemaking techniques, the Barolo wines remain firmly in the traditionalist camp, aged in large Slavonian-oak botte before bottling. Only indigenous yeasts and',
    'Overview of the Wine The story of Poderi Aldo Conterno, one of the elite, historic Barolo producers, is a tale of great passion for winemaking that winds back across generations and crosses international borders. While the Langhe Rosso, Chardonnay "Bussiador", Barbera d''Alba "Conca Tre Pile" and Nebbiolo "Favot" represent a nod to modern winemaking techniques, the Barolo wines remain firmly in the traditionalist camp, aged in large Slavonian-oak botte before bottling. Only indigenous yeasts and',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":5,"acidity":5}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Aldo_Conterno_Barolo_Bussia_Piedmont_Italy_2008.jpg',
    129.95,
    129.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Barolo Bussia, Piedmont, Italy, 2017',
    'aldo-conterno-barolo-bussia-piedmont-italy-2017',
    'Nebbiolo',
    'Piedmont',
    'Italy',
    2017,
    'Overview of the Wine The story of Poderi Aldo Conterno, one of the elite, historic Barolo producers, is a tale of great passion for winemaking that winds back across generations and crosses international borders. While the Langhe Rosso, Chardonnay "Bussiador", Barbera d''Alba "Conca Tre Pile" and Nebbiolo "Favot" represent a nod to modern winemaking techniques, the Barolo wines remain firmly in the traditionalist camp, aged in large Slavonian-oak botte before bottling. Only indigenous yeasts and',
    'Overview of the Wine The story of Poderi Aldo Conterno, one of the elite, historic Barolo producers, is a tale of great passion for winemaking that winds back across generations and crosses international borders. While the Langhe Rosso, Chardonnay "Bussiador", Barbera d''Alba "Conca Tre Pile" and Nebbiolo "Favot" represent a nod to modern winemaking techniques, the Barolo wines remain firmly in the traditionalist camp, aged in large Slavonian-oak botte before bottling. Only indigenous yeasts and',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":5,"acidity":5}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/products/Aldo-Conterno-Barolo-Bussia-Piedmont-Italy-2017.jpg',
    119.95,
    119.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Kermit Lynch
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Kermit Lynch',
    'kermit-lynch-merchant-of-wine',
    'Piedmont',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Alessandro & Gian Natale Fantino Barolo "Chinato" Piedmont, Italy, NV',
    'alessandro-gian-natale-fantino-barolo-chinato-piedmont-italy-nv',
    'Nebbiolo',
    'Piedmont',
    'Italy',
    NULL,
    'Overview of the Wine Two brothers, Alessandro and Gian Natale Fantino, run this family estate in Monforte d''Alba. Alessandro managed the vineyards and served as the enologist at Cantina Bartolo Mascarello for 20 years, from 1978 to 1997. Since 1998, he has dedicated himself to running his family estate alongside his brother full-time. The brothers farm eight hectares in the heart of the historic Bussia cru north of Monforte, one of Barolo''s most famous areas for producing wines of great longevit',
    'Overview of the Wine Two brothers, Alessandro and Gian Natale Fantino, run this family estate in Monforte d''Alba. Alessandro managed the vineyards and served as the enologist at Cantina Bartolo Mascarello for 20 years, from 1978 to 1997. Since 1998, he has dedicated himself to running his family estate alongside his brother full-time. The brothers farm eight hectares in the heart of the historic Bussia cru north of Monforte, one of Barolo''s most famous areas for producing wines of great longevit',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":5,"acidity":5}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/products/Alessandro-Gian-Natale-Fantino-Barolo-Chinato-Piedmont-Italy-NV.jpg',
    39.95,
    39.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Alex Foillard
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alex Foillard',
    'alex-foillard-merchant-of-wine',
    'Beaujolais',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Côte de Brouilly, Beaujolais, France, 2020',
    'alex-foillard-cote-de-brouilly-beaujolais-france-2020',
    'Gamay',
    'Beaujolais',
    'France',
    2020,
    'Overview of the Wine The son of Jean and Agnès Foillard, Alex began working at their Morgon domaine in 2015 and in parallel created his own estate with the purchase of vineyards in Brouilly. Prior to he studied and developed his winemaking skills in Montpellier, Beaune, Australia and Japan. Alex follows his father''s philosophy: a lot of work in the vineyards and a minimum of intervention in the cellar, to ensure the final product reveals the nuances of the terroir. Anytime you hear the words "Fo',
    'Overview of the Wine The son of Jean and Agnès Foillard, Alex began working at their Morgon domaine in 2015 and in parallel created his own estate with the purchase of vineyards in Brouilly. Prior to he studied and developed his winemaking skills in Montpellier, Beaune, Australia and Japan. Alex follows his father''s philosophy: a lot of work in the vineyards and a minimum of intervention in the cellar, to ensure the final product reveals the nuances of the terroir. Anytime you hear the words "Fo',
    '["versatile pairing"]'::jsonb,
    '{"body":2,"sweetness":1,"tannin":2,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/products/Alex-Foillard-Cote-de-Brouilly-Beaujolais-France-2020.jpg',
    43.95,
    43.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Alfaro Family
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alfaro Family',
    'alfaro-family-merchant-of-wine',
    NULL,
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Trout Gulch Vineyard Estate Pinot Noir, Santa Cruz County, California, 2021',
    'alfaro-family-trout-gulch-vineyard-estate-pinot-noir-santa-cruz-county-california-2021',
    'Pinot Noir',
    NULL,
    'United States',
    2021,
    'Overview of the Wine After a long and satisfying career as the founder of Alfaro''s Micro Bakery, one of California''s premier gourmet bakeries, Richard Alfaro was presented with a unique opportunity in the form of an aging 75 acre apple farm in Corralitos. An offer was made on the baking company by an interested buyer, and in 1998 this forgotten piece of land was lovingly transformed by Richard and his wife Mary Kay, into what is now known as Alfaro Family Vineyards & Winery. In the ensuing years',
    'Overview of the Wine After a long and satisfying career as the founder of Alfaro''s Micro Bakery, one of California''s premier gourmet bakeries, Richard Alfaro was presented with a unique opportunity in the form of an aging 75 acre apple farm in Corralitos. An offer was made on the baking company by an interested buyer, and in 1998 this forgotten piece of land was lovingly transformed by Richard and his wife Mary Kay, into what is now known as Alfaro Family Vineyards & Winery. In the ensuing years',
    '["versatile pairing"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/AlfaroFamily_TroutGulchVineyardPinotNoir_SantaCruzMountains_California_2021.jpg',
    39.95,
    39.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Allan Scott
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Allan Scott',
    'allan-scott-merchant-of-wine',
    'Marlborough',
    'New Zealand',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Sauvignon Blanc, Marlborough, New Zealand, 2025',
    'allan-scott-sauvignon-blanc-marlborough-new-zealand-2025',
    'Sauvignon Blanc',
    'Marlborough',
    'New Zealand',
    2025,
    'Overview of the Wine Allan Scott is synonymous with wine in Marlborough: he has worked every harvest since 1973 and is credited with planting some of the region''s most famous vineyards, including the very first. In 1990, Allan and his wife Catherine established Allan Scott Wines as one of the first independent wineries of Marlborough. Since its inception, the winery has produced wines consistent in flavor and quality year after year while continually evolving to keep ahead of the changing demand',
    'Overview of the Wine Allan Scott is synonymous with wine in Marlborough: he has worked every harvest since 1973 and is credited with planting some of the region''s most famous vineyards, including the very first. In 1990, Allan and his wife Catherine established Allan Scott Wines as one of the first independent wineries of Marlborough. Since its inception, the winery has produced wines consistent in flavor and quality year after year while continually evolving to keep ahead of the changing demand',
    '["versatile pairing"]'::jsonb,
    '{"body":2,"sweetness":1,"tannin":1,"acidity":5}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Allan_Scott_Sauvignon_Blanc_Marlborough_New_Zealand_2025_9e54d052-32c6-4383-b1ae-92c8ed1c4115.jpg',
    14.95,
    14.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Alma Rosa
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alma Rosa',
    'alma-rosa-merchant-of-wine',
    'Santa Barbara',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '''El Jabali,'' Pinot Noir, Sta. Rita Hills, Santa Barbara, California, 2021',
    'alma-rosa-el-jabali-pinot-noir-sta-rita-hills-santa-barbara-california-2021',
    'Pinot Noir',
    'Santa Barbara',
    'United States',
    2021,
    'Overview of the Wine Situated on the north-facing slopes of the Santa Rita Hills in Santa Barbara County, the Alma Rosa estate vineyard, El Jabali, was first planted in 1983 by California wine pioneer Richard Sanford, who founded Alma Rosa Winery in 2005. Today, our 628-acre estate has five distinct vineyard sites planted to Pinot Noir, Chardonnay, Syrah and Grenache that stretch from the valley floor to 850'' in elevation. Our total 40 vineyard acres comprise a small portion of our ranch and are',
    'Overview of the Wine Situated on the north-facing slopes of the Santa Rita Hills in Santa Barbara County, the Alma Rosa estate vineyard, El Jabali, was first planted in 1983 by California wine pioneer Richard Sanford, who founded Alma Rosa Winery in 2005. Today, our 628-acre estate has five distinct vineyard sites planted to Pinot Noir, Chardonnay, Syrah and Grenache that stretch from the valley floor to 850'' in elevation. Our total 40 vineyard acres comprise a small portion of our ranch and are',
    '["versatile pairing"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Alma_Rosa_El_Jabali_Pinot_Noir_Sta_Rita_Hills_Santa_Barbara_California_2021.jpg',
    99.95,
    99.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Chardonnay, Sta. Rita Hills, Santa Barbara, California, 2023',
    'alma-rosa-chardonnay-sta-rita-hills-santa-barbara-california-2023',
    'Chardonnay',
    'Santa Barbara',
    'United States',
    2023,
    'Top Value from a Top Producer! Overview of the Wine Situated on the north-facing slopes of the Santa Rita Hills in Santa Barbara County, the Alma Rosa estate vineyard, El Jabali, was first planted in 1983 by California wine pioneer Richard Sanford, who founded Alma Rosa Winery in 2005. Today, our 628-acre estate has five distinct vineyard sites planted to Pinot Noir, Chardonnay, Syrah and Grenache that stretch from the valley floor to 850'' in elevation. Our total 40 vineyard acres comprise a sma',
    'Top Value from a Top Producer! Overview of the Wine Situated on the north-facing slopes of the Santa Rita Hills in Santa Barbara County, the Alma Rosa estate vineyard, El Jabali, was first planted in 1983 by California wine pioneer Richard Sanford, who founded Alma Rosa Winery in 2005. Today, our 628-acre estate has five distinct vineyard sites planted to Pinot Noir, Chardonnay, Syrah and Grenache that stretch from the valley floor to 850'' in elevation. Our total 40 vineyard acres comprise a sma',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":1,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Alma_Rosa_Chardonnay_Sta._Rita_Hills_Santa_Barbara_California_2023.jpg',
    29.90,
    29.90,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Almacerro
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Almacerro',
    'almacerro-merchant-of-wine',
    'Napa Valley',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Estate Cabernet Sauvignon, Howell Mountain, Napa Valley, 2018',
    'almacerro-estate-cabernet-sauvignon-howell-mountain-napa-valley-2018',
    'Cabernet Sauvignon',
    'Napa Valley',
    'United States',
    2018,
    'About The Producer We fell in love with a Napa we came to know in the early 1980s, which is to say a Napa that hadn''t changed much since the repeal of Prohibition. Farmers and winemakers tasting out of their cellars, unabashedly agrarian and bucolic. Remote and often wild places; even on the well-traveled Silverado Trail you felt like you were miles in the country. So when we started looking for a vineyard, we knew exactly what we wanted. We wanted our own piece of dirt, high up on Howell Mounta',
    'About The Producer We fell in love with a Napa we came to know in the early 1980s, which is to say a Napa that hadn''t changed much since the repeal of Prohibition. Farmers and winemakers tasting out of their cellars, unabashedly agrarian and bucolic. Remote and often wild places; even on the well-traveled Silverado Trail you felt like you were miles in the country. So when we started looking for a vineyard, we knew exactly what we wanted. We wanted our own piece of dirt, high up on Howell Mounta',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Almacerro_EstateCabernetSauvignon_HowellMountain_NapaValley_2018.jpg',
    214.79,
    214.79,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Estate Cabernet Sauvignon, Howell Mountain, Napa Valley, 2019',
    'almacerro-estate-cabernet-sauvignon-howell-mountain-napa-valley-2019',
    'Cabernet Sauvignon',
    'Napa Valley',
    'United States',
    2019,
    'About The Producer We fell in love with a Napa we came to know in the early 1980s, which is to say a Napa that hadn''t changed much since the repeal of Prohibition. Farmers and winemakers tasting out of their cellars, unabashedly agrarian and bucolic. Remote and often wild places; even on the well-traveled Silverado Trail you felt like you were miles in the country. So when we started looking for a vineyard, we knew exactly what we wanted. We wanted our own piece of dirt, high up on Howell Mounta',
    'About The Producer We fell in love with a Napa we came to know in the early 1980s, which is to say a Napa that hadn''t changed much since the repeal of Prohibition. Farmers and winemakers tasting out of their cellars, unabashedly agrarian and bucolic. Remote and often wild places; even on the well-traveled Silverado Trail you felt like you were miles in the country. So when we started looking for a vineyard, we knew exactly what we wanted. We wanted our own piece of dirt, high up on Howell Mounta',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Almacerro_Estate_Cabernet_Sauvignon_Howell_Mountain_Napa_Valley_2019.jpg',
    219.95,
    219.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Almaviva Red
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Almaviva Red',
    'almaviva-red-merchant-of-wine',
    NULL,
    'Chile',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Puente Alto, Maipo Valley, Chile, 2017 - 100 Points',
    'almaviva-red-puente-alto-maipo-valley-chile-2017-100-points',
    'Cabernet Sauvignon',
    NULL,
    'Chile',
    2017,
    'Overview of the Wine Almaviva is the name of both winery and wine born of the joint venture between Baron Philippe de Rothschild and Viña Concha y Toro. It is also that of Pierre de Beaumarchais'' character, the "Count of Almaviva" in his Marriage of Figaro, a work Wolfang Amadeus Mozart later turned into one of the most popular operas ever. The classical epithet, laid out in Pierre de Beaumarchais'' fair hand, shares the label with insignia of pre-hispanic roots symbolizing a union of European an',
    'Overview of the Wine Almaviva is the name of both winery and wine born of the joint venture between Baron Philippe de Rothschild and Viña Concha y Toro. It is also that of Pierre de Beaumarchais'' character, the "Count of Almaviva" in his Marriage of Figaro, a work Wolfang Amadeus Mozart later turned into one of the most popular operas ever. The classical epithet, laid out in Pierre de Beaumarchais'' fair hand, shares the label with insignia of pre-hispanic roots symbolizing a union of European an',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/products/Almaviva-Red-Puente-Alto-Maipo-Valley-Chile-2017.jpg',
    219.95,
    219.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Alpha Estate
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alpha Estate',
    'alpha-estate-merchant-of-wine',
    NULL,
    'Greece',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Axia, Syrah/Xinomavro, Florina, Greece, 2021',
    'alpha-estate-axia-syrah-xinomavro-florina-greece-2021',
    'Syrah',
    NULL,
    'Greece',
    2021,
    'Overview of the Wine Alpha Estate was founded in 1997 by the experienced viticulturist Makis Mavridis and chemist-oenologist Angelos Iatridis, who, after years of experience in various locations of Greece and abroad, chose the Amyndeon region to create his own wine. The knowledge and love for winemaking was passed on to the next generation. Angeliki Iatridou and Emorfili Mavridou carry on the tradition today, aspiring to evolve, while participating in the team''s common vision. Human factor is in',
    'Overview of the Wine Alpha Estate was founded in 1997 by the experienced viticulturist Makis Mavridis and chemist-oenologist Angelos Iatridis, who, after years of experience in various locations of Greece and abroad, chose the Amyndeon region to create his own wine. The knowledge and love for winemaking was passed on to the next generation. Angeliki Iatridou and Emorfili Mavridou carry on the tradition today, aspiring to evolve, while participating in the team''s common vision. Human factor is in',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Alpha_Estate_Axia_Syrah_Xinomavro_Florina_Greece_2021.jpg',
    24.95,
    24.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Ecosystem, Xinomavro Reserve, Old Vines, Barba Yannis, Amyndeon, Greece, 2021',
    'alpha-estate-ecosystem-xinomavro-reserve-old-vines-barba-yannis-amyndeon-greece-2021',
    NULL,
    NULL,
    'Greece',
    2021,
    'Overview of the Wine Alpha Estate was founded in 1997 by the experienced viticulturist Makis Mavridis and chemist-oenologist Angelos Iatridis, who, after years of experience in various locations of Greece and abroad, chose the Amyndeon region to create his own wine. The knowledge and love for winemaking was passed on to the next generation. Angeliki Iatridou and Emorfili Mavridou carry on the tradition today, aspiring to evolve, while participating in the team''s common vision. Human factor is in',
    'Overview of the Wine Alpha Estate was founded in 1997 by the experienced viticulturist Makis Mavridis and chemist-oenologist Angelos Iatridis, who, after years of experience in various locations of Greece and abroad, chose the Amyndeon region to create his own wine. The knowledge and love for winemaking was passed on to the next generation. Angeliki Iatridou and Emorfili Mavridou carry on the tradition today, aspiring to evolve, while participating in the team''s common vision. Human factor is in',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Alpha_Estate_Ecosystem_Xinomavro_Reserve_Old_Vines_Barba_Yannis_Amyndeon_Greece_2021_9cba150a-7b87-4935-abf3-24d616e2aa7c.jpg',
    42.95,
    42.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Alphonse Mellot
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alphonse Mellot',
    'alphonse-mellot-merchant-of-wine',
    'Sancerre',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Satellite Sancerre Blanc, Loire Valley, France, 2016',
    'alphonse-mellot-satellite-sancerre-blanc-loire-valley-france-2016',
    'Sauvignon Blanc',
    'Sancerre',
    'France',
    2016,
    'Overview of the Wine As far back as the XVI century, in 1513 to be exact, the local records mention the MELLOT family, whose life even at that time was governed by the seasons of the vine and the production of wines of excellent quality. The Mellot family, vinegrowers and wine merchants, was again mentioned during the siege of the town. They pursued their patient labours and continued to gain recognition because César Mellot was appointed as Wine Advisor to Louis XIV in 1698. At the beginning of',
    'Overview of the Wine As far back as the XVI century, in 1513 to be exact, the local records mention the MELLOT family, whose life even at that time was governed by the seasons of the vine and the production of wines of excellent quality. The Mellot family, vinegrowers and wine merchants, was again mentioned during the siege of the town. They pursued their patient labours and continued to gain recognition because César Mellot was appointed as Wine Advisor to Louis XIV in 1698. At the beginning of',
    '["versatile pairing"]'::jsonb,
    '{"body":2,"sweetness":1,"tannin":1,"acidity":5}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Alphonse-Mellot-Satellite-Sancerre-Blanc-Loire-Valley-France-2016.jpg',
    79.95,
    79.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Altamura
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Altamura',
    'altamura-merchant-of-wine',
    'Napa Valley',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Cabernet Sauvignon, Napa Valley, California, 2019',
    'altamura-cabernet-sauvignon-napa-valley-california-2019',
    'Cabernet Sauvignon',
    'Napa Valley',
    'United States',
    2019,
    'Overview of the Wine Altamura Vineyards and Winery, established in 1985 by Frank and Karen Altamura, is the only winery in Wooden Valley located within the Napa Valley appellation. Napa natives Frank and Karen have a decidedly hands-on approach to every step of the growing and winemaking process. Thus, a natural production limit is established at the Altamura Ranch and the wines reflect the Altamura''s deep commitment to reflecting the terroir of Wooden Valley. Frank Altamura''s lifelong pursuit a',
    'Overview of the Wine Altamura Vineyards and Winery, established in 1985 by Frank and Karen Altamura, is the only winery in Wooden Valley located within the Napa Valley appellation. Napa natives Frank and Karen have a decidedly hands-on approach to every step of the growing and winemaking process. Thus, a natural production limit is established at the Altamura Ranch and the wines reflect the Altamura''s deep commitment to reflecting the terroir of Wooden Valley. Frank Altamura''s lifelong pursuit a',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Altamura_Cabernet_Sauvignon_Napa_Valley_California_2019.jpg',
    128.95,
    128.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Altesino
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Altesino',
    'altesino-merchant-of-wine',
    'Tuscany',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Brunello di Montalcino, Tuscany, Italy, 2019',
    'altesino-brunello-di-montalcino-tuscany-italy-2019',
    'Sangiovese',
    'Tuscany',
    'Italy',
    2019,
    'Overview of the Wine Near the end of 2002, Elisabetta Gnudi Angelini, owner of nearby Tenuta Caparzo, purchased the Altesino winery. Today''s winemaking team, led by Simone Giunti and Alessandro Ciacci, is firmly committed to maintaining Altesino''s hard-earned reputation as a Montalcino institution and a global leader in innovative winemaking. Amid the eastern hills of Montalcino near Siena in central Tuscany, stands the magnificently elegant 14th century-built Palazzo Altesi, home to the Altesin',
    'Overview of the Wine Near the end of 2002, Elisabetta Gnudi Angelini, owner of nearby Tenuta Caparzo, purchased the Altesino winery. Today''s winemaking team, led by Simone Giunti and Alessandro Ciacci, is firmly committed to maintaining Altesino''s hard-earned reputation as a Montalcino institution and a global leader in innovative winemaking. Amid the eastern hills of Montalcino near Siena in central Tuscany, stands the magnificently elegant 14th century-built Palazzo Altesi, home to the Altesin',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":4,"acidity":5}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Altesino_BrunellodiMontalcino_Tuscany_Italy_2019.jpg',
    59.95,
    59.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Alto Moncayo
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alto Moncayo',
    'alto-moncayo-merchant-of-wine',
    NULL,
    'Spain',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '''Moncayo'', Garnacha, Campo de Borja, Spain, 2020',
    'alto-moncayo-moncayo-garnacha-campo-de-borja-spain-2020',
    'Grenache',
    NULL,
    'Spain',
    2020,
    'The 2021 vintage is now available here. Overview of the Wine Bodegas Alto Moncayo is a winery located in the Campo de Borja D.O. It was founded in 2002 with the aim of turning it into a world reference for Garnacha wines of the highest quality, crafted from some of the oldest native vine clones in the area.The garnacha grape is one of the varieties that best expresses its terroir. Thus, the Garnacha of Alto Moncayo is different from the rest of the Campo de Borja D.O area. This is due to the ver',
    'The 2021 vintage is now available here. Overview of the Wine Bodegas Alto Moncayo is a winery located in the Campo de Borja D.O. It was founded in 2002 with the aim of turning it into a world reference for Garnacha wines of the highest quality, crafted from some of the oldest native vine clones in the area.The garnacha grape is one of the varieties that best expresses its terroir. Thus, the Garnacha of Alto Moncayo is different from the rest of the Campo de Borja D.O area. This is due to the ver',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":3,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/AltoMoncayo_Moncayo_CampodeBorja_Spain_2020.jpg',
    49.95,
    49.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '''Moncayo'', Garnacha, Campo de Borja, Spain, 2021',
    'alto-moncayo-moncayo-garnacha-campo-de-borja-spain-2021',
    'Grenache',
    NULL,
    'Spain',
    2021,
    'The 2020 vintage is still available here - click here. Overview of the Wine Bodegas Alto Moncayo is a winery located in the Campo de Borja D.O. It was founded in 2002 with the aim of turning it into a world reference for Garnacha wines of the highest quality, crafted from some of the oldest native vine clones in the area.The garnacha grape is one of the varieties that best expresses its terroir. Thus, the Garnacha of Alto Moncayo is different from the rest of the Campo de Borja D.O area. This is',
    'The 2020 vintage is still available here - click here. Overview of the Wine Bodegas Alto Moncayo is a winery located in the Campo de Borja D.O. It was founded in 2002 with the aim of turning it into a world reference for Garnacha wines of the highest quality, crafted from some of the oldest native vine clones in the area.The garnacha grape is one of the varieties that best expresses its terroir. Thus, the Garnacha of Alto Moncayo is different from the rest of the Campo de Borja D.O area. This is',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":3,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Alto_Moncayo_Moncayo_Garnacha_Campo_de_Borja_Spain_2021_8a2a03a7-f5ac-4cfa-8c9e-2d41f661ad02.jpg',
    51.95,
    51.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '''Veraton'', Garnacha, Campo de Borja, Spain, 2021',
    'alto-moncayo-veraton-garnacha-campo-de-borja-spain-2021',
    'Grenache',
    NULL,
    'Spain',
    2021,
    'Overview of the Wine Bodegas Alto Moncayo is a winery located in the Campo de Borja D.O. It was founded in 2002 with the aim of turning it into a world reference for Garnacha wines of the highest quality, crafted from some of the oldest native vine clones in the area.The garnacha grape is one of the varieties that best expresses its terroir. Thus, the Garnacha of Alto Moncayo is different from the rest of the Campo de Borja D.O area. This is due to the very strict selection made from the vineyar',
    'Overview of the Wine Bodegas Alto Moncayo is a winery located in the Campo de Borja D.O. It was founded in 2002 with the aim of turning it into a world reference for Garnacha wines of the highest quality, crafted from some of the oldest native vine clones in the area.The garnacha grape is one of the varieties that best expresses its terroir. Thus, the Garnacha of Alto Moncayo is different from the rest of the Campo de Borja D.O area. This is due to the very strict selection made from the vineyar',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":3,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Alto_Moncayo_Veraton_Garnacha_Campo_de_Borja_Spain_2021.jpg',
    36.79,
    36.79,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '''Veraton'', Garnacha, Campo de Borja, Spain, 2022',
    'alto-moncayo-veraton-garnacha-campo-de-borja-spain-2022',
    'Grenache',
    NULL,
    'Spain',
    2022,
    'Overview of the Wine Bodegas Alto Moncayo is a winery located in the Campo de Borja D.O. It was founded in 2002 with the aim of turning it into a world reference for Garnacha wines of the highest quality, crafted from some of the oldest native vine clones in the area.The garnacha grape is one of the varieties that best expresses its terroir. Thus, the Garnacha of Alto Moncayo is different from the rest of the Campo de Borja D.O area. This is due to the very strict selection made from the vineyar',
    'Overview of the Wine Bodegas Alto Moncayo is a winery located in the Campo de Borja D.O. It was founded in 2002 with the aim of turning it into a world reference for Garnacha wines of the highest quality, crafted from some of the oldest native vine clones in the area.The garnacha grape is one of the varieties that best expresses its terroir. Thus, the Garnacha of Alto Moncayo is different from the rest of the Campo de Borja D.O area. This is due to the very strict selection made from the vineyar',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":3,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Alto_Moncayo_Veraton_Garnacha_Campo_de_Borja_Spain_2022.jpg',
    36.95,
    36.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Álvaro Palacios
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Álvaro Palacios',
    'alvaro-palacios-merchant-of-wine',
    'Priorat',
    'Spain',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Camins del Priorat, Priorat, Spain, 2023',
    'alvaro-palacios-camins-del-priorat-priorat-spain-2023',
    'Grenache',
    'Priorat',
    'Spain',
    2023,
    'Overview of the Wine If anyone embodies the promise and spirit of "The New Spain," it''s Alvaro Palacios. His L''Ermita is widely considered—along with Peter Sisseck''s Dominio de Pingus—to be the most important new Spanish wine of the modern era. One of nine children born to the owners of Rioja''s respected Palacios Remondo, Alvaro studied enology in Bordeaux, while working under Jean-Pierre Moueix at Ch. Pétrus. He credits his tenure at Pétrus for much of his winemaking philosophy and for showing',
    'Overview of the Wine If anyone embodies the promise and spirit of "The New Spain," it''s Alvaro Palacios. His L''Ermita is widely considered—along with Peter Sisseck''s Dominio de Pingus—to be the most important new Spanish wine of the modern era. One of nine children born to the owners of Rioja''s respected Palacios Remondo, Alvaro studied enology in Bordeaux, while working under Jean-Pierre Moueix at Ch. Pétrus. He credits his tenure at Pétrus for much of his winemaking philosophy and for showing',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":3,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Alvaro-Palacios-Camins-del-Priorat-Priorat-Spain-2021.jpg',
    28.95,
    28.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Alvina Pernot
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alvina Pernot',
    'alvina-pernot-merchant-of-wine',
    'Burgundy',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Puligny-Montrachet, "Les Chalumaux," Premier Cru, Burgundy, France, 2023',
    'alvina-pernot-puligny-montrachet-les-chalumaux-premier-cru-burgundy-france-2023',
    'Chardonnay',
    'Burgundy',
    'France',
    2023,
    'Overview of the Wine An exciting new arrival on the scene in the Côte de Beaune is Alvina Pernot, granddaughter of Paul Pernot of Domaine Paul Pernot and cousin of Philippe Pernot of Domaine Pernot Belicard. After working for three years at her grandfather''s domaine, Alvina and her husband, Philippe Abadie, set up a tiny domaine & maison in Puligny-Montrachet. Alvina and her husband favor earlier-picked fruit and higher-altitude parcels within the large Pernot holdings. Alvina and her husband se',
    'Overview of the Wine An exciting new arrival on the scene in the Côte de Beaune is Alvina Pernot, granddaughter of Paul Pernot of Domaine Paul Pernot and cousin of Philippe Pernot of Domaine Pernot Belicard. After working for three years at her grandfather''s domaine, Alvina and her husband, Philippe Abadie, set up a tiny domaine & maison in Puligny-Montrachet. Alvina and her husband favor earlier-picked fruit and higher-altitude parcels within the large Pernot holdings. Alvina and her husband se',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":1,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Alvina_Pernot_Puligny-Montrachet_Les_Chalumaux_Premier_Cru_Burgundy_France_2023.jpg',
    279.95,
    279.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Ameztoi Txakoli
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Ameztoi Txakoli',
    'ameztoi-txakoli-merchant-of-wine',
    NULL,
    'Spain',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Getariako Txakolina, Spain, 2024',
    'ameztoi-txakoli-getariako-txakolina-spain-2024',
    NULL,
    NULL,
    'Spain',
    2024,
    'Overview of the Wine The Ameztoi Winery is pleased to offer you an authentic wine with total warranty and knowledge by five generations of winemakers. Since 1820 making and producing Txakoli. Old barrels, wood smell, bottle and laugh noises. This was the old Ameztoi and used to welcome many people. In fact, the Ameztoi family is widely known with the nickname "Criquet", symbol of joy, happiness and pride. Over time they have grown and improved their product to achieve their own expression, an au',
    'Overview of the Wine The Ameztoi Winery is pleased to offer you an authentic wine with total warranty and knowledge by five generations of winemakers. Since 1820 making and producing Txakoli. Old barrels, wood smell, bottle and laugh noises. This was the old Ameztoi and used to welcome many people. In fact, the Ameztoi family is widely known with the nickname "Criquet", symbol of joy, happiness and pride. Over time they have grown and improved their product to achieve their own expression, an au',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Ameztoi_Getariako_Txakolina_White_Blend_Spain_2024.jpg',
    25.95,
    25.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Amuse Bouche
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Amuse Bouche',
    'amuse-bouche-merchant-of-wine',
    'Napa Valley',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Proprietary Red, Napa Valley, California, 2021',
    'amuse-bouche-proprietary-red-napa-valley-california-2021',
    'Merlot',
    'Napa Valley',
    'United States',
    2021,
    'Overview of the Wine Heidi Barrett grew up in the Napa Valley in a winemaking family and was destined to become one of California''s leading winemakers. It is said that winemaking is a combination of science and art. With a scientist-winemaker father and an artist mother it is no big surprise that Heidi was drawn to the wine industry. With great enthusiasm, a love for what she does, and an incredible wealth of experience, Heidi blends the art and science of winemaking like few can. In 2002, Heidi',
    'Overview of the Wine Heidi Barrett grew up in the Napa Valley in a winemaking family and was destined to become one of California''s leading winemakers. It is said that winemaking is a combination of science and art. With a scientist-winemaker father and an artist mother it is no big surprise that Heidi was drawn to the wine industry. With great enthusiasm, a love for what she does, and an incredible wealth of experience, Heidi blends the art and science of winemaking like few can. In 2002, Heidi',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":3,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/AmuseBouche_ProprietaryRed_NapaValley_California_2021.jpg',
    228.95,
    228.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Ancient Peaks
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Ancient Peaks',
    'ancient-peaks-merchant-of-wine',
    'Paso Robles',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Cabernet Sauvignon, Santa Margarita Ranch, Paso Robles, California, 2021',
    'ancient-peaks-cabernet-sauvignon-santa-margarita-ranch-paso-robles-california-2021',
    'Cabernet Sauvignon',
    'Paso Robles',
    'United States',
    2021,
    'Overview of the Wine We are a family-owned winery specializing in estate-grown wines from Margarita Vineyard, the southernmost vineyard in the Paso Robles appellation on California''s Central Coast. Just look at a map of Paso Robles wineries and at the very southern tip you will find our Vineyard. Here, amid the rugged Santa Lucia mountain range just 14 miles from the Pacific Ocean, Margarita Vineyard stands alone as the only vineyard in its vicinity, and thus the only vineyard to benefit from th',
    'Overview of the Wine We are a family-owned winery specializing in estate-grown wines from Margarita Vineyard, the southernmost vineyard in the Paso Robles appellation on California''s Central Coast. Just look at a map of Paso Robles wineries and at the very southern tip you will find our Vineyard. Here, amid the rugged Santa Lucia mountain range just 14 miles from the Pacific Ocean, Margarita Vineyard stands alone as the only vineyard in its vicinity, and thus the only vineyard to benefit from th',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Ancient-Peaks-Cabernet-Sauvignon-Paso-Robles-California-2021.jpg',
    18.95,
    18.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Zinfandel, Santa Margarita Ranch, Paso Robles, California, 2022',
    'ancient-peaks-zinfandel-santa-margarita-ranch-paso-robles-california-2022',
    'Zinfandel',
    'Paso Robles',
    'United States',
    2022,
    'Overview of the Wine We are a family-owned winery specializing in estate-grown wines from Margarita Vineyard, the southernmost vineyard in the Paso Robles appellation on California''s Central Coast. Just look at a map of Paso Robles wineries and at the very southern tip you will find our Vineyard. Here, amid the rugged Santa Lucia mountain range just 14 miles from the Pacific Ocean, Margarita Vineyard stands alone as the only vineyard in its vicinity, and thus the only vineyard to benefit from th',
    'Overview of the Wine We are a family-owned winery specializing in estate-grown wines from Margarita Vineyard, the southernmost vineyard in the Paso Robles appellation on California''s Central Coast. Just look at a map of Paso Robles wineries and at the very southern tip you will find our Vineyard. Here, amid the rugged Santa Lucia mountain range just 14 miles from the Pacific Ocean, Margarita Vineyard stands alone as the only vineyard in its vicinity, and thus the only vineyard to benefit from th',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":2,"tannin":3,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Ancient_Peaks_Zinfandel_Santa_Margarita_Ranch_Paso_Robles_California_2022.jpg',
    18.95,
    18.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- =========================================================================
  -- RETAILER 3: Silverlake Wine
  -- Location: Silver Lake, Los Angeles
  -- =========================================================================

  INSERT INTO public.organizations (id, name, slug, metadata)
  VALUES (
    gen_random_uuid(),
    'Silverlake Wine',
    'silverlake-wine',
    '{"location":"Silver Lake, Los Angeles","tagline":"Your neighborhood wine shop in the heart of Silver Lake"}'::jsonb
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, metadata = EXCLUDED.metadata
  RETURNING id INTO _org_id;

  -- Producer: Aaron Petite
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Aaron Petite',
    'aaron-petite-silverlake-wine',
    NULL,
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Aaron Petite Sirah',
    'aaron-petite-sirah',
    'Petite Sirah',
    NULL,
    'United States',
    NULL,
    '100% Petite Sirah California > USA Full-bodied and inky with dark berry fruit, pepper spice, and firm tannins.',
    '100% Petite Sirah California > USA Full-bodied and inky with dark berry fruit, pepper spice, and firm tannins.',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/03a8dbca-d301-4b5a-9f99-616ee24311dc.jpg',
    54.00,
    54.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Abbondanza Bianco Pecorino
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Abbondanza Bianco Pecorino',
    'abbondanza-bianco-pecorino-silverlake-wine',
    'Abruzzo',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '- 1 Liter',
    'abbondanza-bianco-pecorino-1-liter',
    'Pecorino',
    'Abruzzo',
    'Italy',
    NULL,
    '100% Pecorino 1000 ml Abruzzo > Italy clean + crisp light + bright extremely crowd pleasing white wine crack open the cap for your arugula salad or to just kick back',
    '100% Pecorino 1000 ml Abruzzo > Italy clean + crisp light + bright extremely crowd pleasing white wine crack open the cap for your arugula salad or to just kick back',
    '["versatile pairing"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":1,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/d77a9ed3d59cde97756b65b0a7b1d5c0.jpg',
    21.00,
    21.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Abbondanza Montepulciano d'Abruzzo
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Abbondanza Montepulciano d''Abruzzo',
    'abbondanza-montepulciano-dabruzzo-silverlake-wine',
    'Abruzzo',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '- 1 Liter',
    'abbondanza-montepulciano-dabruzzo-1-liter',
    'Montepulciano',
    'Abruzzo',
    'Italy',
    NULL,
    '100% Montepulciano Abruzzo > Central Italy label artwork by Eric Junker Abbondanza is made right outside the gorgeous seaside town of Pescana Salty sea air and warm climate make this easy drinking medium bodied italian red Black cherry, dark fruits with hints of herbs, gluggable, easy drinking! PIZZA WINE ALERT !!!',
    '100% Montepulciano Abruzzo > Central Italy label artwork by Eric Junker Abbondanza is made right outside the gorgeous seaside town of Pescana Salty sea air and warm climate make this easy drinking medium bodied italian red Black cherry, dark fruits with hints of herbs, gluggable, easy drinking! PIZZA WINE ALERT !!!',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/products/e7aa48b7ecdfef3f9ae32c981d165df2.png',
    21.00,
    21.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Adelante
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Adelante',
    'adelante-silverlake-wine',
    NULL,
    'Argentina',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Malbec',
    'adelante-malbec',
    'Malbec',
    NULL,
    'Argentina',
    NULL,
    'Winemaker Ray Kaufman left California years ago for his Argentinian wine odyssey, and his Malbec is full of lush dark fruit, but with an added complexity of spice and minerality.',
    'Winemaker Ray Kaufman left California years ago for his Argentinian wine odyssey, and his Malbec is full of lush dark fruit, but with an added complexity of spice and minerality.',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/products/5961e850f5490b5b0a8b84b8f626af62.jpg',
    20.00,
    20.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Adrien Renoir Le
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Adrien Renoir Le',
    'adrien-renoir-le-silverlake-wine',
    'Champagne',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Terroir Grand Cru Champagne',
    'adrien-renoir-le-terroir-grand-cru-champagne',
    'Champagne',
    'Champagne',
    'France',
    NULL,
    'Extra Brut 50/50 blend of Pinot Noir and Chardonnay. 40 year-old vines located in the Grand Cru village of Verzy in Montagne de Reims. Organic',
    'Extra Brut 50/50 blend of Pinot Noir and Chardonnay. 40 year-old vines located in the Grand Cru village of Verzy in Montagne de Reims. Organic',
    '["versatile pairing"]'::jsonb,
    '{"body":2,"sweetness":1,"tannin":1,"acidity":5}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/fb539209-12a2-4ec3-bfb8-bf98e207e0da.jpg',
    84.00,
    84.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Adrien Renoir Les
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Adrien Renoir Les',
    'adrien-renoir-les-silverlake-wine',
    'Champagne',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Vignes Goisses Grand Cru Champagne 2018',
    'adrien-renoir-les-vignes-goisses-grand-cru-champagne-2018',
    'Champagne',
    'Champagne',
    'France',
    2018,
    '100% Petit Meunier from "Les Vignes Goisses" lieu-dit in Verzy, the Grand Cru village of Montagne de Reims. Wine rested on lees for a minimum of 36 months. Zero dosage for this fruity and intense Champagne Blanc de Meunier.',
    '100% Petit Meunier from "Les Vignes Goisses" lieu-dit in Verzy, the Grand Cru village of Montagne de Reims. Wine rested on lees for a minimum of 36 months. Zero dosage for this fruity and intense Champagne Blanc de Meunier.',
    '["versatile pairing"]'::jsonb,
    '{"body":2,"sweetness":1,"tannin":1,"acidity":5}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/ad65d774-0997-4e54-a170-3d99d4d05a20.jpg',
    160.00,
    160.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Agrapart & Fils
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Agrapart & Fils',
    'agrapart-fils-silverlake-wine',
    'Champagne',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '7 Crus Extra Brut Champagne',
    'agrapart-fils-7-crus-extra-brut-champagne',
    'Champagne',
    'Champagne',
    'France',
    NULL,
    '100% Chardonnay from 7 villages in the Côte des Blancs - Avize, Oger, Oily & Cramant for the Grand Crus, and Avenay Val d''Or, Bergères les Vertus & Mardeuil for the Premier Crus. Elegant, with aromas of white flowers & honey, with elegant & pure notes of nectarine, apple, & chalk.',
    '100% Chardonnay from 7 villages in the Côte des Blancs - Avize, Oger, Oily & Cramant for the Grand Crus, and Avenay Val d''Or, Bergères les Vertus & Mardeuil for the Premier Crus. Elegant, with aromas of white flowers & honey, with elegant & pure notes of nectarine, apple, & chalk.',
    '["versatile pairing"]'::jsonb,
    '{"body":2,"sweetness":1,"tannin":1,"acidity":5}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/285fb6e1-48c6-495e-8d1e-771669952f00.jpg',
    88.00,
    88.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Aia dei Colombi
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Aia dei Colombi',
    'aia-dei-colombi-silverlake-wine',
    NULL,
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Falanghina Del Sannio',
    'aia-dei-colombi-falanghina-del-sannio',
    NULL,
    NULL,
    'Italy',
    NULL,
    'Dry, medium-bodied, savory, silky, minerally.',
    'Dry, medium-bodied, savory, silky, minerally.',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/products/3584500ff926f8bffb9049ef6d1a846c.jpg',
    19.50,
    19.50,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Akarregi Txiki Balea
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Akarregi Txiki Balea',
    'akarregi-txiki-balea-silverlake-wine',
    NULL,
    'Spain',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Txakoli White',
    'akarregi-txiki-balea-txakoli-white',
    NULL,
    NULL,
    'Spain',
    NULL,
    '95% Hondarrabi Zuri + 5% Hondarrabi Beltza Getaria > Basque > Spain Light-bodied with a slight effervescence. Citrus, apple, dry herbs',
    '95% Hondarrabi Zuri + 5% Hondarrabi Beltza Getaria > Basque > Spain Light-bodied with a slight effervescence. Citrus, apple, dry herbs',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/942434c5-731c-45c5-85d5-665208c46653.jpg',
    26.75,
    26.75,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Alberti Malbec Reserva
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alberti Malbec Reserva',
    'alberti-malbec-reserva-silverlake-wine',
    NULL,
    'Argentina',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Bodega Calle',
    'alberti-malbec-reserva-bodega-calle',
    'Malbec',
    NULL,
    'Argentina',
    NULL,
    'A Silverlake Wine mainstay. ultimate richness. ultimate smoothness. exact Malbec. thoroughly Argentinean.',
    'A Silverlake Wine mainstay. ultimate richness. ultimate smoothness. exact Malbec. thoroughly Argentinean.',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/7943863f53ef4d9ecb2986fa03a4c3c4.jpg',
    21.00,
    21.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Albet i Noya
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Albet i Noya',
    'albet-i-noya-silverlake-wine',
    NULL,
    'Spain',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Petit Albet Brut Reserva Sparkling',
    'albet-i-noya-petit-albet-brut-reserva-sparkling',
    NULL,
    NULL,
    'Spain',
    NULL,
    'Xarello, Macabeu, Parella Penedes > Spain A co-ferment of biodynamic gapes citrus, honeydew, dry finish, refreshing',
    'Xarello, Macabeu, Parella Penedes > Spain A co-ferment of biodynamic gapes citrus, honeydew, dry finish, refreshing',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/c12b7683-92ee-4e4a-8ba1-98c9a8ea164c.jpg',
    22.00,
    22.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Petit Albet Brut Rosé Sparkling',
    'albet-i-noya-petit-albet-brut-rose-sparkling',
    'Pinot Noir',
    NULL,
    'Spain',
    NULL,
    'Pinot Noir + Garnatxa Penedes > Spain herbal, floral, rich, and red fruity text book blanc de noirs organic farming since 1978',
    'Pinot Noir + Garnatxa Penedes > Spain herbal, floral, rich, and red fruity text book blanc de noirs organic farming since 1978',
    '["versatile pairing"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/08b87ee0-80e0-4f4a-9421-2341e0bd1a28.jpg',
    22.00,
    22.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Aldinger Trollinger
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Aldinger Trollinger',
    'aldinger-trollinger-silverlake-wine',
    NULL,
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Feldhase Trocken',
    'aldinger-trollinger-feldhase-trocken',
    NULL,
    NULL,
    'Italy',
    NULL,
    'Known in Italy as Vernatsch or Schiava, the light-skinned Trollinger grape is native to Wuerttemberg, Germany. The Aldinger''s version is a beautifully fruit-driven, yet earthy red that is exceptional when slightly chilled.',
    'Known in Italy as Vernatsch or Schiava, the light-skinned Trollinger grape is native to Wuerttemberg, Germany. The Aldinger''s version is a beautifully fruit-driven, yet earthy red that is exceptional when slightly chilled.',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/products/580108a0f0b6999ad459cc733f8e2c52.jpg',
    23.00,
    23.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Alegre Valganon
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alegre Valganon',
    'alegre-valganon-silverlake-wine',
    'Rioja',
    'Spain',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Rioja Blanco',
    'alegre-valganon-rioja-blanco',
    'Tempranillo',
    'Rioja',
    'Spain',
    NULL,
    '85% Viura, 15% Garnacha Blanca, 5% Tempranillo Blanco Rioja > Spain Aged in concrete, oak vats and 500-liter barrels',
    '85% Viura, 15% Garnacha Blanca, 5% Tempranillo Blanco Rioja > Spain Aged in concrete, oak vats and 500-liter barrels',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/4c2a1565-926a-4d4a-91b9-f67fa63e8815.jpg',
    29.00,
    29.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Alessandro Viola
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alessandro Viola',
    'alessandro-viola-silverlake-wine',
    'Sicily',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Carricat Bianco',
    'alessandro-viola-carricat-bianco',
    NULL,
    'Sicily',
    'Italy',
    NULL,
    'Carricat is an exciting white wine from Sicily, made from a blend of Carricante and Catarratto, two indigenous grape varieties that thrive in the region. This wine reflects Viola''s natural winemaking philosophy, with grapes farmed organically and vinified with minimal intervention. Carricat undergoes a short skin contact maceration (about 48 hours), which adds a subtle texture without overpowering the wine''s bright and refreshing character.',
    'Carricat is an exciting white wine from Sicily, made from a blend of Carricante and Catarratto, two indigenous grape varieties that thrive in the region. This wine reflects Viola''s natural winemaking philosophy, with grapes farmed organically and vinified with minimal intervention. Carricat undergoes a short skin contact maceration (about 48 hours), which adds a subtle texture without overpowering the wine''s bright and refreshing character.',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/2665a20c817bc8a436f81d8cf3f27ea8.jpg',
    31.00,
    31.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Alessandro Viola Note
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alessandro Viola Note',
    'alessandro-viola-note-silverlake-wine',
    'Sicily',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Alessandro Viola Note di Rosso',
    'alessandro-viola-note-di-rosso',
    'Syrah',
    'Sicily',
    'Italy',
    NULL,
    'Organic. A blend of Nero d''Avola and Syrah gives off notes of dark fruit, sharp spice, and minerality. Perfect body and finishing off with soft tannins.',
    'Organic. A blend of Nero d''Avola and Syrah gives off notes of dark fruit, sharp spice, and minerality. Perfect body and finishing off with soft tannins.',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/products/ade7732e6748f7bd48a1c5549d545bde.jpg',
    35.00,
    35.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Allimant Laugner Rosé
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Allimant Laugner Rosé',
    'allimant-laugner-rose-silverlake-wine',
    'Alsace',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Cremant d''Alsace',
    'allimant-laugner-rose-cremant-dalsace',
    'Pinot Noir',
    'Alsace',
    'France',
    NULL,
    '100% Pinot Noir Alsace > France Champagne-method sparkler Light maceration native yeast fermented in stainless steel tanks aged 12-18 months on its lees disgorged with low dosage Bright berries, steely minearlity, clean, tiny bubbles, dry',
    '100% Pinot Noir Alsace > France Champagne-method sparkler Light maceration native yeast fermented in stainless steel tanks aged 12-18 months on its lees disgorged with low dosage Bright berries, steely minearlity, clean, tiny bubbles, dry',
    '["versatile pairing"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/bbc646add3d9c2a3ee425a26ef87dc12.jpg',
    24.00,
    24.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Cremant d''Alsace MAGNUM - 1.5 Liter',
    'allimant-laugner-rose-cremant-dalsace-magnum-1-5-liter',
    'Pinot Noir',
    'Alsace',
    'France',
    NULL,
    '100% Pinot Noir Champagne-method sparkler from Orschwiller in Alsace. Light maceration, native yeast fermented in stainless steel tanks, aged 12-18 months on its lees, disgorged with low dosage. Bright berries, steely minearlity, clean, tiny bubble',
    '100% Pinot Noir Champagne-method sparkler from Orschwiller in Alsace. Light maceration, native yeast fermented in stainless steel tanks, aged 12-18 months on its lees, disgorged with low dosage. Bright berries, steely minearlity, clean, tiny bubble',
    '["versatile pairing"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/products/969b492ca1e5cf68965ff604b79618bf.jpg',
    57.00,
    57.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Altar Uco Malbec
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Altar Uco Malbec',
    'altar-uco-malbec-silverlake-wine',
    'Mendoza',
    NULL,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Edad Moderna',
    'altar-uco-malbec-edad-moderna',
    'Malbec',
    'Mendoza',
    NULL,
    NULL,
    '100% Malbec from old vine vineyards in Mendoza, hand-harvested, fermented with native yeasts in cement pools prior to aging in cement tank. Bold, dark fruits, tannin forward balanced with crisp acidity.',
    '100% Malbec from old vine vineyards in Mendoza, hand-harvested, fermented with native yeasts in cement pools prior to aging in cement tank. Bold, dark fruits, tannin forward balanced with crisp acidity.',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/products/4e135cd899e7138bdc8fac270129ff7a.jpg',
    29.00,
    29.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Altxor Txakolina
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Altxor Txakolina',
    'altxor-txakolina-silverlake-wine',
    NULL,
    'Spain',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Blanco',
    'altxor-txakolina-blanco',
    NULL,
    NULL,
    'Spain',
    NULL,
    '100% Hondarrabi Zuri Basque Country > Spain Bright and refreshing saline notes and zippy flavors of lime zest, green apple, rhubarb, and Asian pear It''s mouthwatering and food-friendly too shellfish and fresh seafood pairable',
    '100% Hondarrabi Zuri Basque Country > Spain Bright and refreshing saline notes and zippy flavors of lime zest, green apple, rhubarb, and Asian pear It''s mouthwatering and food-friendly too shellfish and fresh seafood pairable',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/81ffd9e7bf181480db1328b0a7705f9a.jpg',
    23.00,
    23.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Rosat Rosé',
    'altxor-txakolina-rosat-rose',
    NULL,
    NULL,
    'Spain',
    NULL,
    'The gentle fizz (as is traditional for Txakoli) is just one of the many charming elements to this rosé. Bone dry with angular but balanced acidity with a plethora of fruit notes including raspberries and strawberries with an injection of lime zest. Break out the porrón!',
    'The gentle fizz (as is traditional for Txakoli) is just one of the many charming elements to this rosé. Bone dry with angular but balanced acidity with a plethora of fruit notes including raspberries and strawberries with an injection of lime zest. Break out the porrón!',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/193456a0-74bf-475c-a33d-9734e7b24bce.jpg',
    28.00,
    28.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Amevive Carino
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Amevive Carino',
    'amevive-carino-silverlake-wine',
    NULL,
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Tempranillo/Graciano',
    'amevive-carino-tempranillo-graciano',
    'Tempranillo',
    NULL,
    'United States',
    NULL,
    'Cariño is a coferment of the Pesquera Tempranillo and Graciano from the late 90''s plantings at Ibarra-Young. The Pesquera Tempranillo at Ibarra-Young is an own-rooted suitcase clone originating from Bodega Pesquera in Pesquera del Duero, Spain. I had never been inspired to make or seek Tempranillo until tending these vines for the last few years. These vines clearly want to be here! They grow easily and always win the beauty contest. Cariño translates to ''darling'' in Spanish and speaks to the tw',
    'Cariño is a coferment of the Pesquera Tempranillo and Graciano from the late 90''s plantings at Ibarra-Young. The Pesquera Tempranillo at Ibarra-Young is an own-rooted suitcase clone originating from Bodega Pesquera in Pesquera del Duero, Spain. I had never been inspired to make or seek Tempranillo until tending these vines for the last few years. These vines clearly want to be here! They grow easily and always win the beauty contest. Cariño translates to ''darling'' in Spanish and speaks to the tw',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/products/0d0987a99e096330e5aacf4153329bf2.jpg',
    44.00,
    44.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Amorotti
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Amorotti',
    'amorotti-silverlake-wine',
    NULL,
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Trebbiano',
    'amorotti-trebbiano',
    'Trebbiano',
    NULL,
    'Italy',
    NULL,
    'Super rare Trebbiano Abruzzese fermented and aged in untoasted barrels for one year, giving it textural appeal without any new oak flavors. It is a wine of minerality and power with ripe orchard fruit balanced against citrus notes.',
    'Super rare Trebbiano Abruzzese fermented and aged in untoasted barrels for one year, giving it textural appeal without any new oak flavors. It is a wine of minerality and power with ripe orchard fruit balanced against citrus notes.',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/e2bdc88f-dfc5-4365-8a03-add360839842.jpg',
    58.00,
    58.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Ampeleia
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Ampeleia',
    'ampeleia-silverlake-wine',
    'Tuscany',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Unlitro',
    'ampeleia-unlitro',
    'Grenache',
    'Tuscany',
    'Italy',
    NULL,
    'Alicante Nero + Carignano + Mourvèdre + Sangiovese + Alicante Bouschet Tuscany > Italy organic unoaked 1 Liter of wine robust red fruits, super smooth, light tannins, classic italian! The perfect wine to take to dinner goes great with pizza! fantastic collaboration between Elisabetta Foradori, Giovanni Podini, and Thomas Widmann. This wine is a blend of Alicante Nero (Grenache), Carignano, Mourvèdre, Sangiovese, and Alicante Bouschet, sourced from their youngest vineyards near the Tuscan coas',
    'Alicante Nero + Carignano + Mourvèdre + Sangiovese + Alicante Bouschet Tuscany > Italy organic unoaked 1 Liter of wine robust red fruits, super smooth, light tannins, classic italian! The perfect wine to take to dinner goes great with pizza! fantastic collaboration between Elisabetta Foradori, Giovanni Podini, and Thomas Widmann. This wine is a blend of Alicante Nero (Grenache), Carignano, Mourvèdre, Sangiovese, and Alicante Bouschet, sourced from their youngest vineyards near the Tuscan coas',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":3,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/b413b9b0-5e17-4613-b7bf-aabc45d2707d.jpg',
    26.00,
    26.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Anapea Village
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Anapea Village',
    'anapea-village-silverlake-wine',
    NULL,
    NULL,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Kvareli Kisi',
    'anapea-village-kvareli-kisi',
    NULL,
    NULL,
    NULL,
    NULL,
    '100% Kisi Kakheti > Georgia Traditional Georgian winemaking - 6 months on skins and wines aged in Qvevris and 6 months in a cooler set of qveri, unfined and unfiltered, minimal sulfur flowers, peach, herbal tea, nutty',
    '100% Kisi Kakheti > Georgia Traditional Georgian winemaking - 6 months on skins and wines aged in Qvevris and 6 months in a cooler set of qveri, unfined and unfiltered, minimal sulfur flowers, peach, herbal tea, nutty',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/1f93b377-514a-447a-877c-33e432741b94.jpg',
    24.00,
    24.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Andi Weigand Zusammen
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Andi Weigand Zusammen',
    'andi-weigand-zusammen-silverlake-wine',
    NULL,
    'Germany',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'White Cuvee',
    'andi-weigand-zusammen-white-cuvee',
    'Riesling',
    NULL,
    'Germany',
    NULL,
    '45% Scheurebe, 25% Riesling, 20% Muller Thurgau, 10% Silvaner Franken > Germany Organic. Unfined. Unfiltered.',
    '45% Scheurebe, 25% Riesling, 20% Muller Thurgau, 10% Silvaner Franken > Germany Organic. Unfined. Unfiltered.',
    '["versatile pairing"]'::jsonb,
    '{"body":2,"sweetness":3,"tannin":1,"acidity":5}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/14d11112-9c75-4b64-9589-9c1f55423d1d.jpg',
    28.00,
    28.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Angelot Gamay
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Angelot Gamay',
    'angelot-gamay-silverlake-wine',
    NULL,
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Angelot Gamay Bugey',
    'angelot-gamay-bugey',
    'Gamay',
    NULL,
    'France',
    NULL,
    '100% Gamay for Bugey, in Eastern France immensely popular, juicy, funky, and chillable red.',
    '100% Gamay for Bugey, in Eastern France immensely popular, juicy, funky, and chillable red.',
    '["versatile pairing"]'::jsonb,
    '{"body":2,"sweetness":1,"tannin":2,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/products/fe8041a5ea8df03b5ee72bc41aa01d2b.jpg',
    18.00,
    18.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Angura Goruli
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Angura Goruli',
    'angura-goruli-silverlake-wine',
    NULL,
    NULL,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Mtsvane',
    'angura-goruli-mtsvane',
    NULL,
    NULL,
    NULL,
    NULL,
    'Georgia, Eastern Europe Medium-bodied with balanced acidity and clean finish. Skin-contact white with amber hue and textured complexity. organic + natural winemaking',
    'Georgia, Eastern Europe Medium-bodied with balanced acidity and clean finish. Skin-contact white with amber hue and textured complexity. organic + natural winemaking',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/201ab6ff-1bb3-4b03-83b8-ddc85677182e.jpg',
    28.00,
    28.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Anima Mundi
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Anima Mundi',
    'anima-mundi-silverlake-wine',
    NULL,
    'Spain',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Gres Xarel-lo',
    'anima-mundi-gres-xarel-lo',
    NULL,
    NULL,
    'Spain',
    NULL,
    'Spain & Portugal Light-bodied with crisp acidity and refreshing character. organic + natural winemaking',
    'Spain & Portugal Light-bodied with crisp acidity and refreshing character. organic + natural winemaking',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/cca30721-968d-436f-835c-844454d32b10.jpg',
    30.00,
    30.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Anne Pichon
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Anne Pichon',
    'anne-pichon-silverlake-wine',
    'Rhône Valley',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Vermentino Sauvage',
    'anne-pichon-vermentino-sauvage',
    'Vermentino',
    'Rhône Valley',
    'France',
    NULL,
    'Fresh, zippy, direct press Vermentino from the Southern Rhône Valley. Organically grown, with notes of grapefruit, fresh apple, almond, & pineapple.',
    'Fresh, zippy, direct press Vermentino from the Southern Rhône Valley. Organically grown, with notes of grapefruit, fresh apple, almond, & pineapple.',
    '["versatile pairing"]'::jsonb,
    '{"body":2,"sweetness":1,"tannin":1,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/24bd75d891d02de59c8044622eb43d35.jpg',
    22.00,
    22.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Antidoto Ribera
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Antidoto Ribera',
    'antidoto-ribera-silverlake-wine',
    'Ribera del Duero',
    'Spain',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Antidoto Ribera del Duero',
    'antidoto-ribera-del-duero',
    'Tempranillo',
    'Ribera del Duero',
    'Spain',
    NULL,
    'Tempranillo Spain & Portugal Medium-bodied. Cherry, leather, and warm spice with balanced structure. organic + natural winemaking',
    'Tempranillo Spain & Portugal Medium-bodied. Cherry, leather, and warm spice with balanced structure. organic + natural winemaking',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/05166752-15ec-47ff-9a9c-59cfa7535780.jpg',
    35.00,
    35.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Antonella Corda Cannonau
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Antonella Corda Cannonau',
    'antonella-corda-cannonau-silverlake-wine',
    'Sardinia',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Antonella Corda Cannonau di Sardegna',
    'antonella-corda-cannonau-di-sardegna',
    NULL,
    'Sardinia',
    'Italy',
    NULL,
    'Sardinia > Italy Medium-bodied with balanced fruit and approachable tannins. organic + natural winemaking',
    'Sardinia > Italy Medium-bodied with balanced fruit and approachable tannins. organic + natural winemaking',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/7eea8fdf-516f-4737-8432-ed0a6da0488a.jpg',
    29.00,
    29.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Arbeau On
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Arbeau On',
    'arbeau-on-silverlake-wine',
    NULL,
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'L''Appelle Negrette',
    'arbeau-on-lappelle-negrette',
    'Syrah',
    NULL,
    'France',
    NULL,
    '100% Negrette done in a semi-carbonic bringing us a cherry fiz with layers of strawberry, black pepper, and soft tannins. Think Syrah, Pineau d''Aunis, Gamay in the best, fruitiest, balanced way.',
    '100% Negrette done in a semi-carbonic bringing us a cherry fiz with layers of strawberry, black pepper, and soft tannins. Think Syrah, Pineau d''Aunis, Gamay in the best, fruitiest, balanced way.',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/355271eb-0e26-4f8e-9831-c3c05f98e3c5.jpg',
    21.00,
    21.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Arca Nova Rosé
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Arca Nova Rosé',
    'arca-nova-rose-silverlake-wine',
    NULL,
    'Spain',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Vinho Verde',
    'arca-nova-rose-vinho-verde',
    NULL,
    NULL,
    'Spain',
    NULL,
    'Touriga Nacional + Espadeiro Vinho Verde > Portugal fizzy light body super crushable',
    'Touriga Nacional + Espadeiro Vinho Verde > Portugal fizzy light body super crushable',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/a2f4f35d86e0b504daf6667de8454a54.jpg',
    12.50,
    12.50,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Arca Nova
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Arca Nova',
    'arca-nova-silverlake-wine',
    NULL,
    'Spain',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Vinho Verde',
    'arca-nova-vinho-verde',
    NULL,
    NULL,
    'Spain',
    NULL,
    'Loureiro + Arinto + Trajadura Vinho Verde > Portugal Dry, mineral-driven, lemon + lime, kiwi, kumquat, crisp, slightly effervescent. Pound for pound, the best white wine on the planet. A Silverlake Wine staple',
    'Loureiro + Arinto + Trajadura Vinho Verde > Portugal Dry, mineral-driven, lemon + lime, kiwi, kumquat, crisp, slightly effervescent. Pound for pound, the best white wine on the planet. A Silverlake Wine staple',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/393b57fd983278e9e3b9ff47bd78322d.jpg',
    12.50,
    12.50,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Arietta On The
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Arietta On The',
    'arietta-on-the-silverlake-wine',
    NULL,
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'White Keys White Blend',
    'arietta-on-the-white-keys-white-blend',
    'Sauvignon Blanc',
    NULL,
    'United States',
    NULL,
    '78% Sauvignon Blanc, 22% Semillon',
    '78% Sauvignon Blanc, 22% Semillon',
    '["versatile pairing"]'::jsonb,
    '{"body":2,"sweetness":1,"tannin":1,"acidity":5}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/3342650f-40ba-427e-a4fa-5cecc16672f6.jpg',
    85.00,
    85.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Armand Heitz Folie
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Armand Heitz Folie',
    'armand-heitz-folie-silverlake-wine',
    'Burgundy',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Sauvage Bourgogne Rouge',
    'armand-heitz-folie-sauvage-bourgogne-rouge',
    'Pinot Noir',
    'Burgundy',
    'France',
    NULL,
    '40% Pinot Noir + 60% Gamay Pinot Noir from Meursault and Volnay Gamay from Pruzilly, Beaujolais',
    '40% Pinot Noir + 60% Gamay Pinot Noir from Meursault and Volnay Gamay from Pruzilly, Beaujolais',
    '["versatile pairing"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/e4221851-3230-441d-81fe-78eeb2727c33.jpg',
    27.00,
    27.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Arnot-Roberts Gamay
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Arnot-Roberts Gamay',
    'arnot-roberts-gamay-silverlake-wine',
    NULL,
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Arnot-Roberts Gamay Noir',
    'arnot-roberts-gamay-noir',
    'Gamay',
    NULL,
    'United States',
    NULL,
    '100% Gamay - 75% from Barsotti & 25% from Witters Vineyard El Dorado > California 100% whole cluster, with the Barsotti component fermented with carbonic maceration. The wine was aged in 40% concrete tank, 15% foudre and 45% neutral oak barrels. Light in body and brimming with snappy Rainier Cherry fruit inflected with cinnamon and blood orange zest',
    '100% Gamay - 75% from Barsotti & 25% from Witters Vineyard El Dorado > California 100% whole cluster, with the Barsotti component fermented with carbonic maceration. The wine was aged in 40% concrete tank, 15% foudre and 45% neutral oak barrels. Light in body and brimming with snappy Rainier Cherry fruit inflected with cinnamon and blood orange zest',
    '["versatile pairing"]'::jsonb,
    '{"body":2,"sweetness":1,"tannin":2,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/31310158-9ede-447e-8f8f-f1919c214686.jpg',
    32.00,
    32.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Arnot-Roberts Pinot Noir
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Arnot-Roberts Pinot Noir',
    'arnot-roberts-pinot-noir-silverlake-wine',
    NULL,
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Fox Creek',
    'arnot-roberts-pinot-noir-fox-creek',
    'Pinot Noir',
    NULL,
    'United States',
    NULL,
    'Pinot Noir California > USA medium-bodied, red fruit, earth, and fine-grained tannins with elegant depth organic, natural',
    'Pinot Noir California > USA medium-bodied, red fruit, earth, and fine-grained tannins with elegant depth organic, natural',
    '["versatile pairing"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/0f30bcf3-bf4a-4e50-9db7-6c0921d30f1b.jpg',
    75.00,
    75.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Arnot-Roberts Rosé
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Arnot-Roberts Rosé',
    'arnot-roberts-rose-silverlake-wine',
    'Lake County',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'California',
    'arnot-roberts-rose-california',
    NULL,
    'Lake County',
    'United States',
    NULL,
    '92% Touriga Nacional + 8% Trincadeira Touriga Nacional: -Luchsinger Vineyard, Lake County: Big Valley AVA, volcanic soils at 1,400 -St. Amant Vineyard, Amador County: sandy granitic loam at the base of the Sierra Nevadas Trincadeira & Touriga Nacional: -St Jorge Vineyard, Lodi: both native Portugeuse varieties thrive in the Mokelumne River delta Volcanic. Elegant. Fresh.',
    '92% Touriga Nacional + 8% Trincadeira Touriga Nacional: -Luchsinger Vineyard, Lake County: Big Valley AVA, volcanic soils at 1,400 -St. Amant Vineyard, Amador County: sandy granitic loam at the base of the Sierra Nevadas Trincadeira & Touriga Nacional: -St Jorge Vineyard, Lodi: both native Portugeuse varieties thrive in the Mokelumne River delta Volcanic. Elegant. Fresh.',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/ab115e24-7866-4332-b268-b9ad95785a7f.jpg',
    30.00,
    30.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Arnot-Roberts Syrah
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Arnot-Roberts Syrah',
    'arnot-roberts-syrah-silverlake-wine',
    'Sonoma',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Sonoma Coast',
    'arnot-roberts-syrah-sonoma-coast',
    'Syrah',
    'Sonoma',
    'United States',
    NULL,
    'Syrah California > USA medium-bodied, violet, blackberry, and cracked pepper with supple tannins sustainably farmed',
    'Syrah California > USA medium-bodied, violet, blackberry, and cracked pepper with supple tannins sustainably farmed',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/products/9e3004637b529ab2e3cb53310fea36d4.jpg',
    47.00,
    47.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Arnot-Roberts
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Arnot-Roberts',
    'arnot-roberts-silverlake-wine',
    NULL,
    NULL,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Trousseau',
    'arnot-roberts-trousseau',
    NULL,
    NULL,
    NULL,
    NULL,
    'Light, vibrant, chillable red',
    'Light, vibrant, chillable red',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/products/ef98e87a0dae1d9717dcd61983f425b2.png',
    39.00,
    39.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Athenais De Beru
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Athenais De Beru',
    'athenais-de-beru-silverlake-wine',
    NULL,
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Bourgogne Blanc Chardonnay',
    'athenais-de-beru-bourgogne-blanc-chardonnay',
    'Chardonnay',
    NULL,
    'France',
    NULL,
    'Athenais produces this wine under her small negociant business started a few years ago. All the fruit is sourced from trusted natural and biodynamic growers so the quality is always high. They are fermented at the Beru Chateau following all the same biodynamic principles as the estate wines and very little if any sulphur. Some are fermented in Amphorae, some in wood depending on the year.',
    'Athenais produces this wine under her small negociant business started a few years ago. All the fruit is sourced from trusted natural and biodynamic growers so the quality is always high. They are fermented at the Beru Chateau following all the same biodynamic principles as the estate wines and very little if any sulphur. Some are fermented in Amphorae, some in wood depending on the year.',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":1,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/e9f9a40d-8b87-4b41-8bbd-3ac560fb6d84.jpg',
    52.00,
    52.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Auguste Clape
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Auguste Clape',
    'auguste-clape-silverlake-wine',
    'Rhone',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Cornas 2022',
    'auguste-clape-cornas-2022',
    'Syrah',
    'Rhone',
    'France',
    2022,
    'A gorgeous Northern Rhone Syrah grown on the steep Western slopes of the Rhone river, this wine exemplifies the terroir by expressing herbaceous minty notes Auguste was a pioneer in Cornas, becoming the first to make the move from selling grapes to negociants and bottling his own wine Vinified naturally in old large oak foudres and bottled unfiltered',
    'A gorgeous Northern Rhone Syrah grown on the steep Western slopes of the Rhone river, this wine exemplifies the terroir by expressing herbaceous minty notes Auguste was a pioneer in Cornas, becoming the first to make the move from selling grapes to negociants and bottling his own wine Vinified naturally in old large oak foudres and bottled unfiltered',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/483b4c3f-4079-49b1-962c-95f79ff7e1d9.jpg',
    260.00,
    260.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Auguste Clape Cornas
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Auguste Clape Cornas',
    'auguste-clape-cornas-silverlake-wine',
    'Rhone',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Renaissance 2021',
    'auguste-clape-cornas-renaissance-2021',
    'Syrah',
    'Rhone',
    'France',
    2021,
    'Perfect for aging or enjoying now, this is a fine example of unfiltered Syrah grown in the top parcels in the Northern Rhone. Dark, inky fruit with a satisfying gameyness and notes of black olive. The Clape family pioneered grower/producer wine in Cornas.',
    'Perfect for aging or enjoying now, this is a fine example of unfiltered Syrah grown in the top parcels in the Northern Rhone. Dark, inky fruit with a satisfying gameyness and notes of black olive. The Clape family pioneered grower/producer wine in Cornas.',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/4d43d58e21d2b6530d37b896c2e13685.jpg',
    180.00,
    180.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Auguste Clape Le
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Auguste Clape Le',
    'auguste-clape-le-silverlake-wine',
    NULL,
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Vin des Amis',
    'auguste-clape-le-vin-des-amis',
    'Syrah',
    NULL,
    'France',
    NULL,
    '100% Syrah from vineyards between the village of Cornas and the Rhône river. Fermented and aged in cement tanks, then aged for only 2 months in foudres before bottling. A fresh take on Northern Rhône Syrah.',
    '100% Syrah from vineyards between the village of Cornas and the Rhône river. Fermented and aged in cement tanks, then aged for only 2 months in foudres before bottling. A fresh take on Northern Rhône Syrah.',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/b68745560f523e33497a0c7f52e77a3f.jpg',
    75.00,
    75.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Auguste Clape Saint-Peray
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Auguste Clape Saint-Peray',
    'auguste-clape-saint-peray-silverlake-wine',
    'Rhone',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Blanc 2023',
    'auguste-clape-saint-peray-blanc-2023',
    NULL,
    'Rhone',
    'France',
    2023,
    '80% Marsanne, 20% Roussanne from the Northern Rhone Valley. Fermented and aged in a combination of tank and foudre before bottling. Mid-weight, mineral driven, hints of stone fruit.',
    '80% Marsanne, 20% Roussanne from the Northern Rhone Valley. Fermented and aged in a combination of tank and foudre before bottling. Mid-weight, mineral driven, hints of stone fruit.',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/082efd88-df02-4089-8d32-6d4375511675.jpg',
    110.00,
    110.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Aux Moines Savennieres
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Aux Moines Savennieres',
    'aux-moines-savennieres-silverlake-wine',
    NULL,
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Roche Aux Moines',
    'aux-moines-savennieres-roche-aux-moines',
    'Chenin Blanc',
    NULL,
    'France',
    NULL,
    '100% Chenin Blanc fermented & aged in barrel. White flowers/yellow fruits evolving towards complex notes of acacia and candied fruits.',
    '100% Chenin Blanc fermented & aged in barrel. White flowers/yellow fruits evolving towards complex notes of acacia and candied fruits.',
    '["versatile pairing"]'::jsonb,
    '{"body":3,"sweetness":2,"tannin":1,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/0c3b68780c9fc7aa510914d65456c3cb.jpg',
    72.00,
    72.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Averaen Pinot
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Averaen Pinot',
    'averaen-pinot-silverlake-wine',
    'Willamette Valley',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Averaen Pinot Noir',
    'averaen-pinot-noir',
    'Pinot Noir',
    'Willamette Valley',
    'United States',
    NULL,
    '100% Pinot Noir Willamette Valley > Oregon Vibrant, fresh dark fruit, spice and citrus, dry and focused.',
    '100% Pinot Noir Willamette Valley > Oregon Vibrant, fresh dark fruit, spice and citrus, dry and focused.',
    '["versatile pairing"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/8524c37c-e51e-429d-a057-51cc00fde155.jpg',
    26.00,
    26.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Aviary Chardonnay
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Aviary Chardonnay',
    'aviary-chardonnay-silverlake-wine',
    'Napa Valley',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'California',
    'aviary-chardonnay-california',
    'Chardonnay',
    'Napa Valley',
    'United States',
    NULL,
    '100% Chardonnay Napa Valley > California all about making good Napa wine affordable Rich / buttered popcorn / smooth / dry',
    '100% Chardonnay Napa Valley > California all about making good Napa wine affordable Rich / buttered popcorn / smooth / dry',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":1,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/ca6ca1127a381ac8049b174d249d2009.jpg',
    23.00,
    23.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- =========================================================================
  -- RETAILER 4: Flask Fine Wine & Whisky
  -- Location: Downtown, Los Angeles
  -- =========================================================================

  INSERT INTO public.organizations (id, name, slug, metadata)
  VALUES (
    gen_random_uuid(),
    'Flask Fine Wine & Whisky',
    'flask-fine-wine',
    '{"location":"Downtown, Los Angeles","tagline":"Premium rare and vintage wines and whisky"}'::jsonb
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, metadata = EXCLUDED.metadata
  RETURNING id INTO _org_id;

  -- Producer: Alvear
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alvear',
    'alvear-flask-fine-wine',
    NULL,
    'Spain',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Pedro Ximenez Dulce Muy Viejo Montilla-Moriles',
    '1830-alvear-pedro-ximenez-dulce-muy-viejo-montilla-moriles',
    NULL,
    NULL,
    'Spain',
    NULL,
    '1830 Alvear Pedro Ximenez Dulce Muy Viejo Montilla-Moriles Dark mahogany color. Very aromatic and spicy with hints of cocoa, dates and raisins. Consistent, long and elegant, with hints of solera, raisins, honey and coffee.',
    '1830 Alvear Pedro Ximenez Dulce Muy Viejo Montilla-Moriles Dark mahogany color. Very aromatic and spicy with hints of cocoa, dates and raisins. Consistent, long and elegant, with hints of solera, raisins, honey and coffee.',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/products/buy-wine-dessert-1830-alvear-pedro-ximenez-dulce-muy-viejo-montilla-moriles-online-29132447940776.jpg',
    299.97,
    299.97,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Chateau Lafite Rothschild
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Chateau Lafite Rothschild',
    'chateau-lafite-rothschild-flask-fine-wine',
    NULL,
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Magnum',
    '1962-chateau-lafite-rothschild-magnum',
    NULL,
    NULL,
    'France',
    1962,
    '1962 Chateau Lafite Rothschild Magnum The 1962 Lafite-Rothschild is served from an impeccable magnum, one of the standouts of this comprehensive vertical tasting. Perhaps the larger format and provenance should be factored in, but neither of my two previous encounters with 1962 has come close to this. Deeper in color than 1966, 1962 offers impressive blackberry and bilberry on the nose, vines of cedar and graphite evolving with time flanked by subtle black olive and brine. The palate is revivify',
    '1962 Chateau Lafite Rothschild Magnum The 1962 Lafite-Rothschild is served from an impeccable magnum, one of the standouts of this comprehensive vertical tasting. Perhaps the larger format and provenance should be factored in, but neither of my two previous encounters with 1962 has come close to this. Deeper in color than 1966, 1962 offers impressive blackberry and bilberry on the nose, vines of cedar and graphite evolving with time flanked by subtle black olive and brine. The palate is revivify',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/products/buy-wine-red-bordeaux-1962-chateau-lafite-rothschild-magnum-online-29160247099560.jpg',
    2999.97,
    2999.97,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Dom Perignon
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Dom Perignon',
    'dom-perignon-flask-fine-wine',
    'Champagne',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Oenotheque Champagne',
    '1969-dom-perignon-oenotheque-champagne',
    'Champagne',
    'Champagne',
    'France',
    1969,
    '1969 Dom Perignon Oenotheque Champagne The effect on the palate is powerful and frank, against a profound and austere background. The wine remains somewhat closed, before finally revealing its impeccable structure. The finish is astonishingly fruity (blueberry). The bouquet is complex, concentrated and dark, with hints of candied citrus fruits, bitter chocolate, leather and dried flowers.',
    '1969 Dom Perignon Oenotheque Champagne The effect on the palate is powerful and frank, against a profound and austere background. The wine remains somewhat closed, before finally revealing its impeccable structure. The finish is astonishingly fruity (blueberry). The bouquet is complex, concentrated and dark, with hints of candied citrus fruits, bitter chocolate, leather and dried flowers.',
    '["versatile pairing"]'::jsonb,
    '{"body":2,"sweetness":1,"tannin":1,"acidity":5}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/products/1969DomPerignonOenothequeChampagne.png',
    2499.97,
    2499.97,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Champagne',
    '1992-dom-perignon-champagne',
    'Champagne',
    'Champagne',
    'France',
    1992,
    '1992 Dom Perignon Champagne Dom Perignon, a Benedictine monk, was appointed cellarer in the Hautvillers Abbaye in 1668, which marked his time in contributing to the development of champagne, originally designed to be a "still" wine (without bubbles). The advent of Napoleon, a friend of Jean-Remy Chandon in 1804, marks the beginning of an era of uninterrupted commercial success for Moët & Chandon, which is now globally renowned. "The" Dom Perignon, cuvee prestige of the house, is certainly the mo',
    '1992 Dom Perignon Champagne Dom Perignon, a Benedictine monk, was appointed cellarer in the Hautvillers Abbaye in 1668, which marked his time in contributing to the development of champagne, originally designed to be a "still" wine (without bubbles). The advent of Napoleon, a friend of Jean-Remy Chandon in 1804, marks the beginning of an era of uninterrupted commercial success for Moët & Chandon, which is now globally renowned. "The" Dom Perignon, cuvee prestige of the house, is certainly the mo',
    '["versatile pairing"]'::jsonb,
    '{"body":2,"sweetness":1,"tannin":1,"acidity":5}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/products/1992DomPerignonChampagne.jpg',
    299.99,
    299.99,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Lopez de Heredia
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Lopez de Heredia',
    'lopez-de-heredia-flask-fine-wine',
    'Rioja',
    'Spain',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Vina Tondonia Gran Reserva Blanco',
    '1970-lopez-de-heredia-vina-tondonia-gran-reserva-blanco',
    NULL,
    NULL,
    'Spain',
    1970,
    '1970 Lopez de Heredia Vina Tondonia Gran Reserva Blanco The 1970 Vina Bosconia Gran Reserva is a captivating effort, with endless, well-defined nuances of pine, minerals and sweet red fruits that emerge from the glass in a breathtaking display of purity and class. It shows the extraordinary length, great expression and the pure breed of a truly great wine.',
    '1970 Lopez de Heredia Vina Tondonia Gran Reserva Blanco The 1970 Vina Bosconia Gran Reserva is a captivating effort, with endless, well-defined nuances of pine, minerals and sweet red fruits that emerge from the glass in a breathtaking display of purity and class. It shows the extraordinary length, great expression and the pure breed of a truly great wine.',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/products/buy-wine-white-1970-lopez-de-heredia-vina-tondonia-gran-reserva-blanco-online-29177982189736.jpg',
    1499.97,
    1499.97,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Vina Tondonia Rioja',
    '1970-lopez-de-heredia-vina-tondonia-rioja',
    NULL,
    'Rioja',
    'Spain',
    1970,
    '1970 Lopez de Heredia Vina Tondonia Rioja A visit to the venerable Bodega Lopez de Heredia, located in the Rioja Alta capital of Haro, is akin to entering a time machine taking you back 100 years. Construction of the Bodega began in 1877 and continues without any apparent changes to the present day. The winery is operated by the voluble Maria Jose Lopez de Heredia, her sister Mercedes, and their father Pedro, still active in his 80s. All of the wines are produced from estate grown bush vines.',
    '1970 Lopez de Heredia Vina Tondonia Rioja A visit to the venerable Bodega Lopez de Heredia, located in the Rioja Alta capital of Haro, is akin to entering a time machine taking you back 100 years. Construction of the Bodega began in 1877 and continues without any apparent changes to the present day. The winery is operated by the voluble Maria Jose Lopez de Heredia, her sister Mercedes, and their father Pedro, still active in his 80s. All of the wines are produced from estate grown bush vines.',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/products/1970LopezdeHerediavinaTondoniaRioja.jpg',
    399.97,
    399.97,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: California
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'California',
    'california-flask-fine-wine',
    'Napa Valley',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Clos du Val Cabernet Sauvignon, Napa Valley',
    '1975-clos-du-val-cabernet-sauvignon-napa-valley',
    'Cabernet Sauvignon',
    'Napa Valley',
    'United States',
    1975,
    '1975 Clos du Val Cabernet Sauvignon, Napa Valley The first vintage of Clos du Val Cabernet Sauvignon in 1972 was one of only five California Cabernets selected for the now-legendary 1976 Paris Tasting. That same vintage took first place in a rematch 10 years later, proving that Clos Du Val wines age with grace.',
    '1975 Clos du Val Cabernet Sauvignon, Napa Valley The first vintage of Clos du Val Cabernet Sauvignon in 1972 was one of only five California Cabernets selected for the now-legendary 1976 Paris Tasting. That same vintage took first place in a rematch 10 years later, proving that Clos Du Val wines age with grace.',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/products/1975ClosduValCabernetSauvignon_NapaValley.png',
    119.97,
    119.97,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Screaming Eagle Cabernet Sauvignon, Napa Valley',
    '1996-screaming-eagle-cabernet-sauvignon-napa-valley',
    'Cabernet Sauvignon',
    'Napa Valley',
    'United States',
    1996,
    '1996 Screaming Eagle Cabernet Sauvignon, Napa Valley Screaming Eagle is California''s original and most sought after cult wine in the world. Produced in tiny quantities from a small vineyard in Napa''s Oakville appellation, the Cabernet Sauvignon-based wine regularly sells for upwards of $3000 plus a bottle and is America''s most expensive regularly produced wine. Jean Phillips established the vineyards in 1986, and set about selling fruit to local producers in Napa. After a few years, the decision',
    '1996 Screaming Eagle Cabernet Sauvignon, Napa Valley Screaming Eagle is California''s original and most sought after cult wine in the world. Produced in tiny quantities from a small vineyard in Napa''s Oakville appellation, the Cabernet Sauvignon-based wine regularly sells for upwards of $3000 plus a bottle and is America''s most expensive regularly produced wine. Jean Phillips established the vineyards in 1986, and set about selling fruit to local producers in Napa. After a few years, the decision',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/products/1996ScreamingEagleCabernetSauvignon_NapaValley.jpg',
    3699.97,
    3699.97,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Peju Province Cabernet Sauvignon Napa Valley',
    '2015-peju-province-cabernet-sauvignon-napa-valley',
    'Cabernet Sauvignon',
    'Napa Valley',
    'United States',
    2015,
    'Winemaker Notes Ruby in color the 2015 Cabernet Sauvignon opens with floral notes of violet and rich cedar aromas on the nose. Concentrated flavors of dark cherry, black currant, raspberry and dusty cocoa lead to a brooding finish with firm tannins and soft acidity that support the rich black fruit flavors. Blend: 99% Cabernet Sauvignon, 1% Merlot',
    'Winemaker Notes Ruby in color the 2015 Cabernet Sauvignon opens with floral notes of violet and rich cedar aromas on the nose. Concentrated flavors of dark cherry, black currant, raspberry and dusty cocoa lead to a brooding finish with firm tannins and soft acidity that support the rich black fruit flavors. Blend: 99% Cabernet Sauvignon, 1% Merlot',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/products/buy-wine-red-cabernet-sauvignon-2015-peju-province-cabernet-sauvignon-napa-valley-online-28836760682664.jpg',
    52.97,
    52.97,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: South Africa
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'South Africa',
    'south-africa-flask-fine-wine',
    NULL,
    'South Africa',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'KWV Classic Collection Red Muscadel',
    '1975-kwv-classic-collection-red-muscadel',
    NULL,
    NULL,
    'South Africa',
    1975,
    '1975 KWV Classic Collection Red Muscadel A Fortified Wine from Western Cape, South Africa. Made from Muscadelle. This international award-winning wine has rich and ripe raisin, honey and spicy aromas and flavors. It is well balanced with the fruit, acidity and sweetness being in harmony. The finish is lingering and smooth.',
    '1975 KWV Classic Collection Red Muscadel A Fortified Wine from Western Cape, South Africa. Made from Muscadelle. This international award-winning wine has rich and ripe raisin, honey and spicy aromas and flavors. It is well balanced with the fruit, acidity and sweetness being in harmony. The finish is lingering and smooth.',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/products/buy-wine-dessert-1975-kwv-classic-collection-red-muscadel-online-28127195267240.jpg',
    89.97,
    89.97,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Chateau Figeac
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Chateau Figeac',
    'chateau-figeac-flask-fine-wine',
    NULL,
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Chateau La Tour Figeac Saint Emillon Grand Cru Classe',
    '1978-chateau-la-tour-figeac-saint-emillon-grand-cru-classe',
    NULL,
    NULL,
    'France',
    1978,
    NULL,
    NULL,
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/files/wfvgoyhve3qwuuw9tfmc.jpg',
    99.99,
    99.99,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: France
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'France',
    'france-flask-fine-wine',
    'Bordeaux',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Chateau de Ferrand Baron Bich Saint Emilion Grand Cru',
    '1982-chateau-de-ferrand-baron-bich-saint-emilion-grand-cru',
    'Merlot',
    'Bordeaux',
    'France',
    1982,
    '1982 Chateau de Ferrand Baron Bich Saint Emilion Grand Cru Château de Ferrand is a 42-hectare (104-acre) estate in Saint-Émilion, on Bordeaux''s so-called Right Bank region (on the right/north bank of the Dordogne river). It gained Saint-Émilion Grand Cru Classé status in 2012, and makes two wines: the grand vin and a second label, Le Différent de Château de Ferrand. The well-drained, clay-rich soils that underpin the estate''s 32 hectares (79 acres) of vineyard are planted to 75 percent Merlot, 1',
    '1982 Chateau de Ferrand Baron Bich Saint Emilion Grand Cru Château de Ferrand is a 42-hectare (104-acre) estate in Saint-Émilion, on Bordeaux''s so-called Right Bank region (on the right/north bank of the Dordogne river). It gained Saint-Émilion Grand Cru Classé status in 2012, and makes two wines: the grand vin and a second label, Le Différent de Château de Ferrand. The well-drained, clay-rich soils that underpin the estate''s 32 hectares (79 acres) of vineyard are planted to 75 percent Merlot, 1',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":3,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/products/buy-wine-red-bordeaux-1982-chateau-de-ferrand-baron-bich-saint-emilion-grand-cru-online-28127125799080.jpg',
    129.99,
    129.99,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Chateau La Lagune Haut-Medoc Grand Cru Classe',
    '1986-chateau-la-lagune-haut-medoc-grand-cru-classe',
    NULL,
    'Bordeaux',
    'France',
    1986,
    '1986 Chateau La Lagune Haut-Medoc Grand Cru Classe La Lagune is located in the Haut-Médoc appellation a few kilometers south of Margaux. Its top wine has certain similarities with Margaux grand crus in fine vintages. It is aged for 18 months in oak barrels of which 55% are renewed every year. This is a structured wine with a superb nose which is redolent of blackberry, raspberry and menthol. It has a very fine concentration on the palate and recent vintages are more delicate. A fine Bordeaux to',
    '1986 Chateau La Lagune Haut-Medoc Grand Cru Classe La Lagune is located in the Haut-Médoc appellation a few kilometers south of Margaux. Its top wine has certain similarities with Margaux grand crus in fine vintages. It is aged for 18 months in oak barrels of which 55% are renewed every year. This is a structured wine with a superb nose which is redolent of blackberry, raspberry and menthol. It has a very fine concentration on the palate and recent vintages are more delicate. A fine Bordeaux to',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/products/1986ChateauLaLaguneHaut-MedocGrandCruClasse.png',
    89.99,
    89.99,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Cordier Chateau Lafaurie-Peyraguey Sauternes 375',
    '1988-cordier-chateau-lafaurie-peyraguey-sauternes-375',
    NULL,
    NULL,
    'France',
    1988,
    '1988 Cordier Chateau Lafaurie-Peyraguey Sauternes 375 Fresh, lifted, sweet, candied tangerines, orange rind, pineapple, and mango with loads of caramel, butterscotch, and spice on the nose and palate. This has moved slightly past its peak, so there is no reason to age this any longer. It is best if it''s consumed over the next few years. Drink from 2022-2028. Critical Acclaim 95 Robert Parker''s Wine Advocate The massively rich, yet fresh, lively 1988 offers a compelling, flowery, honeyed bouquet',
    '1988 Cordier Chateau Lafaurie-Peyraguey Sauternes 375 Fresh, lifted, sweet, candied tangerines, orange rind, pineapple, and mango with loads of caramel, butterscotch, and spice on the nose and palate. This has moved slightly past its peak, so there is no reason to age this any longer. It is best if it''s consumed over the next few years. Drink from 2022-2028. Critical Acclaim 95 Robert Parker''s Wine Advocate The massively rich, yet fresh, lively 1988 offers a compelling, flowery, honeyed bouquet',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/products/1988CordierChateauLafaurie-PeyragueySauternes375.jpg',
    89.99,
    89.99,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Chateau La Croix de Gay Chateau La Fleur de Gay, Pomerol',
    '1989-chateau-la-croix-de-gay-chateau-la-fleur-de-gay-pomerol',
    'Merlot',
    'Bordeaux',
    'France',
    1989,
    '1989 Chateau La Croix de Gay Chateau La Fleur de Gay, Pomerol Château La Fleur de Gay is a Bordeaux red wine made in the Pomerol appellation from old-vine plots on the property of Chateau La Croix de Gay. It was first produced as an individual wine in the early 1980s. For a few vintages it featured a little Cabernet Franc, but today the wine is 100 percent Merlot. Rather than being an estate in its own right, La Fleur de Gay is consdered a sister-label of the La Croix de Gay site. The owners (th',
    '1989 Chateau La Croix de Gay Chateau La Fleur de Gay, Pomerol Château La Fleur de Gay is a Bordeaux red wine made in the Pomerol appellation from old-vine plots on the property of Chateau La Croix de Gay. It was first produced as an individual wine in the early 1980s. For a few vintages it featured a little Cabernet Franc, but today the wine is 100 percent Merlot. Rather than being an estate in its own right, La Fleur de Gay is consdered a sister-label of the La Croix de Gay site. The owners (th',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":3,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/products/Myproject_3_04b39b20-7c10-4b78-bed8-c05d5e9ee7f2.png',
    399.97,
    399.97,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Yquem',
    '2001-yquem',
    NULL,
    NULL,
    'France',
    2001,
    '2001 Yquem The 2001 Château d''Yquem is undoubtedly one of the greatest Sauternes ever made and has near limitless potential longevity. It is kaleidoscopically complex and incredibly powerful, with simply staggering balance, precision and detail. On the nose it is utterly beguiling, offering intricate layers of honeyed stone fruits, citrus peel, almond paste, crème brûlée, toasted nuts and liquidised stones. The palate achieves levels of richness and intensity very rarely possible, with laserlike',
    '2001 Yquem The 2001 Château d''Yquem is undoubtedly one of the greatest Sauternes ever made and has near limitless potential longevity. It is kaleidoscopically complex and incredibly powerful, with simply staggering balance, precision and detail. On the nose it is utterly beguiling, offering intricate layers of honeyed stone fruits, citrus peel, almond paste, crème brûlée, toasted nuts and liquidised stones. The palate achieves levels of richness and intensity very rarely possible, with laserlike',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/files/2001yquem.jpg',
    469.97,
    469.97,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Clos Saint-Jean Chateauneuf-du-Pape La Combe des Fous',
    '2004-clos-saint-jean-chateauneuf-du-pape-la-combe-des-fous',
    'Syrah',
    'Rhône Valley',
    'France',
    2004,
    '2004 Clos Saint-Jean Chateauneuf-du-Pape La Combe des Fous Châteauneuf-du-Pape; the southern French wine region whose renown is such that it is even known among those for whom wine is a mystery. Châteauneuf-du-Pape is a historic wine region located between the towns of Orange and Avignon, in France''s southern Rhône Valley. It is famous for powerful, full-bodied red wine, largely made from the classic southern Rhône grape trio of Grenache-Syrah-Mourvèdre. Critical Acclaim 93 Wine Advocate The 200',
    '2004 Clos Saint-Jean Chateauneuf-du-Pape La Combe des Fous Châteauneuf-du-Pape; the southern French wine region whose renown is such that it is even known among those for whom wine is a mystery. Châteauneuf-du-Pape is a historic wine region located between the towns of Orange and Avignon, in France''s southern Rhône Valley. It is famous for powerful, full-bodied red wine, largely made from the classic southern Rhône grape trio of Grenache-Syrah-Mourvèdre. Critical Acclaim 93 Wine Advocate The 200',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/files/2004ClosSaint-JeanChateauneuf-du-PapeLaCombedesFous.png',
    99.97,
    99.97,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Christian Moueix Merlot Bordeaux',
    '2005-christian-moueix-merlot-bordeaux',
    'Merlot',
    'Bordeaux',
    'France',
    2005,
    '2005 Christian Moueix Merlot Bordeaux Christian Moueix has created this uniquely personal cuvée through a selection of wines from numerous small growers in the Côtes de Castillon, Côtes de Francs and Côtes de Bourg appellations. The common factor in these three areas is the predominance of the Merlot variety. In the Côtes de Castillon, it acquires elegance, finesse and longevity; in the Côtes de Francs, structure and fruitiness; and in the Côtes de Bourg, is selected for aroma, body and richness',
    '2005 Christian Moueix Merlot Bordeaux Christian Moueix has created this uniquely personal cuvée through a selection of wines from numerous small growers in the Côtes de Castillon, Côtes de Francs and Côtes de Bourg appellations. The common factor in these three areas is the predominance of the Merlot variety. In the Côtes de Castillon, it acquires elegance, finesse and longevity; in the Côtes de Francs, structure and fruitiness; and in the Côtes de Bourg, is selected for aroma, body and richness',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":3,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/products/2005ChristianMoueixMerlotBordeaux.jpg',
    19.99,
    19.99,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Chateau Leoville Las Cases',
    '2009-chateau-leoville-las-cases',
    NULL,
    NULL,
    'France',
    2009,
    '2009 Chateau Leoville Las Cases Chateau Leoville Las Cases is one of the largest and oldest classified growths in the Medoc region of France. The fruit is harvested by hand. The fermentation vessels include a fascinating mix of wooden, cement and stainless steel vats. When finished the wine is pumped to the barrel cellar. Here it is transferred into oak barrique, between 50% and 100% new for the grand vin, depending on the vintage. Critical Acclaim 99 James Suckling Let yourself go and sink into',
    '2009 Chateau Leoville Las Cases Chateau Leoville Las Cases is one of the largest and oldest classified growths in the Medoc region of France. The fruit is harvested by hand. The fermentation vessels include a fascinating mix of wooden, cement and stainless steel vats. When finished the wine is pumped to the barrel cellar. Here it is transferred into oak barrique, between 50% and 100% new for the grand vin, depending on the vintage. Critical Acclaim 99 James Suckling Let yourself go and sink into',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/files/2009ChateauLeovilleLasCases.png',
    349.97,
    349.97,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Domaine Jean-Louis Chave Hermitage',
    '2011-domaine-jean-louis-chave-hermitage',
    'Syrah',
    'Rhône Valley',
    'France',
    2011,
    '2011 Domaine Jean-Louis Chave Hermitage Domaine Jean-Louis Chave is a powerhouse wine producer based in the village of Mauves, in the Saint-Joseph region and just over the Rhône river from Hermitage – the source of the estate''s most acclaimed wines. Chave''s red and white Hermitage – based on Syrah and Marsanne and Roussanne respectively – are some of the most important in the Rhône Valley, commanding both high prices and exceptional, sometimes 100-point scores. Critical Acclaim 96 Jeb Dunnuck I',
    '2011 Domaine Jean-Louis Chave Hermitage Domaine Jean-Louis Chave is a powerhouse wine producer based in the village of Mauves, in the Saint-Joseph region and just over the Rhône river from Hermitage – the source of the estate''s most acclaimed wines. Chave''s red and white Hermitage – based on Syrah and Marsanne and Roussanne respectively – are some of the most important in the Rhône Valley, commanding both high prices and exceptional, sometimes 100-point scores. Critical Acclaim 96 Jeb Dunnuck I',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/files/2011DomaineJean-LouisChaveHermitage.jpg',
    349.99,
    349.99,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Domaine Leroy Chambolle-Musigny Les Fremieres',
    '2011-domaine-leroy-chambolle-musigny-les-fremieres',
    'Pinot Noir',
    'Burgundy',
    'France',
    2011,
    '2011 Domaine Leroy Chambolle-Musigny Les Fremieres In 2011, vignerons across Burgundy faced a race against time with an early start followed by a bafflingly cool and wet August. Nevertheless, Domaine Leroy''s vigilant guardianship over their cherished Chambolle Les Fremieres vineyard has yielded a wine of exquisite equipoise. The fruit, although harvested earlier than usual, reveals an inimitable elegance that imbues this particular interpretation of Pinot Noir with a dignified grace. Fine tannin',
    '2011 Domaine Leroy Chambolle-Musigny Les Fremieres In 2011, vignerons across Burgundy faced a race against time with an early start followed by a bafflingly cool and wet August. Nevertheless, Domaine Leroy''s vigilant guardianship over their cherished Chambolle Les Fremieres vineyard has yielded a wine of exquisite equipoise. The fruit, although harvested earlier than usual, reveals an inimitable elegance that imbues this particular interpretation of Pinot Noir with a dignified grace. Fine tannin',
    '["versatile pairing"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/files/2011DomaineLeroyChambolle-MusignyLesFremieres.png',
    999.97,
    999.97,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'DRC Echezeaux Grand Cru',
    '2012-drc-echezeaux-grand-cru',
    NULL,
    'Burgundy',
    'France',
    2012,
    '2012 DRC Echezeaux Grand Cru Domaine de la Romanée-Conti, or DRC as it is commonly known, is easily Burgundy''s best-known and most collectible wine producer. Based in the Burgundy village of Vosne-Romanée, the domaine sells wines from eight different grand cru vineyards that span the length of the Côte d''Or. The most famous comes from the eponymous Romanée-Conti vineyard, and on average is the most expensive wine in the world. Not as consistently well-regarded as its "grander" neighbor, Grands-E',
    '2012 DRC Echezeaux Grand Cru Domaine de la Romanée-Conti, or DRC as it is commonly known, is easily Burgundy''s best-known and most collectible wine producer. Based in the Burgundy village of Vosne-Romanée, the domaine sells wines from eight different grand cru vineyards that span the length of the Côte d''Or. The most famous comes from the eponymous Romanée-Conti vineyard, and on average is the most expensive wine in the world. Not as consistently well-regarded as its "grander" neighbor, Grands-E',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/files/2012DRCEchezeauxGrandCru.png',
    1389.97,
    1389.97,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Cos dEstournel Blanc St-Estephe',
    '2013-cos-destournel-blanc-st-estephe',
    'Cabernet Sauvignon',
    NULL,
    'France',
    2013,
    '2013 Cos dEstournel Blanc St-Estephe Golden yellow color. Aromatic nose of ripe yellow fruit, quince, ripe lemon and white pepper hints. Round in the mouth, with a juicy yellow fruit attack, backed up by a nice, long and crisp finish. The vineyard of Château Cos d''Estournel now covers 91 hectares. On this terroir with meager peaks and on the southern slopes, Cabernet Sauvignon (60% of the vineyard) find their soils of choice. On the eastern slopes and on the coasts where the limestone basement o',
    '2013 Cos dEstournel Blanc St-Estephe Golden yellow color. Aromatic nose of ripe yellow fruit, quince, ripe lemon and white pepper hints. Round in the mouth, with a juicy yellow fruit attack, backed up by a nice, long and crisp finish. The vineyard of Château Cos d''Estournel now covers 91 hectares. On this terroir with meager peaks and on the southern slopes, Cabernet Sauvignon (60% of the vineyard) find their soils of choice. On the eastern slopes and on the coasts where the limestone basement o',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/products/buy-wine-red-bordeaux-2013-cos-destournel-blanc-st-estephe-online-29245990830248.jpg',
    119.99,
    119.99,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Domaine de la Romanee Conti Romanee St. Vivant',
    '2014-domaine-de-la-romanee-conti-romanee-st-vivant',
    NULL,
    NULL,
    'France',
    2014,
    '2014 Domaine de la Romanee Conti Romanee St. Vivant',
    '2014 Domaine de la Romanee Conti Romanee St. Vivant',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/products/buy-wine-red-burgundy-2014-domaine-de-la-romanee-conti-romanee-st-vivant-online-28689639276712.jpg',
    1789.97,
    1789.97,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Louis Latour Vosne Romanee',
    '2014-louis-latour-vosne-romanee',
    NULL,
    NULL,
    'France',
    2014,
    '2014 Louis Latour Vosne Romanee',
    '2014 Louis Latour Vosne Romanee',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/products/buy-wine-red-burgundy-2014-louis-latour-vosne-romanee-online-28138421911720.jpg',
    84.99,
    84.99,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Chateau Margaux',
    '2015-chateau-margaux',
    NULL,
    NULL,
    'France',
    2015,
    NULL,
    NULL,
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/products/buy-wine-red-bordeaux-2015-chateau-margaux-online-28136198963368.jpg',
    1499.97,
    1499.97,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Marques de Murietta
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Marques de Murietta',
    'marques-de-murietta-flask-fine-wine',
    NULL,
    'Spain',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Marques de Murrieta Castillo Ygay Blanco',
    '1986-marques-de-murrieta-castillo-ygay-blanco',
    NULL,
    NULL,
    'Spain',
    1986,
    '1986 Marques de Murrieta Castillo Ygay Blanco I have been terribly excited about this wine since I first learned that (part of) it was still in cement waiting to be bottled in September 2013. I consider the rare white Castillo Ygay one of the greatest white wines ever produced in Spain, and the 1986 Castillo Ygay Blanco Gran Reserva Especial is a great addition to the portfolio of the winery--an historic wine that is coming back to life. I did a vertical tasting of many of the old, historic vint',
    '1986 Marques de Murrieta Castillo Ygay Blanco I have been terribly excited about this wine since I first learned that (part of) it was still in cement waiting to be bottled in September 2013. I consider the rare white Castillo Ygay one of the greatest white wines ever produced in Spain, and the 1986 Castillo Ygay Blanco Gran Reserva Especial is a great addition to the portfolio of the winery--an historic wine that is coming back to life. I did a vertical tasting of many of the old, historic vint',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/products/buy-wine-white-1986-marques-de-murrieta-castillo-ygay-blanco-online-29328015982760.jpg',
    899.99,
    899.99,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Australia
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Australia',
    'australia-flask-fine-wine',
    'Barossa',
    'Australia',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Chateau Reynella Basket Pressed Shiraz',
    '1994-chateau-reynella-basket-pressed-shiraz',
    'Shiraz',
    NULL,
    'Australia',
    1994,
    '1994 Chateau Reynella Basket Pressed Shiraz Australian wine producer and home to South Australia''s oldest operating winery. Currently owned by BRL Hardy Limited. Critical Acclaim 92 Wine Spectator A generous mouthful of brilliant berry, black pepper, sweet spice, coffee and chocolate flavors swirl through the velvety finish. Delicious now; best in 1997. 4,000 cases made.',
    '1994 Chateau Reynella Basket Pressed Shiraz Australian wine producer and home to South Australia''s oldest operating winery. Currently owned by BRL Hardy Limited. Critical Acclaim 92 Wine Spectator A generous mouthful of brilliant berry, black pepper, sweet spice, coffee and chocolate flavors swirl through the velvety finish. Delicious now; best in 1997. 4,000 cases made.',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/products/1994ChateauReynellaBasketPressedShiraz_edited.jpg',
    49.97,
    49.97,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Hardys William Hardy Shiraz, Barossa Valley',
    '2011-hardys-william-hardy-shiraz-barossa-valley',
    'Shiraz',
    'Barossa',
    'Australia',
    2011,
    '2011 Hardys William Hardy Shiraz, Barossa Valley Ruby color with pleasing and fresh black and red fruit, cedar wood, spice and a whiff brown sugar aromas. On the palate it''s between light and medium-bodied, with medium-acidity, and balanced with inviting cherry, plum, black raspberry, and hints of dark chocolate and spiced vanilla flavors. Hardy''s is a major wine brand based in South Australia. It is known for its wide range of wines, from entry-level examples to flagship releases. The brand pri',
    '2011 Hardys William Hardy Shiraz, Barossa Valley Ruby color with pleasing and fresh black and red fruit, cedar wood, spice and a whiff brown sugar aromas. On the palate it''s between light and medium-bodied, with medium-acidity, and balanced with inviting cherry, plum, black raspberry, and hints of dark chocolate and spiced vanilla flavors. Hardy''s is a major wine brand based in South Australia. It is known for its wide range of wines, from entry-level examples to flagship releases. The brand pri',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/files/2011HardysWilliamHardyShiraz_BarossaValley.png',
    14.99,
    14.99,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Smith Woodhouse
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Smith Woodhouse',
    'smith-woodhouse-flask-fine-wine',
    NULL,
    'Portugal',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Vintage Port',
    '1994-smith-woodhouse-vintage-port',
    NULL,
    NULL,
    'Portugal',
    1994,
    '1994 Smith Woodhouse Vintage Port An under-rated producer, Smith-Woodhouse has turned out a port with an impressively saturated dark ruby/purple color. This powerful port is moderately sweet, forward, rich, and full-bodied, with nicely integrated alcohol and tannin. While it is not one of the vintage''s blockbusters, it should be ready to drink in 3-5 years and keep for 15-20. Anticipated maturity: 1999-2018.',
    '1994 Smith Woodhouse Vintage Port An under-rated producer, Smith-Woodhouse has turned out a port with an impressively saturated dark ruby/purple color. This powerful port is moderately sweet, forward, rich, and full-bodied, with nicely integrated alcohol and tannin. While it is not one of the vintage''s blockbusters, it should be ready to drink in 3-5 years and keep for 15-20. Anticipated maturity: 1999-2018.',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/products/buy-wine-dessert-port-1994-smith-woodhouse-vintage-port-online-28135849820328.jpg',
    149.97,
    149.97,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Chateau Lascombes
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Chateau Lascombes',
    'chateau-lascombes-flask-fine-wine',
    NULL,
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Margaux',
    '1995-chateau-lascombes-margaux',
    NULL,
    NULL,
    'France',
    1995,
    '1995 Chateau Lascombes, Margaux The 1995 Lascombes is now softer and full of mature nuances. The color is slightly brick-ish. The nose of leather, tobacco and cedar. It is so scented that it oozes out of the glass the body is medium but the wine is so flavorful and balanced that it is a great joy to drink it. I am so lucky that there are still four bottles left from the original half case. At age 26, this wine is at its peak and will hold well over the next five to ten years. Please take note th',
    '1995 Chateau Lascombes, Margaux The 1995 Lascombes is now softer and full of mature nuances. The color is slightly brick-ish. The nose of leather, tobacco and cedar. It is so scented that it oozes out of the glass the body is medium but the wine is so flavorful and balanced that it is a great joy to drink it. I am so lucky that there are still four bottles left from the original half case. At age 26, this wine is at its peak and will hold well over the next five to ten years. Please take note th',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/products/Myproject_4.png',
    149.99,
    149.99,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Krug
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Krug',
    'krug-flask-fine-wine',
    'Champagne',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Clos dAmbonnay Krug Champagne',
    '1996-clos-dambonnay-krug-champagne',
    'Champagne',
    'Champagne',
    'France',
    1996,
    '1996 Clos dAmbonnay Krug Champagne The House of Krug invites you to discover the intensity, individuality and purity of Krug Clos d''Ambonnay 1996: from a single plot, a single grape variety – Pinot Noir – and the harvest of the year 1996. Clos d''Ambonnay is a tiny walled plot of 0.68 hectares located in the heart of Ambonnay, one of the most distinguished villages for Pinot Noir grapes in Champagne and the main source of Pinot Noir for the House since its earliest years. Krug Clos d''Ambonnay 199',
    '1996 Clos dAmbonnay Krug Champagne The House of Krug invites you to discover the intensity, individuality and purity of Krug Clos d''Ambonnay 1996: from a single plot, a single grape variety – Pinot Noir – and the harvest of the year 1996. Clos d''Ambonnay is a tiny walled plot of 0.68 hectares located in the heart of Ambonnay, one of the most distinguished villages for Pinot Noir grapes in Champagne and the main source of Pinot Noir for the House since its earliest years. Krug Clos d''Ambonnay 199',
    '["versatile pairing"]'::jsonb,
    '{"body":2,"sweetness":1,"tannin":1,"acidity":5}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/products/1996Closd_AmbonnayKrugChampagne.jpg',
    2699.97,
    2699.97,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Cantenac Brown
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Cantenac Brown',
    'cantenac-brown-flask-fine-wine',
    NULL,
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Chateau Cantenac Brown Margaux',
    '1999-chateau-cantenac-brown-margaux',
    NULL,
    NULL,
    'France',
    1999,
    '1999 Chateau Cantenac Brown Margaux The 1999 Cantenac Brown is more closed on the nose with darker fruit than the Grand Puy-Lacoste, that sanfins serves blind alongside, earthier aromas, sous-bois and fern. The palate is medium-bodied with very pliant tannins that provide a firm backbone. There is a fine bead of acidity, fresh and silky smooth with a cohesive, fleshy finish that demonstrates impressive clarity and persistence. A big surprise when this was revealed-perhaps better than the 2000. t',
    '1999 Chateau Cantenac Brown Margaux The 1999 Cantenac Brown is more closed on the nose with darker fruit than the Grand Puy-Lacoste, that sanfins serves blind alongside, earthier aromas, sous-bois and fern. The palate is medium-bodied with very pliant tannins that provide a firm backbone. There is a fine bead of acidity, fresh and silky smooth with a cohesive, fleshy finish that demonstrates impressive clarity and persistence. A big surprise when this was revealed-perhaps better than the 2000. t',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/files/jk3igorrtleaakzvezjz.jpg',
    129.99,
    129.99,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Flask
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Flask',
    'flask-flask-fine-wine',
    'Tuscany',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Cresti Fattoria Carpineta Fontalpino Do ut des Toscana IGT',
    '2002-cresti-fattoria-carpineta-fontalpino-do-ut-des-toscana-igt',
    NULL,
    'Tuscany',
    'Italy',
    2002,
    '2002 Cresti Fattoria Carpineta Fontalpino Do ut des Toscana IGT The owners Gioia & Filippo Cresti along with Top Rated winemaker" Carlo Ferrini, created a range of wines traditionally made with innovative character. The CARPINETA FONTALPINO vineyard has been owned by the CRESTI family since the 1960''s, and you find traces of the wine producing traditions dating back to the beginning of the past century. (1800) The vineyard is located in the heart of Tuscany, very close to the splendid city of Si',
    '2002 Cresti Fattoria Carpineta Fontalpino Do ut des Toscana IGT The owners Gioia & Filippo Cresti along with Top Rated winemaker" Carlo Ferrini, created a range of wines traditionally made with innovative character. The CARPINETA FONTALPINO vineyard has been owned by the CRESTI family since the 1960''s, and you find traces of the wine producing traditions dating back to the beginning of the past century. (1800) The vineyard is located in the heart of Tuscany, very close to the splendid city of Si',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/files/yzjxnl2y5hxzrftevqzs.jpg',
    49.99,
    49.99,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Screaming Eagle
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Screaming Eagle',
    'screaming-eagle-flask-fine-wine',
    'Napa Valley',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Cabernet Sauvignon, Napa Valley',
    '2003-screaming-eagle-cabernet-sauvignon-napa-valley',
    'Cabernet Sauvignon',
    'Napa Valley',
    'United States',
    2003,
    '2003 Screaming Eagle Cabernet Sauvignon, Napa Valley Screaming Eagle''s vineyard lies within the Oakville AVA in the central part of Napa Valley. The unmarked vineyard lies on the eastern side of the AVA, below the vineyards of Dalla Valle and Oakville Ranch in the foothills further east, and just north of Paraduxx in Yountville. As is typical for the AVA, the vineyard is planted mainly to Cabernet Sauvignon with some Merlot and Cabernet Franc, and a small plot of Sauvignon Blanc. Critical Acclai',
    '2003 Screaming Eagle Cabernet Sauvignon, Napa Valley Screaming Eagle''s vineyard lies within the Oakville AVA in the central part of Napa Valley. The unmarked vineyard lies on the eastern side of the AVA, below the vineyards of Dalla Valle and Oakville Ranch in the foothills further east, and just north of Paraduxx in Yountville. As is typical for the AVA, the vineyard is planted mainly to Cabernet Sauvignon with some Merlot and Cabernet Franc, and a small plot of Sauvignon Blanc. Critical Acclai',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/files/2003ScreamingEagleCabernetSauvignon_NapaValley_19292f80-1945-4bb7-8251-e99e4f397c6e.jpg',
    2999.97,
    2999.97,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Spain
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Spain',
    'spain-flask-fine-wine',
    'Rioja',
    'Spain',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Marques de Riscal Gran Reserva Rioja',
    '2007-marques-de-riscal-gran-reserva-rioja',
    NULL,
    'Rioja',
    'Spain',
    2007,
    '2007 Marques de Riscal Gran Reserva Rioja To make their Gran Reserva wines, Riscal uses grapes produced by old vines over 80 years old, from estate vineyards and bought from regular local growers. After blending the wines from the harvest, the wine destined to become a Gran Reserva is transferred into French oak casks where it will remain for between two and a half and three years, followed by a further three years in the bottle prior to release for sale. Intense black-cherry color with violet h',
    '2007 Marques de Riscal Gran Reserva Rioja To make their Gran Reserva wines, Riscal uses grapes produced by old vines over 80 years old, from estate vineyards and bought from regular local growers. After blending the wines from the harvest, the wine destined to become a Gran Reserva is transferred into French oak casks where it will remain for between two and a half and three years, followed by a further three years in the bottle prior to release for sale. Intense black-cherry color with violet h',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/products/2007MarquesdeRiscalGranReservaRioja.jpg',
    44.97,
    44.97,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Domaine de la Romanee Conti
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Domaine de la Romanee Conti',
    'domaine-de-la-romanee-conti-flask-fine-wine',
    'Burgundy',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Domaine de la Romanee-Conti Grands Echezeaux Grand Cru',
    '2010-domaine-de-la-romanee-conti-grands-echezeaux-grand-cru',
    NULL,
    NULL,
    'France',
    2010,
    '2010 Domaine de la Romanee-Conti Grands Echezeaux Grand Cru Composed, profound and dense, this wine needs a lot of time to integrate and expand. Sexy dark fruit, strong stem, savory, grilled meat, primrose, violet, hibiscus, green citrus, dust, mushroom, walnut, mint and chocolate all among the intense perfume that just glows. Nose is greatly deep and cool. So elegant, linear and spicy on the Taste with amazing vintage purity, nuance and power. Pinching precision, seamless tension and complex sw',
    '2010 Domaine de la Romanee-Conti Grands Echezeaux Grand Cru Composed, profound and dense, this wine needs a lot of time to integrate and expand. Sexy dark fruit, strong stem, savory, grilled meat, primrose, violet, hibiscus, green citrus, dust, mushroom, walnut, mint and chocolate all among the intense perfume that just glows. Nose is greatly deep and cool. So elegant, linear and spicy on the Taste with amazing vintage purity, nuance and power. Pinching precision, seamless tension and complex sw',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/files/2010DRCGrandsEchezeauxGrandCru.jpg',
    1949.97,
    1949.97,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Domaine de la Romanee-Conti La Tache Grand Cru Monopole, 6 Bottle OWC',
    '2011-domaine-de-la-romanee-conti-la-tache-grand-cru-monopole-6-bottle-owc',
    NULL,
    'Burgundy',
    'France',
    2011,
    '2011 Domaine de la Romanee-Conti La Tache Grand Cru Monopole, 6 Bottle OWC Domaine de la Romanée-Conti, or DRC as it is commonly known, is easily Burgundy''s best-known and most collectible wine producer. Based in the Burgundy village of Vosne-Romanée, the domaine sells wines from eight different grand cru vineyards that span the length of the Côte d''Or. The most famous comes from the eponymous Romanée-Conti vineyard, and on average is the most expensive wine in the world. The domaine predominate',
    '2011 Domaine de la Romanee-Conti La Tache Grand Cru Monopole, 6 Bottle OWC Domaine de la Romanée-Conti, or DRC as it is commonly known, is easily Burgundy''s best-known and most collectible wine producer. Based in the Burgundy village of Vosne-Romanée, the domaine sells wines from eight different grand cru vineyards that span the length of the Côte d''Or. The most famous comes from the eponymous Romanée-Conti vineyard, and on average is the most expensive wine in the world. The domaine predominate',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/files/2011DomainedelaRomanee-ContiLaTacheGrandCruMonopole_6BottleOWC.jpg',
    17999.97,
    17999.97,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Domaine Jean-Louis Chave
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Domaine Jean-Louis Chave',
    'domaine-jean-louis-chave-flask-fine-wine',
    'Rhône Valley',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Hermitage Blanc',
    '2012-domaine-jean-louis-chave-hermitage-blanc',
    'Syrah',
    'Rhône Valley',
    'France',
    2012,
    '2012 Domaine Jean-Louis Chave Hermitage Blanc Domaine Jean-Louis Chave is a powerhouse wine producer based in the village of Mauves, in the Saint-Joseph region and just over the Rhône river from Hermitage – the source of the estate''s most acclaimed wines. Chave''s red and white Hermitage – based on Syrah and Marsanne and Roussanne respectively – are some of the most important in the Rhône Valley, commanding both high prices and exceptional, sometimes 100-point scores. Critical Acclaim 97 Wine Spe',
    '2012 Domaine Jean-Louis Chave Hermitage Blanc Domaine Jean-Louis Chave is a powerhouse wine producer based in the village of Mauves, in the Saint-Joseph region and just over the Rhône river from Hermitage – the source of the estate''s most acclaimed wines. Chave''s red and white Hermitage – based on Syrah and Marsanne and Roussanne respectively – are some of the most important in the Rhône Valley, commanding both high prices and exceptional, sometimes 100-point scores. Critical Acclaim 97 Wine Spe',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/products/buy-wine-white-rhone-white-2012-domaine-jean-louis-chave-hermitage-blanc-online-29178298499240.jpg',
    399.97,
    399.97,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Austria
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Austria',
    'austria-flask-fine-wine',
    NULL,
    'Austria',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Franz Hirtzberger Setzberg Riesling Smaragd',
    '2012-franz-hirtzberger-setzberg-riesling-smaragd',
    'Riesling',
    NULL,
    'Austria',
    2012,
    '2012 Franz Hirtzberger Setzberg Riesling Smaragd Light gold color. The nose is bright and salty with a mountain stream, minerals, white flowers, and ginger, on top of the key lime pie and lemon curd. Lovely texture, a plump feel on the palate, with crisp, vibrant, tickling acidity, and the balance is on point. The depth of lime, lemon, apricot and guava fruit is impressive, but there''s lots of honey, ginger, white tea, almond, and mint, not to mention chalk dust and minerals.',
    '2012 Franz Hirtzberger Setzberg Riesling Smaragd Light gold color. The nose is bright and salty with a mountain stream, minerals, white flowers, and ginger, on top of the key lime pie and lemon curd. Lovely texture, a plump feel on the palate, with crisp, vibrant, tickling acidity, and the balance is on point. The depth of lime, lemon, apricot and guava fruit is impressive, but there''s lots of honey, ginger, white tea, almond, and mint, not to mention chalk dust and minerals.',
    '["versatile pairing"]'::jsonb,
    '{"body":2,"sweetness":3,"tannin":1,"acidity":5}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/products/2012FranzHirtzbergerSetzbergRieslingSmaragd.jpg',
    59.99,
    59.99,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Italy
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Italy',
    'italy-flask-fine-wine',
    'Piedmont',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Il Falcone Castel del Monte Rosso Riserva DOCG',
    '2012-il-falcone-castel-del-monte-rosso-riserva-docg',
    'Montepulciano',
    NULL,
    'Italy',
    2012,
    '2012 Il Falcone Castel del Monte Rosso Riserva DOCG A blend of 70% Nero di Troia and 30% Montepulciano, this is an enticingly savory and earthy wine with lots of appeals. Aromas of spiced red cherry, cured meat, peppery tobacco and anise meld seamlessly on the nose. The aromas are echoed on the mouthwatering and engaging palate of medium weight, lingering on a sanguine note. Currently grippy and structured with grainy tannins, this will soften with time in the bottle, giving way to its wealth of',
    '2012 Il Falcone Castel del Monte Rosso Riserva DOCG A blend of 70% Nero di Troia and 30% Montepulciano, this is an enticingly savory and earthy wine with lots of appeals. Aromas of spiced red cherry, cured meat, peppery tobacco and anise meld seamlessly on the nose. The aromas are echoed on the mouthwatering and engaging palate of medium weight, lingering on a sanguine note. Currently grippy and structured with grainy tannins, this will soften with time in the bottle, giving way to its wealth of',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/products/2012IlFalconeCasteldelMonteRossoRiservaDOCG.jpg',
    35.99,
    35.99,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Terre del Barolo Barbaresco Riserva',
    '2012-terre-del-barolo-barbaresco-riserva',
    NULL,
    'Piedmont',
    'Italy',
    2012,
    '2012 Terre del Barolo Barbaresco Riserva This wine''s fragrance evokes underbrush, toast, chopped celery and prune. The tight, angular palate offers dried cherry, star anise, espresso and sage notes alongside bracing tannins that clench the finish. Cantina Terre del Barolo is an Italian wine cooperative based just north of the iconic village of Castiglione Falletto in the east of the Barolo wine region, Piedmont. It produces wines from this eponymous DOCG as well as a wide number of labels across',
    '2012 Terre del Barolo Barbaresco Riserva This wine''s fragrance evokes underbrush, toast, chopped celery and prune. The tight, angular palate offers dried cherry, star anise, espresso and sage notes alongside bracing tannins that clench the finish. Cantina Terre del Barolo is an Italian wine cooperative based just north of the iconic village of Castiglione Falletto in the east of the Barolo wine region, Piedmont. It produces wines from this eponymous DOCG as well as a wide number of labels across',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/files/buy-wine-red-2012-terre-del-barolo-barbaresco-riserva-online-28716898615464.jpg',
    29.99,
    29.99,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Frescobaldi Nipozzano Chianti Rufina Riserva',
    '2014-frescobaldi-nipozzano-chianti-rufina-riserva',
    NULL,
    NULL,
    'Italy',
    2014,
    NULL,
    NULL,
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/products/buy-wine-red-2014-frescobaldi-nipozzano-chianti-rufina-riserva-online-28688999055528.jpg',
    22.99,
    22.99,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Pra Soave Classico Staforte',
    '2015-pra-soave-classico-staforte',
    NULL,
    NULL,
    'Italy',
    2015,
    NULL,
    NULL,
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/products/buy-wine-white-2015-pra-soave-classico-staforte-online-29248334561448.jpg',
    28.99,
    28.99,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Petrolo
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Petrolo',
    'petrolo-flask-fine-wine',
    'Tuscany',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Inarno Rosso Toscana',
    '2012-petrolo-inarno-rosso-toscana',
    'Sangiovese',
    'Tuscany',
    'Italy',
    2012,
    '2012 Petrolo Inarno Rosso Toscana Petrolo is a leading wine estate in Tuscany, Italy. It is located a mile or so to the east of Chianti Classico, within the Chianti Colli Aretini zone. It is widely regarded as rivaling many Chianti Classico properties in terms of quality and is best known for its high-quality Sangiovese-based wines. The wine portfolio is headed by the Bòggina line which is composed of three varietal wines. Produced only in exceptional vintages, it is a trio of Trebbiano and two',
    '2012 Petrolo Inarno Rosso Toscana Petrolo is a leading wine estate in Tuscany, Italy. It is located a mile or so to the east of Chianti Classico, within the Chianti Colli Aretini zone. It is widely regarded as rivaling many Chianti Classico properties in terms of quality and is best known for its high-quality Sangiovese-based wines. The wine portfolio is headed by the Bòggina line which is composed of three varietal wines. Produced only in exceptional vintages, it is a trio of Trebbiano and two',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":4,"acidity":5}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/products/2012PetroloInarnoRossoToscana_edited.jpg',
    19.99,
    19.99,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Laffourcade
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Laffourcade',
    'laffourcade-flask-fine-wine',
    NULL,
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Chateau de l''Echarderie Quarts De Chaume',
    '2014-laffourcade-chateau-de-lecharderie-quarts-de-chaume-500ml',
    NULL,
    NULL,
    'France',
    2014,
    '2014 Laffourcade Chateau de lEcharderie Quarts De Chaume 500ml Perhaps less intense than some wines from this appellation, this is still a sweet, honeyed wine that is shot through with lemon acidity. It is poised and very stylish with yellow fruits and orange marmalade that are caught in a web of botrytis.',
    '2014 Laffourcade Chateau de lEcharderie Quarts De Chaume 500ml Perhaps less intense than some wines from this appellation, this is still a sweet, honeyed wine that is shot through with lemon acidity. It is poised and very stylish with yellow fruits and orange marmalade that are caught in a web of botrytis.',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0350/4717/8372/files/210000007874.jpg',
    72.99,
    72.99,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- =========================================================================
  -- RETAILER 5: Wally's Wine & Spirits
  -- Location: Beverly Hills
  -- =========================================================================

  INSERT INTO public.organizations (id, name, slug, metadata)
  VALUES (
    gen_random_uuid(),
    'Wally''s Wine & Spirits',
    'wallys-wine-spirits',
    '{"location":"Beverly Hills","tagline":"Trusted by collectors and connoisseurs since 1968"}'::jsonb
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, metadata = EXCLUDED.metadata
  RETURNING id INTO _org_id;

  -- Producer: A. Lamblot
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'A. Lamblot',
    'a-lamblot-wallys-wine-spirits',
    'Champagne',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Mouvance 21, Champagne, France, Pinot Noir/ Chardonnay/ Meunier, 2021',
    'a-lamblot-mouvance-21-champagne-france-pinot-noir-chardonnay-meunier-2021-wallys-wine-spirits',
    'Pinot Noir',
    'Champagne',
    'France',
    2021,
    'Notes of crisp pear and orchard fruit, citrus, saline, and creaminess. Serving temp: Fridge cold! Keep it ice ice baby! Pairing: Fresh crudite; seafood; prosciutto and grissini!',
    'Notes of crisp pear and orchard fruit, citrus, saline, and creaminess. Serving temp: Fridge cold! Keep it ice ice baby! Pairing: Fresh crudite; seafood; prosciutto and grissini!',
    '["Fresh crudite","seafood","prosciutto and grissini","brunch dishes","charcuterie board"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/FullSizeRender_e755ccbb-1760-4985-bd8e-49a2458ea124.jpg',
    146.00,
    146.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Adega Pedralonga
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Adega Pedralonga',
    'adega-pedralonga-wallys-wine-spirits',
    'Galicia',
    'Spain',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Terra de Godos, Rias Baixas, Galicia, Albarino, 2024',
    'adega-pedralonga-terra-de-godos-rias-baixas-galicia-albarino-2024-wallys-wine-spirits',
    'Albarino',
    'Galicia',
    'Spain',
    2024,
    NULL,
    NULL,
    '["brunch dishes","charcuterie board","grilled meats","grilled fish"]'::jsonb,
    '{"body":2,"sweetness":1,"tannin":1,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/FullSizeRender_4_b120c27b-cbe8-440a-9cb9-bca1a8959c08.jpg',
    25.00,
    25.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Agnanum
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Agnanum',
    'agnanum-wallys-wine-spirits',
    'Campania',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Sabbia Vulcanica Vino Rosso, Campania, Italy, Piedirosso, 2023',
    'agnanum-sabbia-vulcanica-vino-rosso-campania-italy-piedirosso-2023-wallys-wine-spirits',
    'Piedirosso',
    'Campania',
    'Italy',
    2023,
    NULL,
    NULL,
    '["charcuterie board"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/IMG_6113.jpg',
    22.00,
    22.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Agrapart & Fils
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Agrapart & Fils',
    'agrapart-fils-wallys-wine-spirits',
    'Champagne',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '7 Crus, Avize, Champagne, Chardonnay/Pinot Noir, NV',
    'agrapart-fils-7-crus-avize-champagne-chardonnay-pinot-noir-nv-wallys-wine-spirits',
    'Pinot Noir',
    'Champagne',
    'France',
    NULL,
    NULL,
    NULL,
    '["charcuterie board","grilled fish"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/IMG_1570.jpg',
    104.00,
    104.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Alessandra Divella
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alessandra Divella',
    'alessandra-divella-wallys-wine-spirits',
    'Lombardia',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'NiNi, Riserva, Franciacorta, Lombardia, Chardonnay/Pinot Noir, 2019',
    'alessandra-divella-nini-riserva-franciacorta-lombardia-chardonnay-pinot-noir-2019-wallys-wine-spirits',
    'Pinot Noir',
    'Lombardia',
    'Italy',
    2019,
    'Crafted from 50% Chardonnay and 50% Pinot Noir, this sparkling wine offers a complex, savory profile with notes of bruised fruit, minerality and an elegant finish. Serving temp: Fridge cold!',
    'Crafted from 50% Chardonnay and 50% Pinot Noir, this sparkling wine offers a complex, savory profile with notes of bruised fruit, minerality and an elegant finish. Serving temp: Fridge cold!',
    '["brunch dishes"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/DSC07452.jpg',
    92.00,
    92.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Amorotti
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Amorotti',
    'amorotti-wallys-wine-spirits',
    'Abruzzo',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Montepulciano d''Abruzzo, 2020',
    'amorotti-montepulciano-dabruzzo-2020-wallys-wine-spirits',
    'Montepulciano',
    'Abruzzo',
    'Italy',
    2020,
    'Did you ever know that you''re my heroooooo? That''s the song this wine sings when it see''s a bowl of pasta. Just kidding but also SO SERIOUS! Very classic but very well make Montepulciano by the Amorotti family. Brambly, herby, dense fruit with a touch of menthol and good acidity.',
    'Did you ever know that you''re my heroooooo? That''s the song this wine sings when it see''s a bowl of pasta. Just kidding but also SO SERIOUS! Very classic but very well make Montepulciano by the Amorotti family. Brambly, herby, dense fruit with a touch of menthol and good acidity.',
    '["grilled meats"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/IMG_3201.jpg',
    74.00,
    74.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Ampeleia
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Ampeleia',
    'ampeleia-wallys-wine-spirits',
    'Tuscany',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Bianco Di Ampeleia, Tuscany, Italy, Trebbiano, 2022',
    'ampeleia-bianco-di-ampeleia-tuscany-italy-trebbiano-2022-wallys-wine-spirits',
    'Trebbiano',
    'Tuscany',
    'Italy',
    2022,
    'Bianco Di Ampeleia displays a superior expression of the territory''s identity and the way harmony arises from diversity. A brief maceration yields a golden-hued wine with notes of chamomile, rosemary and citrusy acidity. Serving temp: Fridge cold! Food pairings: Mediterranean style appetizers!',
    'Bianco Di Ampeleia displays a superior expression of the territory''s identity and the way harmony arises from diversity. A brief maceration yields a golden-hued wine with notes of chamomile, rosemary and citrusy acidity. Serving temp: Fridge cold! Food pairings: Mediterranean style appetizers!',
    '["charcuterie board","grilled fish"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/DSC06398.jpg',
    29.00,
    29.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'UnLitro, Toscana, Alicante Nero/Carignano/Sangiovese/Mourvedre/Alicante Bouschet, 1L, 2021',
    'ampeleia-unlitro-toscana-alicante-nero-carignano-sangiovese-mourvedre-alicante-bouschet-1l-2021-wallys-wine-spirits',
    'Sangiovese',
    NULL,
    'Italy',
    2021,
    NULL,
    NULL,
    '["grilled meats"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":4,"acidity":5}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/DSC07478.jpg',
    27.00,
    27.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Anthony Thevenet
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Anthony Thevenet',
    'anthony-thevenet-wallys-wine-spirits',
    'Beaujolais',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Morgon Vieilles Vignes, Beaujolais, France, Gamay, 2022',
    'anthony-thevenet-morgon-vieilles-vignes-beaujolais-france-gamay-2022-wallys-wine-spirits',
    'Gamay',
    'Beaujolais',
    'France',
    2022,
    NULL,
    NULL,
    '["charcuterie board","grilled meats"]'::jsonb,
    '{"body":2,"sweetness":1,"tannin":2,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/IMG_2234.jpg',
    64.00,
    64.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Antoine Arena
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Antoine Arena',
    'antoine-arena-wallys-wine-spirits',
    'Corsica',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Hauts de Carco, Corsica, France, Vermentinu, 2024',
    'antoine-arena-hauts-de-carco-corsica-france-vermentinu-2024-wallys-wine-spirits',
    NULL,
    'Corsica',
    'France',
    2024,
    NULL,
    NULL,
    '["charcuterie board","grilled meats","grilled fish"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/FullSizeRender_3_ddb8b805-8cca-4a15-8112-ba6e25fd822e.jpg',
    51.00,
    51.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Memoria, Patrimonio, Corsica, Nielluccio, 2024',
    'antoine-arena-memoria-patrimonio-corsica-nielluccio-2024-wallys-wine-spirits',
    NULL,
    'Corsica',
    'France',
    2024,
    NULL,
    NULL,
    '["charcuterie board"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/IMG_0319.jpg',
    93.00,
    93.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Artuke
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Artuke',
    'artuke-wallys-wine-spirits',
    'Rioja',
    'Spain',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Tinto, Rioja, Spain, Tempranillo/Viura, 2024',
    'artuke-tinto-rioja-spain-tempranillo-viura-2024-wallys-wine-spirits',
    'Tempranillo',
    'Rioja',
    'Spain',
    2024,
    NULL,
    NULL,
    '["charcuterie board","grilled meats","grilled fish"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/IMG_1071.jpg',
    20.00,
    20.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Benjamin Leroux
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Benjamin Leroux',
    'benjamin-leroux-wallys-wine-spirits',
    'Burgundy',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '1er Cru, La Piece Sous Le Bois, Meursault, Chardonnay, 2021',
    'benjamin-leroux-1er-cru-la-piece-sous-le-bois-meursault-chardonnay-2021-wallys-wine-spirits',
    'Chardonnay',
    'Burgundy',
    'France',
    2021,
    'Born and raised in the heart of Burgundy, France, Leroux''s winemaking philosophy revolves around respect for nature and minimal intervention. Crisp and lively with notes of bright citrus and pear!',
    'Born and raised in the heart of Burgundy, France, Leroux''s winemaking philosophy revolves around respect for nature and minimal intervention. Crisp and lively with notes of bright citrus and pear!',
    '["charcuterie board","grilled meats","grilled fish"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":1,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/IMG-6948.jpg',
    280.00,
    280.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Gevrey-Chambertin, Pinot Noir, 2021',
    'benjamin-leroux-gevrey-chambertin-pinot-noir-2021-wallys-wine-spirits',
    'Pinot Noir',
    'Burgundy',
    'France',
    2021,
    NULL,
    NULL,
    '["grilled meats","grilled fish"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/IMG_1921.heic',
    152.00,
    152.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Amelie Berthaut
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Amelie Berthaut',
    'amelie-berthaut-wallys-wine-spirits',
    'Burgundy',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Berthaut-Gerbet, Les Clos, Fixin, Cotes de Nuits, Burgundy, France, Pinot Noir, 2023',
    'berthaut-gerbet-les-clos-fixin-cotes-de-nuits-burgundy-france-pinot-noir-2023-wallys-wine-spirits',
    'Pinot Noir',
    'Burgundy',
    'France',
    2023,
    NULL,
    NULL,
    '["grilled meats","grilled fish"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/berthautlesclos18.jpg',
    92.00,
    92.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Berthaut-Gerbet, Les Crais, Fixin, Cotes de Nuits, Burgundy, France, Pinot Noir, 2023',
    'berthaut-gerbet-les-crais-fixin-cotes-de-nuits-burgundy-france-pinot-noir-2023-wallys-wine-spirits',
    'Pinot Noir',
    'Burgundy',
    'France',
    2023,
    NULL,
    NULL,
    '["grilled meats","grilled fish"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/AmelieLesCrais.jpg',
    94.00,
    94.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- =========================================================================
  -- RETAILER 6: Domaine LA
  -- Location: Melrose, Los Angeles
  -- =========================================================================

  INSERT INTO public.organizations (id, name, slug, metadata)
  VALUES (
    gen_random_uuid(),
    'Domaine LA',
    'domaine-la',
    '{"location":"Melrose, Los Angeles","tagline":"French wines and the people who love them"}'::jsonb
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, metadata = EXCLUDED.metadata
  RETURNING id INTO _org_id;

  -- Producer: Bisson
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Bisson',
    'bisson-domaine-la',
    'Veneto',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Glera, Vino Frizzante, Marca Trevigiana, Veneto, Italy, 2024',
    'bisson-glera-vino-frizzante-marca-trevigiana-veneto-italy-2024-domaine-la',
    'Glera',
    'Veneto',
    'Italy',
    2024,
    'Hand-harvested from steep hillside vineyards in the Veneto region of Italy, this is a beautifully-refreshing Prosecco! Bone-dry, clean and bright with hints of white flowers, honey, tart nectarines and subtle minerality! Serving temp: Fridge cold!',
    'Hand-harvested from steep hillside vineyards in the Veneto region of Italy, this is a beautifully-refreshing Prosecco! Bone-dry, clean and bright with hints of white flowers, honey, tart nectarines and subtle minerality! Serving temp: Fridge cold!',
    '["brunch dishes","charcuterie board"]'::jsonb,
    '{"body":1,"sweetness":2,"tannin":1,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/IMG_07052.heic',
    28.00,
    28.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Paglianetto
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Paglianetto',
    'paglianetto-domaine-la',
    'Marche',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Borgo Paglianetto, Terravignata, Marche, Italy Verdicchio, 2024',
    'borgo-paglianetto-terravignata-marche-italy-verdicchio-2024-domaine-la',
    'Verdicchio',
    'Marche',
    'Italy',
    2024,
    'Sometimes a perfectly zippy white wine comes into your life at just the right moment. Grown in the picturesque rolling hills of the Marche, where green is popping off Green, this wine grows and is made. The vines are a little bit above sea level and the grapes are picked at varying levels of ripeness. The clay-calcarious soils do no wrong as far as terroir is concerned and honestly expressed such a delicious and linear verdicchio, it''s everything that I want in a white wine and more. Serving tem',
    'Sometimes a perfectly zippy white wine comes into your life at just the right moment. Grown in the picturesque rolling hills of the Marche, where green is popping off Green, this wine grows and is made. The vines are a little bit above sea level and the grapes are picked at varying levels of ripeness. The clay-calcarious soils do no wrong as far as terroir is concerned and honestly expressed such a delicious and linear verdicchio, it''s everything that I want in a white wine and more. Serving tem',
    '["charcuterie board","grilled meats","grilled fish"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/FullSizeRender_1_5fd3c30a-337a-4150-8b47-5e0bdd040bf6.jpg',
    25.00,
    25.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Bret Brothers
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Bret Brothers',
    'bret-brothers-domaine-la',
    'Beaujolais',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Brouilly Cuvee Zen, Beaujolais, France, Gamay, 2022',
    'bret-brothers-brouilly-cuvee-zen-beaujolais-france-gamay-2022-domaine-la',
    'Gamay',
    'Beaujolais',
    'France',
    2022,
    NULL,
    NULL,
    '["charcuterie board"]'::jsonb,
    '{"body":2,"sweetness":1,"tannin":2,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/622B7E1C-D7F9-4300-B591-11BCF41E3988_1_201_a.jpg',
    61.00,
    61.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Cantine Benvenuto
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Cantine Benvenuto',
    'cantine-benvenuto-domaine-la',
    NULL,
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Mare, Calabria, Italy, Malvasia/Zibibbo, 2024',
    'cantine-benvenuto-mare-calabria-italy-malvasia-zibibbo-2024-domaine-la',
    NULL,
    NULL,
    'Italy',
    2024,
    NULL,
    NULL,
    '["charcuterie board","grilled fish"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/5A68DB09-849A-49B9-9AB9-F5CE3E94CC27_1_201_a.jpg',
    30.00,
    30.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Caparsa
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Caparsa',
    'caparsa-domaine-la',
    NULL,
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Doccio a Matteo Riserva, Chianti Classico, Italy, Chianti Blend, 2016',
    'caparsa-doccio-a-matteo-riserva-chianti-classico-italy-chianti-blend-2016-domaine-la',
    NULL,
    NULL,
    'Italy',
    2016,
    NULL,
    NULL,
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/IMG-4060.jpg',
    94.00,
    94.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Caroline Bellavoine
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Caroline Bellavoine',
    'caroline-bellavoine-domaine-la',
    'Burgundy',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Cote Chalonnaise France, Chardonnay, 2022',
    'caroline-bellavoine-cote-chalonnaise-france-chardonnay-2022-domaine-la',
    'Chardonnay',
    'Burgundy',
    'France',
    2022,
    'Elegant and mineraly! Serving temp: Fridge cold! Food pairings: Grilled lobster, grilled asparagus with lemon, olive oil and sea salt!',
    'Elegant and mineraly! Serving temp: Fridge cold! Food pairings: Grilled lobster, grilled asparagus with lemon, olive oil and sea salt!',
    '["charcuterie board","grilled meats","grilled fish"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":1,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/298DD1A6-DE16-4832-9216-4505DE1DD54C_1_201_a.jpg',
    36.00,
    36.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Cascina Fèipu dei Massaretti
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Cascina Fèipu dei Massaretti',
    'cascina-feipu-dei-massaretti-domaine-la',
    'Liguria',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Cascina Feipu dei Massaretti, Pigato, Liguria, Pigato, 2023',
    'cascina-feipu-dei-massaretti-pigato-liguria-pigato-2023-domaine-la',
    NULL,
    'Liguria',
    'Italy',
    2023,
    'A dry, fresh and balanced white from the Ligurian Riviera... With notes of white stone fruit and dried Mediterranean herbs, this is one of the most suitable wines for seafood dishes! Serving temp: fridge cold! Pairing: pesto pasta; focaccia with olive oil and rosemary',
    'A dry, fresh and balanced white from the Ligurian Riviera... With notes of white stone fruit and dried Mediterranean herbs, this is one of the most suitable wines for seafood dishes! Serving temp: fridge cold! Pairing: pesto pasta; focaccia with olive oil and rosemary',
    '["pesto pasta","focaccia with olive oil and rosemary","charcuterie board","grilled meats"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/IMG_0336.heic',
    36.00,
    36.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Caveau des Byards
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Caveau des Byards',
    'caveau-des-byards-domaine-la',
    'Jura',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Cremant du Jura Rose, Jura, Pinot Noir/Trousseau/Poulsard, NV',
    'caveau-des-byards-cremant-du-jura-rose-jura-pinot-noir-trousseau-poulsard-nv-domaine-la',
    'Pinot Noir',
    'Jura',
    'France',
    NULL,
    'This Pinot Noir-dominant Crémant du Jura Rosé is dry and crisp, with notes of red fruit. Serving temp: Fridge cold!',
    'This Pinot Noir-dominant Crémant du Jura Rosé is dry and crisp, with notes of red fruit. Serving temp: Fridge cold!',
    '["brunch dishes"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/IMG_8697.jpg',
    42.00,
    42.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Chartogne-Taillet
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Chartogne-Taillet',
    'chartogne-taillet-domaine-la',
    'Champagne',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Sainte Anne, Chardonnay/Pinot Noir/Pinot Meunier, NV',
    'chartogne-taillet-sainte-anne-chardonnay-pinot-noir-pinot-meunier-nv-domaine-la',
    'Champagne',
    'Champagne',
    'France',
    NULL,
    NULL,
    NULL,
    '["brunch dishes"]'::jsonb,
    '{"body":2,"sweetness":1,"tannin":1,"acidity":5}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/1486C645-A660-478D-827C-BD4DFACBEA47_1_201_a.jpg',
    112.00,
    112.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Chateau de Miniere
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Chateau de Miniere',
    'chateau-de-miniere-domaine-la',
    NULL,
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Bulles de Miniere Rose, Bourgueil, Cabernet Franc, NV',
    'chateau-de-miniere-bulles-de-miniere-rose-bourgueil-cabernet-franc-nv-domaine-la',
    'Cabernet Franc',
    NULL,
    'France',
    NULL,
    NULL,
    NULL,
    '["charcuterie board"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/IMG_1304.jpg',
    26.00,
    26.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Châaeau la Croix Toulifaut
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Châaeau la Croix Toulifaut',
    'chaaeau-la-croix-toulifaut-domaine-la',
    'Bordeaux',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Chateau la Croix Toulifaut, Pomerol, Bordeaux, Merlot/ Cabernet Franc, 2007',
    'chateau-la-croix-toulifaut-pomerol-bordeaux-merlot-cabernet-franc-2007-domaine-la',
    'Merlot',
    'Bordeaux',
    'France',
    2007,
    NULL,
    NULL,
    '["charcuterie board"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":3,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/IMG_9782.jpg',
    92.00,
    92.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Chateau La Grolet
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Chateau La Grolet',
    'chateau-la-grolet-domaine-la',
    'Bordeaux',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Cotes de Bourg, Bordeaux, France, Merlot/Cabernet Sauvignon/Cabernet Franc/Malbec, 2022',
    'chateau-la-grolet-cotes-de-bourg-bordeaux-france-merlot-cabernet-sauvignon-cabernet-franc-malbec-2022-domaine-la',
    'Cabernet Sauvignon',
    'Bordeaux',
    'France',
    2022,
    'Grolet is a biodynamic producer in Bordeaux, more specifically in the Cotes de Bourg and the wine is made from a classic combination of Cabernet Sauvignon, Merlot and Cabernet Franc. Also a touch of malbec!! The wine is medium to full bodied, but maintains an awesome back bone and amazing nuance. What''s also cool about this wine is that part of its dynamic energy comes from the fact that the vines are planted in deeper clay soil with gravel on top. Serving temp: Cellar temp around 65 degrees, st',
    'Grolet is a biodynamic producer in Bordeaux, more specifically in the Cotes de Bourg and the wine is made from a classic combination of Cabernet Sauvignon, Merlot and Cabernet Franc. Also a touch of malbec!! The wine is medium to full bodied, but maintains an awesome back bone and amazing nuance. What''s also cool about this wine is that part of its dynamic energy comes from the fact that the vines are planted in deeper clay soil with gravel on top. Serving temp: Cellar temp around 65 degrees, st',
    '["charcuterie board","grilled meats","grilled fish"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/IMG_1769.jpg',
    23.00,
    23.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Chateau le Puy
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Chateau le Puy',
    'chateau-le-puy-domaine-la',
    'Bordeaux',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Emilien, Cotes de Bordeaux, Merlot/Cabernet Sauv/Carmenere, 2022',
    'chateau-le-puy-emilien-cotes-de-bordeaux-merlot-cabernet-sauv-carmenere-2022-domaine-la',
    'Cabernet Sauvignon',
    'Bordeaux',
    'France',
    2022,
    'Full-bodied and suuuuper silky, this garnet-red wine exudes aromatic notes of ripe red fruit with hints of wild undergrowth. The palate is well-rounded and complex possessing notes of ripe currants, bell pepper, plum and olive.',
    'Full-bodied and suuuuper silky, this garnet-red wine exudes aromatic notes of ripe red fruit with hints of wild undergrowth. The palate is well-rounded and complex possessing notes of ripe currants, bell pepper, plum and olive.',
    '["charcuterie board","grilled meats"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/lepuyemilien2017.jpg',
    87.00,
    87.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Champagne Chavost
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Champagne Chavost',
    'champagne-chavost-domaine-la',
    'Champagne',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Chavost, Blanc d'' Assemblage, Brut Nature, Pinot Meunier/Pinot Noir/Chardonnay, NV',
    'chavost-blanc-d-assemblage-brut-nature-pinot-meunier-pinot-noir-chardonnay-nv-domaine-la',
    'Pinot Noir',
    'Champagne',
    'France',
    NULL,
    'What is unique about the Chavost project is that it is a co-op of 20 different growers all together. Once Fabian took over, he convinced all of these tiny wine growers to trust in turning their grapes into wines made without any additives or sulphites. This should not be taken lightly as the traditions in Champagne, the older generation''s mindset have been some of the most resistant to change but the result has been absolutely astounding. Zippy, bright and fresh! Chavost just hits differently!!!',
    'What is unique about the Chavost project is that it is a co-op of 20 different growers all together. Once Fabian took over, he convinced all of these tiny wine growers to trust in turning their grapes into wines made without any additives or sulphites. This should not be taken lightly as the traditions in Champagne, the older generation''s mindset have been some of the most resistant to change but the result has been absolutely astounding. Zippy, bright and fresh! Chavost just hits differently!!!',
    '["charcuterie board","grilled fish"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/IMG_2026.jpg',
    82.00,
    82.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Clos des Mourres
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Clos des Mourres',
    'clos-des-mourres-domaine-la',
    'Rhone',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Pompette, Vin de France, Aubun/Counoise/Cinsault/Tempranillo, 2022',
    'clos-des-mourres-pompette-vin-de-france-aubun-counoise-cinsault-tempranillo-2022-domaine-la',
    'Syrah',
    'Rhone',
    'France',
    2022,
    NULL,
    NULL,
    '["grilled meats"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/DSC07352.jpg',
    38.00,
    38.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Clos Saint Joseph
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Clos Saint Joseph',
    'clos-saint-joseph-domaine-la',
    'Provence',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Blanc de Blancs, Cotes de provence, France, Rolle/ Ugni Blanc, 2022',
    'clos-saint-joseph-blanc-de-blancs-cotes-de-provence-france-rolle-ugni-blanc-2022-domaine-la',
    NULL,
    'Provence',
    'France',
    2022,
    NULL,
    NULL,
    '["charcuterie board","grilled meats","grilled fish"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/IMG_0312.jpg',
    40.00,
    40.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- =========================================================================
  -- RETAILER 7: Vinovore
  -- Location: East Hollywood, Los Angeles
  -- =========================================================================

  INSERT INTO public.organizations (id, name, slug, metadata)
  VALUES (
    gen_random_uuid(),
    'Vinovore',
    'vinovore',
    '{"location":"East Hollywood, Los Angeles","tagline":"Wine made by women — every bottle on the shelf"}'::jsonb
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, metadata = EXCLUDED.metadata
  RETURNING id INTO _org_id;

  -- Producer: Closerie des Moussis
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Closerie des Moussis',
    'closerie-des-moussis-vinovore',
    'Bordeaux',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Closeries Des moussis, Haut-Médoc, Bordeaux,France, Cabernet Sauvignon/ Merlot/ Cabernet Franc, 2021',
    'closeries-des-moussis-haut-medoc-bordeaux-france-cabernet-sauvignon-merlot-cabernet-franc-2021-vinovore',
    'Cabernet Sauvignon',
    'Bordeaux',
    'France',
    2021,
    NULL,
    NULL,
    '["charcuterie board","grilled meats","grilled fish"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/moussis.jpg',
    59.00,
    59.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Comtes Lafon
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Comtes Lafon',
    'comtes-lafon-vinovore',
    'Burgundy',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '1er Cru, Meursault-Porusots, Chardonnay, 2019',
    'comtes-lafon-1er-cru-meursault-porusots-chardonnay-2019-vinovore',
    'Chardonnay',
    'Burgundy',
    'France',
    2019,
    'Vibrant and full-bodied, while balanced with natural acidity. Flavor notes of ripe peaches, apricot and lemon curd. Pairs beautifully with broiled lobster tails and soft cheeses! Serving temp: Fridge cold! Food pairing: King prawns in garlic butter sauce or Creamy butternut squash risotto!',
    'Vibrant and full-bodied, while balanced with natural acidity. Flavor notes of ripe peaches, apricot and lemon curd. Pairs beautifully with broiled lobster tails and soft cheeses! Serving temp: Fridge cold! Food pairing: King prawns in garlic butter sauce or Creamy butternut squash risotto!',
    '["charcuterie board"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":1,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/ComtesLafonPorusot.jpg',
    610.00,
    610.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: COZs
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'COZs',
    'cozs-vinovore',
    NULL,
    'Portugal',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Pop, Vinho Branco Macerado, Lisbon, Portugal, Vital, 2023',
    'cozs-pop-vinho-branco-macerado-lisbon-portugal-vital-2023-vinovore',
    NULL,
    NULL,
    'Portugal',
    2023,
    '100% Vital, from Serra de Montejunto, not far from Lisbon and the salty Atlantic Ocean. Serving temp: Fridge cold! Pairing: Ruben sandwich; Grilled cheese and soup',
    '100% Vital, from Serra de Montejunto, not far from Lisbon and the salty Atlantic Ocean. Serving temp: Fridge cold! Pairing: Ruben sandwich; Grilled cheese and soup',
    '["Ruben sandwich","Grilled cheese and soup","brunch dishes"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/C25E377F-F07D-4056-8FD4-0EE437D2A20E_1_201_a.jpg',
    40.00,
    40.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Cume do Avia
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Cume do Avia',
    'cume-do-avia-vinovore',
    NULL,
    'Spain',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Colleita 10, Tinto, Ribeiro, Caino Longo/Souson/Brancellao, 2022',
    'cume-do-avia-colleita-10-tinto-ribeiro-caino-longo-souson-brancellao-2022-vinovore',
    NULL,
    NULL,
    'Spain',
    2022,
    NULL,
    NULL,
    '["charcuterie board"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/FullSizeRender_017f505c-b3c9-4080-bdce-dd8f80782137.jpg',
    28.00,
    28.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Domaine La Calmette
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Domaine La Calmette',
    'domaine-la-calmette-vinovore',
    NULL,
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Domaine Calmette, Trespotz, Cahors, Malbec/Merlot, 2022',
    'domaine-calmette-trespotz-cahors-malbec-merlot-2022-vinovore',
    'Malbec',
    NULL,
    'France',
    2022,
    'Made by a super cool couple, growing grapes at high elevation vineyards in Cahors, surrounded by forest energy. It all adds up to the magic that is the wines from Domaine La Calmette. This is the Trespotz which translates to "three wells" but references the fact that this wine is a blend of grapes grown in three different types of soil: red clay, marl & Kimmeridgian. The wine is mostly Malbec with a touch of Merlot, its inky dark complexion gives way to a super balanced and luscious red wine tha',
    'Made by a super cool couple, growing grapes at high elevation vineyards in Cahors, surrounded by forest energy. It all adds up to the magic that is the wines from Domaine La Calmette. This is the Trespotz which translates to "three wells" but references the fact that this wine is a blend of grapes grown in three different types of soil: red clay, marl & Kimmeridgian. The wine is mostly Malbec with a touch of Merlot, its inky dark complexion gives way to a super balanced and luscious red wine tha',
    '["grilled meats"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/trespotz.jpg',
    42.00,
    42.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Domaine Clos des Rocs
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Domaine Clos des Rocs',
    'domaine-clos-des-rocs-vinovore',
    'Burgundy',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'En Pres Foret, Macon-Loche, Burgundy, France, Chardonnay, 2024',
    'domaine-clos-des-rocs-en-pres-foret-macon-loche-burgundy-france-chardonnay-2024-vinovore',
    'Chardonnay',
    'Burgundy',
    'France',
    2024,
    NULL,
    NULL,
    '["charcuterie board","grilled meats","grilled fish"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":1,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/FullSizeRender_2_48d34c5a-ad18-4c01-ab82-ea7c06aa241b.jpg',
    41.00,
    41.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Domaine Del Leone
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Domaine Del Leone',
    'domaine-del-leone-vinovore',
    'Veneto',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Veneto Rosso, IGT, Merlot/ Cabernet, NV',
    'domaine-del-leone-veneto-rosso-igt-merlot-cabernet-nv-vinovore',
    'Merlot',
    'Veneto',
    'Italy',
    NULL,
    NULL,
    NULL,
    '["charcuterie board"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":3,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/FullSizeRender_2_504b7527-8832-4cb7-8810-638a7f5f1419.jpg',
    18.00,
    18.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Domaine des Hauts Baigneux
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Domaine des Hauts Baigneux',
    'domaine-des-hauts-baigneux-vinovore',
    'Loire Valley',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Domaine des Hauts Baigneux, Les Moulins, Loire Valley, France, Cabernet Franc, 2023',
    'domaine-des-hauts-baigneux-les-moulins-loire-valley-france-cabernet-franc-2023-vinovore',
    'Cabernet Franc',
    'Loire Valley',
    'France',
    2023,
    NULL,
    NULL,
    '["charcuterie board"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/IMG_6953.jpg',
    26.00,
    26.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Domaine du Jaugaret
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Domaine du Jaugaret',
    'domaine-du-jaugaret-vinovore',
    'Bordeaux',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Saint-Julien, Cabernet Sauvignon/Petit Verdot/Malbec, 2019',
    'domaine-du-jaugaret-saint-julien-cabernet-sauvignon-petit-verdot-malbec-2019-vinovore',
    'Cabernet Sauvignon',
    'Bordeaux',
    'France',
    2019,
    'The estate of Domaine du Jaugaret has been in the Fillastre family since 1654 (!!!), and Jean-François Fillastre is dedicated to preserving it''s traditions! With it''s savory, black-fruit layered, tobacco-rich earth, and herbal bouquet, this wine is a pure and poetic expression of it''s terroir! Serve with braised thighs, mushroom risotto or aged cheeses.',
    'The estate of Domaine du Jaugaret has been in the Fillastre family since 1654 (!!!), and Jean-François Fillastre is dedicated to preserving it''s traditions! With it''s savory, black-fruit layered, tobacco-rich earth, and herbal bouquet, this wine is a pure and poetic expression of it''s terroir! Serve with braised thighs, mushroom risotto or aged cheeses.',
    '["grilled meats"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/Jaugart.jpg',
    216.00,
    216.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Domaine du Kre
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Domaine du Kre',
    'domaine-du-kre-vinovore',
    NULL,
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Plongeon, Savoie, France, Gamay, 2023',
    'domaine-du-kre-plongeon-savoie-france-gamay-2023-vinovore',
    'Gamay',
    NULL,
    'France',
    2023,
    NULL,
    NULL,
    '["versatile pairing"]'::jsonb,
    '{"body":2,"sweetness":1,"tannin":2,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/80DCB787-AFE5-40C8-8D58-3519511F9A95_1_201_a.jpg',
    23.00,
    23.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Domaine Fourrier
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Domaine Fourrier',
    'domaine-fourrier-vinovore',
    'Burgundy',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '1er Cru, La Combe Aux Moines, Gevrey-Chambertin, Vieille Vigne, Burgundy, Pinot Noir, 2023',
    'domaine-fourrier-1er-cru-la-combe-aux-moines-gevrey-chambertin-vieille-vigne-burgundy-pinot-noir-2023-vinovore',
    'Pinot Noir',
    'Burgundy',
    'France',
    2023,
    NULL,
    NULL,
    '["charcuterie board"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/IMG_7417.jpg',
    398.00,
    398.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '1er Cru, Les Goulots, Gevrey-Chambertin, Vieille Vigne, Burgundy, Pinot Noir, 2023',
    'domaine-fourrier-1er-cru-les-goulots-gevrey-chambertin-vieille-vigne-burgundy-pinot-noir-2023-vinovore',
    'Pinot Noir',
    'Burgundy',
    'France',
    2023,
    NULL,
    NULL,
    '["charcuterie board"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/IMG_7418.jpg',
    356.00,
    356.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Domaine Landron Chartier
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Domaine Landron Chartier',
    'domaine-landron-chartier-vinovore',
    NULL,
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Melon B, Vin de France, Melon de Bourgogne, 2023',
    'domaine-landron-chartier-melon-b-vin-de-france-melon-de-bourgogne-2023-vinovore',
    NULL,
    NULL,
    'France',
    2023,
    'This is from an area called Muscadet and made from a grape called Melon de Bourgogne. It''s literally the perfect oyster wine: Hence the label. Fresh, zippy, bright, mineral-rich and palette wetting. It''s a wine you always want to take another sip of, especially when you are downing briny little treats. The subtle, but not sweet, notes of pear, apple and honeydew are coupled with a dubstep beat of minerals and brightness. This is a third generation winemaker and is one of few in Muscadet who appr',
    'This is from an area called Muscadet and made from a grape called Melon de Bourgogne. It''s literally the perfect oyster wine: Hence the label. Fresh, zippy, bright, mineral-rich and palette wetting. It''s a wine you always want to take another sip of, especially when you are downing briny little treats. The subtle, but not sweet, notes of pear, apple and honeydew are coupled with a dubstep beat of minerals and brightness. This is a third generation winemaker and is one of few in Muscadet who appr',
    '["grilled fish"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/products/landronchartier.jpg',
    27.00,
    27.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Domaine Les Enfants Sauvages
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Domaine Les Enfants Sauvages',
    'domaine-les-enfants-sauvages-vinovore',
    'Roussillon',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Côtes Catalanes Bouche du Soleil, Roussillon, France, Muscat of Alexandria, 2024',
    'domaine-les-enfants-sauvages-cotes-catalanes-bouche-du-soleil-roussillon-france-muscat-of-alexandria-2024-vinovore',
    NULL,
    'Roussillon',
    'France',
    2024,
    'A complex bouquet featuring aromatic notes of ripe stone fruits and citrus, as well as subtle hints of jasmine, with herbal undertones. The palate is rich and textured, highlighting flavors of dried fruits, a touch of spice, and refreshing acidity.',
    'A complex bouquet featuring aromatic notes of ripe stone fruits and citrus, as well as subtle hints of jasmine, with herbal undertones. The palate is rich and textured, highlighting flavors of dried fruits, a touch of spice, and refreshing acidity.',
    '["brunch dishes","charcuterie board"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0053/2493/1142/files/IMG_8698.jpg',
    36.00,
    36.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: 00 Wines
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    '00 Wines',
    '00-wines-vinovore',
    'Willamette Valley',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '''VGR'', Pinot Noir, Willamette Valley, Oregon, 2022',
    '00-wines-vgr-pinot-noir-willamette-valley-oregon-2022-vinovore',
    'Pinot Noir',
    'Willamette Valley',
    'United States',
    2022,
    'Overview of the Wine Double Zero Wines is a daring journey exploring the potential of cool-climate Chardonnay and Pinot Noir by wine industry pioneer Chris Hermann and entrepreneur Kathryn Hermann. 00 Wines was founded in 2015, emerging from a fusion of family heritage and winemaking ambition. The vision was born from Chris Hermann, an attorney specializing in international wine law, and his late father, Dr. Richard Hermann, a distinguished botanist and Douglas Fir geneticist at Oregon State Uni',
    'Overview of the Wine Double Zero Wines is a daring journey exploring the potential of cool-climate Chardonnay and Pinot Noir by wine industry pioneer Chris Hermann and entrepreneur Kathryn Hermann. 00 Wines was founded in 2015, emerging from a fusion of family heritage and winemaking ambition. The vision was born from Chris Hermann, an attorney specializing in international wine law, and his late father, Dr. Richard Hermann, a distinguished botanist and Douglas Fir geneticist at Oregon State Uni',
    '["versatile pairing"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/00_Wines_VGR_Pinot_Noir_Willamette_Valley_Oregon_2022.jpg',
    102.95,
    102.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: 001 Vintners
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    '001 Vintners',
    '001-vintners-vinovore',
    'Napa Valley',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Cabernet Sauvignon, Ecotone Vineyard, Napa Valley, 2021 (Graeme MacDonald)',
    '001-vintners-cabernet-sauvignon-ecotone-vineyard-napa-valley-2021-graeme-macdonald-vinovore',
    'Cabernet Sauvignon',
    'Napa Valley',
    'United States',
    2021,
    'Overview of the Wine Following the repeal of Prohibition, in 1933, Carmine Martignetti was granted retail license number 001 for Martignetti Grocery Company in Boston''s North End. Since the late 1970''s, a passion for wine led our family to introduce numerous Napa Valley wines to New England. Inspired by those classic vintages, third-generation principals Carmine and Beth Martignetti and their sons Freddie, Philip and Michael have created their own wine, sourced from thirty-three-year-old hillsid',
    'Overview of the Wine Following the repeal of Prohibition, in 1933, Carmine Martignetti was granted retail license number 001 for Martignetti Grocery Company in Boston''s North End. Since the late 1970''s, a passion for wine led our family to introduce numerous Napa Valley wines to New England. Inspired by those classic vintages, third-generation principals Carmine and Beth Martignetti and their sons Freddie, Philip and Michael have created their own wine, sourced from thirty-three-year-old hillsid',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/001_Vintners_Ecotone_Vineyard_Cabernet_Sauvignon_Napa_Valley_California_2021.jpg',
    214.79,
    214.79,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- =========================================================================
  -- RETAILER 8: Lou Wine Shop
  -- Location: Los Feliz, Los Angeles
  -- =========================================================================

  INSERT INTO public.organizations (id, name, slug, metadata)
  VALUES (
    gen_random_uuid(),
    'Lou Wine Shop',
    'lou-wine-shop',
    '{"location":"Los Feliz, Los Angeles","tagline":"Your neighborhood bottle shop in Los Feliz"}'::jsonb
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, metadata = EXCLUDED.metadata
  RETURNING id INTO _org_id;

  -- Producer: 10 Ninths
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    '10 Ninths',
    '10-ninths-lou-wine-shop',
    'Santa Barbara',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Chardonnay, Sta. Rita Hills, Santa Barbara, California, 2022',
    '10-ninths-chardonnay-sta-rita-hills-santa-barbara-california-2022-lou-wine-shop',
    'Chardonnay',
    'Santa Barbara',
    'United States',
    2022,
    'Overview of the Wine Our vineyards are located in the sloping, sandy soils at the westernmost edge of the Sta. Rita Hills, where a cool maritime influence results in a slow, deliberate ripening of the grapes. Through minimal intervention viticultural practices, we aim to bring out the vibrant, balanced, and distinctive qualities of our 10 Ninths wines. At 10 Ninths, craftsmanship is our art form. Our team strives to create exceptional wines that harmonize with nature. Through regenerative method',
    'Overview of the Wine Our vineyards are located in the sloping, sandy soils at the westernmost edge of the Sta. Rita Hills, where a cool maritime influence results in a slow, deliberate ripening of the grapes. Through minimal intervention viticultural practices, we aim to bring out the vibrant, balanced, and distinctive qualities of our 10 Ninths wines. At 10 Ninths, craftsmanship is our art form. Our team strives to create exceptional wines that harmonize with nature. Through regenerative method',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":1,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/10_Ninths_Chardonnay_Santa_Barbara_California_2022.jpg',
    49.95,
    49.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Radius, Pinot Noir, Sta. Rita Hills, Santa Barbara, California, 2021',
    '10-ninths-radius-pinot-noir-sta-rita-hills-santa-barbara-california-2021-lou-wine-shop',
    'Pinot Noir',
    'Santa Barbara',
    'United States',
    2021,
    'Overview of the Wine Our vineyards are located in the sloping, sandy soils at the westernmost edge of the Sta. Rita Hills, where a cool maritime influence results in a slow, deliberate ripening of the grapes. Through minimal intervention viticultural practices, we aim to bring out the vibrant, balanced, and distinctive qualities of our 10 Ninths wines. At 10 Ninths, craftsmanship is our art form. Our team strives to create exceptional wines that harmonize with nature. Through regenerative method',
    'Overview of the Wine Our vineyards are located in the sloping, sandy soils at the westernmost edge of the Sta. Rita Hills, where a cool maritime influence results in a slow, deliberate ripening of the grapes. Through minimal intervention viticultural practices, we aim to bring out the vibrant, balanced, and distinctive qualities of our 10 Ninths wines. At 10 Ninths, craftsmanship is our art form. Our team strives to create exceptional wines that harmonize with nature. Through regenerative method',
    '["versatile pairing"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/10_Ninths_Radius_Pinot_Noir_Santa_Barbara_California_2021.jpg',
    44.95,
    44.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: 50 by 50
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    '50 by 50',
    '50-by-50-lou-wine-shop',
    'Napa Valley',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Rose of Pinot Noir, Carneros, California, 2023',
    '50-by-50-rose-of-pinot-noir-carneros-california-2023-lou-wine-shop',
    'Pinot Noir',
    'Napa Valley',
    'United States',
    2023,
    'Overview of the Wine "The 50 by 50 -- what''s in a name? To start it''s the fusion of two passions - architecture and wine, the latter one dominating as I drank my way to knowledge traveling around the globe performing with my band, Devi, through 7 world tours and countless music festivals. From consumer, to respectful student to devoted Pinot Noir producer. My love of Pinot Noir came later in life. When my band, Devo, signed with Warner Brothers Records in 1978, we left Ohio for the promise of Ca',
    'Overview of the Wine "The 50 by 50 -- what''s in a name? To start it''s the fusion of two passions - architecture and wine, the latter one dominating as I drank my way to knowledge traveling around the globe performing with my band, Devi, through 7 world tours and countless music festivals. From consumer, to respectful student to devoted Pinot Noir producer. My love of Pinot Noir came later in life. When my band, Devo, signed with Warner Brothers Records in 1978, we left Ohio for the promise of Ca',
    '["versatile pairing"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/50_by_50_Carneros_Rose_of_Pinot_Noir_Carneros_California_2023.jpg',
    18.95,
    18.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: A&D Wines
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'A&D Wines',
    'a-d-wines-lou-wine-shop',
    NULL,
    'Portugal',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Esculpido White, Vinho Verde, Portugal, 2019',
    'a-d-wines-esculpido-white-vinho-verde-portugal-2019-lou-wine-shop',
    NULL,
    NULL,
    'Portugal',
    2019,
    'Overview of the Wine Located in Baião, the properties Casa do Arrabalde, Quinta dos Espinhosos and Quinta de Santa Teresa are made up of parcels of vineyards from low to medium production, organically cared for and in predominant granitic soils, performing a total of 45 ha of vineyard. The three properties, although all located in the same sub-region, possess special, quite different features: The vineyard of Casa do Arrabalde, exposed to the Marão foothills at 490m above sea level, produces lat',
    'Overview of the Wine Located in Baião, the properties Casa do Arrabalde, Quinta dos Espinhosos and Quinta de Santa Teresa are made up of parcels of vineyards from low to medium production, organically cared for and in predominant granitic soils, performing a total of 45 ha of vineyard. The three properties, although all located in the same sub-region, possess special, quite different features: The vineyard of Casa do Arrabalde, exposed to the Marão foothills at 490m above sea level, produces lat',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/A_DWines_EsculpidoWhite_VinhoVerde_Portugal_2019.jpg',
    30.95,
    30.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Aaron
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Aaron',
    'aaron-lou-wine-shop',
    'Paso Robles',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Wines, Sand & Stone (Grenache, Petite, Syrah, Graciano), Paso Robles, California, 2022',
    'aaron-wines-sand-stone-grenache-petite-syrah-graciano-paso-robles-california-2022-lou-wine-shop',
    'Grenache',
    'Paso Robles',
    'United States',
    2022,
    'Overview of the Wine Aaron began in 2002 with a focus on producing powerful, age-worthy wines from the rugged hillsides of westside Paso Robles.Utilizing vineyards from the most amazing sites their boots could find, they source intense yet balanced fruit from the Willow Creek, Adelaida, and Templeton Gap districts. From Ian Blackburn - I was really blown away by the quality, texture, and complexity. I buy massive scoring wines from Paso at much higher price points that don''t have the charm and d',
    'Overview of the Wine Aaron began in 2002 with a focus on producing powerful, age-worthy wines from the rugged hillsides of westside Paso Robles.Utilizing vineyards from the most amazing sites their boots could find, they source intense yet balanced fruit from the Willow Creek, Adelaida, and Templeton Gap districts. From Ian Blackburn - I was really blown away by the quality, texture, and complexity. I buy massive scoring wines from Paso at much higher price points that don''t have the charm and d',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":3,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/AaronWines_Sand_Stone_PasoRobles_California_2022_7f5fa4c6-e942-4574-8078-445068401ea9.jpg',
    48.95,
    48.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Abadia Retuerta
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Abadia Retuerta',
    'abadia-retuerta-lou-wine-shop',
    NULL,
    'Spain',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Pago Negralada, Tempranillo, Castilla y León, Spain, 2015',
    'abadia-retuerta-pago-negralada-tempranillo-castilla-y-leon-spain-2015-lou-wine-shop',
    'Tempranillo',
    NULL,
    'Spain',
    2015,
    'Overview of the Wine The Abadía Retuerta Estate occupies over 700 hectares of terrain, and its name comes from the combination of two words that define and describe the territory: Rívula (river bank) and Torta (twisting, winding). Over 204 hectares of vineyards are spread out on hillsides ranging in altitude from a maximum 850 metres down to the southern bank of the Duero River. Most of the world''s best varieties of soil are represented. Designed by famous French enologist, Pascal Delbeck, in 19',
    'Overview of the Wine The Abadía Retuerta Estate occupies over 700 hectares of terrain, and its name comes from the combination of two words that define and describe the territory: Rívula (river bank) and Torta (twisting, winding). Over 204 hectares of vineyards are spread out on hillsides ranging in altitude from a maximum 850 metres down to the southern bank of the Duero River. Most of the world''s best varieties of soil are represented. Designed by famous French enologist, Pascal Delbeck, in 19',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Abadia_Retuerta_Pago_Negralada_Tempranillo_Castilla_y_Leon_Spain_2015.jpg',
    94.95,
    94.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Aborigen
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Aborigen',
    'aborigen-lou-wine-shop',
    NULL,
    'Mexico',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '''Clandestino'' Blanco, Mexico, 2024',
    'aborigen-clandestino-blanco-mexico-2024-lou-wine-shop',
    'Chenin Blanc',
    NULL,
    'Mexico',
    2024,
    'Overview of the Wine The Aboriginal Winery is part of a project to rescue vineyards in the Baja California area, traditionally wine, whose process carries out actions of environmental responsibility such as the sustainable exploitation of the resource, management of production under organic practices, promotion of biological variability and prohibition of intensive and cultural exploitation. In Aborigen, there are small production scales, the care of every detail and the different characters tha',
    'Overview of the Wine The Aboriginal Winery is part of a project to rescue vineyards in the Baja California area, traditionally wine, whose process carries out actions of environmental responsibility such as the sustainable exploitation of the resource, management of production under organic practices, promotion of biological variability and prohibition of intensive and cultural exploitation. In Aborigen, there are small production scales, the care of every detail and the different characters tha',
    '["versatile pairing"]'::jsonb,
    '{"body":3,"sweetness":2,"tannin":1,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Aborigen_Clandestino_Blanco_Queretaro_Mexico_2024.jpg',
    25.95,
    25.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Acrata Tinta del Valle Rouge, Valle de Guadalupe, Baja, Mexico, 2021 (Recommended)',
    'aborigen-acrata-tinta-del-valle-rouge-valle-de-guadalupe-baja-mexico-2021-recommended-lou-wine-shop',
    'Grenache',
    NULL,
    'Mexico',
    2021,
    'Overview of the Wine The Aboriginal Winery is part of a project to rescue vineyards in the Baja California area, traditionally wine, whose process carries out actions of environmental responsibility such as the sustainable exploitation of the resource, management of production under organic practices, promotion of biological variability and prohibition of intensive and cultural exploitation. In Aborigen, there are small production scales, the care of every detail and the different characters tha',
    'Overview of the Wine The Aboriginal Winery is part of a project to rescue vineyards in the Baja California area, traditionally wine, whose process carries out actions of environmental responsibility such as the sustainable exploitation of the resource, management of production under organic practices, promotion of biological variability and prohibition of intensive and cultural exploitation. In Aborigen, there are small production scales, the care of every detail and the different characters tha',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":3,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Aborigen-Acrata-Tinta-del-Valle-Rouge-Valle-de-Guadalupe-Baja-Mexico-2021.jpg',
    24.95,
    24.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Ad Vivum
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Ad Vivum',
    'ad-vivum-lou-wine-shop',
    'Napa Valley',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Cabernet Sauvignon, Sleeping Lady Vineyard, Napa Valley, 2016',
    'ad-vivum-cabernet-sauvignon-sleeping-lady-vineyard-napa-valley-2016-lou-wine-shop',
    'Cabernet Sauvignon',
    'Napa Valley',
    'United States',
    2016,
    'Winemaker Chris Phelps - (Former winemaker at Dominus) About The Producer AD VIVUM is a story of a special vineyard, a seasoned winemaker, a meticulous farmer, and Mother Nature. AD VIVUM is a single-vineyard, 100% Cabernet Sauvignon wine crafted by Chris Phelps, a long-time Napa Valley winemaker who has earned a reputation for his ability to consistently produce unique wines that honestly reflect the terroir of their vineyard origin. After many years of searching, Chris was introduced to Sleepi',
    'Winemaker Chris Phelps - (Former winemaker at Dominus) About The Producer AD VIVUM is a story of a special vineyard, a seasoned winemaker, a meticulous farmer, and Mother Nature. AD VIVUM is a single-vineyard, 100% Cabernet Sauvignon wine crafted by Chris Phelps, a long-time Napa Valley winemaker who has earned a reputation for his ability to consistently produce unique wines that honestly reflect the terroir of their vineyard origin. After many years of searching, Chris was introduced to Sleepi',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/products/Ad-Vivium-Cabernet-Sauvignon-Napa-Valley-California-2016.jpg',
    189.95,
    189.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Adami
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Adami',
    'adami-lou-wine-shop',
    NULL,
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '"Cartizze", Brut Prosecco, Valdobbiadene Superiore, Italy, NV',
    'adami-cartizze-brut-prosecco-valdobbiadene-superiore-italy-nv-lou-wine-shop',
    'Prosecco',
    NULL,
    'Italy',
    NULL,
    'Overview of the Wine Love and commitment to our life-project cannot, at the same time, prevent us from being aware that we are indeed quite fortunate. Fortunate to be able to love and contribute to the beauty of this unique corner of earth, both through the work we do every day as well as through our preservation and protection of the places in our Alta Marca Trevigiana, which continue to surprise us as we see them each day. Sustainable Winemaker Adriano Adami Grape / Blend 95% Glera, 5% Chardon',
    'Overview of the Wine Love and commitment to our life-project cannot, at the same time, prevent us from being aware that we are indeed quite fortunate. Fortunate to be able to love and contribute to the beauty of this unique corner of earth, both through the work we do every day as well as through our preservation and protection of the places in our Alta Marca Trevigiana, which continue to surprise us as we see them each day. Sustainable Winemaker Adriano Adami Grape / Blend 95% Glera, 5% Chardon',
    '["versatile pairing"]'::jsonb,
    '{"body":1,"sweetness":2,"tannin":1,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Adami_Cartizze_Brut_Prosecco_Valdobbiadene_Superiore_Italy_NV.jpg',
    37.95,
    37.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Addax
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Addax',
    'addax-lou-wine-shop',
    'Napa Valley',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Cabernet Sauvignon, Napa Valley, California, 2019',
    'addax-cabernet-sauvignon-napa-valley-california-2019-lou-wine-shop',
    'Cabernet Sauvignon',
    'Napa Valley',
    'United States',
    2019,
    'About the Producer Crafted by Russell Bevan, one of the most sought-after winemakers in California today, Addax is an artisan winery founded by Brian Kearney and Josh Peeples. What began with a few friends and a few barrels of Cabernet in 2009 has evolved into a phenomenal portfolio of wines, including Oakville Cabernet Sauvignon, Petaluma Gap and Sta. Rita Pinot Noir, and a selection of Sonoma Chardonnays. After more than a decade, we continue our quest to work with exceptional vineyard sites t',
    'About the Producer Crafted by Russell Bevan, one of the most sought-after winemakers in California today, Addax is an artisan winery founded by Brian Kearney and Josh Peeples. What began with a few friends and a few barrels of Cabernet in 2009 has evolved into a phenomenal portfolio of wines, including Oakville Cabernet Sauvignon, Petaluma Gap and Sta. Rita Pinot Noir, and a selection of Sonoma Chardonnays. After more than a decade, we continue our quest to work with exceptional vineyard sites t',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/products/Addax-Cabernet-Sauvignon-Napa-Valley-California-2019.jpg',
    129.95,
    129.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Pinot Noir, Sonoma Coast, California, 2021',
    'addax-pinot-noir-sonoma-coast-california-2021-lou-wine-shop',
    'Pinot Noir',
    'Sonoma',
    'United States',
    2021,
    'About the Producer Crafted by Russell Bevan, one of the most sought-after winemakers in California today, Addax is an artisan winery founded by Brian Kearney and Josh Peeples. What began with a few friends and a few barrels of Cabernet in 2009 has evolved into a phenomenal portfolio of wines, including Oakville Cabernet Sauvignon, Petaluma Gap and Sta. Rita Pinot Noir, and a selection of Sonoma Chardonnays. After more than a decade, we continue our quest to work with exceptional vineyard sites t',
    'About the Producer Crafted by Russell Bevan, one of the most sought-after winemakers in California today, Addax is an artisan winery founded by Brian Kearney and Josh Peeples. What began with a few friends and a few barrels of Cabernet in 2009 has evolved into a phenomenal portfolio of wines, including Oakville Cabernet Sauvignon, Petaluma Gap and Sta. Rita Pinot Noir, and a selection of Sonoma Chardonnays. After more than a decade, we continue our quest to work with exceptional vineyard sites t',
    '["versatile pairing"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Addax_PinotNoir_SonomaCoast_California_2021.jpg',
    72.95,
    72.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Adversity Cellars
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Adversity Cellars',
    'adversity-cellars-lou-wine-shop',
    'Napa Valley',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Melanson Vineyard Cabernet Sauvignon, Napa Valley, California, 2023',
    'adversity-cellars-melanson-vineyard-cabernet-sauvignon-napa-valley-california-2023-lou-wine-shop',
    'Cabernet Sauvignon',
    'Napa Valley',
    'United States',
    2023,
    'About the Producer Crafted by Russell Bevan, one of the most sought-after winemakers in California today, Addax is an artisan winery founded by Brian Kearney and Josh Peeples. What began with a few friends and a few barrels of Cabernet in 2009 has evolved into a phenomenal portfolio of wines, including Oakville Cabernet Sauvignon, Petaluma Gap and Sta. Rita Pinot Noir, and a selection of Sonoma Chardonnays. After more than a decade, we continue our quest to work with exceptional vineyard sites t',
    'About the Producer Crafted by Russell Bevan, one of the most sought-after winemakers in California today, Addax is an artisan winery founded by Brian Kearney and Josh Peeples. What began with a few friends and a few barrels of Cabernet in 2009 has evolved into a phenomenal portfolio of wines, including Oakville Cabernet Sauvignon, Petaluma Gap and Sta. Rita Pinot Noir, and a selection of Sonoma Chardonnays. After more than a decade, we continue our quest to work with exceptional vineyard sites t',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Adversity_Cellars_Melanson_Vineyard_Cabernet_Sauvignon_Napa_Valley_California_2023.jpg',
    219.95,
    219.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Aether
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Aether',
    'aether-lou-wine-shop',
    'Santa Barbara',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '''La Rinconada'' Chardonnay, Sta. Rita Hills, California, 2021',
    'aether-la-rinconada-chardonnay-sta-rita-hills-california-2021-lou-wine-shop',
    'Chardonnay',
    'Santa Barbara',
    'United States',
    2021,
    'Top find! Overview of the Wine We have all the instruments and algorithms that modern vintners use, and these are helpful for making the wine hold together in the bottle. We see to the technical components, the raw materials, fruit, sourcing, uniqueness of terroir; all of the observational, empirical inputs that can be captured in a spreadsheet. But wine has ideas of its own. What begins as naked elements puts on character with age. Wine has culture that can be cultivated or interrupted from mom',
    'Top find! Overview of the Wine We have all the instruments and algorithms that modern vintners use, and these are helpful for making the wine hold together in the bottle. We see to the technical components, the raw materials, fruit, sourcing, uniqueness of terroir; all of the observational, empirical inputs that can be captured in a spreadsheet. But wine has ideas of its own. What begins as naked elements puts on character with age. Wine has culture that can be cultivated or interrupted from mom',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":1,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Aether_LaRinconada_Chardonnay_Sta.RitaHills_California_2021_5125316b-40c8-4691-aaf8-561fb468edc8.jpg',
    37.95,
    37.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Pinot Noir, Sanford & Benedict, Sta Rita Hills, California, 2019',
    'aether-pinot-noir-sanford-benedict-sta-rita-hills-california-2019-lou-wine-shop',
    'Pinot Noir',
    'Santa Barbara',
    'United States',
    2019,
    'Overview of the Wine We have all the instruments and algorithms that modern vintners use, and these are helpful for making the wine hold together in the bottle. We see to the technical components, the raw materials, fruit, sourcing, uniqueness of terroir; all of the observational, empirical inputs that can be captured in a spreadsheet. But wine has ideas of its own. What begins as naked elements puts on character with age. Wine has culture that can be cultivated or interrupted from moment to mom',
    'Overview of the Wine We have all the instruments and algorithms that modern vintners use, and these are helpful for making the wine hold together in the bottle. We see to the technical components, the raw materials, fruit, sourcing, uniqueness of terroir; all of the observational, empirical inputs that can be captured in a spreadsheet. But wine has ideas of its own. What begins as naked elements puts on character with age. Wine has culture that can be cultivated or interrupted from moment to mom',
    '["versatile pairing"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/products/Aether-Sanford-Benedict-Pinot-Noir-Sta-Rita-Hills-California-2019.jpg',
    62.95,
    62.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Agricola Punica
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Agricola Punica',
    'agricola-punica-lou-wine-shop',
    'Sardinia',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Barrua Isola dei Nuraghi IGT, Sardinia, Italy, 2020',
    'agricola-punica-barrua-isola-dei-nuraghi-igt-sardinia-italy-2020-lou-wine-shop',
    'Merlot',
    'Sardinia',
    'Italy',
    2020,
    'Overview of the Wine An undertaking between world renowned names in the winemaking business, Agricola Punica is a joint venture between Dr. Sebastiano Rosa, Sardinian winery Cantina Sociale di Santadi, Tenuta San Guido, Santadi President Antonello Pilloni and legendary Tuscan consulting oenologist Giacomo Tachis. Sebastiano Rosa, oenologist and winemaker at Tenuta San Guido since 2000 and Santadi, the highly respected Sardinian cooperative, represent the majority ownership, with forty percent ea',
    'Overview of the Wine An undertaking between world renowned names in the winemaking business, Agricola Punica is a joint venture between Dr. Sebastiano Rosa, Sardinian winery Cantina Sociale di Santadi, Tenuta San Guido, Santadi President Antonello Pilloni and legendary Tuscan consulting oenologist Giacomo Tachis. Sebastiano Rosa, oenologist and winemaker at Tenuta San Guido since 2000 and Santadi, the highly respected Sardinian cooperative, represent the majority ownership, with forty percent ea',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":3,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Agricola_Punica_Barrua_Isola_dei_Nuraghi_IGT_Sardinia_Italy_2020.jpg',
    48.95,
    48.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- =========================================================================
  -- RETAILER 9: The Wine House
  -- Location: West Los Angeles
  -- =========================================================================

  INSERT INTO public.organizations (id, name, slug, metadata)
  VALUES (
    gen_random_uuid(),
    'The Wine House',
    'the-wine-house',
    '{"location":"West Los Angeles","tagline":"LA wine institution since 1973 — tastings, classes, and community"}'::jsonb
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, metadata = EXCLUDED.metadata
  RETURNING id INTO _org_id;

  -- Producer: Aia Vecchia
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Aia Vecchia',
    'aia-vecchia-the-wine-house',
    'Bordeaux',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Lagone, Toscana IGT, Italy, 2023 (Top Value)',
    'aia-vecchia-lagone-toscana-igt-italy-2023-top-value-the-wine-house',
    'Merlot',
    'Bordeaux',
    'Italy',
    2023,
    'TOP VALUE! Overview of the Wine The Pellegrini family, Aia Vecchia''s owners, have been grape growers in the Bolgheri area for several generations and have sold their grapes to many of the most notable wineries in the region for decades. After replanting their original vineyards in 1995, the following year they took the plunge and established their own winery with the goal of creating a portfolio of small-lot, high-quality Super Tuscan blends focusing on Bordeaux grape varieties. With the help of',
    'TOP VALUE! Overview of the Wine The Pellegrini family, Aia Vecchia''s owners, have been grape growers in the Bolgheri area for several generations and have sold their grapes to many of the most notable wineries in the region for decades. After replanting their original vineyards in 1995, the following year they took the plunge and established their own winery with the goal of creating a portfolio of small-lot, high-quality Super Tuscan blends focusing on Bordeaux grape varieties. With the help of',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":3,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Aia_Vecchia_Lagone_Toscana_IGT_Italy_2023.jpg',
    20.95,
    20.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Alain Courreges
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alain Courreges',
    'alain-courreges-the-wine-house',
    'Corsica',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Domaine de Vaccelli, Granit Rouge, Corsica, France, 2022',
    'alain-courreges-domaine-de-vaccelli-granit-rouge-corsica-france-2022-the-wine-house',
    NULL,
    'Corsica',
    'France',
    2022,
    'Overview of the Wine Domaine de Vaccelli is a leading producer of modern Corsican wines, with a focus on typical Corsican grape varieties that form the pillars of the Ajaccio appellation and terroir. The vineyard is committed to manual harvesting and organic farming, and was certified as organic in 2019. The vineyard''s 25 hectares of vines are planted on hillsides with granite arenas, producing exceptional wines like the Chioso Novo cuvée and Aja Donica, crafted from a parcel selection of Vermen',
    'Overview of the Wine Domaine de Vaccelli is a leading producer of modern Corsican wines, with a focus on typical Corsican grape varieties that form the pillars of the Ajaccio appellation and terroir. The vineyard is committed to manual harvesting and organic farming, and was certified as organic in 2019. The vineyard''s 25 hectares of vines are planted on hillsides with granite arenas, producing exceptional wines like the Chioso Novo cuvée and Aja Donica, crafted from a parcel selection of Vermen',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Alain_Courreges_Domaine_de_Vaccelli_Granit_Rouge_Corsica_France_2022.jpg',
    96.95,
    96.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Domaine de Vaccelli, Quartz Blanc, Corsica, France, 2023',
    'alain-courreges-domaine-de-vaccelli-quartz-blanc-corsica-france-2023-the-wine-house',
    NULL,
    'Corsica',
    'France',
    2023,
    'Overview of the Wine Domaine de Vaccelli is a leading producer of modern Corsican wines, with a focus on typical Corsican grape varieties that form the pillars of the Ajaccio appellation and terroir. The vineyard is committed to manual harvesting and organic farming, and was certified as organic in 2019. The vineyard''s 25 hectares of vines are planted on hillsides with granite arenas, producing exceptional wines like the Chioso Novo cuvée and Aja Donica, crafted from a parcel selection of Vermen',
    'Overview of the Wine Domaine de Vaccelli is a leading producer of modern Corsican wines, with a focus on typical Corsican grape varieties that form the pillars of the Ajaccio appellation and terroir. The vineyard is committed to manual harvesting and organic farming, and was certified as organic in 2019. The vineyard''s 25 hectares of vines are planted on hillsides with granite arenas, producing exceptional wines like the Chioso Novo cuvée and Aja Donica, crafted from a parcel selection of Vermen',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Alain_Courreges_Domaine_de_Vaccelli_Quartz_Blanc_Corsica_France_2023.jpg',
    95.95,
    95.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Alain Graillot
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alain Graillot',
    'alain-graillot-the-wine-house',
    'Rhone',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Crozes Hermitage Rouge, Rhône Valley, France, 2020',
    'alain-graillot-crozes-hermitage-rouge-rhone-valley-france-2020-the-wine-house',
    'Syrah',
    'Rhone',
    'France',
    2020,
    'Overview of the Brand Northern Rhône native, Alain Graillot, is recognized for his passion of Syrah. Prior to starting his own domaine, Alain worked in Burgundy, where he received guidance from the reputable Jacques Seysses of Domaine Dujac. In 1985, Alain founded Domaine Alain Graillot just outside the village of Pont de l''Isère, about 6 km south of Tain-l''Hermitage. He is now considered one of the most highly sought-after producers in the Northern Rhône due to his exuberant, robust and impecca',
    'Overview of the Brand Northern Rhône native, Alain Graillot, is recognized for his passion of Syrah. Prior to starting his own domaine, Alain worked in Burgundy, where he received guidance from the reputable Jacques Seysses of Domaine Dujac. In 1985, Alain founded Domaine Alain Graillot just outside the village of Pont de l''Isère, about 6 km south of Tain-l''Hermitage. He is now considered one of the most highly sought-after producers in the Northern Rhône due to his exuberant, robust and impecca',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/products/Alain-Graillot-Crozes-Hermitage-Rouge-Rhone-Valley-France-2020.jpg',
    44.95,
    44.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Alban Vineyards
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alban Vineyards',
    'alban-vineyards-the-wine-house',
    'Rhone',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Patrina Estate Syrah, Central Coast, California, 2021',
    'alban-vineyards-patrina-estate-syrah-central-coast-california-2021-the-wine-house',
    'Syrah',
    'Rhone',
    'United States',
    2021,
    'Overview of the Wine Alban Vineyards is the first America winery and vineyard established exclusively for Rhone varieties. Conceived at a time when there were virtually only two "flavors" of wine produced in the U.S., they set out to introduce wine grapes that would offer oenephiles a new world of possibilities. Pioneering Roussanne, Grenache Noir and Viognier to go along with meticulously selected clones of Syrah, Alban Vineyards has guided consumers and producers to the enormous potential of R',
    'Overview of the Wine Alban Vineyards is the first America winery and vineyard established exclusively for Rhone varieties. Conceived at a time when there were virtually only two "flavors" of wine produced in the U.S., they set out to introduce wine grapes that would offer oenephiles a new world of possibilities. Pioneering Roussanne, Grenache Noir and Viognier to go along with meticulously selected clones of Syrah, Alban Vineyards has guided consumers and producers to the enormous potential of R',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Alban_Vineyards_Patrina_Estate_Syrah_Central_Coast_California_2021.jpg',
    65.95,
    65.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Alban
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alban',
    'alban-the-wine-house',
    'Rhone',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Viognier, Central Coast, California, 2023',
    'alban-viognier-central-coast-california-2023-the-wine-house',
    'Viognier',
    'Rhone',
    'United States',
    2023,
    'Overview of the Wine Alban Vineyards is the first America winery and vineyard established exclusively for Rhone varieties. Conceived at a time when there were virtually only two "flavors" of wine produced in the U.S., they set out to introduce wine grapes that would offer oenephiles a new world of possibilities. Pioneering Roussanne, Grenache Noir and Viognier to go along with meticulously selected clones of Syrah, Alban Vineyards has guided consumers and producers to the enormous potential of R',
    'Overview of the Wine Alban Vineyards is the first America winery and vineyard established exclusively for Rhone varieties. Conceived at a time when there were virtually only two "flavors" of wine produced in the U.S., they set out to introduce wine grapes that would offer oenephiles a new world of possibilities. Pioneering Roussanne, Grenache Noir and Viognier to go along with meticulously selected clones of Syrah, Alban Vineyards has guided consumers and producers to the enormous potential of R',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":1,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Alban_Viognier_CentralCoast_California_2023.jpg',
    31.95,
    31.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Aldo Conterno
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Aldo Conterno',
    'aldo-conterno-the-wine-house',
    'Piedmont',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Barolo Bussia, Piedmont, Italy, 2008',
    'aldo-conterno-barolo-bussia-piedmont-italy-2008-the-wine-house',
    'Nebbiolo',
    'Piedmont',
    'Italy',
    2008,
    'Overview of the Wine The story of Poderi Aldo Conterno, one of the elite, historic Barolo producers, is a tale of great passion for winemaking that winds back across generations and crosses international borders. While the Langhe Rosso, Chardonnay "Bussiador", Barbera d''Alba "Conca Tre Pile" and Nebbiolo "Favot" represent a nod to modern winemaking techniques, the Barolo wines remain firmly in the traditionalist camp, aged in large Slavonian-oak botte before bottling. Only indigenous yeasts and',
    'Overview of the Wine The story of Poderi Aldo Conterno, one of the elite, historic Barolo producers, is a tale of great passion for winemaking that winds back across generations and crosses international borders. While the Langhe Rosso, Chardonnay "Bussiador", Barbera d''Alba "Conca Tre Pile" and Nebbiolo "Favot" represent a nod to modern winemaking techniques, the Barolo wines remain firmly in the traditionalist camp, aged in large Slavonian-oak botte before bottling. Only indigenous yeasts and',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":5,"acidity":5}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Aldo_Conterno_Barolo_Bussia_Piedmont_Italy_2008.jpg',
    129.95,
    129.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Barolo Bussia, Piedmont, Italy, 2017',
    'aldo-conterno-barolo-bussia-piedmont-italy-2017-the-wine-house',
    'Nebbiolo',
    'Piedmont',
    'Italy',
    2017,
    'Overview of the Wine The story of Poderi Aldo Conterno, one of the elite, historic Barolo producers, is a tale of great passion for winemaking that winds back across generations and crosses international borders. While the Langhe Rosso, Chardonnay "Bussiador", Barbera d''Alba "Conca Tre Pile" and Nebbiolo "Favot" represent a nod to modern winemaking techniques, the Barolo wines remain firmly in the traditionalist camp, aged in large Slavonian-oak botte before bottling. Only indigenous yeasts and',
    'Overview of the Wine The story of Poderi Aldo Conterno, one of the elite, historic Barolo producers, is a tale of great passion for winemaking that winds back across generations and crosses international borders. While the Langhe Rosso, Chardonnay "Bussiador", Barbera d''Alba "Conca Tre Pile" and Nebbiolo "Favot" represent a nod to modern winemaking techniques, the Barolo wines remain firmly in the traditionalist camp, aged in large Slavonian-oak botte before bottling. Only indigenous yeasts and',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":5,"acidity":5}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/products/Aldo-Conterno-Barolo-Bussia-Piedmont-Italy-2017.jpg',
    119.95,
    119.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Kermit Lynch
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Kermit Lynch',
    'kermit-lynch-the-wine-house',
    'Piedmont',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Alessandro & Gian Natale Fantino Barolo "Chinato" Piedmont, Italy, NV',
    'alessandro-gian-natale-fantino-barolo-chinato-piedmont-italy-nv-the-wine-house',
    'Nebbiolo',
    'Piedmont',
    'Italy',
    NULL,
    'Overview of the Wine Two brothers, Alessandro and Gian Natale Fantino, run this family estate in Monforte d''Alba. Alessandro managed the vineyards and served as the enologist at Cantina Bartolo Mascarello for 20 years, from 1978 to 1997. Since 1998, he has dedicated himself to running his family estate alongside his brother full-time. The brothers farm eight hectares in the heart of the historic Bussia cru north of Monforte, one of Barolo''s most famous areas for producing wines of great longevit',
    'Overview of the Wine Two brothers, Alessandro and Gian Natale Fantino, run this family estate in Monforte d''Alba. Alessandro managed the vineyards and served as the enologist at Cantina Bartolo Mascarello for 20 years, from 1978 to 1997. Since 1998, he has dedicated himself to running his family estate alongside his brother full-time. The brothers farm eight hectares in the heart of the historic Bussia cru north of Monforte, one of Barolo''s most famous areas for producing wines of great longevit',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":5,"acidity":5}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/products/Alessandro-Gian-Natale-Fantino-Barolo-Chinato-Piedmont-Italy-NV.jpg',
    39.95,
    39.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Alex Foillard
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alex Foillard',
    'alex-foillard-the-wine-house',
    'Beaujolais',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Côte de Brouilly, Beaujolais, France, 2020',
    'alex-foillard-cote-de-brouilly-beaujolais-france-2020-the-wine-house',
    'Gamay',
    'Beaujolais',
    'France',
    2020,
    'Overview of the Wine The son of Jean and Agnès Foillard, Alex began working at their Morgon domaine in 2015 and in parallel created his own estate with the purchase of vineyards in Brouilly. Prior to he studied and developed his winemaking skills in Montpellier, Beaune, Australia and Japan. Alex follows his father''s philosophy: a lot of work in the vineyards and a minimum of intervention in the cellar, to ensure the final product reveals the nuances of the terroir. Anytime you hear the words "Fo',
    'Overview of the Wine The son of Jean and Agnès Foillard, Alex began working at their Morgon domaine in 2015 and in parallel created his own estate with the purchase of vineyards in Brouilly. Prior to he studied and developed his winemaking skills in Montpellier, Beaune, Australia and Japan. Alex follows his father''s philosophy: a lot of work in the vineyards and a minimum of intervention in the cellar, to ensure the final product reveals the nuances of the terroir. Anytime you hear the words "Fo',
    '["versatile pairing"]'::jsonb,
    '{"body":2,"sweetness":1,"tannin":2,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/products/Alex-Foillard-Cote-de-Brouilly-Beaujolais-France-2020.jpg',
    43.95,
    43.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Alfaro Family
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alfaro Family',
    'alfaro-family-the-wine-house',
    NULL,
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Trout Gulch Vineyard Estate Pinot Noir, Santa Cruz County, California, 2021',
    'alfaro-family-trout-gulch-vineyard-estate-pinot-noir-santa-cruz-county-california-2021-the-wine-house',
    'Pinot Noir',
    NULL,
    'United States',
    2021,
    'Overview of the Wine After a long and satisfying career as the founder of Alfaro''s Micro Bakery, one of California''s premier gourmet bakeries, Richard Alfaro was presented with a unique opportunity in the form of an aging 75 acre apple farm in Corralitos. An offer was made on the baking company by an interested buyer, and in 1998 this forgotten piece of land was lovingly transformed by Richard and his wife Mary Kay, into what is now known as Alfaro Family Vineyards & Winery. In the ensuing years',
    'Overview of the Wine After a long and satisfying career as the founder of Alfaro''s Micro Bakery, one of California''s premier gourmet bakeries, Richard Alfaro was presented with a unique opportunity in the form of an aging 75 acre apple farm in Corralitos. An offer was made on the baking company by an interested buyer, and in 1998 this forgotten piece of land was lovingly transformed by Richard and his wife Mary Kay, into what is now known as Alfaro Family Vineyards & Winery. In the ensuing years',
    '["versatile pairing"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/AlfaroFamily_TroutGulchVineyardPinotNoir_SantaCruzMountains_California_2021.jpg',
    39.95,
    39.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Allan Scott
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Allan Scott',
    'allan-scott-the-wine-house',
    'Marlborough',
    'New Zealand',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Sauvignon Blanc, Marlborough, New Zealand, 2025',
    'allan-scott-sauvignon-blanc-marlborough-new-zealand-2025-the-wine-house',
    'Sauvignon Blanc',
    'Marlborough',
    'New Zealand',
    2025,
    'Overview of the Wine Allan Scott is synonymous with wine in Marlborough: he has worked every harvest since 1973 and is credited with planting some of the region''s most famous vineyards, including the very first. In 1990, Allan and his wife Catherine established Allan Scott Wines as one of the first independent wineries of Marlborough. Since its inception, the winery has produced wines consistent in flavor and quality year after year while continually evolving to keep ahead of the changing demand',
    'Overview of the Wine Allan Scott is synonymous with wine in Marlborough: he has worked every harvest since 1973 and is credited with planting some of the region''s most famous vineyards, including the very first. In 1990, Allan and his wife Catherine established Allan Scott Wines as one of the first independent wineries of Marlborough. Since its inception, the winery has produced wines consistent in flavor and quality year after year while continually evolving to keep ahead of the changing demand',
    '["versatile pairing"]'::jsonb,
    '{"body":2,"sweetness":1,"tannin":1,"acidity":5}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Allan_Scott_Sauvignon_Blanc_Marlborough_New_Zealand_2025_9e54d052-32c6-4383-b1ae-92c8ed1c4115.jpg',
    14.95,
    14.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Alma Rosa
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alma Rosa',
    'alma-rosa-the-wine-house',
    'Santa Barbara',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '''El Jabali,'' Pinot Noir, Sta. Rita Hills, Santa Barbara, California, 2021',
    'alma-rosa-el-jabali-pinot-noir-sta-rita-hills-santa-barbara-california-2021-the-wine-house',
    'Pinot Noir',
    'Santa Barbara',
    'United States',
    2021,
    'Overview of the Wine Situated on the north-facing slopes of the Santa Rita Hills in Santa Barbara County, the Alma Rosa estate vineyard, El Jabali, was first planted in 1983 by California wine pioneer Richard Sanford, who founded Alma Rosa Winery in 2005. Today, our 628-acre estate has five distinct vineyard sites planted to Pinot Noir, Chardonnay, Syrah and Grenache that stretch from the valley floor to 850'' in elevation. Our total 40 vineyard acres comprise a small portion of our ranch and are',
    'Overview of the Wine Situated on the north-facing slopes of the Santa Rita Hills in Santa Barbara County, the Alma Rosa estate vineyard, El Jabali, was first planted in 1983 by California wine pioneer Richard Sanford, who founded Alma Rosa Winery in 2005. Today, our 628-acre estate has five distinct vineyard sites planted to Pinot Noir, Chardonnay, Syrah and Grenache that stretch from the valley floor to 850'' in elevation. Our total 40 vineyard acres comprise a small portion of our ranch and are',
    '["versatile pairing"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Alma_Rosa_El_Jabali_Pinot_Noir_Sta_Rita_Hills_Santa_Barbara_California_2021.jpg',
    99.95,
    99.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Chardonnay, Sta. Rita Hills, Santa Barbara, California, 2023',
    'alma-rosa-chardonnay-sta-rita-hills-santa-barbara-california-2023-the-wine-house',
    'Chardonnay',
    'Santa Barbara',
    'United States',
    2023,
    'Top Value from a Top Producer! Overview of the Wine Situated on the north-facing slopes of the Santa Rita Hills in Santa Barbara County, the Alma Rosa estate vineyard, El Jabali, was first planted in 1983 by California wine pioneer Richard Sanford, who founded Alma Rosa Winery in 2005. Today, our 628-acre estate has five distinct vineyard sites planted to Pinot Noir, Chardonnay, Syrah and Grenache that stretch from the valley floor to 850'' in elevation. Our total 40 vineyard acres comprise a sma',
    'Top Value from a Top Producer! Overview of the Wine Situated on the north-facing slopes of the Santa Rita Hills in Santa Barbara County, the Alma Rosa estate vineyard, El Jabali, was first planted in 1983 by California wine pioneer Richard Sanford, who founded Alma Rosa Winery in 2005. Today, our 628-acre estate has five distinct vineyard sites planted to Pinot Noir, Chardonnay, Syrah and Grenache that stretch from the valley floor to 850'' in elevation. Our total 40 vineyard acres comprise a sma',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":1,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Alma_Rosa_Chardonnay_Sta._Rita_Hills_Santa_Barbara_California_2023.jpg',
    29.90,
    29.90,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Almacerro
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Almacerro',
    'almacerro-the-wine-house',
    'Napa Valley',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Estate Cabernet Sauvignon, Howell Mountain, Napa Valley, 2018',
    'almacerro-estate-cabernet-sauvignon-howell-mountain-napa-valley-2018-the-wine-house',
    'Cabernet Sauvignon',
    'Napa Valley',
    'United States',
    2018,
    'About The Producer We fell in love with a Napa we came to know in the early 1980s, which is to say a Napa that hadn''t changed much since the repeal of Prohibition. Farmers and winemakers tasting out of their cellars, unabashedly agrarian and bucolic. Remote and often wild places; even on the well-traveled Silverado Trail you felt like you were miles in the country. So when we started looking for a vineyard, we knew exactly what we wanted. We wanted our own piece of dirt, high up on Howell Mounta',
    'About The Producer We fell in love with a Napa we came to know in the early 1980s, which is to say a Napa that hadn''t changed much since the repeal of Prohibition. Farmers and winemakers tasting out of their cellars, unabashedly agrarian and bucolic. Remote and often wild places; even on the well-traveled Silverado Trail you felt like you were miles in the country. So when we started looking for a vineyard, we knew exactly what we wanted. We wanted our own piece of dirt, high up on Howell Mounta',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Almacerro_EstateCabernetSauvignon_HowellMountain_NapaValley_2018.jpg',
    214.79,
    214.79,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Estate Cabernet Sauvignon, Howell Mountain, Napa Valley, 2019',
    'almacerro-estate-cabernet-sauvignon-howell-mountain-napa-valley-2019-the-wine-house',
    'Cabernet Sauvignon',
    'Napa Valley',
    'United States',
    2019,
    'About The Producer We fell in love with a Napa we came to know in the early 1980s, which is to say a Napa that hadn''t changed much since the repeal of Prohibition. Farmers and winemakers tasting out of their cellars, unabashedly agrarian and bucolic. Remote and often wild places; even on the well-traveled Silverado Trail you felt like you were miles in the country. So when we started looking for a vineyard, we knew exactly what we wanted. We wanted our own piece of dirt, high up on Howell Mounta',
    'About The Producer We fell in love with a Napa we came to know in the early 1980s, which is to say a Napa that hadn''t changed much since the repeal of Prohibition. Farmers and winemakers tasting out of their cellars, unabashedly agrarian and bucolic. Remote and often wild places; even on the well-traveled Silverado Trail you felt like you were miles in the country. So when we started looking for a vineyard, we knew exactly what we wanted. We wanted our own piece of dirt, high up on Howell Mounta',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Almacerro_Estate_Cabernet_Sauvignon_Howell_Mountain_Napa_Valley_2019.jpg',
    219.95,
    219.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- =========================================================================
  -- RETAILER 10: Good Luck Wine Shop
  -- Location: Pasadena
  -- =========================================================================

  INSERT INTO public.organizations (id, name, slug, metadata)
  VALUES (
    gen_random_uuid(),
    'Good Luck Wine Shop',
    'good-luck-wine-shop',
    '{"location":"Pasadena","tagline":"Eclectic wines and good vibes in Old Town Pasadena"}'::jsonb
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, metadata = EXCLUDED.metadata
  RETURNING id INTO _org_id;

  -- Producer: Almaviva Red
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Almaviva Red',
    'almaviva-red-good-luck-wine-shop',
    NULL,
    'Chile',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Puente Alto, Maipo Valley, Chile, 2017 - 100 Points',
    'almaviva-red-puente-alto-maipo-valley-chile-2017-100-points-good-luck-wine-shop',
    'Cabernet Sauvignon',
    NULL,
    'Chile',
    2017,
    'Overview of the Wine Almaviva is the name of both winery and wine born of the joint venture between Baron Philippe de Rothschild and Viña Concha y Toro. It is also that of Pierre de Beaumarchais'' character, the "Count of Almaviva" in his Marriage of Figaro, a work Wolfang Amadeus Mozart later turned into one of the most popular operas ever. The classical epithet, laid out in Pierre de Beaumarchais'' fair hand, shares the label with insignia of pre-hispanic roots symbolizing a union of European an',
    'Overview of the Wine Almaviva is the name of both winery and wine born of the joint venture between Baron Philippe de Rothschild and Viña Concha y Toro. It is also that of Pierre de Beaumarchais'' character, the "Count of Almaviva" in his Marriage of Figaro, a work Wolfang Amadeus Mozart later turned into one of the most popular operas ever. The classical epithet, laid out in Pierre de Beaumarchais'' fair hand, shares the label with insignia of pre-hispanic roots symbolizing a union of European an',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/products/Almaviva-Red-Puente-Alto-Maipo-Valley-Chile-2017.jpg',
    219.95,
    219.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Alpha Estate
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alpha Estate',
    'alpha-estate-good-luck-wine-shop',
    NULL,
    'Greece',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Axia, Syrah/Xinomavro, Florina, Greece, 2021',
    'alpha-estate-axia-syrah-xinomavro-florina-greece-2021-good-luck-wine-shop',
    'Syrah',
    NULL,
    'Greece',
    2021,
    'Overview of the Wine Alpha Estate was founded in 1997 by the experienced viticulturist Makis Mavridis and chemist-oenologist Angelos Iatridis, who, after years of experience in various locations of Greece and abroad, chose the Amyndeon region to create his own wine. The knowledge and love for winemaking was passed on to the next generation. Angeliki Iatridou and Emorfili Mavridou carry on the tradition today, aspiring to evolve, while participating in the team''s common vision. Human factor is in',
    'Overview of the Wine Alpha Estate was founded in 1997 by the experienced viticulturist Makis Mavridis and chemist-oenologist Angelos Iatridis, who, after years of experience in various locations of Greece and abroad, chose the Amyndeon region to create his own wine. The knowledge and love for winemaking was passed on to the next generation. Angeliki Iatridou and Emorfili Mavridou carry on the tradition today, aspiring to evolve, while participating in the team''s common vision. Human factor is in',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Alpha_Estate_Axia_Syrah_Xinomavro_Florina_Greece_2021.jpg',
    24.95,
    24.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Ecosystem, Xinomavro Reserve, Old Vines, Barba Yannis, Amyndeon, Greece, 2021',
    'alpha-estate-ecosystem-xinomavro-reserve-old-vines-barba-yannis-amyndeon-greece-2021-good-luck-wine-shop',
    NULL,
    NULL,
    'Greece',
    2021,
    'Overview of the Wine Alpha Estate was founded in 1997 by the experienced viticulturist Makis Mavridis and chemist-oenologist Angelos Iatridis, who, after years of experience in various locations of Greece and abroad, chose the Amyndeon region to create his own wine. The knowledge and love for winemaking was passed on to the next generation. Angeliki Iatridou and Emorfili Mavridou carry on the tradition today, aspiring to evolve, while participating in the team''s common vision. Human factor is in',
    'Overview of the Wine Alpha Estate was founded in 1997 by the experienced viticulturist Makis Mavridis and chemist-oenologist Angelos Iatridis, who, after years of experience in various locations of Greece and abroad, chose the Amyndeon region to create his own wine. The knowledge and love for winemaking was passed on to the next generation. Angeliki Iatridou and Emorfili Mavridou carry on the tradition today, aspiring to evolve, while participating in the team''s common vision. Human factor is in',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Alpha_Estate_Ecosystem_Xinomavro_Reserve_Old_Vines_Barba_Yannis_Amyndeon_Greece_2021_9cba150a-7b87-4935-abf3-24d616e2aa7c.jpg',
    42.95,
    42.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Alphonse Mellot
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alphonse Mellot',
    'alphonse-mellot-good-luck-wine-shop',
    'Sancerre',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Satellite Sancerre Blanc, Loire Valley, France, 2016',
    'alphonse-mellot-satellite-sancerre-blanc-loire-valley-france-2016-good-luck-wine-shop',
    'Sauvignon Blanc',
    'Sancerre',
    'France',
    2016,
    'Overview of the Wine As far back as the XVI century, in 1513 to be exact, the local records mention the MELLOT family, whose life even at that time was governed by the seasons of the vine and the production of wines of excellent quality. The Mellot family, vinegrowers and wine merchants, was again mentioned during the siege of the town. They pursued their patient labours and continued to gain recognition because César Mellot was appointed as Wine Advisor to Louis XIV in 1698. At the beginning of',
    'Overview of the Wine As far back as the XVI century, in 1513 to be exact, the local records mention the MELLOT family, whose life even at that time was governed by the seasons of the vine and the production of wines of excellent quality. The Mellot family, vinegrowers and wine merchants, was again mentioned during the siege of the town. They pursued their patient labours and continued to gain recognition because César Mellot was appointed as Wine Advisor to Louis XIV in 1698. At the beginning of',
    '["versatile pairing"]'::jsonb,
    '{"body":2,"sweetness":1,"tannin":1,"acidity":5}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Alphonse-Mellot-Satellite-Sancerre-Blanc-Loire-Valley-France-2016.jpg',
    79.95,
    79.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Altamura
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Altamura',
    'altamura-good-luck-wine-shop',
    'Napa Valley',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Cabernet Sauvignon, Napa Valley, California, 2019',
    'altamura-cabernet-sauvignon-napa-valley-california-2019-good-luck-wine-shop',
    'Cabernet Sauvignon',
    'Napa Valley',
    'United States',
    2019,
    'Overview of the Wine Altamura Vineyards and Winery, established in 1985 by Frank and Karen Altamura, is the only winery in Wooden Valley located within the Napa Valley appellation. Napa natives Frank and Karen have a decidedly hands-on approach to every step of the growing and winemaking process. Thus, a natural production limit is established at the Altamura Ranch and the wines reflect the Altamura''s deep commitment to reflecting the terroir of Wooden Valley. Frank Altamura''s lifelong pursuit a',
    'Overview of the Wine Altamura Vineyards and Winery, established in 1985 by Frank and Karen Altamura, is the only winery in Wooden Valley located within the Napa Valley appellation. Napa natives Frank and Karen have a decidedly hands-on approach to every step of the growing and winemaking process. Thus, a natural production limit is established at the Altamura Ranch and the wines reflect the Altamura''s deep commitment to reflecting the terroir of Wooden Valley. Frank Altamura''s lifelong pursuit a',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Altamura_Cabernet_Sauvignon_Napa_Valley_California_2019.jpg',
    128.95,
    128.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Altesino
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Altesino',
    'altesino-good-luck-wine-shop',
    'Tuscany',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Brunello di Montalcino, Tuscany, Italy, 2019',
    'altesino-brunello-di-montalcino-tuscany-italy-2019-good-luck-wine-shop',
    'Sangiovese',
    'Tuscany',
    'Italy',
    2019,
    'Overview of the Wine Near the end of 2002, Elisabetta Gnudi Angelini, owner of nearby Tenuta Caparzo, purchased the Altesino winery. Today''s winemaking team, led by Simone Giunti and Alessandro Ciacci, is firmly committed to maintaining Altesino''s hard-earned reputation as a Montalcino institution and a global leader in innovative winemaking. Amid the eastern hills of Montalcino near Siena in central Tuscany, stands the magnificently elegant 14th century-built Palazzo Altesi, home to the Altesin',
    'Overview of the Wine Near the end of 2002, Elisabetta Gnudi Angelini, owner of nearby Tenuta Caparzo, purchased the Altesino winery. Today''s winemaking team, led by Simone Giunti and Alessandro Ciacci, is firmly committed to maintaining Altesino''s hard-earned reputation as a Montalcino institution and a global leader in innovative winemaking. Amid the eastern hills of Montalcino near Siena in central Tuscany, stands the magnificently elegant 14th century-built Palazzo Altesi, home to the Altesin',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":4,"acidity":5}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Altesino_BrunellodiMontalcino_Tuscany_Italy_2019.jpg',
    59.95,
    59.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Alto Moncayo
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alto Moncayo',
    'alto-moncayo-good-luck-wine-shop',
    NULL,
    'Spain',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '''Moncayo'', Garnacha, Campo de Borja, Spain, 2020',
    'alto-moncayo-moncayo-garnacha-campo-de-borja-spain-2020-good-luck-wine-shop',
    'Grenache',
    NULL,
    'Spain',
    2020,
    'The 2021 vintage is now available here. Overview of the Wine Bodegas Alto Moncayo is a winery located in the Campo de Borja D.O. It was founded in 2002 with the aim of turning it into a world reference for Garnacha wines of the highest quality, crafted from some of the oldest native vine clones in the area.The garnacha grape is one of the varieties that best expresses its terroir. Thus, the Garnacha of Alto Moncayo is different from the rest of the Campo de Borja D.O area. This is due to the ver',
    'The 2021 vintage is now available here. Overview of the Wine Bodegas Alto Moncayo is a winery located in the Campo de Borja D.O. It was founded in 2002 with the aim of turning it into a world reference for Garnacha wines of the highest quality, crafted from some of the oldest native vine clones in the area.The garnacha grape is one of the varieties that best expresses its terroir. Thus, the Garnacha of Alto Moncayo is different from the rest of the Campo de Borja D.O area. This is due to the ver',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":3,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/AltoMoncayo_Moncayo_CampodeBorja_Spain_2020.jpg',
    49.95,
    49.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '''Moncayo'', Garnacha, Campo de Borja, Spain, 2021',
    'alto-moncayo-moncayo-garnacha-campo-de-borja-spain-2021-good-luck-wine-shop',
    'Grenache',
    NULL,
    'Spain',
    2021,
    'The 2020 vintage is still available here - click here. Overview of the Wine Bodegas Alto Moncayo is a winery located in the Campo de Borja D.O. It was founded in 2002 with the aim of turning it into a world reference for Garnacha wines of the highest quality, crafted from some of the oldest native vine clones in the area.The garnacha grape is one of the varieties that best expresses its terroir. Thus, the Garnacha of Alto Moncayo is different from the rest of the Campo de Borja D.O area. This is',
    'The 2020 vintage is still available here - click here. Overview of the Wine Bodegas Alto Moncayo is a winery located in the Campo de Borja D.O. It was founded in 2002 with the aim of turning it into a world reference for Garnacha wines of the highest quality, crafted from some of the oldest native vine clones in the area.The garnacha grape is one of the varieties that best expresses its terroir. Thus, the Garnacha of Alto Moncayo is different from the rest of the Campo de Borja D.O area. This is',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":3,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Alto_Moncayo_Moncayo_Garnacha_Campo_de_Borja_Spain_2021_8a2a03a7-f5ac-4cfa-8c9e-2d41f661ad02.jpg',
    51.95,
    51.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '''Veraton'', Garnacha, Campo de Borja, Spain, 2021',
    'alto-moncayo-veraton-garnacha-campo-de-borja-spain-2021-good-luck-wine-shop',
    'Grenache',
    NULL,
    'Spain',
    2021,
    'Overview of the Wine Bodegas Alto Moncayo is a winery located in the Campo de Borja D.O. It was founded in 2002 with the aim of turning it into a world reference for Garnacha wines of the highest quality, crafted from some of the oldest native vine clones in the area.The garnacha grape is one of the varieties that best expresses its terroir. Thus, the Garnacha of Alto Moncayo is different from the rest of the Campo de Borja D.O area. This is due to the very strict selection made from the vineyar',
    'Overview of the Wine Bodegas Alto Moncayo is a winery located in the Campo de Borja D.O. It was founded in 2002 with the aim of turning it into a world reference for Garnacha wines of the highest quality, crafted from some of the oldest native vine clones in the area.The garnacha grape is one of the varieties that best expresses its terroir. Thus, the Garnacha of Alto Moncayo is different from the rest of the Campo de Borja D.O area. This is due to the very strict selection made from the vineyar',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":3,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Alto_Moncayo_Veraton_Garnacha_Campo_de_Borja_Spain_2021.jpg',
    36.79,
    36.79,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '''Veraton'', Garnacha, Campo de Borja, Spain, 2022',
    'alto-moncayo-veraton-garnacha-campo-de-borja-spain-2022-good-luck-wine-shop',
    'Grenache',
    NULL,
    'Spain',
    2022,
    'Overview of the Wine Bodegas Alto Moncayo is a winery located in the Campo de Borja D.O. It was founded in 2002 with the aim of turning it into a world reference for Garnacha wines of the highest quality, crafted from some of the oldest native vine clones in the area.The garnacha grape is one of the varieties that best expresses its terroir. Thus, the Garnacha of Alto Moncayo is different from the rest of the Campo de Borja D.O area. This is due to the very strict selection made from the vineyar',
    'Overview of the Wine Bodegas Alto Moncayo is a winery located in the Campo de Borja D.O. It was founded in 2002 with the aim of turning it into a world reference for Garnacha wines of the highest quality, crafted from some of the oldest native vine clones in the area.The garnacha grape is one of the varieties that best expresses its terroir. Thus, the Garnacha of Alto Moncayo is different from the rest of the Campo de Borja D.O area. This is due to the very strict selection made from the vineyar',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":3,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Alto_Moncayo_Veraton_Garnacha_Campo_de_Borja_Spain_2022.jpg',
    36.95,
    36.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Álvaro Palacios
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Álvaro Palacios',
    'alvaro-palacios-good-luck-wine-shop',
    'Priorat',
    'Spain',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Camins del Priorat, Priorat, Spain, 2023',
    'alvaro-palacios-camins-del-priorat-priorat-spain-2023-good-luck-wine-shop',
    'Grenache',
    'Priorat',
    'Spain',
    2023,
    'Overview of the Wine If anyone embodies the promise and spirit of "The New Spain," it''s Alvaro Palacios. His L''Ermita is widely considered—along with Peter Sisseck''s Dominio de Pingus—to be the most important new Spanish wine of the modern era. One of nine children born to the owners of Rioja''s respected Palacios Remondo, Alvaro studied enology in Bordeaux, while working under Jean-Pierre Moueix at Ch. Pétrus. He credits his tenure at Pétrus for much of his winemaking philosophy and for showing',
    'Overview of the Wine If anyone embodies the promise and spirit of "The New Spain," it''s Alvaro Palacios. His L''Ermita is widely considered—along with Peter Sisseck''s Dominio de Pingus—to be the most important new Spanish wine of the modern era. One of nine children born to the owners of Rioja''s respected Palacios Remondo, Alvaro studied enology in Bordeaux, while working under Jean-Pierre Moueix at Ch. Pétrus. He credits his tenure at Pétrus for much of his winemaking philosophy and for showing',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":3,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Alvaro-Palacios-Camins-del-Priorat-Priorat-Spain-2021.jpg',
    28.95,
    28.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Alvina Pernot
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alvina Pernot',
    'alvina-pernot-good-luck-wine-shop',
    'Burgundy',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Puligny-Montrachet, "Les Chalumaux," Premier Cru, Burgundy, France, 2023',
    'alvina-pernot-puligny-montrachet-les-chalumaux-premier-cru-burgundy-france-2023-good-luck-wine-shop',
    'Chardonnay',
    'Burgundy',
    'France',
    2023,
    'Overview of the Wine An exciting new arrival on the scene in the Côte de Beaune is Alvina Pernot, granddaughter of Paul Pernot of Domaine Paul Pernot and cousin of Philippe Pernot of Domaine Pernot Belicard. After working for three years at her grandfather''s domaine, Alvina and her husband, Philippe Abadie, set up a tiny domaine & maison in Puligny-Montrachet. Alvina and her husband favor earlier-picked fruit and higher-altitude parcels within the large Pernot holdings. Alvina and her husband se',
    'Overview of the Wine An exciting new arrival on the scene in the Côte de Beaune is Alvina Pernot, granddaughter of Paul Pernot of Domaine Paul Pernot and cousin of Philippe Pernot of Domaine Pernot Belicard. After working for three years at her grandfather''s domaine, Alvina and her husband, Philippe Abadie, set up a tiny domaine & maison in Puligny-Montrachet. Alvina and her husband favor earlier-picked fruit and higher-altitude parcels within the large Pernot holdings. Alvina and her husband se',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":1,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Alvina_Pernot_Puligny-Montrachet_Les_Chalumaux_Premier_Cru_Burgundy_France_2023.jpg',
    279.95,
    279.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Ameztoi Txakoli
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Ameztoi Txakoli',
    'ameztoi-txakoli-good-luck-wine-shop',
    NULL,
    'Spain',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Getariako Txakolina, Spain, 2024',
    'ameztoi-txakoli-getariako-txakolina-spain-2024-good-luck-wine-shop',
    NULL,
    NULL,
    'Spain',
    2024,
    'Overview of the Wine The Ameztoi Winery is pleased to offer you an authentic wine with total warranty and knowledge by five generations of winemakers. Since 1820 making and producing Txakoli. Old barrels, wood smell, bottle and laugh noises. This was the old Ameztoi and used to welcome many people. In fact, the Ameztoi family is widely known with the nickname "Criquet", symbol of joy, happiness and pride. Over time they have grown and improved their product to achieve their own expression, an au',
    'Overview of the Wine The Ameztoi Winery is pleased to offer you an authentic wine with total warranty and knowledge by five generations of winemakers. Since 1820 making and producing Txakoli. Old barrels, wood smell, bottle and laugh noises. This was the old Ameztoi and used to welcome many people. In fact, the Ameztoi family is widely known with the nickname "Criquet", symbol of joy, happiness and pride. Over time they have grown and improved their product to achieve their own expression, an au',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Ameztoi_Getariako_Txakolina_White_Blend_Spain_2024.jpg',
    25.95,
    25.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Amuse Bouche
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Amuse Bouche',
    'amuse-bouche-good-luck-wine-shop',
    'Napa Valley',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Proprietary Red, Napa Valley, California, 2021',
    'amuse-bouche-proprietary-red-napa-valley-california-2021-good-luck-wine-shop',
    'Merlot',
    'Napa Valley',
    'United States',
    2021,
    'Overview of the Wine Heidi Barrett grew up in the Napa Valley in a winemaking family and was destined to become one of California''s leading winemakers. It is said that winemaking is a combination of science and art. With a scientist-winemaker father and an artist mother it is no big surprise that Heidi was drawn to the wine industry. With great enthusiasm, a love for what she does, and an incredible wealth of experience, Heidi blends the art and science of winemaking like few can. In 2002, Heidi',
    'Overview of the Wine Heidi Barrett grew up in the Napa Valley in a winemaking family and was destined to become one of California''s leading winemakers. It is said that winemaking is a combination of science and art. With a scientist-winemaker father and an artist mother it is no big surprise that Heidi was drawn to the wine industry. With great enthusiasm, a love for what she does, and an incredible wealth of experience, Heidi blends the art and science of winemaking like few can. In 2002, Heidi',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":3,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/AmuseBouche_ProprietaryRed_NapaValley_California_2021.jpg',
    228.95,
    228.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Ancient Peaks
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Ancient Peaks',
    'ancient-peaks-good-luck-wine-shop',
    'Paso Robles',
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Cabernet Sauvignon, Santa Margarita Ranch, Paso Robles, California, 2021',
    'ancient-peaks-cabernet-sauvignon-santa-margarita-ranch-paso-robles-california-2021-good-luck-wine-shop',
    'Cabernet Sauvignon',
    'Paso Robles',
    'United States',
    2021,
    'Overview of the Wine We are a family-owned winery specializing in estate-grown wines from Margarita Vineyard, the southernmost vineyard in the Paso Robles appellation on California''s Central Coast. Just look at a map of Paso Robles wineries and at the very southern tip you will find our Vineyard. Here, amid the rugged Santa Lucia mountain range just 14 miles from the Pacific Ocean, Margarita Vineyard stands alone as the only vineyard in its vicinity, and thus the only vineyard to benefit from th',
    'Overview of the Wine We are a family-owned winery specializing in estate-grown wines from Margarita Vineyard, the southernmost vineyard in the Paso Robles appellation on California''s Central Coast. Just look at a map of Paso Robles wineries and at the very southern tip you will find our Vineyard. Here, amid the rugged Santa Lucia mountain range just 14 miles from the Pacific Ocean, Margarita Vineyard stands alone as the only vineyard in its vicinity, and thus the only vineyard to benefit from th',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Ancient-Peaks-Cabernet-Sauvignon-Paso-Robles-California-2021.jpg',
    18.95,
    18.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Zinfandel, Santa Margarita Ranch, Paso Robles, California, 2022',
    'ancient-peaks-zinfandel-santa-margarita-ranch-paso-robles-california-2022-good-luck-wine-shop',
    'Zinfandel',
    'Paso Robles',
    'United States',
    2022,
    'Overview of the Wine We are a family-owned winery specializing in estate-grown wines from Margarita Vineyard, the southernmost vineyard in the Paso Robles appellation on California''s Central Coast. Just look at a map of Paso Robles wineries and at the very southern tip you will find our Vineyard. Here, amid the rugged Santa Lucia mountain range just 14 miles from the Pacific Ocean, Margarita Vineyard stands alone as the only vineyard in its vicinity, and thus the only vineyard to benefit from th',
    'Overview of the Wine We are a family-owned winery specializing in estate-grown wines from Margarita Vineyard, the southernmost vineyard in the Paso Robles appellation on California''s Central Coast. Just look at a map of Paso Robles wineries and at the very southern tip you will find our Vineyard. Here, amid the rugged Santa Lucia mountain range just 14 miles from the Pacific Ocean, Margarita Vineyard stands alone as the only vineyard in its vicinity, and thus the only vineyard to benefit from th',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":2,"tannin":3,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0275/0441/0666/files/Ancient_Peaks_Zinfandel_Santa_Margarita_Ranch_Paso_Robles_California_2022.jpg',
    18.95,
    18.95,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- =========================================================================
  -- RETAILER 11: Stanley's Wet Goods
  -- Location: Culver City
  -- =========================================================================

  INSERT INTO public.organizations (id, name, slug, metadata)
  VALUES (
    gen_random_uuid(),
    'Stanley''s Wet Goods',
    'stanleys-wet-goods',
    '{"location":"Culver City","tagline":"Craft wines and artisan spirits in the heart of Culver City"}'::jsonb
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, metadata = EXCLUDED.metadata
  RETURNING id INTO _org_id;

  -- Producer: Aaron Petite
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Aaron Petite',
    'aaron-petite-stanleys-wet-goods',
    NULL,
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Aaron Petite Sirah',
    'aaron-petite-sirah-stanleys-wet-goods',
    'Petite Sirah',
    NULL,
    'United States',
    NULL,
    '100% Petite Sirah California > USA Full-bodied and inky with dark berry fruit, pepper spice, and firm tannins.',
    '100% Petite Sirah California > USA Full-bodied and inky with dark berry fruit, pepper spice, and firm tannins.',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":5,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/03a8dbca-d301-4b5a-9f99-616ee24311dc.jpg',
    54.00,
    54.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Abbondanza Bianco Pecorino
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Abbondanza Bianco Pecorino',
    'abbondanza-bianco-pecorino-stanleys-wet-goods',
    'Abruzzo',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '- 1 Liter',
    'abbondanza-bianco-pecorino-1-liter-stanleys-wet-goods',
    'Pecorino',
    'Abruzzo',
    'Italy',
    NULL,
    '100% Pecorino 1000 ml Abruzzo > Italy clean + crisp light + bright extremely crowd pleasing white wine crack open the cap for your arugula salad or to just kick back',
    '100% Pecorino 1000 ml Abruzzo > Italy clean + crisp light + bright extremely crowd pleasing white wine crack open the cap for your arugula salad or to just kick back',
    '["versatile pairing"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":1,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/d77a9ed3d59cde97756b65b0a7b1d5c0.jpg',
    21.00,
    21.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Abbondanza Montepulciano d'Abruzzo
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Abbondanza Montepulciano d''Abruzzo',
    'abbondanza-montepulciano-dabruzzo-stanleys-wet-goods',
    'Abruzzo',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '- 1 Liter',
    'abbondanza-montepulciano-dabruzzo-1-liter-stanleys-wet-goods',
    'Montepulciano',
    'Abruzzo',
    'Italy',
    NULL,
    '100% Montepulciano Abruzzo > Central Italy label artwork by Eric Junker Abbondanza is made right outside the gorgeous seaside town of Pescana Salty sea air and warm climate make this easy drinking medium bodied italian red Black cherry, dark fruits with hints of herbs, gluggable, easy drinking! PIZZA WINE ALERT !!!',
    '100% Montepulciano Abruzzo > Central Italy label artwork by Eric Junker Abbondanza is made right outside the gorgeous seaside town of Pescana Salty sea air and warm climate make this easy drinking medium bodied italian red Black cherry, dark fruits with hints of herbs, gluggable, easy drinking! PIZZA WINE ALERT !!!',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/products/e7aa48b7ecdfef3f9ae32c981d165df2.png',
    21.00,
    21.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Adelante
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Adelante',
    'adelante-stanleys-wet-goods',
    NULL,
    'Argentina',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Malbec',
    'adelante-malbec-stanleys-wet-goods',
    'Malbec',
    NULL,
    'Argentina',
    NULL,
    'Winemaker Ray Kaufman left California years ago for his Argentinian wine odyssey, and his Malbec is full of lush dark fruit, but with an added complexity of spice and minerality.',
    'Winemaker Ray Kaufman left California years ago for his Argentinian wine odyssey, and his Malbec is full of lush dark fruit, but with an added complexity of spice and minerality.',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/products/5961e850f5490b5b0a8b84b8f626af62.jpg',
    20.00,
    20.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Adrien Renoir Le
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Adrien Renoir Le',
    'adrien-renoir-le-stanleys-wet-goods',
    'Champagne',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Terroir Grand Cru Champagne',
    'adrien-renoir-le-terroir-grand-cru-champagne-stanleys-wet-goods',
    'Champagne',
    'Champagne',
    'France',
    NULL,
    'Extra Brut 50/50 blend of Pinot Noir and Chardonnay. 40 year-old vines located in the Grand Cru village of Verzy in Montagne de Reims. Organic',
    'Extra Brut 50/50 blend of Pinot Noir and Chardonnay. 40 year-old vines located in the Grand Cru village of Verzy in Montagne de Reims. Organic',
    '["versatile pairing"]'::jsonb,
    '{"body":2,"sweetness":1,"tannin":1,"acidity":5}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/fb539209-12a2-4ec3-bfb8-bf98e207e0da.jpg',
    84.00,
    84.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Adrien Renoir Les
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Adrien Renoir Les',
    'adrien-renoir-les-stanleys-wet-goods',
    'Champagne',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Vignes Goisses Grand Cru Champagne 2018',
    'adrien-renoir-les-vignes-goisses-grand-cru-champagne-2018-stanleys-wet-goods',
    'Champagne',
    'Champagne',
    'France',
    2018,
    '100% Petit Meunier from "Les Vignes Goisses" lieu-dit in Verzy, the Grand Cru village of Montagne de Reims. Wine rested on lees for a minimum of 36 months. Zero dosage for this fruity and intense Champagne Blanc de Meunier.',
    '100% Petit Meunier from "Les Vignes Goisses" lieu-dit in Verzy, the Grand Cru village of Montagne de Reims. Wine rested on lees for a minimum of 36 months. Zero dosage for this fruity and intense Champagne Blanc de Meunier.',
    '["versatile pairing"]'::jsonb,
    '{"body":2,"sweetness":1,"tannin":1,"acidity":5}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/ad65d774-0997-4e54-a170-3d99d4d05a20.jpg',
    160.00,
    160.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Agrapart & Fils
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Agrapart & Fils',
    'agrapart-fils-stanleys-wet-goods',
    'Champagne',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    '7 Crus Extra Brut Champagne',
    'agrapart-fils-7-crus-extra-brut-champagne-stanleys-wet-goods',
    'Champagne',
    'Champagne',
    'France',
    NULL,
    '100% Chardonnay from 7 villages in the Côte des Blancs - Avize, Oger, Oily & Cramant for the Grand Crus, and Avenay Val d''Or, Bergères les Vertus & Mardeuil for the Premier Crus. Elegant, with aromas of white flowers & honey, with elegant & pure notes of nectarine, apple, & chalk.',
    '100% Chardonnay from 7 villages in the Côte des Blancs - Avize, Oger, Oily & Cramant for the Grand Crus, and Avenay Val d''Or, Bergères les Vertus & Mardeuil for the Premier Crus. Elegant, with aromas of white flowers & honey, with elegant & pure notes of nectarine, apple, & chalk.',
    '["versatile pairing"]'::jsonb,
    '{"body":2,"sweetness":1,"tannin":1,"acidity":5}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/285fb6e1-48c6-495e-8d1e-771669952f00.jpg',
    88.00,
    88.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Aia dei Colombi
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Aia dei Colombi',
    'aia-dei-colombi-stanleys-wet-goods',
    NULL,
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Falanghina Del Sannio',
    'aia-dei-colombi-falanghina-del-sannio-stanleys-wet-goods',
    NULL,
    NULL,
    'Italy',
    NULL,
    'Dry, medium-bodied, savory, silky, minerally.',
    'Dry, medium-bodied, savory, silky, minerally.',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/products/3584500ff926f8bffb9049ef6d1a846c.jpg',
    19.50,
    19.50,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Akarregi Txiki Balea
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Akarregi Txiki Balea',
    'akarregi-txiki-balea-stanleys-wet-goods',
    NULL,
    'Spain',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Txakoli White',
    'akarregi-txiki-balea-txakoli-white-stanleys-wet-goods',
    NULL,
    NULL,
    'Spain',
    NULL,
    '95% Hondarrabi Zuri + 5% Hondarrabi Beltza Getaria > Basque > Spain Light-bodied with a slight effervescence. Citrus, apple, dry herbs',
    '95% Hondarrabi Zuri + 5% Hondarrabi Beltza Getaria > Basque > Spain Light-bodied with a slight effervescence. Citrus, apple, dry herbs',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/942434c5-731c-45c5-85d5-665208c46653.jpg',
    26.75,
    26.75,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Alberti Malbec Reserva
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alberti Malbec Reserva',
    'alberti-malbec-reserva-stanleys-wet-goods',
    NULL,
    'Argentina',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Bodega Calle',
    'alberti-malbec-reserva-bodega-calle-stanleys-wet-goods',
    'Malbec',
    NULL,
    'Argentina',
    NULL,
    'A Silverlake Wine mainstay. ultimate richness. ultimate smoothness. exact Malbec. thoroughly Argentinean.',
    'A Silverlake Wine mainstay. ultimate richness. ultimate smoothness. exact Malbec. thoroughly Argentinean.',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/7943863f53ef4d9ecb2986fa03a4c3c4.jpg',
    21.00,
    21.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Albet i Noya
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Albet i Noya',
    'albet-i-noya-stanleys-wet-goods',
    NULL,
    'Spain',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Petit Albet Brut Reserva Sparkling',
    'albet-i-noya-petit-albet-brut-reserva-sparkling-stanleys-wet-goods',
    NULL,
    NULL,
    'Spain',
    NULL,
    'Xarello, Macabeu, Parella Penedes > Spain A co-ferment of biodynamic gapes citrus, honeydew, dry finish, refreshing',
    'Xarello, Macabeu, Parella Penedes > Spain A co-ferment of biodynamic gapes citrus, honeydew, dry finish, refreshing',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/c12b7683-92ee-4e4a-8ba1-98c9a8ea164c.jpg',
    22.00,
    22.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Petit Albet Brut Rosé Sparkling',
    'albet-i-noya-petit-albet-brut-rose-sparkling-stanleys-wet-goods',
    'Pinot Noir',
    NULL,
    'Spain',
    NULL,
    'Pinot Noir + Garnatxa Penedes > Spain herbal, floral, rich, and red fruity text book blanc de noirs organic farming since 1978',
    'Pinot Noir + Garnatxa Penedes > Spain herbal, floral, rich, and red fruity text book blanc de noirs organic farming since 1978',
    '["versatile pairing"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/08b87ee0-80e0-4f4a-9421-2341e0bd1a28.jpg',
    22.00,
    22.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Aldinger Trollinger
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Aldinger Trollinger',
    'aldinger-trollinger-stanleys-wet-goods',
    NULL,
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Feldhase Trocken',
    'aldinger-trollinger-feldhase-trocken-stanleys-wet-goods',
    NULL,
    NULL,
    'Italy',
    NULL,
    'Known in Italy as Vernatsch or Schiava, the light-skinned Trollinger grape is native to Wuerttemberg, Germany. The Aldinger''s version is a beautifully fruit-driven, yet earthy red that is exceptional when slightly chilled.',
    'Known in Italy as Vernatsch or Schiava, the light-skinned Trollinger grape is native to Wuerttemberg, Germany. The Aldinger''s version is a beautifully fruit-driven, yet earthy red that is exceptional when slightly chilled.',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/products/580108a0f0b6999ad459cc733f8e2c52.jpg',
    23.00,
    23.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Alegre Valganon
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alegre Valganon',
    'alegre-valganon-stanleys-wet-goods',
    'Rioja',
    'Spain',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Rioja Blanco',
    'alegre-valganon-rioja-blanco-stanleys-wet-goods',
    'Tempranillo',
    'Rioja',
    'Spain',
    NULL,
    '85% Viura, 15% Garnacha Blanca, 5% Tempranillo Blanco Rioja > Spain Aged in concrete, oak vats and 500-liter barrels',
    '85% Viura, 15% Garnacha Blanca, 5% Tempranillo Blanco Rioja > Spain Aged in concrete, oak vats and 500-liter barrels',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/4c2a1565-926a-4d4a-91b9-f67fa63e8815.jpg',
    29.00,
    29.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Alessandro Viola
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alessandro Viola',
    'alessandro-viola-stanleys-wet-goods',
    'Sicily',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Carricat Bianco',
    'alessandro-viola-carricat-bianco-stanleys-wet-goods',
    NULL,
    'Sicily',
    'Italy',
    NULL,
    'Carricat is an exciting white wine from Sicily, made from a blend of Carricante and Catarratto, two indigenous grape varieties that thrive in the region. This wine reflects Viola''s natural winemaking philosophy, with grapes farmed organically and vinified with minimal intervention. Carricat undergoes a short skin contact maceration (about 48 hours), which adds a subtle texture without overpowering the wine''s bright and refreshing character.',
    'Carricat is an exciting white wine from Sicily, made from a blend of Carricante and Catarratto, two indigenous grape varieties that thrive in the region. This wine reflects Viola''s natural winemaking philosophy, with grapes farmed organically and vinified with minimal intervention. Carricat undergoes a short skin contact maceration (about 48 hours), which adds a subtle texture without overpowering the wine''s bright and refreshing character.',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/2665a20c817bc8a436f81d8cf3f27ea8.jpg',
    31.00,
    31.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Alessandro Viola Note
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Alessandro Viola Note',
    'alessandro-viola-note-stanleys-wet-goods',
    'Sicily',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Alessandro Viola Note di Rosso',
    'alessandro-viola-note-di-rosso-stanleys-wet-goods',
    'Syrah',
    'Sicily',
    'Italy',
    NULL,
    'Organic. A blend of Nero d''Avola and Syrah gives off notes of dark fruit, sharp spice, and minerality. Perfect body and finishing off with soft tannins.',
    'Organic. A blend of Nero d''Avola and Syrah gives off notes of dark fruit, sharp spice, and minerality. Perfect body and finishing off with soft tannins.',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/products/ade7732e6748f7bd48a1c5549d545bde.jpg',
    35.00,
    35.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- =========================================================================
  -- RETAILER 12: Lincoln Fine Wines
  -- Location: Venice, Los Angeles
  -- =========================================================================

  INSERT INTO public.organizations (id, name, slug, metadata)
  VALUES (
    gen_random_uuid(),
    'Lincoln Fine Wines',
    'lincoln-fine-wines',
    '{"location":"Venice, Los Angeles","tagline":"Italian and French fine wines steps from the beach"}'::jsonb
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, metadata = EXCLUDED.metadata
  RETURNING id INTO _org_id;

  -- Producer: Allimant Laugner Rosé
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Allimant Laugner Rosé',
    'allimant-laugner-rose-lincoln-fine-wines',
    'Alsace',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Cremant d''Alsace',
    'allimant-laugner-rose-cremant-dalsace-lincoln-fine-wines',
    'Pinot Noir',
    'Alsace',
    'France',
    NULL,
    '100% Pinot Noir Alsace > France Champagne-method sparkler Light maceration native yeast fermented in stainless steel tanks aged 12-18 months on its lees disgorged with low dosage Bright berries, steely minearlity, clean, tiny bubbles, dry',
    '100% Pinot Noir Alsace > France Champagne-method sparkler Light maceration native yeast fermented in stainless steel tanks aged 12-18 months on its lees disgorged with low dosage Bright berries, steely minearlity, clean, tiny bubbles, dry',
    '["versatile pairing"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/bbc646add3d9c2a3ee425a26ef87dc12.jpg',
    24.00,
    24.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Cremant d''Alsace MAGNUM - 1.5 Liter',
    'allimant-laugner-rose-cremant-dalsace-magnum-1-5-liter-lincoln-fine-wines',
    'Pinot Noir',
    'Alsace',
    'France',
    NULL,
    '100% Pinot Noir Champagne-method sparkler from Orschwiller in Alsace. Light maceration, native yeast fermented in stainless steel tanks, aged 12-18 months on its lees, disgorged with low dosage. Bright berries, steely minearlity, clean, tiny bubble',
    '100% Pinot Noir Champagne-method sparkler from Orschwiller in Alsace. Light maceration, native yeast fermented in stainless steel tanks, aged 12-18 months on its lees, disgorged with low dosage. Bright berries, steely minearlity, clean, tiny bubble',
    '["versatile pairing"]'::jsonb,
    '{"body":3,"sweetness":1,"tannin":3,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/products/969b492ca1e5cf68965ff604b79618bf.jpg',
    57.00,
    57.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Altar Uco Malbec
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Altar Uco Malbec',
    'altar-uco-malbec-lincoln-fine-wines',
    'Mendoza',
    NULL,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Edad Moderna',
    'altar-uco-malbec-edad-moderna-lincoln-fine-wines',
    'Malbec',
    'Mendoza',
    NULL,
    NULL,
    '100% Malbec from old vine vineyards in Mendoza, hand-harvested, fermented with native yeasts in cement pools prior to aging in cement tank. Bold, dark fruits, tannin forward balanced with crisp acidity.',
    '100% Malbec from old vine vineyards in Mendoza, hand-harvested, fermented with native yeasts in cement pools prior to aging in cement tank. Bold, dark fruits, tannin forward balanced with crisp acidity.',
    '["versatile pairing"]'::jsonb,
    '{"body":5,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/products/4e135cd899e7138bdc8fac270129ff7a.jpg',
    29.00,
    29.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Altxor Txakolina
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Altxor Txakolina',
    'altxor-txakolina-lincoln-fine-wines',
    NULL,
    'Spain',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Blanco',
    'altxor-txakolina-blanco-lincoln-fine-wines',
    NULL,
    NULL,
    'Spain',
    NULL,
    '100% Hondarrabi Zuri Basque Country > Spain Bright and refreshing saline notes and zippy flavors of lime zest, green apple, rhubarb, and Asian pear It''s mouthwatering and food-friendly too shellfish and fresh seafood pairable',
    '100% Hondarrabi Zuri Basque Country > Spain Bright and refreshing saline notes and zippy flavors of lime zest, green apple, rhubarb, and Asian pear It''s mouthwatering and food-friendly too shellfish and fresh seafood pairable',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/81ffd9e7bf181480db1328b0a7705f9a.jpg',
    23.00,
    23.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Rosat Rosé',
    'altxor-txakolina-rosat-rose-lincoln-fine-wines',
    NULL,
    NULL,
    'Spain',
    NULL,
    'The gentle fizz (as is traditional for Txakoli) is just one of the many charming elements to this rosé. Bone dry with angular but balanced acidity with a plethora of fruit notes including raspberries and strawberries with an injection of lime zest. Break out the porrón!',
    'The gentle fizz (as is traditional for Txakoli) is just one of the many charming elements to this rosé. Bone dry with angular but balanced acidity with a plethora of fruit notes including raspberries and strawberries with an injection of lime zest. Break out the porrón!',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/193456a0-74bf-475c-a33d-9734e7b24bce.jpg',
    28.00,
    28.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Amevive Carino
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Amevive Carino',
    'amevive-carino-lincoln-fine-wines',
    NULL,
    'United States',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Tempranillo/Graciano',
    'amevive-carino-tempranillo-graciano-lincoln-fine-wines',
    'Tempranillo',
    NULL,
    'United States',
    NULL,
    'Cariño is a coferment of the Pesquera Tempranillo and Graciano from the late 90''s plantings at Ibarra-Young. The Pesquera Tempranillo at Ibarra-Young is an own-rooted suitcase clone originating from Bodega Pesquera in Pesquera del Duero, Spain. I had never been inspired to make or seek Tempranillo until tending these vines for the last few years. These vines clearly want to be here! They grow easily and always win the beauty contest. Cariño translates to ''darling'' in Spanish and speaks to the tw',
    'Cariño is a coferment of the Pesquera Tempranillo and Graciano from the late 90''s plantings at Ibarra-Young. The Pesquera Tempranillo at Ibarra-Young is an own-rooted suitcase clone originating from Bodega Pesquera in Pesquera del Duero, Spain. I had never been inspired to make or seek Tempranillo until tending these vines for the last few years. These vines clearly want to be here! They grow easily and always win the beauty contest. Cariño translates to ''darling'' in Spanish and speaks to the tw',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/products/0d0987a99e096330e5aacf4153329bf2.jpg',
    44.00,
    44.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Amorotti
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Amorotti',
    'amorotti-lincoln-fine-wines',
    NULL,
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Trebbiano',
    'amorotti-trebbiano-lincoln-fine-wines',
    'Trebbiano',
    NULL,
    'Italy',
    NULL,
    'Super rare Trebbiano Abruzzese fermented and aged in untoasted barrels for one year, giving it textural appeal without any new oak flavors. It is a wine of minerality and power with ripe orchard fruit balanced against citrus notes.',
    'Super rare Trebbiano Abruzzese fermented and aged in untoasted barrels for one year, giving it textural appeal without any new oak flavors. It is a wine of minerality and power with ripe orchard fruit balanced against citrus notes.',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/e2bdc88f-dfc5-4365-8a03-add360839842.jpg',
    58.00,
    58.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Ampeleia
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Ampeleia',
    'ampeleia-lincoln-fine-wines',
    'Tuscany',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Unlitro',
    'ampeleia-unlitro-lincoln-fine-wines',
    'Grenache',
    'Tuscany',
    'Italy',
    NULL,
    'Alicante Nero + Carignano + Mourvèdre + Sangiovese + Alicante Bouschet Tuscany > Italy organic unoaked 1 Liter of wine robust red fruits, super smooth, light tannins, classic italian! The perfect wine to take to dinner goes great with pizza! fantastic collaboration between Elisabetta Foradori, Giovanni Podini, and Thomas Widmann. This wine is a blend of Alicante Nero (Grenache), Carignano, Mourvèdre, Sangiovese, and Alicante Bouschet, sourced from their youngest vineyards near the Tuscan coas',
    'Alicante Nero + Carignano + Mourvèdre + Sangiovese + Alicante Bouschet Tuscany > Italy organic unoaked 1 Liter of wine robust red fruits, super smooth, light tannins, classic italian! The perfect wine to take to dinner goes great with pizza! fantastic collaboration between Elisabetta Foradori, Giovanni Podini, and Thomas Widmann. This wine is a blend of Alicante Nero (Grenache), Carignano, Mourvèdre, Sangiovese, and Alicante Bouschet, sourced from their youngest vineyards near the Tuscan coas',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":3,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/b413b9b0-5e17-4613-b7bf-aabc45d2707d.jpg',
    26.00,
    26.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Anapea Village
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Anapea Village',
    'anapea-village-lincoln-fine-wines',
    NULL,
    NULL,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Kvareli Kisi',
    'anapea-village-kvareli-kisi-lincoln-fine-wines',
    NULL,
    NULL,
    NULL,
    NULL,
    '100% Kisi Kakheti > Georgia Traditional Georgian winemaking - 6 months on skins and wines aged in Qvevris and 6 months in a cooler set of qveri, unfined and unfiltered, minimal sulfur flowers, peach, herbal tea, nutty',
    '100% Kisi Kakheti > Georgia Traditional Georgian winemaking - 6 months on skins and wines aged in Qvevris and 6 months in a cooler set of qveri, unfined and unfiltered, minimal sulfur flowers, peach, herbal tea, nutty',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/1f93b377-514a-447a-877c-33e432741b94.jpg',
    24.00,
    24.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Andi Weigand Zusammen
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Andi Weigand Zusammen',
    'andi-weigand-zusammen-lincoln-fine-wines',
    NULL,
    'Germany',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'White Cuvee',
    'andi-weigand-zusammen-white-cuvee-lincoln-fine-wines',
    'Riesling',
    NULL,
    'Germany',
    NULL,
    '45% Scheurebe, 25% Riesling, 20% Muller Thurgau, 10% Silvaner Franken > Germany Organic. Unfined. Unfiltered.',
    '45% Scheurebe, 25% Riesling, 20% Muller Thurgau, 10% Silvaner Franken > Germany Organic. Unfined. Unfiltered.',
    '["versatile pairing"]'::jsonb,
    '{"body":2,"sweetness":3,"tannin":1,"acidity":5}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/14d11112-9c75-4b64-9589-9c1f55423d1d.jpg',
    28.00,
    28.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Angelot Gamay
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Angelot Gamay',
    'angelot-gamay-lincoln-fine-wines',
    NULL,
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Angelot Gamay Bugey',
    'angelot-gamay-bugey-lincoln-fine-wines',
    'Gamay',
    NULL,
    'France',
    NULL,
    '100% Gamay for Bugey, in Eastern France immensely popular, juicy, funky, and chillable red.',
    '100% Gamay for Bugey, in Eastern France immensely popular, juicy, funky, and chillable red.',
    '["versatile pairing"]'::jsonb,
    '{"body":2,"sweetness":1,"tannin":2,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/products/fe8041a5ea8df03b5ee72bc41aa01d2b.jpg',
    18.00,
    18.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Angura Goruli
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Angura Goruli',
    'angura-goruli-lincoln-fine-wines',
    NULL,
    NULL,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Mtsvane',
    'angura-goruli-mtsvane-lincoln-fine-wines',
    NULL,
    NULL,
    NULL,
    NULL,
    'Georgia, Eastern Europe Medium-bodied with balanced acidity and clean finish. Skin-contact white with amber hue and textured complexity. organic + natural winemaking',
    'Georgia, Eastern Europe Medium-bodied with balanced acidity and clean finish. Skin-contact white with amber hue and textured complexity. organic + natural winemaking',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/201ab6ff-1bb3-4b03-83b8-ddc85677182e.jpg',
    28.00,
    28.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Anima Mundi
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Anima Mundi',
    'anima-mundi-lincoln-fine-wines',
    NULL,
    'Spain',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Gres Xarel-lo',
    'anima-mundi-gres-xarel-lo-lincoln-fine-wines',
    NULL,
    NULL,
    'Spain',
    NULL,
    'Spain & Portugal Light-bodied with crisp acidity and refreshing character. organic + natural winemaking',
    'Spain & Portugal Light-bodied with crisp acidity and refreshing character. organic + natural winemaking',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/cca30721-968d-436f-835c-844454d32b10.jpg',
    30.00,
    30.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Anne Pichon
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Anne Pichon',
    'anne-pichon-lincoln-fine-wines',
    'Rhône Valley',
    'France',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Vermentino Sauvage',
    'anne-pichon-vermentino-sauvage-lincoln-fine-wines',
    'Vermentino',
    'Rhône Valley',
    'France',
    NULL,
    'Fresh, zippy, direct press Vermentino from the Southern Rhône Valley. Organically grown, with notes of grapefruit, fresh apple, almond, & pineapple.',
    'Fresh, zippy, direct press Vermentino from the Southern Rhône Valley. Organically grown, with notes of grapefruit, fresh apple, almond, & pineapple.',
    '["versatile pairing"]'::jsonb,
    '{"body":2,"sweetness":1,"tannin":1,"acidity":4}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/24bd75d891d02de59c8044622eb43d35.jpg',
    22.00,
    22.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Antidoto Ribera
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Antidoto Ribera',
    'antidoto-ribera-lincoln-fine-wines',
    'Ribera del Duero',
    'Spain',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Antidoto Ribera del Duero',
    'antidoto-ribera-del-duero-lincoln-fine-wines',
    'Tempranillo',
    'Ribera del Duero',
    'Spain',
    NULL,
    'Tempranillo Spain & Portugal Medium-bodied. Cherry, leather, and warm spice with balanced structure. organic + natural winemaking',
    'Tempranillo Spain & Portugal Medium-bodied. Cherry, leather, and warm spice with balanced structure. organic + natural winemaking',
    '["versatile pairing"]'::jsonb,
    '{"body":4,"sweetness":1,"tannin":4,"acidity":3}'::jsonb,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/05166752-15ec-47ff-9a9c-59cfa7535780.jpg',
    35.00,
    35.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- Producer: Antonella Corda Cannonau
  INSERT INTO public.producers (id, org_id, name, slug, region, country, is_active)
  VALUES (
    gen_random_uuid(), _org_id,
    'Antonella Corda Cannonau',
    'antonella-corda-cannonau-lincoln-fine-wines',
    'Sardinia',
    'Italy',
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country
  RETURNING id INTO _producer_id;

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, image_url, price_min, price_max, is_active)
  VALUES (
    _org_id, _producer_id,
    'Antonella Corda Cannonau di Sardegna',
    'antonella-corda-cannonau-di-sardegna-lincoln-fine-wines',
    NULL,
    'Sardinia',
    'Italy',
    NULL,
    'Sardinia > Italy Medium-bodied with balanced fruit and approachable tannins. organic + natural winemaking',
    'Sardinia > Italy Medium-bodied with balanced fruit and approachable tannins. organic + natural winemaking',
    '["versatile pairing"]'::jsonb,
    NULL,
    'https://cdn.shopify.com/s/files/1/0579/2507/5110/files/7eea8fdf-516f-4737-8432-ed0a6da0488a.jpg',
    29.00,
    29.00,
    true
  )
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    producer_id = EXCLUDED.producer_id,
    image_url = EXCLUDED.image_url, price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  RAISE NOTICE 'Marketplace seed complete: 12 retailers, wines and producers created/updated.';

END $$;