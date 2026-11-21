import {
  BedDouble,
  Brain,
  ClipboardList,
  Droplet,
  Droplets,
  Flame,
  Flower2,
  Footprints,
  GlassWater,
  HeartPulse,
  Leaf,
  MoonStar,
  Salad,
  ShieldPlus,
  Siren,
  Soup,
  Stethoscope,
  Thermometer,
  ThermometerSun,
  TriangleAlert,
  Wind,
  type LucideIcon,
} from "lucide-react";

/**
 * Health Guide content.
 *
 * General educational information written for the HealthCare AI prototype. It
 * has not been reviewed by a medical professional, and the page says so.
 * Rules for anyone editing this file:
 * - No diagnosis, no medicine names, no doses.
 * - Never suggest stopping or changing prescribed medicine.
 * - Every article ends with when to see a doctor; emergencies point to local
 *   emergency services.
 */

export type GuideCategoryId = "conditions" | "lifestyle" | "first-aid" | "see-doctor";

export type GuideCategory = {
  id: GuideCategoryId;
  letter: "A" | "B" | "C" | "D";
  title: string;
  description: string;
  icon: LucideIcon;
};

export type GuideSection = { heading: string; points: readonly string[] };

export type GuideArticle = {
  id: string;
  category: GuideCategoryId;
  title: string;
  summary: string;
  icon: LucideIcon;
  sections: readonly GuideSection[];
  /** When to book a doctor's appointment. Required on every article. */
  seeDoctor: readonly string[];
  /** Signs that need emergency help straight away. */
  emergency?: readonly string[];
  /** Extra search terms that do not appear in the text. */
  keywords?: readonly string[];
};

export const GUIDE_CATEGORIES: readonly GuideCategory[] = [
  {
    id: "conditions",
    letter: "A",
    title: "Common Health Conditions",
    description: "Everyday problems such as fever, colds and headaches — what helps and what to watch for.",
    icon: Stethoscope,
  },
  {
    id: "lifestyle",
    letter: "B",
    title: "Healthy Lifestyle",
    description: "Small, steady habits for food, water, movement, sleep and stress.",
    icon: Leaf,
  },
  {
    id: "first-aid",
    letter: "C",
    title: "First Aid and Safety",
    description: "Simple first steps for minor injuries, fever and heat — and when to call for help.",
    icon: ShieldPlus,
  },
  {
    id: "see-doctor",
    letter: "D",
    title: "When to See a Doctor",
    description: "Warning signs, symptoms worth a consultation and emergencies that cannot wait.",
    icon: HeartPulse,
  },
];

const MEDICINE_ADVICE =
  "Ask a pharmacist or doctor before taking any medicine, especially for children, during pregnancy, or if you already take other medicines.";

export const GUIDE_ARTICLES: readonly GuideArticle[] = [
  // A. Common Health Conditions
  {
    id: "fever",
    category: "conditions",
    title: "Fever",
    summary:
      "A raised temperature is often the body's response to an infection. In adults, many fevers settle within a few days with rest and fluids.",
    icon: Thermometer,
    keywords: ["temperature", "high temperature", "hot", "chills", "shivering"],
    sections: [
      {
        heading: "What it can feel like",
        points: [
          "Feeling hot to the touch, or hot and shivery at the same time.",
          "Sweating, body aches, headache or tiredness.",
          "Less appetite than usual.",
        ],
      },
      {
        heading: "Staying comfortable",
        points: [
          "Rest as much as you can.",
          "Drink fluids regularly, such as water or clear soups, so you don't become dehydrated.",
          "Wear light clothing and keep the room comfortably cool. Avoid cold baths, which can cause shivering.",
          "Check your temperature with a thermometer and note the readings.",
          MEDICINE_ADVICE,
        ],
      },
    ],
    seeDoctor: [
      "The fever lasts more than a few days, or keeps coming back.",
      "A baby under 3 months old has a fever.",
      "You have a long-term health condition or a weakened immune system.",
      "You feel worse instead of better.",
    ],
    emergency: [
      "A rash that does not fade when you press a glass against it.",
      "A stiff neck, severe headache, confusion or unusual drowsiness.",
      "Difficulty breathing, or a fit (seizure).",
    ],
  },
  {
    id: "cold-and-cough",
    category: "conditions",
    title: "Cold and Cough",
    summary:
      "Colds are common viral infections of the nose and throat. They usually get better on their own within one to two weeks.",
    icon: Wind,
    keywords: ["flu", "runny nose", "sore throat", "sneezing", "congestion"],
    sections: [
      {
        heading: "Common signs",
        points: [
          "Blocked or runny nose and sneezing.",
          "Sore throat and a cough.",
          "Mild tiredness or a slight temperature.",
        ],
      },
      {
        heading: "Looking after yourself",
        points: [
          "Rest and keep warm.",
          "Drink plenty of fluids. Warm drinks can soothe a sore throat.",
          "Honey in a warm drink may ease a cough for adults and children over 1 year. Never give honey to babies under 1.",
          "Antibiotics do not treat colds caused by viruses — a doctor will decide if any treatment is needed.",
        ],
      },
      {
        heading: "Protecting others",
        points: [
          "Wash your hands often with soap and water.",
          "Cover coughs and sneezes with a tissue or your elbow.",
          "Avoid sharing cups, towels or utensils while you are unwell.",
        ],
      },
    ],
    seeDoctor: [
      "A cough lasts more than 3 weeks.",
      "Symptoms get worse after a week, or don't improve.",
      "You cough up blood, or have a high temperature that doesn't settle.",
      "You have a long-term condition such as asthma, diabetes or a heart condition.",
    ],
    emergency: [
      "Difficulty breathing or very fast breathing.",
      "Lips or skin turning blue or grey.",
      "Chest pain.",
    ],
  },
  {
    id: "headache",
    category: "conditions",
    title: "Headache",
    summary:
      "Most headaches are not serious and ease with rest, fluids and time. Knowing the warning signs helps you decide when to get help.",
    icon: Brain,
    keywords: ["migraine", "head pain", "tension"],
    sections: [
      {
        heading: "Common triggers",
        points: [
          "Stress, tension or tight neck and shoulder muscles.",
          "Not enough sleep, skipped meals or not drinking enough water.",
          "Long periods in front of screens, or eye strain.",
        ],
      },
      {
        heading: "What may help",
        points: [
          "Drink some water and rest in a quiet, dimly lit room.",
          "Keep regular meal times and a regular sleep routine.",
          "Take breaks from screens and gently relax your neck and shoulders.",
          "Ask a pharmacist or doctor before using pain relief, and avoid using it very often — frequent use can itself cause headaches.",
        ],
      },
    ],
    seeDoctor: [
      "Headaches happen often or are getting worse over time.",
      "Headaches wake you from sleep, or come with changes in your vision.",
      "Your usual approaches no longer help.",
    ],
    emergency: [
      "A sudden, very severe headache — the worst you have ever had.",
      "A headache with a stiff neck, fever and a rash.",
      "A headache with weakness, numbness, confusion, slurred speech or loss of vision.",
      "A headache after a head injury.",
    ],
  },
  {
    id: "digestive-problems",
    category: "conditions",
    title: "Digestive Problems",
    summary:
      "Upset stomach, diarrhoea, constipation and indigestion are common. Many cases settle with simple care, but some symptoms need checking.",
    icon: Soup,
    keywords: ["stomach", "diarrhea", "diarrhoea", "vomiting", "acidity", "gas", "bloating", "constipation", "indigestion"],
    sections: [
      {
        heading: "Common problems",
        points: [
          "Indigestion, acidity or heartburn after meals.",
          "Diarrhoea or vomiting, often from a stomach infection.",
          "Constipation, bloating or wind.",
        ],
      },
      {
        heading: "Gentle self-care",
        points: [
          "With diarrhoea or vomiting, take small sips of fluid often to avoid dehydration.",
          "Eat small, plain meals when you feel ready.",
          "For constipation, include fibre from fruit, vegetables and whole grains, drink water and stay active.",
          "Eat slowly and avoid lying down straight after a large meal.",
          "Wash your hands, use safe drinking water and eat food that is well cooked.",
        ],
      },
    ],
    seeDoctor: [
      "Diarrhoea or vomiting doesn't improve after a few days.",
      "Symptoms keep coming back, or your bowel habits change for several weeks.",
      "You lose weight without trying, or have difficulty swallowing.",
    ],
    emergency: [
      "Blood in vomit, or black or bloody stools.",
      "Severe or constant tummy pain.",
      "You can't keep any fluids down, or show signs of severe dehydration.",
    ],
  },
  {
    id: "dehydration",
    category: "conditions",
    title: "Dehydration",
    summary:
      "Dehydration happens when your body loses more fluid than it takes in — for example in hot weather, during illness or after exercise.",
    icon: Droplets,
    keywords: ["thirst", "fluids", "water loss", "heat"],
    sections: [
      {
        heading: "Early signs",
        points: [
          "Feeling thirsty, with a dry mouth or lips.",
          "Dark yellow, strong-smelling urine, or peeing less often.",
          "Tiredness, headache or feeling dizzy.",
        ],
      },
      {
        heading: "Who is at higher risk",
        points: [
          "Babies, young children and older adults.",
          "Anyone with diarrhoea, vomiting or a fever.",
          "People working or exercising in the heat, and people with long-term conditions.",
        ],
      },
      {
        heading: "What helps",
        points: [
          "Sip water regularly rather than drinking a lot at once.",
          "Oral rehydration solution can replace lost salts during diarrhoea or vomiting — ask a pharmacist which product suits you.",
          "Rest in a cool, shaded place.",
        ],
      },
    ],
    seeDoctor: [
      "Symptoms don't improve after drinking fluids.",
      "A baby has fewer wet nappies than usual.",
      "Diarrhoea or vomiting continues.",
    ],
    emergency: [
      "Confusion, fainting or a very fast heartbeat.",
      "Not peeing at all during the day.",
      "A baby or child who is very drowsy or floppy, or has sunken eyes.",
    ],
  },
  {
    id: "sleep-problems",
    category: "conditions",
    title: "Sleep Problems",
    summary:
      "Trouble falling or staying asleep is common, especially during stressful times. Small, steady changes to your routine often help.",
    icon: MoonStar,
    keywords: ["insomnia", "can't sleep", "snoring", "tired"],
    sections: [
      {
        heading: "Common signs",
        points: [
          "Difficulty falling asleep, or waking often during the night.",
          "Waking too early and not getting back to sleep.",
          "Feeling tired or irritable during the day.",
        ],
      },
      {
        heading: "Habits that may help",
        points: [
          "Go to bed and wake up at about the same time every day.",
          "Keep your bedroom dark, quiet and comfortably cool.",
          "Avoid caffeine later in the day, and put screens away before bed.",
          "Stay active during the day, and avoid large meals close to bedtime.",
          "If you can't sleep, get up, do something calm in dim light, and return to bed when you feel sleepy.",
        ],
      },
    ],
    seeDoctor: [
      "Sleep problems last for several weeks or affect your daily life.",
      "You snore loudly and someone notices pauses in your breathing or gasping.",
      "You feel very sleepy during the day, for example while driving.",
      "Poor sleep comes with low mood or anxiety.",
    ],
  },

  // B. Healthy Lifestyle
  {
    id: "balanced-nutrition",
    category: "lifestyle",
    title: "Balanced Nutrition",
    summary:
      "A balanced diet includes a variety of foods in sensible portions. There is no single perfect diet — variety and regular meals matter most.",
    icon: Salad,
    keywords: ["diet", "food", "eating", "meals", "protein", "vegetables"],
    sections: [
      {
        heading: "Building a balanced plate",
        points: [
          "Plenty of vegetables and fruit, in different colours.",
          "Whole grains such as brown rice, whole-wheat roti, millets or oats.",
          "Protein from dals and other pulses, eggs, fish, paneer, nuts or seeds.",
          "A small amount of healthy fats, such as nuts and vegetable oils.",
        ],
      },
      {
        heading: "Everyday tips",
        points: [
          "Eat regular meals instead of skipping and overeating later.",
          "Limit sugary drinks, fried snacks and highly processed foods.",
          "Go easy on added salt and sugar.",
          "Choose water as your main drink.",
        ],
      },
    ],
    seeDoctor: [
      "You have a condition such as diabetes, kidney disease or a heart condition — talk to your doctor or a registered dietitian before making big changes.",
      "You are pregnant, breastfeeding or have food allergies.",
      "You notice weight loss or gain you can't explain.",
    ],
  },
  {
    id: "drinking-water",
    category: "lifestyle",
    title: "Drinking Enough Water",
    summary:
      "Your body needs water to work well. How much you need varies with the weather, your activity, your age and your health.",
    icon: GlassWater,
    keywords: ["hydration", "fluids", "water intake"],
    sections: [
      {
        heading: "Signs you may need more",
        points: [
          "Feeling thirsty.",
          "Urine that is darker than pale yellow.",
          "Headache or tiredness.",
        ],
      },
      {
        heading: "Easy habits",
        points: [
          "Keep a bottle of water with you during the day.",
          "Drink a glass of water with each meal.",
          "Drink more in hot weather, during exercise and when you are unwell.",
          "Water-rich foods such as cucumber, watermelon and soups also count.",
          "Choose water over sugary drinks.",
        ],
      },
      {
        heading: "A note of caution",
        points: [
          "Some conditions, such as heart failure or kidney disease, need a fluid limit. If your doctor has given you one, follow their advice.",
        ],
      },
    ],
    seeDoctor: [
      "You feel very thirsty all the time or need to pee much more than usual.",
      "You have been told to limit fluids and are unsure how much to drink.",
    ],
  },
  {
    id: "physical-activity",
    category: "lifestyle",
    title: "Physical Activity",
    summary:
      "Regular movement supports your heart, mood, sleep and strength. Any amount of activity is better than none.",
    icon: Footprints,
    keywords: ["exercise", "walking", "fitness", "yoga", "workout"],
    sections: [
      {
        heading: "General guidance",
        points: [
          "The World Health Organization suggests most adults aim for at least 150 minutes of moderate activity across the week.",
          "It also suggests muscle-strengthening activities on two or more days a week.",
          "Moderate activity raises your heart rate and makes you breathe faster — like a brisk walk.",
        ],
      },
      {
        heading: "Getting started",
        points: [
          "Start small, such as a short daily walk, and build up gradually.",
          "Choose something you enjoy: walking, cycling, dancing, yoga or a sport.",
          "Break up long periods of sitting by standing and moving.",
          "Warm up before and cool down after exercise.",
        ],
      },
    ],
    seeDoctor: [
      "Talk to a doctor before starting if you have a heart condition, joint problems, are pregnant, or haven't been active for a long time.",
      "You get pain or dizziness during activity.",
    ],
    emergency: [
      "Chest pain, severe breathlessness or fainting during exercise — stop and get emergency help.",
    ],
  },
  {
    id: "sleep-and-recovery",
    category: "lifestyle",
    title: "Sleep and Recovery",
    summary:
      "Sleep helps your body recover and your mind stay focused. Many health organisations suggest most adults aim for seven or more hours a night.",
    icon: BedDouble,
    keywords: ["rest", "naps", "routine", "bedtime"],
    sections: [
      {
        heading: "Why it matters",
        points: [
          "Sleep supports memory, concentration and mood.",
          "It helps the body recover after activity and illness.",
        ],
      },
      {
        heading: "Building a routine",
        points: [
          "Keep a consistent sleep and wake time, including weekends.",
          "Create a calm wind-down routine, such as reading or a warm bath.",
          "Get some daylight in the morning.",
        ],
      },
      {
        heading: "Rest during the day",
        points: [
          "Leave time to recover between hard exercise sessions.",
          "A short daytime nap can help, but long or late naps may affect night-time sleep.",
        ],
      },
    ],
    seeDoctor: [
      "You still feel exhausted after enough sleep.",
      "Sleep problems last several weeks or affect your daily life.",
    ],
  },
  {
    id: "stress-management",
    category: "lifestyle",
    title: "Stress Management",
    summary:
      "Stress is a normal response to pressure, but long-lasting stress can affect sleep, mood and physical health.",
    icon: Flower2,
    keywords: ["anxiety", "mental health", "worry", "relax", "breathing"],
    sections: [
      {
        heading: "Common signs",
        points: [
          "Feeling overwhelmed, irritable or on edge.",
          "Trouble sleeping, headaches or tense muscles.",
          "Changes in appetite, or difficulty concentrating.",
        ],
      },
      {
        heading: "Things that may help",
        points: [
          "Try slow breathing: breathe in gently through your nose and out slowly through your mouth.",
          "Stay active — even a short walk can help.",
          "Talk to someone you trust about how you feel.",
          "Break big tasks into smaller steps.",
          "Limit alcohol and caffeine, and make time for things you enjoy.",
        ],
      },
    ],
    seeDoctor: [
      "Stress, worry or low mood lasts more than two weeks or affects daily life.",
      "You are using alcohol or other substances to cope.",
      "You have panic attacks.",
    ],
    emergency: [
      "Thoughts of harming yourself or ending your life — contact your local emergency services or a crisis helpline now, or go to the nearest emergency department. Reach out to someone you trust.",
    ],
  },

  // C. First Aid and Safety
  {
    id: "first-aid-basics",
    category: "first-aid",
    title: "Basic First Aid",
    summary:
      "Basic first aid is about keeping yourself and others safe until help arrives. Staying calm and calling for help early matters most.",
    icon: ShieldPlus,
    keywords: ["first aid kit", "emergency", "injury", "cpr"],
    sections: [
      {
        heading: "First steps",
        points: [
          "Check the area is safe before you help.",
          "Check whether the person responds to you and is breathing normally.",
          "For serious injury or illness, call your local emergency services straight away.",
          "Don't move someone who may have a neck or back injury unless they are in danger.",
        ],
      },
      {
        heading: "A simple first-aid kit",
        points: [
          "Plasters in different sizes, sterile gauze and bandages.",
          "Medical tape, disposable gloves and small scissors.",
          "A digital thermometer.",
          "Keep the kit somewhere easy to reach, and check it regularly.",
        ],
      },
      {
        heading: "Be prepared",
        points: [
          "A hands-on first-aid and CPR course from a recognised organisation is the best way to learn. This guide cannot replace training.",
        ],
      },
    ],
    seeDoctor: [
      "An injury is not healing, or you are unsure how serious it is.",
    ],
    emergency: [
      "The person is unresponsive or not breathing normally.",
      "Severe bleeding, or signs of a heart attack or stroke.",
    ],
  },
  {
    id: "cuts-and-burns",
    category: "first-aid",
    title: "Minor Cuts and Burns",
    summary:
      "Most small cuts, grazes and burns can be cared for at home. Knowing what not to do is just as important.",
    icon: Flame,
    keywords: ["wound", "bleeding", "graze", "scald", "blister"],
    sections: [
      {
        heading: "Minor cuts and grazes",
        points: [
          "Wash your hands, then press gently on the cut with a clean cloth to stop bleeding.",
          "Rinse the wound under clean running water.",
          "Cover it with a clean plaster or dressing, and change it if it gets wet or dirty.",
        ],
      },
      {
        heading: "Minor burns",
        points: [
          "Move away from the heat source.",
          "Cool the burn under cool or lukewarm running water for 20 minutes.",
          "Remove rings or clothing near the burn, unless they are stuck to the skin.",
          "Cover loosely with cling film or a clean, non-fluffy cloth.",
          "Don't use ice, butter, toothpaste or creams, and don't burst blisters.",
        ],
      },
    ],
    seeDoctor: [
      "Signs of infection: increasing redness, swelling, warmth, pus or a fever.",
      "The cut came from a dirty or rusty object, or an animal bite.",
      "A burn on a baby or young child, or a burn that blisters.",
    ],
    emergency: [
      "Bleeding that doesn't stop after 10 minutes of firm pressure.",
      "A deep or gaping wound, or an object stuck in it — don't remove it.",
      "Large or deep burns, burns that look white or charred, or burns on the face, hands, feet or genitals.",
      "Chemical or electrical burns.",
    ],
  },
  {
    id: "fever-precautions",
    category: "first-aid",
    title: "Fever Precautions",
    summary:
      "Simple precautions help you stay comfortable during a fever and lower the chance of passing an infection to others.",
    icon: ThermometerSun,
    keywords: ["temperature", "children", "infection"],
    sections: [
      {
        heading: "At home",
        points: [
          "Rest, drink fluids regularly and wear light clothing.",
          "Check the temperature with a thermometer and note the readings.",
          MEDICINE_ADVICE,
        ],
      },
      {
        heading: "Protecting others",
        points: [
          "Stay at home while you are unwell, if you can.",
          "Wash your hands often and cover coughs and sneezes.",
          "Don't share cups, utensils or towels.",
        ],
      },
      {
        heading: "Caring for a child",
        points: [
          "Offer fluids often and keep them comfortable.",
          "Don't over-wrap them in blankets or heavy clothes.",
          "Check on them regularly, including during the night.",
        ],
      },
    ],
    seeDoctor: [
      "A baby under 3 months old has a fever.",
      "The fever lasts more than a few days.",
      "There are signs of dehydration, such as fewer wet nappies or very little urine.",
    ],
    emergency: [
      "The person is very drowsy or hard to wake.",
      "A fit (seizure), or a rash that does not fade under a pressed glass.",
      "Difficulty breathing.",
    ],
  },
  {
    id: "dehydration-precautions",
    category: "first-aid",
    title: "Dehydration Precautions",
    summary:
      "Preventing dehydration is easier than treating it, especially in hot weather or when you are unwell.",
    icon: Droplet,
    keywords: ["heat", "summer", "heatstroke", "heat exhaustion", "sun"],
    sections: [
      {
        heading: "In hot weather",
        points: [
          "Drink regularly, before you feel thirsty.",
          "Avoid hard physical activity outdoors in the hottest part of the day.",
          "Wear light, loose clothing and a hat, and stay in the shade.",
          "Check on older relatives, neighbours and young children.",
        ],
      },
      {
        heading: "When you are unwell",
        points: [
          "Take small sips of fluid often.",
          "Oral rehydration solution can help during diarrhoea or vomiting — ask a pharmacist.",
          "Keep breastfeeding babies as usual.",
        ],
      },
      {
        heading: "Heat exhaustion",
        points: [
          "Signs include heavy sweating, headache, dizziness, nausea and cramps.",
          "Move to a cool place, lie down with feet slightly raised, sip water and cool the skin with a damp cloth or fan.",
        ],
      },
    ],
    seeDoctor: [
      "Symptoms of dehydration don't improve after drinking fluids.",
      "Diarrhoea or vomiting continues.",
    ],
    emergency: [
      "Still unwell after 30 minutes resting in a cool place.",
      "Feeling very hot but not sweating, fast breathing, confusion, a fit or loss of consciousness — these can be signs of heatstroke.",
    ],
  },
  {
    id: "urgent-medical-attention",
    category: "first-aid",
    title: "When to Seek Urgent Medical Attention",
    summary:
      "Some symptoms need emergency care straight away. If you are unsure, it is safer to call for help.",
    icon: Siren,
    keywords: ["emergency", "ambulance", "stroke", "heart attack", "fast"],
    sections: [
      {
        heading: "Recognising a stroke — think FAST",
        points: [
          "Face: has one side of the face dropped?",
          "Arms: can they lift both arms and keep them there?",
          "Speech: is their speech slurred or confused?",
          "Time: call your local emergency services straight away.",
        ],
      },
      {
        heading: "While you wait for help",
        points: [
          "Stay with the person and keep them calm.",
          "Don't give food or drink to someone who is drowsy or unconscious.",
          "Note the time symptoms started.",
          "Have a list of their medicines ready, if you can.",
        ],
      },
    ],
    seeDoctor: [
      "After any emergency, follow up with a doctor as advised.",
    ],
    emergency: [
      "Chest pain or pressure, or difficulty breathing.",
      "Signs of a stroke, a fit, or loss of consciousness.",
      "Heavy bleeding that won't stop.",
      "A severe allergic reaction, with swelling of the lips, tongue or throat.",
    ],
  },

  // D. When to See a Doctor
  {
    id: "warning-signs",
    category: "see-doctor",
    title: "Warning Signs Not to Ignore",
    summary:
      "Some changes in your body are worth checking with a doctor, even if they are not painful. They often have harmless causes, but a check gives peace of mind.",
    icon: TriangleAlert,
    keywords: ["lump", "weight loss", "mole", "blood"],
    sections: [
      {
        heading: "Changes to get checked",
        points: [
          "Weight loss you can't explain.",
          "A new lump or swelling anywhere on the body.",
          "A mole that changes in size, shape or colour.",
          "A cough or hoarse voice that lasts more than 3 weeks.",
          "Blood in your urine, stools or when you cough.",
          "Tiredness that doesn't go away with rest.",
          "Changes in bowel or bladder habits that last several weeks.",
          "A sore or wound that doesn't heal.",
        ],
      },
    ],
    seeDoctor: [
      "You notice any of the changes above.",
      "Something feels different or wrong to you, even if it's hard to describe.",
    ],
  },
  {
    id: "consultation-symptoms",
    category: "see-doctor",
    title: "Symptoms That Need a Consultation",
    summary:
      "Book an appointment with a doctor when symptoms last, keep coming back or get in the way of daily life.",
    icon: ClipboardList,
    keywords: ["appointment", "medicine", "medication", "prescription", "side effects"],
    sections: [
      {
        heading: "Book an appointment if",
        points: [
          "Symptoms last longer than expected, or keep returning.",
          "You are getting worse rather than better.",
          "Symptoms affect your work, sleep or daily activities.",
          "You notice new symptoms and are pregnant, older, or have a long-term condition or weakened immune system.",
        ],
      },
      {
        heading: "Preparing for your visit",
        points: [
          "Write down your symptoms, when they started and what makes them better or worse.",
          "Bring a list of all medicines and supplements you take.",
          "Note any questions you want to ask, and bring someone with you if it helps.",
        ],
      },
      {
        heading: "About your medicines",
        points: [
          "Don't stop, start or change a prescribed medicine on your own — talk to your doctor or pharmacist first, even if you feel better or notice side effects.",
        ],
      },
    ],
    seeDoctor: [
      "You think you may be having side effects from a medicine.",
      "You are unsure whether your symptoms need a check — it's fine to ask.",
    ],
  },
  {
    id: "emergency-warning-signs",
    category: "see-doctor",
    title: "Emergency Warning Signs",
    summary:
      "These symptoms can be life-threatening. Contact your local emergency services or go to the nearest emergency department immediately.",
    icon: Siren,
    keywords: ["emergency", "ambulance", "heart attack", "stroke", "allergy", "unconscious"],
    sections: [
      {
        heading: "Heart and breathing",
        points: [
          "Chest pain, pressure or tightness, which may spread to the arm, jaw, neck or back.",
          "Difficulty breathing, choking, or lips turning blue or grey.",
        ],
      },
      {
        heading: "Brain and nerves",
        points: [
          "Sudden weakness or numbness on one side of the body, or a drooping face.",
          "Slurred speech or sudden confusion.",
          "A sudden, very severe headache.",
          "A fit (seizure) or loss of consciousness.",
        ],
      },
      {
        heading: "Other emergencies",
        points: [
          "Heavy bleeding that won't stop.",
          "A severe allergic reaction, with swelling of the lips, tongue or throat.",
          "Severe burns, or serious injury after an accident or fall.",
          "Thoughts of harming yourself or ending your life.",
        ],
      },
    ],
    seeDoctor: [
      "Once the emergency has been treated, follow up with your doctor as advised.",
    ],
    emergency: [
      "Any of the signs above. Don't drive yourself if you have chest pain or stroke symptoms — call for help.",
    ],
  },
];

export type GuideFilters = {
  query: string;
  category: GuideCategoryId | "all";
};

export const DEFAULT_GUIDE_FILTERS: GuideFilters = { query: "", category: "all" };

function searchableText(article: GuideArticle): string {
  return [
    article.title,
    article.summary,
    ...(article.keywords ?? []),
    ...article.sections.flatMap((s) => [s.heading, ...s.points]),
    ...article.seeDoctor,
    ...(article.emergency ?? []),
  ]
    .join(" ")
    .toLowerCase();
}

/**
 * Filter articles by category and search text. Every word in the query must
 * appear somewhere in the article (title, summary, keywords or body).
 */
export function filterArticles(
  articles: readonly GuideArticle[],
  filters: GuideFilters,
): GuideArticle[] {
  const terms = filters.query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  return articles.filter((article) => {
    if (filters.category !== "all" && article.category !== filters.category) return false;
    if (terms.length === 0) return true;
    const text = searchableText(article);
    return terms.every((term) => text.includes(term));
  });
}

export function getArticle(id: string): GuideArticle | undefined {
  return GUIDE_ARTICLES.find((a) => a.id === id);
}

export function getCategory(id: GuideCategoryId): GuideCategory {
  const category = GUIDE_CATEGORIES.find((c) => c.id === id);
  if (!category) throw new Error(`Unknown health guide category: ${id}`);
  return category;
}

/** Hash used in the address bar for an open article, e.g. "#topic-fever". */
export const articleHash = (id: string) => `#topic-${id}`;

export function articleIdFromHash(hash: string): string | null {
  const id = /^#topic-(.+)$/.exec(hash)?.[1];
  return id && getArticle(id) ? id : null;
}
