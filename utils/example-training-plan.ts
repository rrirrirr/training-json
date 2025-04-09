import type { TrainingPlanData } from "@/types/training-plan"

export const exampleTrainingPlan: TrainingPlanData = {
  metadata: {
    planName: "5x5 Strength Training Program",
    creationDate: "2025-04-08T10:00:00Z",
    description: "A 20-week strength training program with progressive overload based on 5x5 methodology",
    author: "Training Plan App Team",
    version: "1.0.0"
  },
  
  sessionTypes: [
    {
      id: "gym",
      name: "Gym",
      defaultStyle: {
        colorName: "blue"
      }
    },
    {
      id: "barmark",
      name: "Barmark",
      defaultStyle: {
        colorName: "green"
      }
    },
    {
      id: "rest",
      name: "Eget/Vila",
      defaultStyle: {
        colorName: "gray"
      }
    }
  ],
  
  blocks: [
    {
      id: "block-1",
      name: "Foundation Phase",
      focus: "Grund & Volym",
      durationWeeks: 4,
      description: "Månad 1 (Vecka 1-4): 3 Gympass/vecka - Block 1: Grund & Volym",
      style: {
        colorName: "violet"
      }
    },
    {
      id: "block-2",
      name: "Strength Building Phase",
      focus: "Styrkeuppbyggnad",
      durationWeeks: 4,
      description: "Månad 2 (Vecka 5-8): 3 Gympass/vecka - Block 2: Styrkeuppbyggnad",
      style: {
        colorName: "blue"
      }
    },
    {
      id: "block-3",
      name: "Power Phase",
      focus: "Styrka & Kraft",
      durationWeeks: 4,
      description: "Månad 3 (Vecka 9-12): 4 Gympass/vecka - Block 3: Styrka & Kraft",
      style: {
        colorName: "indigo"
      }
    },
    {
      id: "block-4",
      name: "Deload Phase",
      focus: "Återhämtning & Kraft",
      durationWeeks: 4,
      description: "Månad 4 (Vecka 13-16): 4 Gympass/vecka - Block 3: Styrka & Kraft",
      style: {
        colorName: "yellow"
      }
    },
    {
      id: "block-5",
      name: "Testing Phase",
      focus: "Maxstyrka & Test",
      durationWeeks: 4,
      description: "Månad 5 (Vecka 17-20): 4 Gympass/vecka - Block 4: Maxstyrka & Test",
      style: {
        colorName: "green"
      }
    }
  ],
  
  exerciseDefinitions: [
    {
      id: "sq",
      name: "Knäböj (SQ)",
      isMainLift: true,
      targetMuscles: ["Quads", "Glutes", "Core"],
      generalTips: "Håll ryggen rak, knäna i linje med tårna",
    },
    {
      id: "bp",
      name: "Bänkpress (BP)",
      isMainLift: true,
      targetMuscles: ["Chest", "Triceps", "Shoulders"],
      generalTips: "Håll skulderbladen ihopdragna",
    },
    {
      id: "dl",
      name: "Marklyft (DL)",
      isMainLift: true,
      targetMuscles: ["Hamstrings", "Lower Back", "Glutes"],
      generalTips: "Håll ryggen rak, börja med höfterna lägre än axlarna",
    },
    {
      id: "ohp",
      name: "Militärpress (OHP)",
      isMainLift: true,
      targetMuscles: ["Shoulders", "Triceps", "Upper Back"],
      generalTips: "Pressa stången rakt upp, aktivera core för stabilitet",
    },
    {
      id: "pc",
      name: "Frivändning (PC)",
      isMainLift: true,
      targetMuscles: ["Full Body", "Quads", "Shoulders"],
      generalTips: "Explosiv rörelse, håll stången nära kroppen",
    },
    {
      id: "db_row",
      name: "Hantelrodd (DB Row)",
      isAccessory: true,
      targetMuscles: ["Upper Back", "Biceps", "Forearms"],
      generalTips: "Håll ryggen parallell med golvet, dra hanteln mot höften",
    },
    {
      id: "face_pulls",
      name: "Face Pulls",
      isAccessory: true,
      targetMuscles: ["Rear Delts", "Rotator Cuff", "Upper Back"],
      generalTips: "Dra mot ansiktet, fokusera på att rotera axlarna utåt",
    },
    {
      id: "farmers_walk",
      name: "Farmer's Walk",
      isAccessory: true,
      targetMuscles: ["Forearms", "Traps", "Core"],
      generalTips: "Håll hantlarna vid sidan, gå med rak rygg",
    },
    {
      id: "lat_pulldown",
      name: "Latsdrag",
      isAccessory: true,
      targetMuscles: ["Lats", "Biceps", "Rear Delts"],
      generalTips: "Dra stången till bröstet, fokusera på att aktivera latsen",
    },
    {
      id: "bicep_curl",
      name: "Biceps Curl",
      isAccessory: true,
      targetMuscles: ["Biceps", "Forearms"],
      generalTips: "Håll armbågarna stilla, fokusera på full rörelse",
    },
    {
      id: "plank",
      name: "Plankan",
      isAccessory: true,
      targetMuscles: ["Core", "Shoulders"],
      generalTips: "Håll kroppen i en rak linje, aktivera core",
    },
    {
      id: "side_plank",
      name: "Sidoplanka",
      isAccessory: true,
      targetMuscles: ["Obliques", "Core", "Shoulders"],
      generalTips: "Håll kroppen i en rak linje, lyft höften från golvet",
    },
    {
      id: "chins",
      name: "Chins",
      isAccessory: true,
      targetMuscles: ["Lats", "Biceps", "Upper Back"],
      generalTips: "Dra hakan över stången, fokusera på full rörelse",
    },
    {
      id: "rdl",
      name: "Rumänsk Marklyft (RDL)",
      isAccessory: true,
      targetMuscles: ["Hamstrings", "Glutes", "Lower Back"],
      generalTips: "Håll ryggen rak, fokusera på att sträcka hamstrings",
    },
    {
      id: "bp_var",
      name: "Bänkpress Variation",
      isAccessory: true,
      targetMuscles: ["Chest", "Triceps", "Shoulders"],
      generalTips: "Variera greppet för att aktivera olika delar av bröstmuskeln",
    },
    {
      id: "light_cardio",
      name: "Lätt löpning",
      isAccessory: true,
      targetMuscles: ["Cardiovascular", "Legs"],
      generalTips: "Håll låg intensitet, fokusera på andning",
    },
    {
      id: "mobility",
      name: "Rörlighetsövningar",
      isAccessory: true,
      targetMuscles: ["Full Body", "Joints"],
      generalTips: "Fokusera på problemområden, håll stretcharna i 30-60 sekunder",
    },
    {
      id: "rest",
      name: "Vila",
      targetMuscles: [],
      generalTips: "Återhämtning är viktigt för muskeluppbyggnad",
    },
    {
      id: "own_choice",
      name: "(Chins/Dips/Löpning/Hopp)",
      targetMuscles: ["Varies"],
      generalTips: "Välj övningar som kompletterar ditt program",
    },
  ],
  
  weeks: [
    {
      weekNumber: 1,
      weekType: "A",
      blockId: "block-1", 
      gymDays: 3,
      tm: {
        SQ: 115,
        BP: 80,
        DL: 140,
        OHP: 50,
      },
      weekStyle: {
        colorName: "violet"
      },
      sessions: [
        {
          sessionName: "Gympass 1",
          sessionTypeId: "gym",
          sessionStyle: {
            colorName: "blue"
          },
          exercises: [
            {
              exerciseId: "sq",
              sets: 3,
              reps: "8",
              load: "90 kg (~78%)",
              comment: "Startvikt. Teknik!",
              loadStyle: {
                strong: true,
                color: "blue"
              }
            },
            {
              exerciseId: "bp",
              sets: 3,
              reps: "8",
              load: "60 kg (75%)",
              comment: "Öka mot 65kg snabbt om lätt."
            },
            {
              exerciseId: "db_row",
              sets: 3,
              reps: "8-10 /arm",
              load: "Tungt, RPE 8-9",
              comment: ""
            },
            {
              exerciseId: "face_pulls",
              sets: 3,
              reps: "15",
              load: "Lätt",
              comment: "Axel Hälsa"
            },
            {
              exerciseId: "farmers_walk",
              sets: 3,
              reps: "30-40m",
              load: "Tungt grepp",
              comment: ""
            },
          ],
        },
        {
          sessionName: "Eget Pass / Övrigt",
          sessionTypeId: "rest",
          sessionStyle: {
            colorName: "gray"
          },
          exercises: [
            {
              exerciseId: "own_choice",
              sets: "-",
              reps: "-",
              load: "-",
              comment: "Du planerar"
            },
          ],
        },
        {
          sessionName: "Gympass 2",
          sessionTypeId: "gym",
          sessionStyle: {
            colorName: "blue"
          },
          exercises: [
            {
              exerciseId: "pc",
              sets: 3,
              reps: "5",
              load: "Teknik, lätt",
              comment: "Fokus på teknik"
            },
            {
              exerciseId: "ohp",
              sets: 3,
              reps: "8",
              load: "40 kg (80%)",
              comment: ""
            },
            {
              exerciseId: "lat_pulldown",
              sets: 3,
              reps: "10-12",
              load: "Medel",
              comment: ""
            },
            {
              exerciseId: "bicep_curl",
              sets: 3,
              reps: "10-12",
              load: "Medel-Tungt",
              comment: ""
            },
            {
              exerciseId: "plank",
              sets: 3,
              reps: "30-45s",
              load: "-",
              comment: "Bålstabilitet"
            },
          ],
        },
        {
          sessionName: "Eget Pass / Övrigt",
          sessionTypeId: "rest",
          sessionStyle: {
            colorName: "gray"
          },
          exercises: [
            {
              exerciseId: "own_choice",
              sets: "-",
              reps: "-",
              load: "-",
              comment: "Du planerar"
            },
          ],
        },
        {
          sessionName: "Gympass 3",
          sessionTypeId: "gym",
          sessionStyle: {
            colorName: "blue"
          },
          exercises: [
            {
              exerciseId: "pc",
              sets: 3,
              reps: "3",
              load: "Lätt",
              comment: "Teknikövning"
            },
            {
              exerciseId: "dl",
              sets: 3,
              reps: "8",
              load: "110 kg (~78%)",
              comment: "Startvikt"
            },
            {
              exerciseId: "bp_var",
              sets: 3,
              reps: "10",
              load: "50 kg (~62%)",
              comment: "Bredare grepp"
            },
            {
              exerciseId: "chins",
              sets: "3-4",
              reps: "AMRAP",
              load: "Kroppsvikt",
              comment: "Så många som möjligt"
            },
            {
              exerciseId: "side_plank",
              sets: 2,
              reps: "30s /sida",
              load: "-",
              comment: ""
            },
          ],
        },
        {
          sessionName: "Vila / Eget Pass",
          sessionTypeId: "rest",
          sessionStyle: {
            colorName: "gray"
          },
          exercises: [
            {
              exerciseId: "own_choice",
              sets: "-",
              reps: "-",
              load: "-",
              comment: "Du planerar"
            },
          ],
        },
      ],
    },
    {
      weekNumber: 2,
      weekType: "B",
      blockId: "block-1",
      gymDays: 3,
      tm: {
        SQ: 120,
        BP: 82.5,
        DL: 145,
        OHP: 52.5,
      },
      weekStyle: {
        colorName: "violet"
      },
      sessions: [
        {
          sessionName: "Gympass 1",
          sessionTypeId: "gym",
          sessionStyle: {
            colorName: "blue"
          },
          exercises: [
            {
              exerciseId: "sq",
              sets: 3,
              reps: "8",
              load: "95 kg (~79%)",
              comment: "Öka från förra veckan"
            },
            {
              exerciseId: "bp",
              sets: 3,
              reps: "8",
              load: "65 kg (~79%)",
              comment: ""
            },
            {
              exerciseId: "db_row",
              sets: 3,
              reps: "8-10 /arm",
              load: "Tungt, RPE 8-9",
              comment: "Öka från förra veckan"
            },
            {
              exerciseId: "face_pulls",
              sets: 3,
              reps: "15",
              load: "Lätt",
              comment: "Axel Hälsa"
            },
            {
              exerciseId: "farmers_walk",
              sets: 3,
              reps: "30-40m",
              load: "Tungt grepp",
              comment: "Öka från förra veckan"
            },
          ],
        },
        {
          sessionName: "Eget Pass / Övrigt",
          sessionTypeId: "rest",
          sessionStyle: {
            colorName: "gray"
          },
          exercises: [
            {
              exerciseId: "own_choice",
              sets: "-",
              reps: "-",
              load: "-",
              comment: "Du planerar"
            },
          ],
        },
        {
          sessionName: "Gympass 2",
          sessionTypeId: "gym",
          sessionStyle: {
            colorName: "blue"
          },
          exercises: [
            {
              exerciseId: "pc",
              sets: 3,
              reps: "5",
              load: "Teknik, lätt",
              comment: "Fokus på teknik"
            },
            {
              exerciseId: "ohp",
              sets: 3,
              reps: "8",
              load: "42.5 kg (~81%)",
              comment: "Öka från förra veckan"
            },
            {
              exerciseId: "lat_pulldown",
              sets: 3,
              reps: "10-12",
              load: "Medel",
              comment: "Öka från förra veckan"
            },
            {
              exerciseId: "bicep_curl",
              sets: 3,
              reps: "10-12",
              load: "Medel-Tungt",
              comment: "Öka från förra veckan"
            },
            {
              exerciseId: "plank",
              sets: 3,
              reps: "30-45s",
              load: "-",
              comment: "Bålstabilitet"
            },
          ],
        },
        {
          sessionName: "Eget Pass / Övrigt",
          sessionTypeId: "rest",
          sessionStyle: {
            colorName: "gray"
          },
          exercises: [
            {
              exerciseId: "own_choice",
              sets: "-",
              reps: "-",
              load: "-",
              comment: "Du planerar"
            },
          ],
        },
        {
          sessionName: "Gympass 3",
          sessionTypeId: "gym",
          sessionStyle: {
            colorName: "blue"
          },
          exercises: [
            {
              exerciseId: "pc",
              sets: 3,
              reps: "3",
              load: "Lätt",
              comment: "Teknikövning"
            },
            {
              exerciseId: "rdl",
              sets: 3,
              reps: "8",
              load: "100 kg (~69%)",
              comment: "Fokus på hamstrings"
            },
            {
              exerciseId: "bp_var",
              sets: 3,
              reps: "10",
              load: "52.5 kg (~64%)",
              comment: "Bredare grepp"
            },
            {
              exerciseId: "chins",
              sets: "3-4",
              reps: "AMRAP",
              load: "Kroppsvikt",
              comment: "Försök öka från förra veckan"
            },
            {
              exerciseId: "side_plank",
              sets: 2,
              reps: "30s /sida",
              load: "-",
              comment: ""
            },
          ],
        },
        {
          sessionName: "Vila / Eget Pass",
          sessionTypeId: "rest",
          sessionStyle: {
            colorName: "gray"
          },
          exercises: [
            {
              exerciseId: "own_choice",
              sets: "-",
              reps: "-",
              load: "-",
              comment: "Du planerar"
            },
          ],
        },
      ],
    },
    {
      weekNumber: 16,
      weekType: "A",
      blockId: "block-4",
      gymDays: 4,
      isDeload: true,
      tm: {
        SQ: 150,
        BP: 100,
        DL: 180,
        OHP: 65,
      },
      weekStyle: {
        colorName: "yellow"
      },
      sessions: [
        {
          sessionName: "Gympass 1 (DELOAD)",
          sessionTypeId: "gym",
          sessionStyle: {
            colorName: "blue"
          },
          exercises: [
            {
              exerciseId: "sq",
              sets: 3,
              reps: "5",
              load: "105 kg (70%)",
              comment: "Lätt deload"
            },
            {
              exerciseId: "bp",
              sets: 3,
              reps: "5",
              load: "70 kg (70%)",
              comment: "Lätt deload"
            },
            {
              exerciseId: "db_row",
              sets: 2,
              reps: "8 /arm",
              load: "Medel",
              comment: "Reducerad volym"
            },
            {
              exerciseId: "face_pulls",
              sets: 2,
              reps: "15",
              load: "Lätt",
              comment: "Axel Hälsa"
            },
          ],
        },
        {
          sessionName: "Barmark 1",
          sessionTypeId: "barmark",
          sessionStyle: {
            colorName: "green"
          },
          exercises: [
            {
              exerciseId: "light_cardio",
              sets: 1,
              reps: "15-20 min",
              load: "Låg intensitet",
              comment: "Återhämtning"
            },
            {
              exerciseId: "mobility",
              sets: 1,
              reps: "10 min",
              load: "-",
              comment: "Fokus på höft och axlar"
            },
          ],
        },
      ],
    },
    {
      weekNumber: 20,
      weekType: "A",
      blockId: "block-5",
      gymDays: 4,
      isTest: true,
      weekStyle: {
        colorName: "green"
      },
      sessions: [
        {
          sessionName: "Gympass 1 (TEST)",
          sessionTypeId: "gym",
          sessionStyle: {
            colorName: "blue"
          },
          exercises: [
            {
              exerciseId: "sq",
              sets: 1,
              reps: "1-3",
              load: "1RM Test",
              comment: "Maxtest"
            },
            {
              exerciseId: "bp",
              sets: 1,
              reps: "1-3",
              load: "1RM Test",
              comment: "Maxtest"
            },
            {
              exerciseId: "own_choice",
              sets: 2,
              reps: "10-15",
              load: "Lätt",
              comment: "Valfria övningar"
            },
          ],
        },
        {
          sessionName: "Vila",
          sessionTypeId: "rest",
          sessionStyle: {
            colorName: "gray"
          },
          exercises: [
            {
              exerciseId: "rest",
              sets: "-",
              reps: "-",
              load: "-",
              comment: "Återhämtning inför nästa test"
            },
          ],
        },
      ],
    },
  ],
  
  monthBlocks: [
    { 
      id: 1, 
      name: "Månad 1 (Vecka 1-4)", 
      weeks: [1, 2, 3, 4],
      style: {
        colorName: "violet"
      }
    },
    { 
      id: 2, 
      name: "Månad 2 (Vecka 5-8)", 
      weeks: [5, 6, 7, 8],
      style: {
        colorName: "blue"
      }
    },
    { 
      id: 3, 
      name: "Månad 3 (Vecka 9-12)", 
      weeks: [9, 10, 11, 12],
      style: {
        colorName: "indigo"
      }
    },
    { 
      id: 4, 
      name: "Månad 4 (Vecka 13-16)", 
      weeks: [13, 14, 15, 16],
      style: {
        colorName: "yellow"
      }
    },
    { 
      id: 5, 
      name: "Månad 5 (Vecka 17-20)", 
      weeks: [17, 18, 19, 20],
      style: {
        colorName: "green"
      }
    },
  ],
}