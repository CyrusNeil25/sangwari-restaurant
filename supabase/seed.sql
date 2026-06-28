-- =============================================================
-- Sangwari — seed data
-- Run AFTER schema.sql. Safe to re-run (uses ON CONFLICT DO NOTHING).
-- Replace the placeholder UPI / WhatsApp values before running.
-- =============================================================

-- Settings (replace with real values!)
insert into settings (id, name, tagline, welcome, upi_id, upi_name,
  whatsapp_number, phone_display, address, map_url, hours,
  is_open, delivery_fee, min_order, tax_percent, instagram)
values (1,
  'Sangwari',
  'Where every guest eats like family',
  'Jay Johar!',
  'shubz493@ybl',           -- ← replace
  'Sangwari Restaurant',
  '917898217039',              -- ← replace (digits only, with country code)
  '+91 78982 17039',           -- ← replace
  'Raipur Road, Mahasamund, Chhattisgarh 493445',
  'https://maps.app.goo.gl/FMRE6viCFePiujw58',
  '11:00 AM – 11:00 PM',
  true, 30, 99, 5, 'sangwari'
)
on conflict (id) do nothing;

-- Categories
insert into categories (id, name, emoji, sort_order) values
  ('cg-specials', 'Chhattisgarhi Specials', '🪔', 1),
  ('starters',    'Starters',               '🧆', 2),
  ('mains',       'Main Course',            '🍛', 3),
  ('breads',      'Breads',                 '🫓', 4),
  ('rice',        'Rice & Biryani',         '🍚', 5),
  ('chinese',     'Chinese',                '🍜', 6),
  ('beverages',   'Beverages',              '🍵', 7),
  ('desserts',    'Desserts',               '🍮', 8)
on conflict (id) do nothing;

-- Menu items
insert into menu_items
  (id, category_id, name, description, price, emoji, is_veg, is_available, spice_level, tags, sort_order)
values
  -- Chhattisgarhi Specials
  ('chila',   'cg-specials', 'Chila',  'Soft rice-and-lentil pancake, a Chhattisgarhi breakfast classic, served with green chutney.', 70,  '🥞', true, true, 1, '{local}', 1),
  ('fara',    'cg-specials', 'Fara',   'Steamed rice dumplings tempered with mustard and curry leaves.',                                80,  '🥟', true, true, 1, '{local}', 2),
  ('muthia',  'cg-specials', 'Muthia', 'Steamed, pan-tossed rice-flour rolls — light and savoury.',                                   90,  '🧆', true, true, 1, '{local}', 3),
  ('aamat',   'cg-specials', 'Aamat',  'Traditional tangy mixed-vegetable curry with local spices.',                                  120, '🍲', true, true, 2, '{local,chef-special}', 4),
  -- Starters
  ('paneer-tikka',     'starters', 'Paneer Tikka',            'Char-grilled cottage cheese marinated in yogurt and spices.',                 180, '🧀', true,  true, 2, '{bestseller}', 1),
  ('veg-manchurian',   'starters', 'Veg Manchurian',          'Crispy vegetable balls tossed in a tangy Indo-Chinese sauce.',               150, '🥬', true,  true, 2, '{}', 2),
  ('chicken-65',       'starters', 'Chicken 65',              'Fiery South-Indian style fried chicken with curry leaves.',                  220, '🍗', false, true, 3, '{bestseller}', 3),
  ('tandoori-chicken', 'starters', 'Tandoori Chicken (Half)', 'Clay-oven roasted chicken in a smoky tandoori marinade.',                   260, '🍗', false, true, 2, '{}', 4),
  -- Main Course
  ('paneer-butter-masala', 'mains', 'Paneer Butter Masala', 'Cottage cheese in a rich, creamy tomato-cashew gravy.',                      220, '🍛', true,  true, 1, '{bestseller}', 1),
  ('dal-tadka',            'mains', 'Dal Tadka',            'Yellow lentils finished with a sizzling ghee tempering.',                    150, '🥘', true,  true, 1, '{}', 2),
  ('kadhai-chicken',       'mains', 'Kadhai Chicken',       'Chicken cooked with bell peppers and freshly ground spices.',                280, '🍛', false, true, 2, '{}', 3),
  ('butter-chicken',       'mains', 'Butter Chicken',       'Tandoori chicken simmered in a velvety buttery tomato gravy.',              300, '🍛', false, true, 1, '{chef-special}', 4),
  -- Breads
  ('tandoori-roti', 'breads', 'Tandoori Roti', 'Whole-wheat flatbread fresh from the clay oven.', 20, '🫓', true, true, 0, '{}', 1),
  ('butter-naan',   'breads', 'Butter Naan',   'Soft, fluffy naan brushed with butter.',          45, '🫓', true, true, 0, '{bestseller}', 2),
  ('garlic-naan',   'breads', 'Garlic Naan',   'Naan topped with garlic and coriander.',           60, '🫓', true, true, 0, '{}', 3),
  -- Rice & Biryani
  ('jeera-rice',      'rice', 'Jeera Rice',      'Basmati rice tempered with cumin.',                              120, '🍚', true,  true, 0, '{}', 1),
  ('veg-biryani',     'rice', 'Veg Biryani',     'Fragrant dum-cooked rice with seasonal vegetables.',             180, '🍚', true,  true, 2, '{}', 2),
  ('chicken-biryani', 'rice', 'Chicken Biryani', 'Layered basmati and chicken slow-cooked on dum.',               240, '🍛', false, true, 2, '{bestseller}', 3),
  -- Chinese
  ('veg-noodles',        'chinese', 'Veg Hakka Noodles',  'Wok-tossed noodles with crunchy vegetables.',          140, '🍜', true,  true, 1, '{}', 1),
  ('chicken-fried-rice', 'chinese', 'Chicken Fried Rice', 'Stir-fried rice with chicken and spring onions.',      170, '🍚', false, true, 1, '{}', 2),
  -- Beverages
  ('masala-chai', 'beverages', 'Masala Chai',      'Spiced milk tea brewed fresh.',          25, '🍵', true, true, 0, '{}', 1),
  ('sweet-lassi', 'beverages', 'Sweet Lassi',      'Thick, chilled yogurt drink.',           60, '🥛', true, true, 0, '{}', 2),
  ('lime-soda',   'beverages', 'Fresh Lime Soda',  'Sweet-and-salty fresh lime soda.',       50, '🥤', true, true, 0, '{}', 3),
  -- Desserts
  ('dehrori',     'desserts', 'Dehrori',              'Chhattisgarhi fried rice-batter sweet soaked in sugar syrup.', 90, '🍮', true, true, 0, '{local}', 1),
  ('gulab-jamun', 'desserts', 'Gulab Jamun (2 pc)',   'Warm milk-solid dumplings in rose-cardamom syrup.',           60, '🍩', true, true, 0, '{}', 2)
on conflict (id) do nothing;
