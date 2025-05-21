-- supabase/seed.sql

-- Clear out specific known plan IDs before inserting to prevent conflicts
DELETE FROM public.training_plans WHERE id IN (
    '00000000-0000-0000-0000-000000000001', -- Main Example Plan
    '00000000-0000-0000-0000-000000000002', -- COLOR test Plan
    '123e4567-e89b-12d3-a456-426614174000', -- TEST_PLAN_ID
    '123e4567-e89b-12d3-a456-426614174001'  -- OTHER_PLAN_ID
);

-- Insert the main "Example Training Plan" (used by the "Load Example" button)
INSERT INTO public.training_plans (id, plan_data, created_at, last_accessed_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    '{
      "metadata": {
        "planName": "5x5 Strength Training Program (Seeded Example)",
        "creationDate": "2025-04-08T10:00:00Z",
        "description": "A 20-week strength training program with progressive overload based on 5x5 methodology, seeded from seed.sql",
        "author": "Training Plan App Team",
        "version": "1.0.0",
        "creator": "system"
      },
      "weekTypes": [
        { "id": "deload", "name": "DELOAD", "colorName": "yellow", "description": "Lower intensity recovery week" },
        { "id": "test", "name": "TEST", "colorName": "green", "description": "Testing maximum strength" },
        { "id": "competition", "name": "COMP", "colorName": "red", "description": "Competition preparation week" }
      ],
      "sessionTypes": [
        { "id": "gym", "name": "Gym", "defaultStyle": { "colorName": "blue" } },
        { "id": "barmark", "name": "Barmark", "defaultStyle": { "colorName": "green" } },
        { "id": "rest", "name": "Eget/Vila", "defaultStyle": { "colorName": "gray" } }
      ],
      "blocks": [
        { "id": "block-1", "name": "Foundation Phase", "weeks": [1, 2], "focus": "Grund & Volym", "durationWeeks": 4, "description": "Månad 1 (Vecka 1-4): 3 Gympass/vecka - Block 1: Grund & Volym", "style": { "colorName": "violet" } },
        { "id": "block-2", "name": "Strength Building Phase", "weeks": [], "focus": "Styrkeuppbyggnad", "durationWeeks": 4, "description": "Månad 2 (Vecka 5-8): 3 Gympass/vecka - Block 2: Styrkeuppbyggnad", "style": { "colorName": "blue" } },
        { "id": "block-3", "name": "Power Phase", "weeks": [], "focus": "Styrka & Kraft", "durationWeeks": 4, "description": "Månad 3 (Vecka 9-12): 4 Gympass/vecka - Block 3: Styrka & Kraft", "style": { "colorName": "indigo" } },
        { "id": "block-4", "name": "Deload Phase", "weeks": [16], "focus": "Återhämtning & Kraft", "durationWeeks": 4, "description": "Månad 4 (Vecka 13-16): 4 Gympass/vecka - Block 3: Styrka & Kraft", "style": { "colorName": "yellow" } },
        { "id": "block-5", "name": "Testing Phase", "weeks": [18, 20], "focus": "Maxstyrka & Test", "durationWeeks": 4, "description": "Månad 5 (Vecka 17-20): 4 Gympass/vecka - Block 4: Maxstyrka & Test", "style": { "colorName": "green" } }
      ],
      "exerciseDefinitions": [
        { "id": "sq", "name": "Knäböj (SQ)", "isMainLift": true, "targetMuscles": ["Quads", "Glutes", "Core"], "generalTips": "Håll ryggen rak, knäna i linje med tårna" },
        { "id": "bp", "name": "Bänkpress (BP)", "isMainLift": true, "targetMuscles": ["Chest", "Triceps", "Shoulders"], "generalTips": "Håll skulderbladen ihopdragna" },
        { "id": "dl", "name": "Marklyft (DL)", "isMainLift": true, "targetMuscles": ["Hamstrings", "Lower Back", "Glutes"], "generalTips": "Håll ryggen rak, börja med höfterna lägre än axlarna" },
        { "id": "ohp", "name": "Militärpress (OHP)", "isMainLift": true, "targetMuscles": ["Shoulders", "Triceps", "Upper Back"], "generalTips": "Pressa stången rakt upp, aktivera core för stabilitet" },
        { "id": "pc", "name": "Frivändning (PC)", "isMainLift": true, "targetMuscles": ["Full Body", "Quads", "Shoulders"], "generalTips": "Explosiv rörelse, håll stången nära kroppen" },
        { "id": "db_row", "name": "Hantelrodd (DB Row)", "isAccessory": true, "targetMuscles": ["Upper Back", "Biceps", "Forearms"], "generalTips": "Håll ryggen parallell med golvet, dra hanteln mot höften" },
        { "id": "face_pulls", "name": "Face Pulls", "isAccessory": true, "targetMuscles": ["Rear Delts", "Rotator Cuff", "Upper Back"], "generalTips": "Dra mot ansiktet, fokusera på att rotera axlarna utåt" },
        { "id": "farmers_walk", "name": "Farmer''s Walk", "isAccessory": true, "targetMuscles": ["Forearms", "Traps", "Core"], "generalTips": "Håll hantlarna vid sidan, gå med rak rygg" },
        { "id": "lat_pulldown", "name": "Latsdrag", "isAccessory": true, "targetMuscles": ["Lats", "Biceps", "Rear Delts"], "generalTips": "Dra stången till bröstet, fokusera på att aktivera latsen" },
        { "id": "bicep_curl", "name": "Biceps Curl", "isAccessory": true, "targetMuscles": ["Biceps", "Forearms"], "generalTips": "Håll armbågarna stilla, fokusera på full rörelse" },
        { "id": "plank", "name": "Plankan", "isAccessory": true, "targetMuscles": ["Core", "Shoulders"], "generalTips": "Håll kroppen i en rak linje, aktivera core" },
        { "id": "side_plank", "name": "Sidoplanka", "isAccessory": true, "targetMuscles": ["Obliques", "Core", "Shoulders"], "generalTips": "Håll kroppen i en rak linje, lyft höften från golvet" },
        { "id": "chins", "name": "Chins", "isAccessory": true, "targetMuscles": ["Lats", "Biceps", "Upper Back"], "generalTips": "Dra hakan över stången, fokusera på full rörelse" },
        { "id": "rdl", "name": "Rumänsk Marklyft (RDL)", "isAccessory": true, "targetMuscles": ["Hamstrings", "Glutes", "Lower Back"], "generalTips": "Håll ryggen rak, fokusera på att sträcka hamstrings" },
        { "id": "bp_var", "name": "Bänkpress Variation", "isAccessory": true, "targetMuscles": ["Chest", "Triceps", "Shoulders"], "generalTips": "Variera greppet för att aktivera olika delar av bröstmuskeln" },
        { "id": "light_cardio", "name": "Lätt löpning", "isAccessory": true, "targetMuscles": ["Cardiovascular", "Legs"], "generalTips": "Håll låg intensitet, fokusera på andning" },
        { "id": "mobility", "name": "Rörlighetsövningar", "isAccessory": true, "targetMuscles": ["Full Body", "Joints"], "generalTips": "Fokusera på problemområden, håll stretcharna i 30-60 sekunder" },
        { "id": "rest", "name": "Vila", "targetMuscles": [], "generalTips": "Återhämtning är viktigt för muskeluppbyggnad" },
        { "id": "own_choice", "name": "(Chins/Dips/Löpning/Hopp)", "targetMuscles": ["Varies"], "generalTips": "Välj övningar som kompletterar ditt program" }
      ],
      "weeks": [
        { "weekNumber": 1, "weekType": "A", "blockId": "block-1", "gymDays": 3, "weekTypeIds": [], "tm": { "SQ": 115, "BP": 80, "DL": 140, "OHP": 50 }, "weekStyle": { "colorName": "violet" }, "sessions": [
          { "sessionName": "Gympass 1", "sessionTypeId": "gym", "sessionStyle": { "colorName": "green" }, "exercises": [
            { "exerciseId": "sq", "sets": 3, "reps": "8", "load": "90 kg (~78%)", "comment": "Startvikt. Teknik!", "loadStyle": { "strong": true, "color": "blue"} },
            { "exerciseId": "bp", "sets": 3, "reps": "8", "load": "60 kg (75%)", "comment": "Öka mot 65kg snabbt om lätt." },
            { "exerciseId": "db_row", "sets": 3, "reps": "8-10 /arm", "load": "Tungt, RPE 8-9", "comment": "" },
            { "exerciseId": "face_pulls", "sets": 3, "reps": "15", "load": "Lätt", "comment": "Axel Hälsa" },
            { "exerciseId": "farmers_walk", "sets": 3, "reps": "30-40m", "load": "Tungt grepp", "comment": "" }
          ]},
          { "sessionName": "Eget Pass / Övrigt", "sessionTypeId": "rest", "sessionStyle": { "colorName": "gray" }, "exercises": [
            { "exerciseId": "own_choice", "sets": "-", "reps": "-", "load": "-", "comment": "Du planerar" }
          ]},
          { "sessionName": "Gympass 2", "sessionTypeId": "gym", "sessionStyle": { "colorName": "blue" }, "exercises": [
            { "exerciseId": "pc", "sets": 3, "reps": "5", "load": "Teknik, lätt", "comment": "Fokus på teknik" },
            { "exerciseId": "ohp", "sets": 3, "reps": "8", "load": "40 kg (80%)", "comment": "" },
            { "exerciseId": "lat_pulldown", "sets": 3, "reps": "10-12", "load": "Medel", "comment": "" },
            { "exerciseId": "bicep_curl", "sets": 3, "reps": "10-12", "load": "Medel-Tungt", "comment": "" },
            { "exerciseId": "plank", "sets": 3, "reps": "30-45s", "load": "-", "comment": "Bålstabilitet" }
          ]},
          { "sessionName": "Eget Pass / Övrigt", "sessionTypeId": "rest", "sessionStyle": { "colorName": "gray" }, "exercises": [
            { "exerciseId": "own_choice", "sets": "-", "reps": "-", "load": "-", "comment": "Du planerar" }
          ]},
          { "sessionName": "Gympass 3", "sessionTypeId": "gym", "sessionStyle": { "colorName": "blue" }, "exercises": [
            { "exerciseId": "pc", "sets": 3, "reps": "3", "load": "Lätt", "comment": "Teknikövning" },
            { "exerciseId": "dl", "sets": 3, "reps": "8", "load": "110 kg (~78%)", "comment": "Startvikt" },
            { "exerciseId": "bp_var", "sets": 3, "reps": "10", "load": "50 kg (~62%)", "comment": "Bredare grepp" },
            { "exerciseId": "chins", "sets": "3-4", "reps": "AMRAP", "load": "Kroppsvikt", "comment": "Så många som möjligt" },
            { "exerciseId": "side_plank", "sets": 2, "reps": "30s /sida", "load": "-", "comment": "" }
          ]},
          { "sessionName": "Vila / Eget Pass", "sessionTypeId": "rest", "sessionStyle": { "colorName": "gray" }, "exercises": [
            { "exerciseId": "own_choice", "sets": "-", "reps": "-", "load": "-", "comment": "Du planerar" }
          ]}
        ]},
        { "weekNumber": 2, "weekType": "B", "blockId": "block-1", "gymDays": 3, "weekTypeIds": [], "tm": { "SQ": 120, "BP": 82.5, "DL": 145, "OHP": 52.5 }, "weekStyle": { "colorName": "violet" }, "sessions": [
          { "sessionName": "Gympass 1", "sessionTypeId": "gym", "sessionStyle": { "colorName": "blue" }, "exercises": [
            { "exerciseId": "sq", "sets": 3, "reps": "8", "load": "95 kg (~79%)", "comment": "Öka från förra veckan" },
            { "exerciseId": "bp", "sets": 3, "reps": "8", "load": "65 kg (~79%)", "comment": "" },
            { "exerciseId": "db_row", "sets": 3, "reps": "8-10 /arm", "load": "Tungt, RPE 8-9", "comment": "Öka från förra veckan" },
            { "exerciseId": "face_pulls", "sets": 3, "reps": "15", "load": "Lätt", "comment": "Axel Hälsa" },
            { "exerciseId": "farmers_walk", "sets": 3, "reps": "30-40m", "load": "Tungt grepp", "comment": "Öka från förra veckan" }
          ]}
        ]},
        { "weekNumber": 16, "weekType": "A", "blockId": "block-4", "gymDays": 4, "weekTypeIds": ["deload"], "tm": { "SQ": 150, "BP": 100, "DL": 180, "OHP": 65 }, "weekStyle": { "colorName": "yellow" }, "sessions": [
          { "sessionName": "Gympass 1 (DELOAD)", "sessionTypeId": "gym", "sessionStyle": { "colorName": "blue" }, "exercises": [
            { "exerciseId": "sq", "sets": 3, "reps": "5", "load": "105 kg (70%)", "comment": "Lätt deload" },
            { "exerciseId": "bp", "sets": 3, "reps": "5", "load": "70 kg (70%)", "comment": "Lätt deload" }
          ]}
        ]},
        { "weekNumber": 18, "weekType": "A", "blockId": "block-5", "gymDays": 3, "weekTypeIds": ["deload", "competition"], "weekStyle": { "colorName": "red" }, "sessions": [
            { "sessionName": "Gympass 1 (Comp Prep)", "sessionTypeId": "gym", "sessionStyle": { "colorName": "red" }, "exercises": [
                { "exerciseId": "sq", "sets": 3, "reps": "3", "load": "130 kg (85%)", "comment": "Competition prep" }
            ]}
        ]},
        { "weekNumber": 20, "weekType": "A", "blockId": "block-5", "gymDays": 4, "weekTypeIds": ["test"], "weekStyle": { "colorName": "green" }, "sessions": [
          { "sessionName": "Gympass 1 (TEST)", "sessionTypeId": "gym", "sessionStyle": { "colorName": "blue" }, "exercises": [
            { "exerciseId": "sq", "sets": 1, "reps": "1-3", "load": "1RM Test", "comment": "Maxtest" },
            { "exerciseId": "bp", "sets": 1, "reps": "1-3", "load": "1RM Test", "comment": "Maxtest" }
          ]}
        ]}
      ]
    }'::jsonb,
    NOW(), -- created_at
    NOW()  -- last_accessed_at
);

-- Insert TEST_PLAN_ID (used for specific tests)
INSERT INTO public.training_plans (id, plan_data, created_at, last_accessed_at)
VALUES (
   '123e4567-e89b-12d3-a456-426614174000', -- TEST_PLAN_ID
    '{
      "metadata": {
        "planName": "Test Training Plan",
        "creationDate": "2023-01-01T00:00:00.000Z"
      },
      "weekTypes": [{"id": "regular", "name": "Regular", "colorName": "blue"}],
      "exerciseDefinitions": [{"id": "ex1", "name": "Squat"}],
      "weeks": [
        {
          "weekNumber": 1, "blockId": 1, "weekTypeIds": ["regular"], "sessions": [
            {"sessionName": "Day 1: Full Body Workout", "sessionTypeId": "gym", "exercises": [
              {"exerciseId": "ex1", "sets": 3, "reps": "8-12", "load": "70% 1RM"}
            ]}
          ]
        }
      ],
      "blocks": [{"id": 1, "name": "First Block", "weeks": [1]}]
    }'::jsonb,
    '2023-01-01T00:00:00.000Z',
    NOW()
);

-- Insert OTHER_PLAN_ID (used for specific tests)
INSERT INTO public.training_plans (id, plan_data, created_at, last_accessed_at)
VALUES (
    '123e4567-e89b-12d3-a456-426614174001', -- OTHER_PLAN_ID
    '{
      "metadata": {
        "planName": "Other Training Plan",
        "creationDate": "2023-01-02T00:00:00.000Z"
      },
      "weekTypes": [],
      "exerciseDefinitions": [],
      "weeks": [],
      "blocks": []
    }'::jsonb,
    '2023-01-02T00:00:00.000Z',
    NOW()
);


-- Insert the Color Theme Showcase Plan with revised spacing
INSERT INTO public.training_plans (id, plan_data, created_at, last_accessed_at)
VALUES (
    '00000000-0000-0000-0000-000000000002',
    '{
      "metadata" : {
        "planName" : "Color Theme Showcase Plan",
        "creationDate" : "2025-05-22T15:00:00Z",
        "description" : "A plan to test all available ColorName options for UI elements and contrast themes.",
        "author" : "T-JSON Seed",
        "version" : "1.0.2",
        "creator" : "system"
      },
      "weekTypes" : [
        { "id" : "wt-slate", "name" : "WT Slate", "colorName" : "slate", "description" : "Slate Week Type" }, { "id" : "wt-gray", "name" : "WT Gray", "colorName" : "gray", "description" : "Gray Week Type" },
        { "id" : "wt-zinc", "name" : "WT Zinc", "colorName" : "zinc", "description" : "Zinc Week Type" }, { "id" : "wt-neutral", "name" : "WT Neutral", "colorName" : "neutral", "description" : "Neutral Week Type" },
        { "id" : "wt-stone", "name" : "WT Stone", "colorName" : "stone", "description" : "Stone Week Type" }, { "id" : "wt-red", "name" : "WT Red", "colorName" : "red", "description" : "Red Week Type" },
        { "id" : "wt-orange", "name" : "WT Orange", "colorName" : "orange", "description" : "Orange Week Type" }, { "id" : "wt-amber", "name" : "WT Amber", "colorName" : "amber", "description" : "Amber Week Type" },
        { "id" : "wt-yellow", "name" : "WT Yellow", "colorName" : "yellow", "description" : "Yellow Week Type" }, { "id" : "wt-lime", "name" : "WT Lime", "colorName" : "lime", "description" : "Lime Week Type" },
        { "id" : "wt-green", "name" : "WT Green", "colorName" : "green", "description" : "Green Week Type" }, { "id" : "wt-emerald", "name" : "WT Emerald", "colorName" : "emerald", "description" : "Emerald Week Type" },
        { "id" : "wt-teal", "name" : "WT Teal", "colorName" : "teal", "description" : "Teal Week Type" }, { "id" : "wt-cyan", "name" : "WT Cyan", "colorName" : "cyan", "description" : "Cyan Week Type" },
        { "id" : "wt-sky", "name" : "WT Sky", "colorName" : "sky", "description" : "Sky Week Type" }, { "id" : "wt-blue", "name" : "WT Blue", "colorName" : "blue", "description" : "Blue Week Type" },
        { "id" : "wt-indigo", "name" : "WT Indigo", "colorName" : "indigo", "description" : "Indigo Week Type" }, { "id" : "wt-violet", "name" : "WT Violet", "colorName" : "violet", "description" : "Violet Week Type" },
        { "id" : "wt-purple", "name" : "WT Purple", "colorName" : "purple", "description" : "Purple Week Type" }, { "id" : "wt-fuchsia", "name" : "WT Fuchsia", "colorName" : "fuchsia", "description" : "Fuchsia Week Type" },
        { "id" : "wt-pink", "name" : "WT Pink", "colorName" : "pink", "description" : "Pink Week Type" }, { "id" : "wt-rose", "name" : "WT Rose", "colorName" : "rose", "description" : "Rose Week Type" }
      ],
      "sessionTypes" : [
        { "id" : "st-slate", "name" : "Slate ST", "defaultStyle" : { "colorName" : "slate" } }, { "id" : "st-gray", "name" : "Gray ST", "defaultStyle" : { "colorName" : "gray" } },
        { "id" : "st-zinc", "name" : "Zinc ST", "defaultStyle" : { "colorName" : "zinc" } }, { "id" : "st-neutral", "name" : "Neutral ST", "defaultStyle" : { "colorName" : "neutral" } },
        { "id" : "st-stone", "name" : "Stone ST", "defaultStyle" : { "colorName" : "stone" } }, { "id" : "st-red", "name" : "Red ST", "defaultStyle" : { "colorName" : "red" } },
        { "id" : "st-orange", "name" : "Orange ST", "defaultStyle" : { "colorName" : "orange" } }, { "id" : "st-amber", "name" : "Amber ST", "defaultStyle" : { "colorName" : "amber" } },
        { "id" : "st-yellow", "name" : "Yellow ST", "defaultStyle" : { "colorName" : "yellow" } }, { "id" : "st-lime", "name" : "Lime ST", "defaultStyle" : { "colorName" : "lime" } },
        { "id" : "st-green", "name" : "Green ST", "defaultStyle" : { "colorName" : "green" } }, { "id" : "st-emerald", "name" : "Emerald ST", "defaultStyle" : { "colorName" : "emerald" } },
        { "id" : "st-teal", "name" : "Teal ST", "defaultStyle" : { "colorName" : "teal" } }, { "id" : "st-cyan", "name" : "Cyan ST", "defaultStyle" : { "colorName" : "cyan" } },
        { "id" : "st-sky", "name" : "Sky ST", "defaultStyle" : { "colorName" : "sky" } }, { "id" : "st-blue", "name" : "Blue ST", "defaultStyle" : { "colorName" : "blue" } },
        { "id" : "st-indigo", "name" : "Indigo ST", "defaultStyle" : { "colorName" : "indigo" } }, { "id" : "st-violet", "name" : "Violet ST", "defaultStyle" : { "colorName" : "violet" } },
        { "id" : "st-purple", "name" : "Purple ST", "defaultStyle" : { "colorName" : "purple" } }, { "id" : "st-fuchsia", "name" : "Fuchsia ST", "defaultStyle" : { "colorName" : "fuchsia" } },
        { "id" : "st-pink", "name" : "Pink ST", "defaultStyle" : { "colorName" : "pink" } }, { "id" : "st-rose", "name" : "Rose ST", "defaultStyle" : { "colorName" : "rose" } }
      ],
      "exerciseDefinitions" : [
        { "id" : "color-ex", "name" : "Color Display Exercise", "generalTips" : "Observe the applied colors." }
      ],
      "blockDefinitions" : [
        { "id" : "bdef-group1", "name" : "Greyscale Definitions", "focus" : "Colors 1-5", "durationWeeks" : 5, "description" : "Slate, Gray, Zinc, Neutral, Stone", "style" : { "colorName" : "gray" } },
        { "id" : "bdef-group2", "name" : "Warm Definitions", "focus" : "Colors 6-10", "durationWeeks" : 5, "description" : "Red, Orange, Amber, Yellow, Lime", "style" : { "colorName" : "amber" } },
        { "id" : "bdef-group3", "name" : "Cool Definitions", "focus" : "Colors 11-16", "durationWeeks" : 6, "description" : "Green, Emerald, Teal, Cyan, Sky, Blue", "style" : { "colorName" : "teal" } },
        { "id" : "bdef-group4", "name" : "Purple/Pink Definitions", "focus" : "Colors 17-22", "durationWeeks" : 6, "description" : "Indigo, Violet, Purple, Fuchsia, Pink, Rose", "style" : { "colorName" : "violet" } }
      ],
      "weeks" : [
        { "weekNumber" : 1, "blockId" : "bdef-group1", "weekTypeIds" : [ "wt-slate" ], "weekStyle" : { "colorName" : "slate", "note" : "Slate Week Style" }, "sessions" : [ { "sessionName" : "Slate Session", "sessionTypeId" : "st-slate", "sessionStyle" : { "colorName" : "slate" }, "exercises" : [ { "exerciseId" : "color-ex", "sets" : 1, "reps" : "1", "load" : "Slate Load", "loadStyle" : { "color" : "slate" }, "comment" : "Slate Comment", "commentStyle" : { "color" : "slate" } } ] } ] },
        { "weekNumber" : 2, "blockId" : "bdef-group1", "weekTypeIds" : [ "wt-gray" ], "weekStyle" : { "colorName" : "gray", "note" : "Gray Week Style" }, "sessions" : [ { "sessionName" : "Gray Session", "sessionTypeId" : "st-gray", "sessionStyle" : { "colorName" : "gray" }, "exercises" : [ { "exerciseId" : "color-ex", "sets" : 1, "reps" : "1", "load" : "Gray Load", "loadStyle" : { "color" : "gray" }, "comment" : "Gray Comment", "commentStyle" : { "color" : "gray" } } ] } ] },
        { "weekNumber" : 3, "blockId" : "bdef-group1", "weekTypeIds" : [ "wt-zinc" ], "weekStyle" : { "colorName" : "zinc", "note" : "Zinc Week Style" }, "sessions" : [ { "sessionName" : "Zinc Session", "sessionTypeId" : "st-zinc", "sessionStyle" : { "colorName" : "zinc" }, "exercises" : [ { "exerciseId" : "color-ex", "sets" : 1, "reps" : "1", "load" : "Zinc Load", "loadStyle" : { "color" : "zinc" }, "comment" : "Zinc Comment", "commentStyle" : { "color" : "zinc" } } ] } ] },
        { "weekNumber" : 4, "blockId" : "bdef-group1", "weekTypeIds" : [ "wt-neutral" ], "weekStyle" : { "colorName" : "neutral", "note" : "Neutral Week Style" }, "sessions" : [ { "sessionName" : "Neutral Session", "sessionTypeId" : "st-neutral", "sessionStyle" : { "colorName" : "neutral" }, "exercises" : [ { "exerciseId" : "color-ex", "sets" : 1, "reps" : "1", "load" : "Neutral Load", "loadStyle" : { "color" : "neutral" }, "comment" : "Neutral Comment", "commentStyle" : { "color" : "neutral" } } ] } ] },
        { "weekNumber" : 5, "blockId" : "bdef-group1", "weekTypeIds" : [ "wt-stone" ], "weekStyle" : { "colorName" : "stone", "note" : "Stone Week Style" }, "sessions" : [ { "sessionName" : "Stone Session", "sessionTypeId" : "st-stone", "sessionStyle" : { "colorName" : "stone" }, "exercises" : [ { "exerciseId" : "color-ex", "sets" : 1, "reps" : "1", "load" : "Stone Load", "loadStyle" : { "color" : "stone" }, "comment" : "Stone Comment", "commentStyle" : { "color" : "stone" } } ] } ] },
        { "weekNumber" : 6, "blockId" : "bdef-group2", "weekTypeIds" : [ "wt-red" ], "weekStyle" : { "colorName" : "red", "note" : "Red Week Style" }, "sessions" : [ { "sessionName" : "Red Session", "sessionTypeId" : "st-red", "sessionStyle" : { "colorName" : "red" }, "exercises" : [ { "exerciseId" : "color-ex", "sets" : 1, "reps" : "1", "load" : "Red Load", "loadStyle" : { "color" : "red" }, "comment" : "Red Comment", "commentStyle" : { "color" : "red" } } ] } ] },
        { "weekNumber" : 7, "blockId" : "bdef-group2", "weekTypeIds" : [ "wt-orange" ], "weekStyle" : { "colorName" : "orange", "note" : "Orange Week Style" }, "sessions" : [ { "sessionName" : "Orange Session", "sessionTypeId" : "st-orange", "sessionStyle" : { "colorName" : "orange" }, "exercises" : [ { "exerciseId" : "color-ex", "sets" : 1, "reps" : "1", "load" : "Orange Load", "loadStyle" : { "color" : "orange" }, "comment" : "Orange Comment", "commentStyle" : { "color" : "orange" } } ] } ] },
        { "weekNumber" : 8, "blockId" : "bdef-group2", "weekTypeIds" : [ "wt-amber" ], "weekStyle" : { "colorName" : "amber", "note" : "Amber Week Style" }, "sessions" : [ { "sessionName" : "Amber Session", "sessionTypeId" : "st-amber", "sessionStyle" : { "colorName" : "amber" }, "exercises" : [ { "exerciseId" : "color-ex", "sets" : 1, "reps" : "1", "load" : "Amber Load", "loadStyle" : { "color" : "amber" }, "comment" : "Amber Comment", "commentStyle" : { "color" : "amber" } } ] } ] },
        { "weekNumber" : 9, "blockId" : "bdef-group2", "weekTypeIds" : [ "wt-yellow" ], "weekStyle" : { "colorName" : "yellow", "note" : "Yellow Week Style" }, "sessions" : [ { "sessionName" : "Yellow Session", "sessionTypeId" : "st-yellow", "sessionStyle" : { "colorName" : "yellow" }, "exercises" : [ { "exerciseId" : "color-ex", "sets" : 1, "reps" : "1", "load" : "Yellow Load", "loadStyle" : { "color" : "yellow" }, "comment" : "Yellow Comment", "commentStyle" : { "color" : "yellow" } } ] } ] },
        { "weekNumber" : 10, "blockId" : "bdef-group2", "weekTypeIds" : [ "wt-lime" ], "weekStyle" : { "colorName" : "lime", "note" : "Lime Week Style" }, "sessions" : [ { "sessionName" : "Lime Session", "sessionTypeId" : "st-lime", "sessionStyle" : { "colorName" : "lime" }, "exercises" : [ { "exerciseId" : "color-ex", "sets" : 1, "reps" : "1", "load" : "Lime Load", "loadStyle" : { "color" : "lime" }, "comment" : "Lime Comment", "commentStyle" : { "color" : "lime" } } ] } ] },
        { "weekNumber" : 11, "blockId" : "bdef-group3", "weekTypeIds" : [ "wt-green" ], "weekStyle" : { "colorName" : "green", "note" : "Green Week Style" }, "sessions" : [ { "sessionName" : "Green Session", "sessionTypeId" : "st-green", "sessionStyle" : { "colorName" : "green" }, "exercises" : [ { "exerciseId" : "color-ex", "sets" : 1, "reps" : "1", "load" : "Green Load", "loadStyle" : { "color" : "green" }, "comment" : "Green Comment", "commentStyle" : { "color" : "green" } } ] } ] },
        { "weekNumber" : 12, "blockId" : "bdef-group3", "weekTypeIds" : [ "wt-emerald" ], "weekStyle" : { "colorName" : "emerald", "note" : "Emerald Week Style" }, "sessions" : [ { "sessionName" : "Emerald Session", "sessionTypeId" : "st-emerald", "sessionStyle" : { "colorName" : "emerald" }, "exercises" : [ { "exerciseId" : "color-ex", "sets" : 1, "reps" : "1", "load" : "Emerald Load", "loadStyle" : { "color" : "emerald" }, "comment" : "Emerald Comment", "commentStyle" : { "color" : "emerald" } } ] } ] },
        { "weekNumber" : 13, "blockId" : "bdef-group3", "weekTypeIds" : [ "wt-teal" ], "weekStyle" : { "colorName" : "teal", "note" : "Teal Week Style" }, "sessions" : [ { "sessionName" : "Teal Session", "sessionTypeId" : "st-teal", "sessionStyle" : { "colorName" : "teal" }, "exercises" : [ { "exerciseId" : "color-ex", "sets" : 1, "reps" : "1", "load" : "Teal Load", "loadStyle" : { "color" : "teal" }, "comment" : "Teal Comment", "commentStyle" : { "color" : "teal" } } ] } ] },
        { "weekNumber" : 14, "blockId" : "bdef-group3", "weekTypeIds" : [ "wt-cyan" ], "weekStyle" : { "colorName" : "cyan", "note" : "Cyan Week Style" }, "sessions" : [ { "sessionName" : "Cyan Session", "sessionTypeId" : "st-cyan", "sessionStyle" : { "colorName" : "cyan" }, "exercises" : [ { "exerciseId" : "color-ex", "sets" : 1, "reps" : "1", "load" : "Cyan Load", "loadStyle" : { "color" : "cyan" }, "comment" : "Cyan Comment", "commentStyle" : { "color" : "cyan" } } ] } ] },
        { "weekNumber" : 15, "blockId" : "bdef-group3", "weekTypeIds" : [ "wt-sky" ], "weekStyle" : { "colorName" : "sky", "note" : "Sky Week Style" }, "sessions" : [ { "sessionName" : "Sky Session", "sessionTypeId" : "st-sky", "sessionStyle" : { "colorName" : "sky" }, "exercises" : [ { "exerciseId" : "color-ex", "sets" : 1, "reps" : "1", "load" : "Sky Load", "loadStyle" : { "color" : "sky" }, "comment" : "Sky Comment", "commentStyle" : { "color" : "sky" } } ] } ] },
        { "weekNumber" : 16, "blockId" : "bdef-group3", "weekTypeIds" : [ "wt-blue" ], "weekStyle" : { "colorName" : "blue", "note" : "Blue Week Style" }, "sessions" : [ { "sessionName" : "Blue Session", "sessionTypeId" : "st-blue", "sessionStyle" : { "colorName" : "blue" }, "exercises" : [ { "exerciseId" : "color-ex", "sets" : 1, "reps" : "1", "load" : "Blue Load", "loadStyle" : { "color" : "blue" }, "comment" : "Blue Comment", "commentStyle" : { "color" : "blue" } } ] } ] },
        { "weekNumber" : 17, "blockId" : "bdef-group4", "weekTypeIds" : [ "wt-indigo" ], "weekStyle" : { "colorName" : "indigo", "note" : "Indigo Week Style" }, "sessions" : [ { "sessionName" : "Indigo Session", "sessionTypeId" : "st-indigo", "sessionStyle" : { "colorName" : "indigo" }, "exercises" : [ { "exerciseId" : "color-ex", "sets" : 1, "reps" : "1", "load" : "Indigo Load", "loadStyle" : { "color" : "indigo" }, "comment" : "Indigo Comment", "commentStyle" : { "color" : "indigo" } } ] } ] },
        { "weekNumber" : 18, "blockId" : "bdef-group4", "weekTypeIds" : [ "wt-violet" ], "weekStyle" : { "colorName" : "violet", "note" : "Violet Week Style" }, "sessions" : [ { "sessionName" : "Violet Session", "sessionTypeId" : "st-violet", "sessionStyle" : { "colorName" : "violet" }, "exercises" : [ { "exerciseId" : "color-ex", "sets" : 1, "reps" : "1", "load" : "Violet Load", "loadStyle" : { "color" : "violet" }, "comment" : "Violet Comment", "commentStyle" : { "color" : "violet" } } ] } ] },
        { "weekNumber" : 19, "blockId" : "bdef-group4", "weekTypeIds" : [ "wt-purple" ], "weekStyle" : { "colorName" : "purple", "note" : "Purple Week Style" }, "sessions" : [ { "sessionName" : "Purple Session", "sessionTypeId" : "st-purple", "sessionStyle" : { "colorName" : "purple" }, "exercises" : [ { "exerciseId" : "color-ex", "sets" : 1, "reps" : "1", "load" : "Purple Load", "loadStyle" : { "color" : "purple" }, "comment" : "Purple Comment", "commentStyle" : { "color" : "purple" } } ] } ] },
        { "weekNumber" : 20, "blockId" : "bdef-group4", "weekTypeIds" : [ "wt-fuchsia" ], "weekStyle" : { "colorName" : "fuchsia", "note" : "Fuchsia Week Style" }, "sessions" : [ { "sessionName" : "Fuchsia Session", "sessionTypeId" : "st-fuchsia", "sessionStyle" : { "colorName" : "fuchsia" }, "exercises" : [ { "exerciseId" : "color-ex", "sets" : 1, "reps" : "1", "load" : "Fuchsia Load", "loadStyle" : { "color" : "fuchsia" }, "comment" : "Fuchsia Comment", "commentStyle" : { "color" : "fuchsia" } } ] } ] },
        { "weekNumber" : 21, "blockId" : "bdef-group4", "weekTypeIds" : [ "wt-pink" ], "weekStyle" : { "colorName" : "pink", "note" : "Pink Week Style" }, "sessions" : [ { "sessionName" : "Pink Session", "sessionTypeId" : "st-pink", "sessionStyle" : { "colorName" : "pink" }, "exercises" : [ { "exerciseId" : "color-ex", "sets" : 1, "reps" : "1", "load" : "Pink Load", "loadStyle" : { "color" : "pink" }, "comment" : "Pink Comment", "commentStyle" : { "color" : "pink" } } ] } ] },
        { "weekNumber" : 22, "blockId" : "bdef-group4", "weekTypeIds" : [ "wt-rose" ], "weekStyle" : { "colorName" : "rose", "note" : "Rose Week Style" }, "sessions" : [ { "sessionName" : "Rose Session", "sessionTypeId" : "st-rose", "sessionStyle" : { "colorName" : "rose" }, "exercises" : [ { "exerciseId" : "color-ex", "sets" : 1, "reps" : "1", "load" : "Rose Load", "loadStyle" : { "color" : "rose" }, "comment" : "Rose Comment", "commentStyle" : { "color" : "rose" } } ] } ] }
      ],
      "blocks" : [
        { "id" : 1, "name" : "Greyscale Tones (Wks 1-5)", "weeks" : [ 1, 2, 3, 4, 5 ], "style" : { "colorName" : "gray" } },
        { "id" : 2, "name" : "Warm Tones (Wks 6-10)", "weeks" : [ 6, 7, 8, 9, 10 ], "style" : { "colorName" : "amber" } },
        { "id" : 3, "name" : "Cool & Blue Tones (Wks 11-16)", "weeks" : [ 11, 12, 13, 14, 15, 16 ], "style" : { "colorName" : "teal" } },
        { "id" : 4, "name" : "Purple & Pink Tones (Wks 17-22)", "weeks" : [ 17, 18, 19, 20, 21, 22 ], "style" : { "colorName" : "violet" } }
      ]
    }'::jsonb,
    NOW(),
    NOW()
);
