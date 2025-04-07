export type Exercise = {
  name: string
  sets: number | string
  reps: string
  load: string
  comment: string
}

export type Session = {
  sessionName: string
  sessionType: "Gym" | "Barmark" | "Eget/Vila"
  exercises: Exercise[]
}

export type Week = {
  weekNumber: number
  weekType: "A" | "B"
  blockInfo: string
  gymDays: number
  barmarkDays?: number
  isDeload?: boolean
  isTest?: boolean
  tm?: Record<string, number>
  sessions: Session[]
}

// Sample data for the first two weeks
export const trainingPlanData: Week[] = [
  {
    weekNumber: 1,
    weekType: "A",
    blockInfo: "Månad 1 (Vecka 1-4): 3 Gympass/vecka - Block 1: Grund & Volym",
    gymDays: 3,
    tm: {
      SQ: 115,
      BP: 80,
      DL: 140,
      OHP: 50,
    },
    sessions: [
      {
        sessionName: "Gympass 1",
        sessionType: "Gym",
        exercises: [
          { name: "Knäböj (SQ)", sets: 3, reps: "8", load: "90 kg (~78%)", comment: "Startvikt. Teknik!" },
          { name: "Bänkpress (BP)", sets: 3, reps: "8", load: "60 kg (75%)", comment: "Öka mot 65kg snabbt om lätt." },
          { name: "Hantelrodd (DB Row)", sets: 3, reps: "8-10 /arm", load: "Tungt, RPE 8-9", comment: "" },
          { name: "Face Pulls", sets: 3, reps: "15", load: "Lätt", comment: "Axel Hälsa" },
          { name: "Farmer's Walk", sets: 3, reps: "30-40m", load: "Tungt grepp", comment: "" },
        ],
      },
      {
        sessionName: "Eget Pass / Övrigt",
        sessionType: "Eget/Vila",
        exercises: [{ name: "(Chins/Dips/Löpning/Hopp)", sets: "-", reps: "-", load: "-", comment: "Du planerar" }],
      },
      {
        sessionName: "Gympass 2",
        sessionType: "Gym",
        exercises: [
          { name: "Frivändning (PC)", sets: 3, reps: "5", load: "Teknik, lätt", comment: "Fokus på teknik" },
          { name: "Militärpress (OHP)", sets: 3, reps: "8", load: "40 kg (80%)", comment: "" },
          { name: "Latsdrag", sets: 3, reps: "10-12", load: "Medel", comment: "" },
          { name: "Biceps Curl", sets: 3, reps: "10-12", load: "Medel-Tungt", comment: "" },
          { name: "Plankan", sets: 3, reps: "30-45s", load: "-", comment: "Bålstabilitet" },
        ],
      },
      {
        sessionName: "Eget Pass / Övrigt",
        sessionType: "Eget/Vila",
        exercises: [{ name: "(Chins/Dips/Löpning/Hopp)", sets: "-", reps: "-", load: "-", comment: "Du planerar" }],
      },
      {
        sessionName: "Gympass 3",
        sessionType: "Gym",
        exercises: [
          { name: "PC Teknik", sets: 3, reps: "3", load: "Lätt", comment: "Teknikövning" },
          { name: "Marklyft (DL)", sets: 3, reps: "8", load: "110 kg (~78%)", comment: "Startvikt" },
          { name: "Bänkpress Variation", sets: 3, reps: "10", load: "50 kg (~62%)", comment: "Bredare grepp" },
          { name: "Chins", sets: "3-4", reps: "AMRAP", load: "Kroppsvikt", comment: "Så många som möjligt" },
          { name: "Sidoplanka", sets: 2, reps: "30s /sida", load: "-", comment: "" },
        ],
      },
      {
        sessionName: "Vila / Eget Pass",
        sessionType: "Eget/Vila",
        exercises: [
          { name: "(Chins/Dips/Löpning/Hopp/Vila)", sets: "-", reps: "-", load: "-", comment: "Du planerar" },
        ],
      },
    ],
  },
  {
    weekNumber: 2,
    weekType: "B",
    blockInfo: "Månad 1 (Vecka 1-4): 3 Gympass/vecka - Block 1: Grund & Volym",
    gymDays: 3,
    tm: {
      SQ: 120,
      BP: 82.5,
      DL: 145,
      OHP: 52.5,
    },
    sessions: [
      {
        sessionName: "Gympass 1",
        sessionType: "Gym",
        exercises: [
          { name: "Knäböj (SQ)", sets: 3, reps: "8", load: "95 kg (~79%)", comment: "Öka från förra veckan" },
          { name: "Bänkpress (BP)", sets: 3, reps: "8", load: "65 kg (~79%)", comment: "" },
          {
            name: "Hantelrodd (DB Row)",
            sets: 3,
            reps: "8-10 /arm",
            load: "Tungt, RPE 8-9",
            comment: "Öka från förra veckan",
          },
          { name: "Face Pulls", sets: 3, reps: "15", load: "Lätt", comment: "Axel Hälsa" },
          { name: "Farmer's Walk", sets: 3, reps: "30-40m", load: "Tungt grepp", comment: "Öka från förra veckan" },
        ],
      },
      {
        sessionName: "Eget Pass / Övrigt",
        sessionType: "Eget/Vila",
        exercises: [{ name: "(Chins/Dips/Löpning/Hopp)", sets: "-", reps: "-", load: "-", comment: "Du planerar" }],
      },
      {
        sessionName: "Gympass 2",
        sessionType: "Gym",
        exercises: [
          { name: "Frivändning (PC)", sets: 3, reps: "5", load: "Teknik, lätt", comment: "Fokus på teknik" },
          { name: "Militärpress (OHP)", sets: 3, reps: "8", load: "42.5 kg (~81%)", comment: "Öka från förra veckan" },
          { name: "Latsdrag", sets: 3, reps: "10-12", load: "Medel", comment: "Öka från förra veckan" },
          { name: "Biceps Curl", sets: 3, reps: "10-12", load: "Medel-Tungt", comment: "Öka från förra veckan" },
          { name: "Plankan", sets: 3, reps: "30-45s", load: "-", comment: "Bålstabilitet" },
        ],
      },
      {
        sessionName: "Eget Pass / Övrigt",
        sessionType: "Eget/Vila",
        exercises: [{ name: "(Chins/Dips/Löpning/Hopp)", sets: "-", reps: "-", load: "-", comment: "Du planerar" }],
      },
      {
        sessionName: "Gympass 3",
        sessionType: "Gym",
        exercises: [
          { name: "PC Teknik", sets: 3, reps: "3", load: "Lätt", comment: "Teknikövning" },
          { name: "Rumänsk Marklyft (RDL)", sets: 3, reps: "8", load: "100 kg (~69%)", comment: "Fokus på hamstrings" },
          { name: "Bänkpress Variation", sets: 3, reps: "10", load: "52.5 kg (~64%)", comment: "Bredare grepp" },
          { name: "Chins", sets: "3-4", reps: "AMRAP", load: "Kroppsvikt", comment: "Försök öka från förra veckan" },
          { name: "Sidoplanka", sets: 2, reps: "30s /sida", load: "-", comment: "" },
        ],
      },
      {
        sessionName: "Vila / Eget Pass",
        sessionType: "Eget/Vila",
        exercises: [
          { name: "(Chins/Dips/Löpning/Hopp/Vila)", sets: "-", reps: "-", load: "-", comment: "Du planerar" },
        ],
      },
    ],
  },
  // Add more weeks as needed
  {
    weekNumber: 16,
    weekType: "A",
    blockInfo: "Månad 4 (Vecka 13-16): 4 Gympass/vecka - Block 3: Styrka & Kraft",
    gymDays: 4,
    isDeload: true,
    tm: {
      SQ: 150,
      BP: 100,
      DL: 180,
      OHP: 65,
    },
    sessions: [
      {
        sessionName: "Gympass 1 (DELOAD)",
        sessionType: "Gym",
        exercises: [
          { name: "Knäböj (SQ)", sets: 3, reps: "5", load: "105 kg (70%)", comment: "Lätt deload" },
          { name: "Bänkpress (BP)", sets: 3, reps: "5", load: "70 kg (70%)", comment: "Lätt deload" },
          { name: "Hantelrodd (DB Row)", sets: 2, reps: "8 /arm", load: "Medel", comment: "Reducerad volym" },
          { name: "Face Pulls", sets: 2, reps: "15", load: "Lätt", comment: "Axel Hälsa" },
        ],
      },
      {
        sessionName: "Barmark 1",
        sessionType: "Barmark",
        exercises: [
          { name: "Lätt löpning", sets: 1, reps: "15-20 min", load: "Låg intensitet", comment: "Återhämtning" },
          { name: "Rörlighetsövningar", sets: 1, reps: "10 min", load: "-", comment: "Fokus på höft och axlar" },
        ],
      },
    ],
  },
  {
    weekNumber: 20,
    weekType: "A",
    blockInfo: "Månad 5 (Vecka 17-20): 4 Gympass/vecka - Block 4: Maxstyrka & Test",
    gymDays: 4,
    isTest: true,
    sessions: [
      {
        sessionName: "Gympass 1 (TEST)",
        sessionType: "Gym",
        exercises: [
          { name: "Knäböj (SQ)", sets: 1, reps: "1-3", load: "1RM Test", comment: "Maxtest" },
          { name: "Bänkpress (BP)", sets: 1, reps: "1-3", load: "1RM Test", comment: "Maxtest" },
          { name: "Lätt accessoriskt arbete", sets: 2, reps: "10-15", load: "Lätt", comment: "Valfria övningar" },
        ],
      },
      {
        sessionName: "Vila",
        sessionType: "Eget/Vila",
        exercises: [{ name: "Vila", sets: "-", reps: "-", load: "-", comment: "Återhämtning inför nästa test" }],
      },
    ],
  },
]

// Group weeks by month/block for tab navigation
export const monthBlocks = [
  { id: 1, name: "Månad 1 (Vecka 1-4)", weeks: [1, 2, 3, 4] },
  { id: 2, name: "Månad 2 (Vecka 5-8)", weeks: [5, 6, 7, 8] },
  { id: 3, name: "Månad 3 (Vecka 9-12)", weeks: [9, 10, 11, 12] },
  { id: 4, name: "Månad 4 (Vecka 13-16)", weeks: [13, 14, 15, 16] },
  { id: 5, name: "Månad 5 (Vecka 17-20)", weeks: [17, 18, 19, 20] },
]

