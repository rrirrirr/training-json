-- Seed file: Insert test plan data
-- This provides consistent test data for local development and testing

-- Insert test plans
INSERT INTO public.training_plans (id, plan_data, created_at)
VALUES 
  (
    '123e4567-e89b-12d3-a456-426614174000', -- TEST_PLAN_ID
    '{
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "metadata": {
        "planName": "Test Training Plan",
        "creationDate": "2023-01-01T00:00:00.000Z"
      },
      "weekTypes": [
        {
          "id": 1,
          "name": "Regular",
          "colorName": "blue"
        }
      ],
      "exerciseDefinitions": [
        {
          "id": "ex1",
          "name": "Squat",
          "category": "Legs"
        }
      ],
      "weeks": [
        {
          "weekNumber": 1,
          "weekType": "Regular",
          "weekTypeIds": [1],
          "sessions": []
        }
      ],
      "monthBlocks": [
        {
          "id": 1,
          "name": "First Block",
          "weekNumbers": [1]
        }
      ]
    }'::jsonb,
    '2023-01-01T00:00:00.000Z'
  ),
  (
    '123e4567-e89b-12d3-a456-426614174001', -- OTHER_PLAN_ID
    '{
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "metadata": {
        "planName": "Other Training Plan",
        "creationDate": "2023-01-02T00:00:00.000Z"
      },
      "weekTypes": [],
      "exerciseDefinitions": [],
      "weeks": [],
      "monthBlocks": []
    }'::jsonb,
    '2023-01-02T00:00:00.000Z'
  );
