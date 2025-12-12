-- Seed Data for Personal Finance Control App
-- This file contains initial data for categories and categorization rules

-- ===========================================
-- Default Categories (System Categories)
-- ===========================================

-- Expense Categories
INSERT INTO public.categories (id, user_id, name, icon, color, type, parent_id, is_system) VALUES
  (gen_random_uuid(), NULL, 'Alimentação', '🍔', '#22C55E', 'expense', NULL, true),
  (gen_random_uuid(), NULL, 'Transporte', '🚗', '#3B82F6', 'expense', NULL, true),
  (gen_random_uuid(), NULL, 'Moradia', '🏠', '#8B5CF6', 'expense', NULL, true),
  (gen_random_uuid(), NULL, 'Lazer', '🎬', '#EC4899', 'expense', NULL, true),
  (gen_random_uuid(), NULL, 'Saúde', '💊', '#EF4444', 'expense', NULL, true),
  (gen_random_uuid(), NULL, 'Educação', '📚', '#F59E0B', 'expense', NULL, true),
  (gen_random_uuid(), NULL, 'Compras', '🛒', '#06B6D4', 'expense', NULL, true),
  (gen_random_uuid(), NULL, 'Assinaturas', '📱', '#6366F1', 'expense', NULL, true),
  (gen_random_uuid(), NULL, 'Outros', '📦', '#6B7280', 'expense', NULL, true);

-- Income Categories
INSERT INTO public.categories (id, user_id, name, icon, color, type, parent_id, is_system) VALUES
  (gen_random_uuid(), NULL, 'Salário', '💼', '#10B981', 'income', NULL, true),
  (gen_random_uuid(), NULL, 'Freelance', '💻', '#14B8A6', 'income', NULL, true),
  (gen_random_uuid(), NULL, 'Investimentos', '📈', '#8B5CF6', 'income', NULL, true),
  (gen_random_uuid(), NULL, 'Presente', '🎁', '#F472B6', 'income', NULL, true),
  (gen_random_uuid(), NULL, 'Reembolso', '💰', '#FBBF24', 'income', NULL, true),
  (gen_random_uuid(), NULL, 'Outros', '📦', '#6B7280', 'income', NULL, true);

-- ===========================================
-- Default Categorization Rules (System Rules)
-- ===========================================

-- Get category IDs for rules (using a DO block for dynamic insertion)
DO $$
DECLARE
  cat_alimentacao UUID;
  cat_transporte UUID;
  cat_moradia UUID;
  cat_lazer UUID;
  cat_saude UUID;
  cat_assinaturas UUID;
  cat_compras UUID;
BEGIN
  SELECT id INTO cat_alimentacao FROM public.categories WHERE name = 'Alimentação' AND is_system = true LIMIT 1;
  SELECT id INTO cat_transporte FROM public.categories WHERE name = 'Transporte' AND is_system = true LIMIT 1;
  SELECT id INTO cat_moradia FROM public.categories WHERE name = 'Moradia' AND is_system = true LIMIT 1;
  SELECT id INTO cat_lazer FROM public.categories WHERE name = 'Lazer' AND is_system = true LIMIT 1;
  SELECT id INTO cat_saude FROM public.categories WHERE name = 'Saúde' AND is_system = true LIMIT 1;
  SELECT id INTO cat_assinaturas FROM public.categories WHERE name = 'Assinaturas' AND is_system = true LIMIT 1;
  SELECT id INTO cat_compras FROM public.categories WHERE name = 'Compras' AND is_system = true LIMIT 1;

  -- Alimentação rules
  INSERT INTO public.categorization_rules (user_id, category_id, pattern, priority, is_active) VALUES
    (NULL, cat_alimentacao, 'ifood|rappi|uber\s*eats|delivery', 100, true),
    (NULL, cat_alimentacao, 'supermercado|mercado|atacadao|carrefour|extra|pao de acucar', 95, true),
    (NULL, cat_alimentacao, 'restaurante|lanchonete|pizzaria|hamburgueria|cafe|padaria', 90, true),
    (NULL, cat_alimentacao, 'mcdonalds|burger king|subway|starbucks|outback|habib', 90, true);

  -- Transporte rules
  INSERT INTO public.categorization_rules (user_id, category_id, pattern, priority, is_active) VALUES
    (NULL, cat_transporte, 'uber|99|cabify|taxi|lyft', 100, true),
    (NULL, cat_transporte, 'posto|shell|ipiranga|br\s*distribuidora|combustivel|gasolina', 95, true),
    (NULL, cat_transporte, 'estacionamento|parking|zona\s*azul|estapar', 90, true),
    (NULL, cat_transporte, 'pedagio|sem\s*parar|conectcar|veloe', 90, true);

  -- Moradia rules
  INSERT INTO public.categorization_rules (user_id, category_id, pattern, priority, is_active) VALUES
    (NULL, cat_moradia, 'aluguel|condominio|iptu', 100, true),
    (NULL, cat_moradia, 'luz|energia|cpfl|enel|eletrobras|cemig', 95, true),
    (NULL, cat_moradia, 'agua|sabesp|sanepar|copasa', 95, true),
    (NULL, cat_moradia, 'gas|comgas|ultragaz', 95, true),
    (NULL, cat_moradia, 'internet|wifi|vivo\s*fibra|claro\s*internet|net\s*virtua', 90, true);

  -- Lazer rules
  INSERT INTO public.categorization_rules (user_id, category_id, pattern, priority, is_active) VALUES
    (NULL, cat_lazer, 'cinema|cinemark|uci|kinoplex', 100, true),
    (NULL, cat_lazer, 'teatro|show|ingresso|ticket|eventim', 95, true),
    (NULL, cat_lazer, 'hotel|airbnb|booking|hospedagem', 90, true),
    (NULL, cat_lazer, 'viagem|passagem|latam|gol|azul|cvc', 90, true);

  -- Saúde rules
  INSERT INTO public.categorization_rules (user_id, category_id, pattern, priority, is_active) VALUES
    (NULL, cat_saude, 'farmacia|drogaria|drogasil|pacheco|raia', 100, true),
    (NULL, cat_saude, 'medico|consulta|clinica|hospital|laboratorio', 95, true),
    (NULL, cat_saude, 'plano\s*de\s*saude|unimed|amil|sulamerica|bradesco\s*saude', 95, true),
    (NULL, cat_saude, 'academia|smart\s*fit|bodytech|bio\s*ritmo', 90, true);

  -- Assinaturas rules
  INSERT INTO public.categorization_rules (user_id, category_id, pattern, priority, is_active) VALUES
    (NULL, cat_assinaturas, 'netflix|prime\s*video|disney|hbo|star\+|globoplay', 100, true),
    (NULL, cat_assinaturas, 'spotify|deezer|youtube\s*music|apple\s*music|tidal', 100, true),
    (NULL, cat_assinaturas, 'icloud|google\s*one|dropbox|onedrive', 95, true),
    (NULL, cat_assinaturas, 'xbox|playstation|nintendo|steam', 90, true);

  -- Compras rules
  INSERT INTO public.categorization_rules (user_id, category_id, pattern, priority, is_active) VALUES
    (NULL, cat_compras, 'amazon|mercado\s*livre|shopee|aliexpress|shein', 100, true),
    (NULL, cat_compras, 'magazine\s*luiza|magalu|americanas|casas\s*bahia|ponto', 95, true),
    (NULL, cat_compras, 'renner|riachuelo|cea|zara|hm', 90, true);

END $$;

-- Log seed execution
DO $$
BEGIN
  RAISE NOTICE 'Seed data inserted successfully';
  RAISE NOTICE 'Categories: % expense, % income', 
    (SELECT COUNT(*) FROM public.categories WHERE type = 'expense' AND is_system = true),
    (SELECT COUNT(*) FROM public.categories WHERE type = 'income' AND is_system = true);
  RAISE NOTICE 'Categorization rules: %', 
    (SELECT COUNT(*) FROM public.categorization_rules WHERE user_id IS NULL);
END $$;

