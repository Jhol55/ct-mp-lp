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
      'paymentMethods', u."paymentMethods",
      'cancellationRules', u."cancellationRules",
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
              'classType', CASE 
                  WHEN ss."classType"::TEXT = 'LIVRE' THEN 'ADULTOS E KIDS' 
                  ELSE ss."classType"::TEXT 
              END,
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

-