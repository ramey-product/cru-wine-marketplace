-- =============================================================================
-- Seed: Sample Producers, Wines, and Producer Photos
--
-- Populates 5 producers with 2-4 wines each and 2-3 photos per producer.
-- Idempotent: uses ON CONFLICT (slug) DO UPDATE for upserts.
--
-- USAGE:
--   psql $DATABASE_URL -f supabase/seed-producers.sql
--   -- or via Supabase CLI:
--   supabase db seed
--
-- NOTE: All seeded content uses the platform organization's org_id.
-- Replace the CTE value below with your actual platform org UUID.
-- =============================================================================

SET search_path TO '';

-- ---------------------------------------------------------------------------
-- Platform org_id — replace with your real platform org UUID
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  _org_id UUID;
  _p1 UUID; _p2 UUID; _p3 UUID; _p4 UUID; _p5 UUID;
BEGIN

  -- Grab the first organization as the platform org (adjust as needed)
  SELECT id INTO _org_id FROM public.organizations LIMIT 1;

  IF _org_id IS NULL THEN
    RAISE NOTICE 'No organization found — skipping seed. Create an org first.';
    RETURN;
  END IF;

  -- =========================================================================
  -- PRODUCERS
  -- =========================================================================

  INSERT INTO public.producers (id, org_id, name, slug, region, country, tagline, story_content, farming_practices, vineyard_size, year_established, annual_production, hero_image_url, is_active)
  VALUES
    (gen_random_uuid(), _org_id,
     'Domaine Ciel Ouvert', 'domaine-ciel-ouvert',
     'Burgundy', 'France',
     'Where tradition meets terroir under open skies',
     'For four generations, the Moreau family has tended 12 hectares of Pinot Noir and Chardonnay on the eastern slopes of the Cote de Beaune. Their philosophy is simple: let the land speak. With minimal intervention in cellar and vineyard alike, Domaine Ciel Ouvert produces wines that are unmistakably Burgundian — elegant, layered, and built for contemplation.',
     '["organic", "biodynamic", "hand-harvested"]'::jsonb,
     '12 hectares', 1923, '45,000 bottles',
     'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=1200',
     true)
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country,
    tagline = EXCLUDED.tagline, story_content = EXCLUDED.story_content,
    farming_practices = EXCLUDED.farming_practices, hero_image_url = EXCLUDED.hero_image_url
  RETURNING id INTO _p1;

  INSERT INTO public.producers (id, org_id, name, slug, region, country, tagline, story_content, farming_practices, vineyard_size, year_established, annual_production, hero_image_url, is_active)
  VALUES
    (gen_random_uuid(), _org_id,
     'Bodega Alma Viva', 'bodega-alma-viva',
     'Mendoza', 'Argentina',
     'High-altitude wines with soul',
     'At 1,200 meters above sea level in the Uco Valley, Bodega Alma Viva crafts Malbec and Cabernet Franc that reflect the dramatic landscape. Planted in sandy, alluvial soils with Andean snowmelt irrigation, the vines struggle beautifully — producing small berries with concentrated flavors. Founded in 2005 by winemaker Lucia Fernandez, the estate combines Argentine boldness with restrained elegance.',
     '["sustainable", "dry-farmed", "minimal-intervention"]'::jsonb,
     '28 hectares', 2005, '60,000 bottles',
     'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=1200',
     true)
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country,
    tagline = EXCLUDED.tagline, story_content = EXCLUDED.story_content,
    farming_practices = EXCLUDED.farming_practices, hero_image_url = EXCLUDED.hero_image_url
  RETURNING id INTO _p2;

  INSERT INTO public.producers (id, org_id, name, slug, region, country, tagline, story_content, farming_practices, vineyard_size, year_established, annual_production, hero_image_url, is_active)
  VALUES
    (gen_random_uuid(), _org_id,
     'Tenuta del Sole', 'tenuta-del-sole',
     'Tuscany', 'Italy',
     'Sangiovese perfected by Tuscan sun',
     'Perched on the rolling hills between Montalcino and Montepulciano, Tenuta del Sole has been cultivating Sangiovese since the late 18th century. The estate blends traditional winemaking — large Slavonian oak barrels, long macerations — with modern vineyard management. Their Brunello di Montalcino is a benchmark of the region, and their rosato has become a cult favorite among Italian wine enthusiasts.',
     '["organic", "integrated-pest-management", "hand-harvested"]'::jsonb,
     '35 hectares', 1789, '90,000 bottles',
     'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=1200',
     true)
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country,
    tagline = EXCLUDED.tagline, story_content = EXCLUDED.story_content,
    farming_practices = EXCLUDED.farming_practices, hero_image_url = EXCLUDED.hero_image_url
  RETURNING id INTO _p3;

  INSERT INTO public.producers (id, org_id, name, slug, region, country, tagline, story_content, farming_practices, vineyard_size, year_established, annual_production, hero_image_url, is_active)
  VALUES
    (gen_random_uuid(), _org_id,
     'Willow Creek Estate', 'willow-creek-estate',
     'Willamette Valley', 'United States',
     'Cool-climate Pinot from the heart of Oregon',
     'Nestled in the Dundee Hills AVA, Willow Creek Estate was founded by Sarah and James Park in 2010 with a singular mission: to prove that Oregon Pinot Noir belongs on the world stage. Their 18-hectare property sits on volcanic Jory soil, producing wines with signature cherry-spice character and a mineral backbone. Every bottle is estate-grown and hand-sorted.',
     '["sustainable", "LIVE-certified", "estate-grown"]'::jsonb,
     '18 hectares', 2010, '30,000 bottles',
     'https://images.unsplash.com/photo-1464638681168-ab0eb7764765?w=1200',
     true)
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country,
    tagline = EXCLUDED.tagline, story_content = EXCLUDED.story_content,
    farming_practices = EXCLUDED.farming_practices, hero_image_url = EXCLUDED.hero_image_url
  RETURNING id INTO _p4;

  INSERT INTO public.producers (id, org_id, name, slug, region, country, tagline, story_content, farming_practices, vineyard_size, year_established, annual_production, hero_image_url, is_active)
  VALUES
    (gen_random_uuid(), _org_id,
     'Weingut Steinberg', 'weingut-steinberg',
     'Mosel', 'Germany',
     'Riesling from ancient slate, impossibly steep',
     'On the steepest slopes of the Mosel River, the Steinberg family has been crafting Riesling since 1867. Their vineyards, planted at up to 65-degree inclines on blue Devonian slate, produce wines of crystalline purity and electric acidity. From bone-dry Grosses Gewachs to lusciously sweet Auslese, every bottle captures the essence of the Mosel — tension, precision, and an almost infinite finish.',
     '["organic", "hand-harvested", "gravity-winery"]'::jsonb,
     '8 hectares', 1867, '25,000 bottles',
     'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200',
     true)
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, region = EXCLUDED.region, country = EXCLUDED.country,
    tagline = EXCLUDED.tagline, story_content = EXCLUDED.story_content,
    farming_practices = EXCLUDED.farming_practices, hero_image_url = EXCLUDED.hero_image_url
  RETURNING id INTO _p5;

  -- =========================================================================
  -- WINES
  -- =========================================================================

  -- --- Domaine Ciel Ouvert (3 wines) ---

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, story_hook, image_url, price_min, price_max, is_active)
  VALUES
    (_org_id, _p1, 'Bourgogne Rouge Les Argiles', 'bourgogne-rouge-les-argiles',
     'Pinot Noir', 'Burgundy', 'France', 2021,
     'A village-level Burgundy from clay-rich soils at the base of the slope. Approachable and vibrant, this is everyday Burgundy at its best.',
     'Bright ruby with purple glints. Red cherry, wild strawberry, and a whisper of fresh thyme on the nose. The palate is juicy and medium-bodied with silky tannins and a chalky mineral finish.',
     '["roast chicken", "mushroom risotto", "gruyere cheese"]'::jsonb,
     '{"body": 3, "sweetness": 1, "tannin": 3, "acidity": 4, "fruit": 4, "earth": 3}'::jsonb,
     'A gateway to Burgundy''s magic',
     'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=800', 28.00, 35.00, true),

    (_org_id, _p1, 'Pommard Premier Cru Les Rugiens', 'pommard-premier-cru-les-rugiens',
     'Pinot Noir', 'Burgundy', 'France', 2019,
     'From the legendary Les Rugiens vineyard — often considered worthy of Grand Cru status. A structured, powerful expression of Pommard.',
     'Deep garnet. Black cherry, cassis, iron, and dried roses. Full-bodied for Pinot with firm but ripe tannins, layers of dark fruit, and extraordinary length. Needs 5-10 years to unfurl completely.',
     '["braised short ribs", "duck confit", "aged comte"]'::jsonb,
     '{"body": 4, "sweetness": 1, "tannin": 4, "acidity": 4, "fruit": 4, "earth": 5}'::jsonb,
     'Premier Cru with Grand Cru ambition',
     'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=800', 85.00, 110.00, true),

    (_org_id, _p1, 'Meursault Les Narvaux', 'meursault-les-narvaux',
     'Chardonnay', 'Burgundy', 'France', 2020,
     'A village Meursault from the Narvaux lieu-dit, fermented and aged in 30% new oak for richness without excess.',
     'Pale gold with green highlights. Ripe pear, white flowers, toasted hazelnut, and a hint of butter. Creamy texture with vibrant acidity that lifts the finish. Elegant and balanced.',
     '["lobster thermidor", "creamy pasta", "roasted turbot"]'::jsonb,
     '{"body": 4, "sweetness": 1, "tannin": 1, "acidity": 4, "fruit": 3, "earth": 3}'::jsonb,
     'Meursault''s golden elegance',
     'https://images.unsplash.com/photo-1558001373-7b93ee48ffa0?w=800', 55.00, 70.00, true)
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- --- Bodega Alma Viva (3 wines) ---

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, story_hook, image_url, price_min, price_max, is_active)
  VALUES
    (_org_id, _p2, 'Malbec Reserva Uco Valley', 'malbec-reserva-uco-valley',
     'Malbec', 'Mendoza', 'Argentina', 2020,
     'High-altitude Malbec from the Uco Valley at 1,100m. Aged 14 months in French oak, this is concentrated yet lifted.',
     'Inky purple-black. Plum, blackberry compote, violet, and mocha. Full-bodied with velvety tannins, layered dark fruit, and a long, spiced finish. The altitude brings freshness that keeps it alive.',
     '["grilled ribeye", "empanadas", "dark chocolate"]'::jsonb,
     '{"body": 5, "sweetness": 1, "tannin": 4, "acidity": 3, "fruit": 5, "earth": 3}'::jsonb,
     'Altitude makes the difference',
     'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800', 32.00, 42.00, true),

    (_org_id, _p2, 'Cabernet Franc Gran Reserva', 'cabernet-franc-gran-reserva',
     'Cabernet Franc', 'Mendoza', 'Argentina', 2019,
     'A single-vineyard Cabernet Franc from the Gualtallary district. 18 months in new French oak. Only 3,000 bottles produced.',
     'Deep ruby with brick edges. Red bell pepper, graphite, black currant, and cedar. Medium-full body with structured tannins and remarkable precision. A wine of terroir, not variety.',
     '["lamb rack", "roasted vegetables", "manchego"]'::jsonb,
     '{"body": 4, "sweetness": 1, "tannin": 4, "acidity": 4, "fruit": 3, "earth": 4}'::jsonb,
     'Gualtallary''s hidden gem',
     'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=800', 58.00, 75.00, true),

    (_org_id, _p2, 'Rose de Malbec', 'rose-de-malbec',
     'Malbec', 'Mendoza', 'Argentina', 2022,
     'A pale, Provencal-style rose made from Malbec grapes. Direct press, stainless steel only. Summer in a glass.',
     'Salmon pink with copper highlights. Watermelon, white peach, and fresh herbs. Dry and crisp with refreshing acidity. Light-bodied and endlessly drinkable.',
     '["grilled seafood", "summer salads", "goat cheese"]'::jsonb,
     '{"body": 2, "sweetness": 1, "tannin": 1, "acidity": 4, "fruit": 4, "earth": 1}'::jsonb,
     'Malbec''s lighter side',
     'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800', 16.00, 22.00, true)
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- --- Tenuta del Sole (4 wines) ---

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, story_hook, image_url, price_min, price_max, is_active)
  VALUES
    (_org_id, _p3, 'Brunello di Montalcino', 'brunello-di-montalcino-tenuta',
     'Sangiovese', 'Tuscany', 'Italy', 2017,
     'A classic Brunello aged 36 months in large Slavonian oak botti. Five years of aging before release — patience rewarded.',
     'Translucent garnet. Dried cherry, leather, tobacco leaf, dried herbs, and balsamic notes. Medium-full body with firm acidity and fine-grained tannins. The finish goes on for minutes.',
     '["bistecca alla fiorentina", "wild boar ragu", "pecorino toscano"]'::jsonb,
     '{"body": 4, "sweetness": 1, "tannin": 5, "acidity": 5, "fruit": 3, "earth": 5}'::jsonb,
     'Five years in the making',
     'https://images.unsplash.com/photo-1566754436766-2baf03a57c7a?w=800', 65.00, 85.00, true),

    (_org_id, _p3, 'Rosso di Montalcino', 'rosso-di-montalcino-tenuta',
     'Sangiovese', 'Tuscany', 'Italy', 2021,
     'Brunello''s younger sibling — same vineyards, shorter aging. Ready to drink now with vibrant, fresh Sangiovese character.',
     'Bright ruby. Fresh cherry, Mediterranean herbs, orange peel. Medium-bodied with lively acidity and supple tannins. A joyful, food-friendly wine.',
     '["margherita pizza", "pasta al pomodoro", "grilled sausages"]'::jsonb,
     '{"body": 3, "sweetness": 1, "tannin": 3, "acidity": 5, "fruit": 4, "earth": 3}'::jsonb,
     'Brunello''s joyful sibling',
     'https://images.unsplash.com/photo-1578911373434-0cb395d2cbfb?w=800', 25.00, 35.00, true),

    (_org_id, _p3, 'Rosato di Toscana', 'rosato-di-toscana-tenuta',
     'Sangiovese', 'Tuscany', 'Italy', 2022,
     'A cult-favorite rosato made from saignee of Brunello fermentations. Limited production — it sells out every vintage.',
     'Pale coral. Wild strawberry, blood orange, rosemary. Bone-dry with rapier acidity and a saline, mineral finish. Serious rose for serious food.',
     '["burrata and tomatoes", "seafood antipasti", "prosciutto"]'::jsonb,
     '{"body": 2, "sweetness": 1, "tannin": 2, "acidity": 5, "fruit": 4, "earth": 2}'::jsonb,
     'The rose that disappears',
     'https://images.unsplash.com/photo-1560148271-00b5e5850075?w=800', 22.00, 28.00, true),

    (_org_id, _p3, 'Vernaccia di San Gimignano', 'vernaccia-san-gimignano-tenuta',
     'Vernaccia', 'Tuscany', 'Italy', 2021,
     'From a small parcel near San Gimignano, this white Tuscan shows that the region is more than just reds.',
     'Straw yellow with golden hues. Almond, lemon zest, chamomile, and a touch of honey. Medium-bodied with textured mid-palate and clean, bitter-almond finish.',
     '["fried zucchini flowers", "clam linguine", "fresh ricotta"]'::jsonb,
     '{"body": 3, "sweetness": 1, "tannin": 1, "acidity": 4, "fruit": 3, "earth": 3}'::jsonb,
     'Tuscany''s white secret',
     'https://images.unsplash.com/photo-1566452348683-1468f866e2c4?w=800', 18.00, 24.00, true)
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- --- Willow Creek Estate (2 wines) ---

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, story_hook, image_url, price_min, price_max, is_active)
  VALUES
    (_org_id, _p4, 'Dundee Hills Pinot Noir', 'dundee-hills-pinot-noir',
     'Pinot Noir', 'Willamette Valley', 'United States', 2021,
     'Estate-grown Pinot from volcanic Jory soil in the Dundee Hills AVA. Whole-cluster fermentation adds complexity and spice.',
     'Medium ruby. Bing cherry, baking spice, forest floor, and cola. Medium-bodied with silky texture and a long, earthy finish. Shows classic Dundee Hills character.',
     '["grilled salmon", "duck breast", "wild mushroom tart"]'::jsonb,
     '{"body": 3, "sweetness": 1, "tannin": 3, "acidity": 4, "fruit": 4, "earth": 4}'::jsonb,
     'Volcanic soil, velvet wine',
     'https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=800', 42.00, 55.00, true),

    (_org_id, _p4, 'Willamette Valley Chardonnay', 'willamette-valley-chardonnay',
     'Chardonnay', 'Willamette Valley', 'United States', 2021,
     'Cool-climate Chardonnay with restrained oak and bright acidity. Oregon''s answer to Chablis.',
     'Light gold. Green apple, lemon curd, oyster shell, and subtle oak spice. Lean and focused with racy acidity and a mineral-driven finish.',
     '["oysters", "grilled halibut", "chicken caesar"]'::jsonb,
     '{"body": 3, "sweetness": 1, "tannin": 1, "acidity": 5, "fruit": 3, "earth": 3}'::jsonb,
     'Oregon''s answer to Chablis',
     'https://images.unsplash.com/photo-1579803815791-6e3b20538fc7?w=800', 30.00, 38.00, true)
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- --- Weingut Steinberg (3 wines) ---

  INSERT INTO public.wines (org_id, producer_id, name, slug, varietal, region, country, vintage, description, tasting_description, food_pairings, flavor_profile, story_hook, image_url, price_min, price_max, is_active)
  VALUES
    (_org_id, _p5, 'Riesling Kabinett Urziger Wurzgarten', 'riesling-kabinett-urziger-wurzgarten',
     'Riesling', 'Mosel', 'Germany', 2022,
     'From the spice garden of Urzig — iron-rich red slate gives this Kabinett its distinctive warmth and exotic character.',
     'Pale green-gold. Lime blossom, white peach, wet slate, and a hint of ginger. Off-dry with electric acidity that makes it feel almost dry. Featherweight at 8% ABV yet incredibly complex.',
     '["thai green curry", "sushi", "spicy szechuan dishes"]'::jsonb,
     '{"body": 2, "sweetness": 3, "tannin": 1, "acidity": 5, "fruit": 4, "earth": 4}'::jsonb,
     'The spice garden of the Mosel',
     'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800', 22.00, 28.00, true),

    (_org_id, _p5, 'Riesling Trocken Grosses Gewachs', 'riesling-trocken-grosses-gewachs',
     'Riesling', 'Mosel', 'Germany', 2020,
     'Bone-dry Grand Cru Riesling from the steepest blue slate vineyards. Germany''s answer to Grand Cru Burgundy.',
     'Deep gold. Petrol, lemon oil, crushed stone, green apple, and white pepper. Full-bodied (for Riesling) with explosive acidity and extraordinary length. A wine of power and precision.',
     '["roast pork belly", "grilled langoustines", "aged gouda"]'::jsonb,
     '{"body": 3, "sweetness": 1, "tannin": 1, "acidity": 5, "fruit": 3, "earth": 5}'::jsonb,
     'Precision from ancient slate',
     'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=800', 48.00, 65.00, true),

    (_org_id, _p5, 'Riesling Spatlese', 'riesling-spatlese-steinberg',
     'Riesling', 'Mosel', 'Germany', 2021,
     'Late-harvest Riesling with residual sweetness perfectly balanced by Mosel acidity. A dessert wine for people who think they do not like dessert wine.',
     'Bright gold. Apricot, honeycomb, lime zest, and jasmine. Medium-sweet with a razor-sharp acid spine that creates perfect tension. The finish oscillates between honey and stone.',
     '["foie gras", "blue cheese", "apple tart"]'::jsonb,
     '{"body": 3, "sweetness": 4, "tannin": 1, "acidity": 5, "fruit": 5, "earth": 3}'::jsonb,
     'Sweet wine for the skeptic',
     'https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?w=800', 35.00, 45.00, true)
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name, varietal = EXCLUDED.varietal, vintage = EXCLUDED.vintage,
    description = EXCLUDED.description, tasting_description = EXCLUDED.tasting_description,
    food_pairings = EXCLUDED.food_pairings, flavor_profile = EXCLUDED.flavor_profile,
    price_min = EXCLUDED.price_min, price_max = EXCLUDED.price_max;

  -- =========================================================================
  -- PRODUCER PHOTOS (2-3 per producer)
  -- =========================================================================

  -- --- Domaine Ciel Ouvert ---
  INSERT INTO public.producer_photos (org_id, producer_id, image_url, caption, display_order)
  VALUES
    (_org_id, _p1, 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800', 'Rolling vineyards on the Cote de Beaune', 0),
    (_org_id, _p1, 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800', 'Hand-sorting Pinot Noir at harvest', 1),
    (_org_id, _p1, 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?w=800', 'The cellar — centuries of winemaking', 2);

  -- --- Bodega Alma Viva ---
  INSERT INTO public.producer_photos (org_id, producer_id, image_url, caption, display_order)
  VALUES
    (_org_id, _p2, 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800', 'Uco Valley vineyards with Andean backdrop', 0),
    (_org_id, _p2, 'https://images.unsplash.com/photo-1504279577054-acfeccf8fc52?w=800', 'Winemaker Lucia Fernandez in the barrel room', 1);

  -- --- Tenuta del Sole ---
  INSERT INTO public.producer_photos (org_id, producer_id, image_url, caption, display_order)
  VALUES
    (_org_id, _p3, 'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?w=800', 'Tuscan hillside vineyards at golden hour', 0),
    (_org_id, _p3, 'https://images.unsplash.com/photo-1566754436766-2baf03a57c7a?w=800', 'Sangiovese clusters ripening in September', 1),
    (_org_id, _p3, 'https://images.unsplash.com/photo-1578911373434-0cb395d2cbfb?w=800', 'The historic estate farmhouse', 2);

  -- --- Willow Creek Estate ---
  INSERT INTO public.producer_photos (org_id, producer_id, image_url, caption, display_order)
  VALUES
    (_org_id, _p4, 'https://images.unsplash.com/photo-1464638681168-ab0eb7764765?w=800', 'Dundee Hills vineyards in autumn fog', 0),
    (_org_id, _p4, 'https://images.unsplash.com/photo-1567696911980-2eed69a46042?w=800', 'The tasting room overlooking the valley', 1),
    (_org_id, _p4, 'https://images.unsplash.com/photo-1579803815791-6e3b20538fc7?w=800', 'Sarah Park checking Pinot clusters', 2);

  -- --- Weingut Steinberg ---
  INSERT INTO public.producer_photos (org_id, producer_id, image_url, caption, display_order)
  VALUES
    (_org_id, _p5, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', 'Impossibly steep Mosel slate vineyards', 0),
    (_org_id, _p5, 'https://images.unsplash.com/photo-1547595628-c61a29f496f0?w=800', 'Riesling grapes on blue Devonian slate', 1);

  RAISE NOTICE 'Seed complete: 5 producers, 15 wines, 14 photos created/updated.';

END $$;
