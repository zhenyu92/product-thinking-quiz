// Content for the Product Thinking lesson game.
//
// Adapted from the Institute of Digital Government's public "Product Thinking"
// pathway (7 modules). Source: https://www.idg.gov.sg/product-thinking/
// An unofficial study aid - not affiliated with or endorsed by any agency.
//
// Three things live here and nothing else: MODULES (source links), CARDS (the
// Learn stage) and QUESTIONS (Practice + Quiz). app.js reads all three.

const MODULES = {
  1: { name: "Understanding the Problem", url: "https://www.idg.gov.sg/guides-and-resources/productthinking1/" },
  2: { name: "Start With The Whys", url: "https://www.idg.gov.sg/guides-and-resources/productthinking2/" },
  3: { name: "Craft a Clear Problem Statement", url: "https://www.idg.gov.sg/guides-and-resources/productthinking3/" },
  4: { name: "Metrics", url: "https://www.idg.gov.sg/guides-and-resources/productthinking4/" },
  5: { name: "Assumptions and Risks", url: "https://www.idg.gov.sg/guides-and-resources/productthinking5/" },
  6: { name: "A Good Customer Experience", url: "https://www.idg.gov.sg/guides-and-resources/productthinking6/" },
  7: { name: "Key Takeaways", url: "https://www.idg.gov.sg/guides-and-resources/productthinking7/" },
};

// ---------------------------------------------------------------- LEARN stage
// Four quick concept cards. `art` names an inline SVG drawn by app.js.
const CARDS = [
  {
    kicker: "Big idea 1 of 4",
    title: "Problems before solutions",
    art: "problem",
    body: "Most initiatives fail because they solved the <b>wrong problem</b>, not because they were built badly. “We need a chatbot” is a solution wearing a problem's clothes.",
    keep: "Ask what is actually broken before naming what to build.",
  },
  {
    kicker: "Big idea 2 of 4",
    title: "The 4Cs of a problem statement",
    art: "fourcs",
    body: "A problem statement earns its keep when it has all four: <b>Clarity</b> (what exactly happens), <b>Consequence</b> (who it hurts), <b>Cause</b> (why it happens) and <b>Confirmation</b> (the evidence).",
    keep: "“We think” is a hunch. Confirmation is what makes it a problem.",
  },
  {
    kicker: "Big idea 3 of 4",
    title: "Outcomes, not outputs",
    art: "outcome",
    body: "Downloads, shipped features and go-live dates are <b>outputs</b> – things you produced. An <b>outcome</b> is a change people actually feel, like renewals dropping from 9 days to 2.",
    keep: "Leading indicators steer you early. Lagging ones prove it worked.",
  },
  {
    kicker: "Big idea 4 of 4",
    title: "De-risk in stages",
    art: "stages",
    body: "Proof of concept, then proof of value, then scale, then maturity. Each stage buys the right to spend more, so commitment stays proportional to what you have actually learned.",
    keep: "Ask what could go wrong – and the cheapest way to find out.",
  },
];

// ------------------------------------------------------ PRACTICE + QUIZ pools
// Questions carrying a `scenario` are dealt into the Quiz round; the plainer
// ones become Practice. Each item:
// { module, scenario?, q, options[], answer (0-based), hint, why }
const QUESTIONS = [
  {
    module: 1,
    scenario: "At a kickoff, a director opens with: “We need an AI chatbot to bring down our call volume. Can we scope it this quarter?”",
    q: "What is the product thinking objection to starting here?",
    options: [
      "The quarter is too short a timeline for an AI build",
      "A solution has been chosen before anyone diagnosed why people are calling",
      "A chatbot is the wrong technology for handling phone calls",
      "There is not enough training data to build a useful chatbot yet",
    ],
    answer: 1,
    hint: "Look at the order of events, not the technology choice.",
    why: "Great products start with problems, not solutions. The chatbot might turn out to be right – but nobody yet knows what is driving the calls, so there is no way to tell.",
  },
  {
    module: 1,
    q: "Grab began with taxis, Amazon with books, Netflix with DVD rentals. What is the lesson?",
    options: [
      "Start in a low-competition market so you have room to grow",
      "Physical services are easier to launch than digital ones",
      "Each mastered a single problem first rather than launching its full vision",
      "Scale is what separates successful products from failed ones",
    ],
    answer: 2,
    hint: "None of them launched with the company you know today.",
    why: "Each nailed one problem before scaling. That is the argument for narrowing scope instead of building the whole ambition at once.",
  },
  {
    module: 1,
    scenario: "A team ships a slick digital form. Uptake stays near zero: the governing policy still requires a wet-ink signature, and the back office has no way to process a digital submission.",
    q: "Which principle does this failure illustrate?",
    options: [
      "Chase outcomes, not outputs",
      "Integrate Policy, Ops and Tech",
      "Problems before solutions",
      "Start with the whys",
    ],
    answer: 1,
    hint: "Count how many parts of the organisation had to move – and how many did.",
    why: "The build was fine. Policy and operations were not aligned with it, and all three have to move together. That is also why cross-functional teams put policy, ops and tech in one room.",
  },
  {
    module: 2,
    q: "What are the Five Whys for?",
    options: [
      "Moving from a symptom to a cause",
      "Getting five different stakeholders to agree on a problem",
      "Proving a problem is worth solving before you fund it",
      "Breaking a large problem into five smaller workstreams",
    ],
    answer: 0,
    hint: "It is a diagnostic tool, not a planning or alignment tool.",
    why: "It is “a simple tool that moves you from symptom to cause” – pushing past the first, most visible version of a problem to the reasons underneath it.",
  },
  {
    module: 2,
    scenario: "Five whys deep, your team lands on a genuine cause: national procurement rules add six months to onboarding any vendor. Nobody on the team can change procurement rules.",
    q: "What makes a cause the right one to act on?",
    options: [
      "It is the deepest cause you reached before running out of whys",
      "It is the cause the most senior stakeholder in the room agrees with",
      "It sits within your team's sphere of control and connects to the outcome you want to change",
      "It is the cause that appears most often across the complaints you have collected",
    ],
    answer: 2,
    hint: "There are two tests, and this cause passes only one of them.",
    why: "A cause has to be inside your sphere of control <i>and</i> connect to the outcome you are trying to move. A true cause you cannot act on does not give you a place to start.",
  },
  {
    module: 2,
    q: "“Problems rarely have one root cause.” What follows from that?",
    options: [
      "The Five Whys should be run exactly five times to stay disciplined",
      "One chain of whys may not be the whole picture, so expect several contributing causes",
      "Root cause analysis is unreliable and should be replaced with user research",
      "You should pick the single deepest cause and ignore the shallower ones",
    ],
    answer: 1,
    hint: "A single chain of whys gives you one path down. Is one path enough?",
    why: "Treating one chain as the whole diagnosis is how teams end up fixing something real that barely moves the outcome.",
  },
  {
    module: 3,
    q: "The 4Cs are Clarity, Consequence, Cause and which fourth?",
    options: ["Cost", "Confirmation", "Constraint", "Commitment"],
    answer: 1,
    hint: "It is the one that asks for evidence.",
    why: "Confirmation is the evidence step – the part that stops a problem statement from being one confident person's hunch.",
  },
  {
    module: 3,
    scenario: "A draft statement: “Residents abandon our permit renewal form halfway through, because it asks for documents they have already submitted. We think this is a real problem.”",
    q: "Which of the 4Cs is this draft missing?",
    options: [
      "Clarity – the problem is not specific enough",
      "Cause – it does not say why the problem happens",
      "Consequence – it does not say what the abandonment costs anyone",
      "Confirmation – “we think” is a hunch, not evidence",
    ],
    answer: 3,
    hint: "Read the last sentence again, slowly.",
    why: "Clarity and Cause are both there – the behaviour is specific and a reason is given. What is missing is data showing this is really happening at the scale claimed.",
  },
  {
    module: 3,
    q: "What does the Consequence step force a team to answer?",
    options: [
      "What it will cost to build the solution",
      "What happens, and to whom, if the problem goes unsolved",
      "Which team will be accountable for the fix",
      "What the second-order effects of the solution might be",
    ],
    answer: 1,
    hint: "It is about the cost of doing nothing, not the cost of building.",
    why: "Consequence turns a real problem into a prioritised one. Plenty of problems are genuine but not worth funding; naming the impact is how you tell them apart.",
  },
  {
    module: 4,
    q: "Which of these is an outcome rather than an output?",
    options: [
      "12,000 residents downloaded the app in its first month",
      "The team shipped all 14 features in the roadmap",
      "Median time to renew a permit fell from 9 days to 2",
      "The new service went live across all 5 regional offices",
    ],
    answer: 2,
    hint: "Three of these describe what the team delivered. One describes what changed for people.",
    why: "Downloads, shipped features and rollout are all things you produced. A drop in renewal time is a change residents actually experience.",
  },
  {
    module: 4,
    scenario: "You are three weeks into a six-month rollout and want to know early whether it is working.",
    q: "What is the relationship between leading and lagging indicators?",
    options: [
      "Leading indicators give early feedback during implementation; lagging ones measure the outcome achieved – you need both",
      "Leading indicators are for executives; lagging indicators are for delivery teams",
      "Leading indicators are estimates, so replace them with lagging data as soon as you can",
      "Leading indicators track cost while lagging indicators track benefit",
    ],
    answer: 0,
    hint: "It is not a choice between them.",
    why: "Lagging indicators tell you whether you succeeded but arrive too late to steer. Leading indicators arrive early enough to act on but do not prove the outcome. The point is how they work together.",
  },
  {
    module: 4,
    q: "What does the Value-Cost Ratio (VCR) measure?",
    options: [
      "Whether a metric is specific, measurable, achievable, relevant and time-bound",
      "The ratio of leading to lagging indicators in your measurement plan",
      "How much value is generated for every dollar spent",
      "The gap between forecast and actual delivery cost",
    ],
    answer: 2,
    hint: "The name gives it away: value over cost.",
    why: "Value generated per dollar spent – the tool for making the case for continued investment, which is exactly when you are asking for the next tranche of funding.",
  },
  {
    module: 5,
    q: "Before building, what is the one question to ask about your assumptions?",
    options: [
      "What is the worst case, and how much would it cost us?",
      "What could go wrong, and what is the cheapest way to find out?",
      "Which assumptions can we validate without involving real users?",
      "What would have to be true for this to succeed?",
    ],
    answer: 1,
    hint: "Any team can list risks. What is the second half that makes it actionable?",
    why: "The operative part is “cheapest way to find out” – so you learn before you have spent the budget rather than after.",
  },
  {
    module: 5,
    scenario: "A health appointment booking service launched as a simple web form with an Excel backend. An A/B test produced zero bookings on one variant and 24 on the other.",
    q: "Why was shipping something that obviously would not scale the right call?",
    options: [
      "It was the lowest-cost way to validate that the demand was real",
      "It let the team claim delivery while the real system was being built",
      "Excel is easier for non-technical operations staff to maintain",
      "It avoided the procurement delay a proper system would have needed",
    ],
    answer: 0,
    hint: "What did the team learn for almost no money?",
    why: "“Not scalable, but the lowest-cost way to validate.” Market risk – will anyone actually use this – gets answered by putting something in front of real users early, not by building well first.",
  },
  {
    module: 5,
    q: "What is the order of the four de-risking stages?",
    options: [
      "Proof of value, proof of concept, maturity, scale",
      "Proof of concept, scale, proof of value, maturity",
      "Proof of concept, proof of value, scale, maturity",
      "Proof of value, scale, proof of concept, maturity",
    ],
    answer: 2,
    hint: "Does it work at all, before does it help anyone.",
    why: "Proof of concept, proof of value, scale, maturity. Each stage buys the right to spend more, keeping commitment proportional to what you have learned.",
  },
  {
    module: 6,
    q: "Why does customer experience matter more, not less, for compulsory services?",
    options: [
      "Compulsory services carry higher political and reputational risk",
      "Mandatory services handle more sensitive personal data",
      "Citizens have no option to go elsewhere, so a bad experience is inescapable",
      "Compliance rates fall sharply when a service is hard to use",
    ],
    answer: 2,
    hint: "What can a frustrated user of a commercial product do that a citizen cannot?",
    why: "Good CX “isn't a nice-to-have, it's necessary... especially true when services are compulsory, because citizens don't have the option to go elsewhere.” A commercial product with bad CX loses customers; a compulsory one just makes people suffer it.",
  },
  {
    module: 6,
    q: "What is the 11-Star Framework used for?",
    options: [
      "Scoring a service against eleven standard usability criteria",
      "Deliberately describing an absurdly good experience to stretch the team's ambition",
      "Ranking features by user value so the roadmap can be cut to fit",
      "Benchmarking a service against the eleven best-rated government products",
    ],
    answer: 1,
    hint: "Nothing is actually rated out of eleven. So what is the eleventh star for?",
    why: "It is an ambition-stretcher, not a rubric. Describe an experience far beyond reasonable, then walk back: “somewhere between adequate and impossible lies an experience that's genuinely worth building.”",
  },
  {
    module: 7,
    q: "Product thinking closes with three mindset shifts. Which set is right?",
    options: [
      "Solutions to problems; outputs to outcomes; big bang delivery to staged delivery",
      "Problems to solutions; outcomes to outputs; staged delivery to continuous delivery",
      "Ideas to evidence; features to metrics; projects to products",
      "Policy to tech; tech to ops; ops to policy",
    ],
    answer: 0,
    hint: "Watch the direction of travel in each pair.",
    why: "Solutions → problems, outputs → outcomes, big bang → staged. In one line: product thinking is “a discipline of asking better questions before reaching for solutions.”",
  },
];
