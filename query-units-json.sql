SELECT 
  json_agg(
    json_build_object(
      'name', u.name,
      'scheduleImageUrl', u."scheduleImageUrl",
      'address', u.address,
      'addressNumber', u."addressNumber",
      'neighborhood', u.neighborhood,
      'city', u.city,
      'state', u.state,
      'zipCode', u."zipCode",
      'paymentMethods', u."paymentMethods",
      'cancellationRules', u."cancellationRules",
      'generalNotes', u."generalNotes",
      'trialClassRulesImageUrl', u."trialClassRulesImageUrl",
      'trialClassRulesText', u."trialClassRulesText",
      'trialClassNotes', u."trialClassNotes",
      'scheduleExplanationImageUrl', u."scheduleExplanationImageUrl",
      'scheduleExplanationText', u."scheduleExplanationText",
      'modalities', COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'modality', m.modality,
              'plansImageUrl', m."imageUrl",
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
                  WHERE p."modalityId" = m.id
                ),
                '[]'::json
              )
            )
            ORDER BY m.modality
          )
          FROM modalities m
          WHERE m."unitId" = u.id
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
      ),
      'partners', COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'name', pt.name,
              'rulesAndNotes', pt."rulesAndNotes"
            )
            ORDER BY pt."createdAt"
          )
          FROM partners pt
          WHERE pt."unitId" = u.id
        ),
        '[]'::json
      )
    )
    ORDER BY u."createdAt"
  ) AS units
FROM units u;

-- Query para buscar unidades específicas por lista de nomes
-- Uso: Substitua ARRAY['Nome1', 'Nome2', 'Nome3'] pelos nomes desejados
SELECT 
  json_agg(
    json_build_object(
      'name', u.name,
      'scheduleImageUrl', u."scheduleImageUrl",
      'address', u.address,
      'addressNumber', u."addressNumber",
      'neighborhood', u.neighborhood,
      'city', u.city,
      'state', u.state,
      'zipCode', u."zipCode",
      'paymentMethods', u."paymentMethods",
      'cancellationRules', u."cancellationRules",
      'generalNotes', u."generalNotes",
      'trialClassRulesImageUrl', u."trialClassRulesImageUrl",
      'trialClassRulesText', u."trialClassRulesText",
      'trialClassNotes', u."trialClassNotes",
      'scheduleExplanationImageUrl', u."scheduleExplanationImageUrl",
      'scheduleExplanationText', u."scheduleExplanationText",
      'modalities', COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'modality', m.modality,
              'plansImageUrl', m."imageUrl",
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
                  WHERE p."modalityId" = m.id
                ),
                '[]'::json
              )
            )
            ORDER BY m.modality
          )
          FROM modalities m
          WHERE m."unitId" = u.id
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
      ),
      'partners', COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'name', pt.name,
              'rulesAndNotes', pt."rulesAndNotes"
            )
            ORDER BY pt."createdAt"
          )
          FROM partners pt
          WHERE pt."unitId" = u.id
        ),
        '[]'::json
      )
    )
    ORDER BY u."createdAt"
  ) AS units
FROM units u
WHERE u.name = ANY(ARRAY['Nome1', 'Nome2', 'Nome3']);
