-- Устраняем дубликаты sort_order: плотная нумерация 0..n-1 по текущему порядку
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (ORDER BY sort_order ASC, created_at ASC, id ASC) - 1 AS rn
  FROM categories
)
UPDATE categories AS c
SET sort_order = r.rn
FROM ranked r
WHERE c.id = r.id;

-- CreateIndex
CREATE UNIQUE INDEX "categories_sort_order_key" ON "categories"("sort_order");
