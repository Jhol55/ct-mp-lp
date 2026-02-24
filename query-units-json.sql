-- Query SQL para retornar todas as unidades com seus dados relacionados em formato JSON
-- Execute esta query no PostgreSQL para obter um JSON completo de todas as unidades

SELECT 
  json_agg(
    json_build_object(
      'name', u.name,
      'plansImageUrl', u."plansImageUrl",
      'scheduleImageUrl', u."scheduleImageUrl",
      'address', u.address,
      'addressNumber', u."addressNumber",
      'neighborhood', u.neighborhood,
      'city', u.city,
      'state', u.state,
      'zipCode', u."zipCode",
      'plans', COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'name', p.name,
              'frequencyLabel', p."frequencyLabel",
              'minAge', p."minAge",
              'maxAge', p."maxAge",
              'notes', p.notes,
              'prices', COALESCE(
                (
                  SELECT json_agg(
                    json_build_object(
                      'id', pp.id,
                      'model', pp.model,
                      'priceCents', pp."priceCents"
                    )
                    ORDER BY pp.model
                  )
                  FROM plan_prices pp
                  WHERE pp."planId" = p.id
                ),
                '[]'::json
              )
            )
            ORDER BY p."createdAt"
          )
          FROM plans p
          WHERE p."unitId" = u.id
        ),
        '[]'::json
      ),
      'scheduleSlots', COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'dayOfWeek', ss."dayOfWeek",
              'time', ss.time,
              'modality', ss.modality,
              'classType', ss."classType",
              'durationMinutes', ss."durationMinutes"
            )
            ORDER BY ss."dayOfWeek", ss.time
          )
          FROM schedule_slots ss
          WHERE ss."unitId" = u.id
        ),
        '[]'::json
      )
    )
    ORDER BY u."createdAt"
  ) AS units
FROM units u;

-- Versão alternativa: retornar cada unidade como uma linha JSON separada
-- Descomente a query abaixo se preferir uma linha por unidade ao invés de um array único

/*
SELECT 
  json_build_object(
    'id', u.id,
    'name', u.name,
    'plansImageUrl', u."plansImageUrl",
    'plansImageKey', u."plansImageKey",
    'scheduleImageUrl', u."scheduleImageUrl",
    'scheduleImageKey', u."scheduleImageKey",
    'address', u.address,
    'addressNumber', u."addressNumber",
    'neighborhood', u.neighborhood,
    'city', u.city,
    'state', u.state,
    'zipCode', u."zipCode",
    'createdAt', u."createdAt",
    'updatedAt', u."updatedAt",
    'plans', COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'id', p.id,
            'name', p.name,
            'frequencyLabel', p."frequencyLabel",
            'minAge', p."minAge",
            'maxAge', p."maxAge",
            'notes', p.notes,
            'createdAt', p."createdAt",
            'updatedAt', p."updatedAt",
            'prices', COALESCE(
              (
                SELECT json_agg(
                  json_build_object(
                    'id', pp.id,
                    'model', pp.model,
                    'priceCents', pp."priceCents",
                    'createdAt', pp."createdAt",
                    'updatedAt', pp."updatedAt"
                  )
                  ORDER BY pp.model
                )
                FROM plan_prices pp
                WHERE pp."planId" = p.id
              ),
              '[]'::json
            )
          )
          ORDER BY p."createdAt"
        )
        FROM plans p
        WHERE p."unitId" = u.id
      ),
      '[]'::json
    ),
    'scheduleSlots', COALESCE(
      (
        SELECT json_agg(
          json_build_object(
            'id', ss.id,
            'dayOfWeek', ss."dayOfWeek",
            'time', ss.time,
            'modality', ss.modality,
            'classType', ss."classType",
            'durationMinutes', ss."durationMinutes",
            'createdAt', ss."createdAt",
            'updatedAt', ss."updatedAt"
          )
          ORDER BY ss."dayOfWeek", ss.time
        )
        FROM schedule_slots ss
        WHERE ss."unitId" = u.id
      ),
      '[]'::json
    ),
    'scheduleVisibility', COALESCE(
      (
        SELECT json_build_object(
          'id', sv.id,
          'hiddenTimeSlots', sv."hiddenTimeSlots",
          'createdAt', sv."createdAt",
          'updatedAt', sv."updatedAt"
        )
        FROM schedule_visibility sv
        WHERE sv."unitId" = u.id
      ),
      NULL
    )
  ) AS unit
FROM units u
ORDER BY u."createdAt";
*/
