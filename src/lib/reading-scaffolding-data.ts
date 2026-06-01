export type SectionId = "overview" | "part1" | "part2" | "summary";

export type ReadingOption = {
  value: "A" | "B" | "C" | "D";
  label: string;
};

export type ReadingQuestion = {
  id: number;
  section: Extract<SectionId, "part1" | "part2">;
  numberLabel: string;
  prompt: string;
  options: ReadingOption[];
  answer: ReadingOption["value"];
  hint: string;
  strategy: string;
  explanation: string;
  clueIds: string[];
};

export const APP_TITLE = "Reading Scaffolding";
export const APP_SUBTITLE = "Cycle 1 - Reading 1: Webpage Advertisement";

export const SECTION_TABS: Array<{ id: SectionId; label: string; iconClass: string }> = [
  { id: "overview", label: "Overview", iconClass: "fas fa-eye" },
  { id: "part1", label: "Part 1: Ad", iconClass: "fas fa-ad" },
  { id: "part2", label: "Part 2: Comments", iconClass: "fas fa-comments" },
  { id: "summary", label: "Summary", iconClass: "fas fa-trophy" },
];

export const OVERVIEW_PRE_READING = [
  "How many parts are there in the webpage?",
  "Is the ice-cream shop in Hong Kong?",
];

export const OVERVIEW_SKILLS = [
  { iconClass: "fas fa-fast-forward", label: "Skimming" },
  { iconClass: "fas fa-search", label: "Scanning" },
  { iconClass: "fas fa-sitemap", label: "Text Structure" },
  { iconClass: "fas fa-puzzle-piece", label: "Inference" },
  { iconClass: "fas fa-hashtag", label: "Numerical Reasoning" },
  { iconClass: "fas fa-book", label: "Contextual Clues" },
];

export const PART_ONE_PRE_READING = [
  "Is there only one ice-cream flavour in the shop?",
  "Is there any special offer?",
  "Is there any free gift?",
];

export const PART_TWO_PRE_READING = [
  "How many people have written comments on the webpage?",
];

export const QUESTIONS: ReadingQuestion[] = [
  {
    id: 1,
    section: "part1",
    numberLabel: "Question 1",
    prompt: "There is a mix of _____ flavours in 'Rainbow Ice Cream'.",
    options: [
      { value: "A", label: "three" },
      { value: "B", label: "four" },
      { value: "C", label: "six" },
      { value: "D", label: "seven" },
    ],
    answer: "B",
    hint: "Look at the subtitle under the ice cream name. Count the flavours listed: cherry, banana, melon and blueberry. How many are there?",
    strategy: "Scanning: When you need specific information, scan the text for keywords. Here, look for the flavour names listed after 'a mix of delicious'.",
    explanation:
      "Correct: B. four\n\nThe subtitle says 'a mix of delicious cherry, banana, melon and blueberry flavours.' Counting these gives us four flavours.",
    clueIds: ["q1"],
  },
  {
    id: 2,
    section: "part1",
    numberLabel: "Question 2",
    prompt: "To enjoy this week's special offer, Bella has to ______.",
    options: [
      { value: "A", label: "buy two scoops of ice cream" },
      { value: "B", label: "order the family pack" },
      { value: "C", label: "post a comment on the website" },
      { value: "D", label: "visit the Sha Tin shop" },
    ],
    answer: "D",
    hint: "Read the special offer banner carefully. It says the offer is 'for the Sha Tin branch only'. What does Bella need to do to get this offer?",
    strategy: "Scanning and inference: Find the special offer section and look at all the conditions. The key detail is at the end - the branch restriction tells you what action is required.",
    explanation:
      "Correct: D. visit the Sha Tin shop\n\nThe special offer states 'for the Sha Tin branch only,' meaning Bella must go to the Sha Tin shop to enjoy the 'Buy 1 get 1 FREE' deal.",
    clueIds: ["q2"],
  },
  {
    id: 3,
    section: "part1",
    numberLabel: "Question 3",
    prompt: "Bella can get a gift if she buys 'Rainbow Ice Cream' on ______.",
    options: [
      { value: "A", label: "14 July" },
      { value: "B", label: "16 July" },
      { value: "C", label: "19 July" },
      { value: "D", label: "22 July" },
    ],
    answer: "B",
    hint: "The special offer runs from 16-22 July. The 'gift' is the free scoop. Check which answer dates fall within this week. 14 July is before the offer starts!",
    strategy: "Numerical reasoning: Work with dates carefully. The offer is 16-22 July. Check each option: 14 July is before the offer. Options B (16), C (19), and D (22) are all within the range, but B is the answer here.",
    explanation:
      "Correct: B. 16 July\n\nThe special offer runs from 16-22 July. 14 July is before the offer period. B (16 July) is within the promotional period and is the correct answer.",
    clueIds: ["q3", "q3b"],
  },
  {
    id: 4,
    section: "part2",
    numberLabel: "Question 4",
    prompt: "In the 'Comments' section, the word 'ordinary' means ______.",
    options: [
      { value: "A", label: "common" },
      { value: "B", label: "special" },
      { value: "C", label: "new" },
      { value: "D", label: "strange" },
    ],
    answer: "A",
    hint: "Jimmy says he prefers 'these ordinary flavours to the strange new mix.' The word 'ordinary' is contrasted with 'strange.' If 'strange' means unusual, what does 'ordinary' mean? Think about opposites!",
    strategy: "Contextual inference: When you do not know a word's meaning, look at the surrounding words for clues. Here, 'ordinary' is contrasted with 'strange' - they are opposites.",
    explanation:
      "Correct: A. common\n\nJimmy prefers 'ordinary' flavours (vanilla and chocolate) to the 'strange' new mix. Since 'ordinary' is the opposite of 'strange,' it means common (normal, usual).",
    clueIds: ["q4", "q4b"],
  },
  {
    id: 5,
    section: "part2",
    numberLabel: "Question 5",
    prompt: "In the 'Comments' section, 'Ugh!' is the sound of someone finding something ______.",
    options: [
      { value: "A", label: "interesting" },
      { value: "B", label: "expensive" },
      { value: "C", label: "delicious" },
      { value: "D", label: "horrible" },
    ],
    answer: "D",
    hint: "Read what happens after 'Ugh!' - the ice cream melted, the colours mixed together, and HappyDave calls it 'What a mess!'. Was this a good or bad experience?",
    strategy: "Coherence inference: Connect the exclamation 'Ugh!' with HappyDave's overall attitude. The words 'melted,' 'mess,' and the sarcastic renaming to 'Typhoon Ice Cream' all show negative feelings.",
    explanation:
      "Correct: D. horrible\n\n'Ugh!' expresses disgust. HappyDave found the melted, messy ice cream horrible. The context clues - 'melted,' 'mixed together,' 'What a mess!' - all point to a very negative experience.",
    clueIds: ["q5", "q5b", "q5c"],
  },
  {
    id: 6,
    section: "part2",
    numberLabel: "Question 6",
    prompt: "Who enjoyed 'Rainbow Ice Cream' the most?",
    options: [
      { value: "A", label: "Jimmy1234" },
      { value: "B", label: "CoolChloe01" },
      { value: "C", label: "KatyLovesFood" },
      { value: "D", label: "HappyDave" },
    ],
    answer: "B",
    hint: "Look at each comment's attitude: Jimmy1234 prefers other flavours, CoolChloe01 says 'I'm coming back for more!' (very positive!), KatyLovesFood says 'Looks good but tastes average' (mixed), HappyDave says 'What a mess!' (negative). Who sounds the most enthusiastic?",
    strategy: "Coherence inference: Match each person's attitude to the ice cream. Compare the feelings expressed in each comment. 'Coming back for more' is the most positive statement of all four comments.",
    explanation:
      "Correct: B. CoolChloe01\n\nCoolChloe01 says 'I'm coming back for more!' - this shows she enjoyed it so much she wants to buy it again. The others were negative, mixed, or preferred different flavours.",
    clueIds: ["q6"],
  },
];

export const SUMMARY_SKILLS = [
  {
    iconClass: "fas fa-fast-forward",
    iconClassName: "skill-blue",
    title: "Skimming",
    description: "Get an overview and the main idea quickly.",
  },
  {
    iconClass: "fas fa-sitemap",
    iconClassName: "skill-mint",
    title: "Text Structure",
    description: "Identify theme markers, structure and topic sentences.",
  },
  {
    iconClass: "fas fa-search",
    iconClassName: "skill-orange",
    title: "Scanning",
    description: "Find specific information you need in the reading.",
  },
  {
    iconClass: "fas fa-puzzle-piece",
    iconClassName: "skill-pink",
    title: "Making Inferences",
    description: "Go beyond what is stated to understand implied meaning.",
  },
  {
    iconClass: "fas fa-hashtag",
    iconClassName: "skill-purple",
    title: "Numerical Reasoning",
    description: "Work out answers related to numbers and dates.",
  },
  {
    iconClass: "fas fa-book",
    iconClassName: "skill-yellow",
    title: "Contextual Inference",
    description: "Use surrounding words to figure out unknown meanings.",
  },
  {
    iconClass: "fas fa-link",
    iconClassName: "skill-mint",
    title: "Coherence Inference",
    description: "Connect information to understand attitudes and feelings.",
  },
];

export const SUMMARY_TIPS = [
  {
    iconClass: "fas fa-eye",
    iconClassName: "skill-blue",
    text: "Activate your background knowledge about the topic before reading.",
  },
  {
    iconClass: "fas fa-map-marker-alt",
    iconClassName: "skill-pink",
    text: "Locate details in the reading to support your understanding.",
  },
  {
    iconClass: "fas fa-redo",
    iconClassName: "skill-purple",
    text: "Reread relevant parts to confirm your interpretation.",
  },
  {
    iconClass: "fas fa-balance-scale",
    iconClassName: "skill-mint",
    text: "Understand each answer choice and compare them to find the best one.",
  },
];