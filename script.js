/* ==========================================================================
   script.js
   1) Loading screen   2) Page logic (data, cards, filters, logos, scrolling)
   ========================================================================== */

/* ------------------------------------------------------------------
   Loading screen logic
   - Shows a progress ring and rotating funny messages
   - Stays for at least 4s, never longer than 9s
   - Finishes once the main script sets window.__ready = true
   ------------------------------------------------------------------ */
(function () {
  const loader  = document.getElementById("ld");
  const arc     = document.getElementById("arc");
  const percent = document.getElementById("pc");
  const quote   = document.getElementById("qt");

  const QUOTES = [
    "Convincing the cloud to wake up…",
    "Counting badges twice, just to be sure…",
    "Asking Gemini to hurry up (it said no)…",
    "Closing 47 browser tabs…",
    "Brewing chai for the servers…",
    "Redeeming access codes… yours too 👀",
    "Teaching the spreadsheet to behave…",
    "Almost there, pinky promise 🤞"
  ];

  // Shuffle the quotes (Fisher-Yates)
  for (let i = QUOTES.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [QUOTES[i], QUOTES[j]] = [QUOTES[j], QUOTES[i]];
  }

  // Rotate the quote every 1.3s with a short fade
  let quoteIndex = 0;
  quote.textContent = QUOTES[0];
  setInterval(() => {
    quote.classList.add("f");
    setTimeout(() => {
      quoteIndex = (quoteIndex + 1) % QUOTES.length;
      quote.textContent = QUOTES[quoteIndex];
      quote.classList.remove("f");
    }, 350);
  }, 1300);

  // Progress ring
  const CIRCUMFERENCE = 2 * Math.PI * 72;
  const MIN_MS = 4000;   // minimum time on screen
  const MAX_MS = 9000;   // give up waiting after this long
  const startTime = performance.now();
  let shown = 0;         // percentage currently drawn
  let finished = false;

  arc.style.strokeDasharray = CIRCUMFERENCE;

  function tick(now) {
    const elapsed = now - startTime;
    const ready = window.__ready === true;

    // Climb to 96% while waiting; jump to 100% once data is ready
    const target = (ready && elapsed >= MIN_MS)
      ? 100
      : Math.min(elapsed / MIN_MS, 1) * 96;

    shown += (target - shown) * 0.12;                 // ease towards target
    if (target === 100 && shown > 99.4) shown = 100;

    arc.style.strokeDashoffset = CIRCUMFERENCE * (1 - shown / 100);
    percent.textContent = Math.round(shown) + "%";

    if (shown >= 100 || elapsed > MAX_MS) {
      if (!finished) {
        finished = true;
        setTimeout(() => {
          loader.classList.add("out");
          document.body.classList.remove("loading");
          setTimeout(() => loader.remove(), 800);
        }, 250);
      }
      return;
    }
    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();


/* ==========================================================================
   SETTINGS
   ========================================================================== */

// Optional live data: a Google Apps Script URL that returns
// { status: "success", data: [ ...participants ], updated: "date text" }.
// If it fails, the built-in PARTICIPANTS list below is used instead.
const API_URL = "https://script.google.com/macros/s/AKfycbwYFLZo4n7tKKOqLsLTDJ3iltE-LsDKcz-jSP9MusVry2mu6DWs7Vonsp4hBI6t_-Dw/exec";

// Image used for the floating Google Cloud logos
const CLOUD_LOGO = "google-cloud.png";

// Filter buttons: [key, label]
const FILTERS = [
  ["all",    "All"],
  ["gear",   "GEAR badge"],
  ["nogear", "No GEAR badge"],
  ["red",    "Code redeemed"],
  ["pend",   "Code pending"]
];

// What each filter keeps
const FILTER_TESTS = {
  all:    ()  => true,
  gear:   (p) => p.gear,
  nogear: (p) => !p.gear,
  red:    (p) => p.r,
  pend:   (p) => !p.r
};


/* ==========================================================================
   PARTICIPANT DATA (fallback copy)

   Field guide:
     n    name                      gear  has GEAR badge
     sp   skills profile status     dp    developer profile status
     r    access code redeemed      m     milestone name
     c    skill badge count         b     list of badge names
     su   skills profile URL        du    developer profile URL
   ========================================================================== */
let PARTICIPANTS = [
  {"n": "Abhinav Singh Nahar", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/d30ff1e6-9c60-4e38-82d9-306ac3f2a8d7", "du": "https://me.developers.google.com/u/107115873937150346163"},
  {"n": "Abhishek kumar", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/17e7abae-8199-4ff9-a356-e1fe53e37f42", "du": "https://me.developers.google.com/u/109186734080267319327"},
  {"n": "Akshay Kalita", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/ef37993d-82b5-4236-9e70-e67e1d056628", "du": "https://developers.google.com/profile/u/110517950192633895755"},
  {"n": "Anamika Kumari", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/71575aa3-581f-425f-b117-c59bfa2662a9", "du": "https://me.developers.google.com/u/111317364491595563223"},
  {"n": "Angshuman Roy", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/61260387-983f-4e73-b1dd-bf1c1f876e8b", "du": "https://me.developers.google.com/u/100411320387204492570"},
  {"n": "Anirban Bhattacharjee", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/f0567a27-a3cb-4521-a15e-ef66aedaaeab", "du": "https://me.developers.google.com/u/117688553758027855679"},
  {"n": "Astha Arya Baishya", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/551966b7-ed9b-4c0d-8868-9ca5713a4d83", "du": "https://me.developers.google.com/u/115100982071128612292"},
  {"n": "Aviskha Bhattacharyya", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/5008a00e-e161-4310-8906-e15d3f354237", "du": "https://me.developers.google.com/u/116756573270424385758"},
  {"n": "Ayan Biswas", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/cf43b532-1152-4023-81f6-a6bb62f5e41c", "du": "https://me.developers.google.com/u/115084467064257212829"},
  {"n": "Ayush Dey", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/1a62fae4-b75a-4db9-a2c6-8a1ba3c6835f", "du": "https://me.developers.google.com/u/113922085444805679709"},
  {"n": "Bishal Chatterjee", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/f84f66e9-cdef-4712-bd60-d101568c446f", "du": "https://me.developers.google.com/u/103714300524060916962"},
  {"n": "Bishal Dey", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/4383340a-3560-4b76-9ca7-8465d38e6b17", "du": "https://me.developers.google.com/u/106993129887960374676"},
  {"n": "Chinmoy Hazarika", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/cd9e897c-9dcb-450b-be79-c78ae0efa87f", "du": "https://me.developers.google.com/u/109928993063166694568"},
  {"n": "Debasish Kashyap", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/83b1088e-602d-43aa-ae02-c2bf6102c4e7", "du": "https://me.developers.google.com/u/106980744901687974579"},
  {"n": "Farhan Abid Hoque", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/e49ed1bd-3fe6-4971-8943-1c107a055f36", "du": "https://me.developers.google.com/u/109239820653869005165"},
  {"n": "Gaurab Neog", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/71a4fd30-2d7f-4178-99b0-b4f51bd2efeb", "du": "https://me.developers.google.com/u/103787428934568342897"},
  {"n": "Harshita Kalita", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/a36de842-b4c6-41dd-bfa4-30206e8b6dcc", "du": "https://me.developers.google.com/u/115495961086568632201"},
  {"n": "Harsita Barman", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/5da86e27-2b95-49af-ac81-f45804c5148d", "du": "https://me.developers.google.com/u/116876093642535144707"},
  {"n": "Hriday Arnab Rajbongshi", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/1ee99309-ab62-426e-b91f-fbf5ec0cc55a", "du": "https://me.developers.google.com/u/108043414850515053611"},
  {"n": "Japjot Singh", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/a6394e2e-34ae-4332-aa62-4251ae444d32", "du": "https://me.developers.google.com/u/101316760889471979092"},
  {"n": "Jeet pritam Deka", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/04827843-b6f5-497c-9c24-91b9f4b024c3", "du": "https://me.developers.google.com/u/105724072144568744480"},
  {"n": "Jenee Das", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/3b67da33-5190-40a7-b4f2-4d6d0ac0e4f0", "du": "https://me.developers.google.com/u/111033207559813914027"},
  {"n": "Jitendra Yadav", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/86e450dc-b914-49d1-9fa8-db4a40c40706", "du": "https://me.developers.google.com/u/108712797353104952561"},
  {"n": "Jitupan Mondal", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/5808b657-2867-49c6-a4b6-c63d6fe73625", "du": "https://me.developers.google.com/u/111626146390610133481"},
  {"n": "Kankan Ray", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/2b04299e-2682-4c43-98c0-adf2b1845e7c", "du": "https://me.developers.google.com/u/102280282541073062676"},
  {"n": "Kapil Upadhyaya", "gear": false, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/c76d84e0-a010-47cf-8703-8a5f48fad33a", "du": "https://me.developers.google.com/u/116018015763742505662"},
  {"n": "Kaushik Banik", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/6f627ff6-3111-436e-8a57-5f8b1f9516f6", "du": "https://me.developers.google.com/u/105360208450506601291"},
  {"n": "Keshav Sharma", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/47773c17-c759-4a5b-a350-a54a8d9b1dab", "du": "https://me.developers.google.com/u/116537041678427490099"},
  {"n": "Komit Pharbosa", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/375878a4-e0d2-4cc7-bfa9-6878556fa687", "du": "https://me.developers.google.com/u/110338804785628784374"},
  {"n": "Krishna kumar Gupta", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/249a9950-76a8-4143-9733-3eb81bf83162", "du": "https://me.developers.google.com/u/113819256737000071326"},
  {"n": "Mandev Kumar Sharma", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/42535a89-2cfd-435f-a853-5cf7998c50ef", "du": "https://me.developers.google.com/u/105920916918459725979"},
  {"n": "Md Asif", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/0deb5b2e-49cf-4cba-b20e-580fa21d5810", "du": "https://me.developers.google.com/u/105320085277777530163"},
  {"n": "Mehadi Hassan Siddique", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/3ac098a5-daf2-4984-be7d-4c2f15f4edff", "du": "https://me.developers.google.com/u/115849096238967802260"},
  {"n": "Migam Mili", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/f2750995-1ee4-4844-b2a3-dee1b7a06910", "du": "https://me.developers.google.com/u/112520653375929369908"},
  {"n": "Mubashir Nurani", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/fdf02a32-d1af-4c75-a5f3-93af6d592a28", "du": "https://me.developers.google.com/u/108597431195850701333"},
  {"n": "Navraj Pradhan", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/c2fdff34-e544-4ed1-a37c-c3b0c9063e66", "du": "https://me.developers.google.com/u/116568777765002071811"},
  {"n": "Partha Choudhury", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/3b1fb570-c4f6-41cd-a34d-6a5b6de75da2", "du": "https://me.developers.google.com/u/101651048053155133012"},
  {"n": "Piyush Das", "gear": true, "sp": "All Good", "dp": "All Good", "r": true, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/111392aa-5d31-4d8e-a74a-683a590c5e85", "du": "https://me.developers.google.com/u/106708315871148452667"},
  {"n": "Pragyan Gogoi", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/a48b677e-a237-4770-8e5e-1076a09c19b9", "du": "https://me.developers.google.com/u/117268693722345624279"},
  {"n": "Prem Charan", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/84a2261c-0859-4774-9933-33e66e316def", "du": "https://me.developers.google.com/u/105403582254073040590"},
  {"n": "Prince Kumar Gupta", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/e4ae8bc7-92c6-4d55-a846-6f8c609eaffb", "du": "https://me.developers.google.com/u/104527396952772184462"},
  {"n": "Priyam Borthakur", "gear": true, "sp": "All Good", "dp": "All Good", "r": true, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/b00cb046-0142-4a2e-a1c0-79b2b5d2f208", "du": "https://me.developers.google.com/u/114478737612958954142"},
  {"n": "Priyanku Gogoi", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/8c23da7f-cf5f-4ade-a911-50112b5f6b84", "du": "https://me.developers.google.com/u/116257306836921394278"},
  {"n": "Raj Kumar Dutta", "gear": false, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/01f2d0ff-29f9-476c-bd44-e94c779f8370", "du": "https://developers.google.com/profile/u/109430416487587483065"},
  {"n": "Raj Pratik Das", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/7bca5d74-c91c-4bb4-aa6f-12d52e145858", "du": "https://me.developers.google.com/u/104894068219992554594"},
  {"n": "Raj Sutradhar", "gear": false, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/487a603a-c549-463d-a3ea-7ab7325fced6", "du": "https://me.developers.google.com/u/104392909062587948513"},
  {"n": "Reena Kumari", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/be36c821-7033-4853-98b4-e636ca80db1c", "du": "https://me.developers.google.com/u/104831525677780194884"},
  {"n": "Ritika Saha Mandal", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/62b8c513-cbac-4880-a484-a4f7e074d8e0", "du": "https://me.developers.google.com/u/117462583041829032283"},
  {"n": "Rudrajit", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/6e97fe27-4717-4a0b-8864-91c97807dafd", "du": "https://me.developers.google.com/u/117617321132668368508"},
  {"n": "Samujal Paul", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/90e12e53-4d36-4b06-8a86-0deb06de19af", "du": "https://me.developers.google.com/u/118248291594789018821"},
  {"n": "Shwet Prakash", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/c248274e-f996-40e2-8425-127ecde608ba", "du": "https://me.developers.google.com/u/113731289785827454642"},
  {"n": "Subhadeep Das", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/4efeeca3-dfaf-4e38-a6a5-7d33f74df69f", "du": "https://me.developers.google.com/u/104231736384746683414"},
  {"n": "Sunil Kumar", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/8fa73f39-e052-477b-a7b8-27c403c78390", "du": "https://me.developers.google.com/u/113245120401413489485"},
  {"n": "Sushant Neel", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/f06989b0-be81-4319-b9a3-9cd2d0c22396", "du": "https://me.developers.google.com/u/110947962176250293109"},
  {"n": "Tanmoy Sarkar", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/197970e1-44b3-48b4-9bde-3c96643ded40", "du": "https://me.developers.google.com/u/112230244862802228312"},
  {"n": "The Aamir Sheikh", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/b73dd8c2-3ae7-44d3-a988-8f763a59befa", "du": "https://me.developers.google.com/u/108357949268304607085"},
  {"n": "Tushar Pratim Sarma", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/78849a1e-816a-419b-957c-cfbf62a612d0", "du": "https://me.developers.google.com/u/109308669768617746884"},
  {"n": "Ujesh Borthakur", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/080b5e74-0299-4c62-9aeb-451bc8d56323", "du": "https://me.developers.google.com/u/107799070749401497131"},
  {"n": "Utpal Kumar Barman", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/4839d3f6-8910-4143-ac2a-9d3b7821569a", "du": "https://me.developers.google.com/u/118298457609450754638"},
  {"n": "Vishalldeo Sutong", "gear": true, "sp": "All Good", "dp": "All Good", "r": false, "m": "No Milestone", "c": 0, "b": [], "su": "https://www.skills.google/public_profiles/d0ce94c0-3a91-449c-a17c-3b94c5c2a3dd", "du": "https://me.developers.google.com/u/116979469752928377025"}
];


/* ==========================================================================
   STATE
   ========================================================================== */
let activeFilter = "all";
let searchTerm   = "";
let sortMode     = "name";


/* ==========================================================================
   HELPERS
   ========================================================================== */
const $ = (selector) => document.querySelector(selector);

// Escape text before putting it into HTML
const escapeHTML = (text) =>
  String(text).replace(/[&<>"]/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"
  }[c]));

// "Abhinav Singh" -> "AS"
const initials = (name) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

// Stable colour per name (0-359)
const hueFromName = (name) =>
  [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % 360;

const percentOf = (value, total) => (total ? Math.round((value / total) * 100) : 0);


/* ==========================================================================
   RENDER: STAT CHIPS + FILTER BUTTONS
   ========================================================================== */
function renderStats() {
  const total       = PARTICIPANTS.length;
  const withGear    = PARTICIPANTS.filter((p) => p.gear).length;
  const redeemed    = PARTICIPANTS.filter((p) => p.r).length;
  const totalBadges = PARTICIPANTS.reduce((sum, p) => sum + p.c, 0);
  const withMilestone = PARTICIPANTS.filter((p) => !/^no milestone/i.test(p.m)).length;

  // Count participants per milestone name
  const milestoneCounts = {};
  PARTICIPANTS.forEach((p) => {
    milestoneCounts[p.m] = (milestoneCounts[p.m] || 0) + 1;
  });

  const mainChips = [
    ["Confirmed",      total],
    ["GEAR badge",     withGear],
    ["Codes redeemed", redeemed],
    ["Skill badges",   totalBadges],
    ["Milestones",     withMilestone]
  ];

  $("#stats").innerHTML =
    mainChips
      .map(([label, value]) =>
        `<div class="chip"><b data-n="${value}">0</b><span>${label}</span></div>`)
      .join("") +
    Object.entries(milestoneCounts)
      .map(([name, count]) =>
        `<div class="chip alt"><b>${count}</b><span>${escapeHTML(name)}</span></div>`)
      .join("");

  // Filter buttons
  $("#fl").innerHTML = FILTERS
    .map(([key, label]) =>
      `<button class="pill${key === activeFilter ? " on" : ""}" data-f="${key}">${label}</button>`)
    .join("");

  // Count-up animation for the main numbers
  document.querySelectorAll("[data-n]").forEach((el) => {
    const target = +el.dataset.n;
    const start  = performance.now();

    (function step(now) {
      const progress = Math.min((now - start) / 900, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));  // ease-out
      if (progress < 1) requestAnimationFrame(step);
    })(start);
  });
}


/* ==========================================================================
   RENDER: PARTICIPANT CARDS
   ========================================================================== */

// HTML for one participant card
function cardHTML(person, number, maxBadges) {
  const hue = hueFromName(person.n);
  const avatarBg =
    `linear-gradient(135deg, hsl(${hue} 50% 85%), hsl(${(hue + 40) % 360} 55% 76%))`;

  const badgeList = person.b.length
    ? `<details>
         <summary>${person.c} skill badge${person.c > 1 ? "s" : ""}</summary>
         <ul>${person.b.map((b) => `<li>${escapeHTML(b)}</li>`).join("")}</ul>
       </details>`
    : "";

  const skillsLink = person.su
    ? `<a href="${escapeHTML(person.su)}" target="_blank" rel="noopener">Skills profile ↗</a>` : "";
  const devLink = person.du
    ? `<a href="${escapeHTML(person.du)}" target="_blank" rel="noopener">Developer ↗</a>` : "";

  const skillsOk = /good/i.test(person.sp) ? "ok" : "";
  const devOk    = /good/i.test(person.dp) ? "ok" : "";
  const barWidth = percentOf(person.c, maxBadges);

  return `
    <article class="card p">
      <div class="head">
        <div class="av" style="background:${avatarBg}">${escapeHTML(initials(person.n))}</div>
        <div>
          <div class="nm">${escapeHTML(person.n)}</div>
          <div class="idx">#${String(number).padStart(2, "0")}</div>
        </div>
      </div>

      <div class="meta">
        <div><small>GEAR badge</small><span>${person.gear ? "Earned" : "Not yet"}</span></div>
        <div><small>Access code</small><span>${person.r ? "Redeemed" : "Pending"}</span></div>
        <div><small>Milestone</small><span>${escapeHTML(person.m)}</span></div>
        <div><small>Skill badges</small><span>${person.c}</span></div>
      </div>

      <div class="bar" style="margin:0"><b style="width:${barWidth}%"></b></div>

      <div class="tags" style="margin:0">
        <span class="tag ${skillsOk}"><i class="dot"></i>Skills: ${escapeHTML(person.sp)}</span>
        <span class="tag ${devOk}"><i class="dot"></i>Dev: ${escapeHTML(person.dp)}</span>
      </div>

      ${badgeList}

      <div class="links">${skillsLink}${devLink}</div>
    </article>`;
}

// Apply search + filter + sort, then draw the cards
function renderList() {
  const visible = PARTICIPANTS.filter((p) =>
    p.n.toLowerCase().includes(searchTerm) && FILTER_TESTS[activeFilter](p)
  );

  const byName = (a, b) => a.n.localeCompare(b.n);
  visible.sort((a, b) => {
    if (sortMode === "badges") return (b.c - a.c) || byName(a, b);
    if (sortMode === "gear")   return (b.gear - a.gear) || byName(a, b);
    return byName(a, b);
  });

  $("#cnt").textContent = `Showing ${visible.length} of ${PARTICIPANTS.length}`;

  const maxBadges = Math.max(8, ...PARTICIPANTS.map((p) => p.c));

  $("#grid").innerHTML = visible.length
    ? visible.map((p) => cardHTML(p, PARTICIPANTS.indexOf(p) + 1, maxBadges)).join("")
    : `<div class="empty card">No learners match that search.</div>`;
}

function renderAll() {
  renderStats();
  renderList();
}


/* ==========================================================================
   EVENTS
   ========================================================================== */

// Search as you type
$("#q").addEventListener("input", (e) => {
  searchTerm = e.target.value.trim().toLowerCase();
  renderList();
});

// Sort dropdown
$("#so").addEventListener("change", (e) => {
  sortMode = e.target.value;
  renderList();
});

// Filter buttons (one listener for all of them)
$("#fl").addEventListener("click", (e) => {
  const button = e.target.closest("[data-f]");
  if (!button) return;

  activeFilter = button.dataset.f;
  document.querySelectorAll("#fl .pill")
    .forEach((pill) => pill.classList.toggle("on", pill === button));
  renderList();
});

// Search button / Enter key -> jump down to the participants
const goToPeople = () => $("#people").scrollIntoView({ behavior: "smooth" });
$("#fb").addEventListener("click", goToPeople);
$("#q").addEventListener("keydown", (e) => { if (e.key === "Enter") goToPeople(); });

// Floating buttons
$("#up").addEventListener("click", () => scrollTo({ top: 0 }));
$("#cp").addEventListener("click", () => document.body.classList.toggle("compact"));

// Fade sections in when they scroll into view
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("in");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll(".rv").forEach((el) => revealObserver.observe(el));


/* ==========================================================================
   GOOGLE CLOUD LOGOS
   Each row = [left %, top %, size px, animation delay s, rotation deg, opacity]
   Delete a row to remove that logo.
   ========================================================================== */
const HERO_LOGOS = [
  [ 5, 22, 60,  0,   -8, .90],
  [14, 58, 44, 1.2,  10, .80],
  [27, 18, 36,  2,  -12, .65],
  [72, 20, 38, 1.8,   6, .70],
  [82, 56, 54,  .8,  -8, .90],
  [93, 24, 48, 2.2,  10, .90],
  [22, 74, 46, 1.6,   8, .85],
  [90, 74, 50, 1.4,   8, .85]
];

const FOOTER_LOGOS = [
  [10, 34, 48,  0,   -8, .90],
  [24, 58, 36, 1.2,  10, .75],
  [42, 22, 42,  .6,   6, .85],
  [60, 54, 44, 1.6,  -8, .85],
  [76, 24, 38,  .3,   8, .75],
  [88, 52, 46, 2.2,  -6, .85]
];

// Place the logos inside a container
function scatterLogos(containerId, positions) {
  const container = document.getElementById(containerId);
  if (!container) return;

  positions.forEach(([left, top, size, delay, rotation, opacity]) => {
    const img = new Image();
    img.src = CLOUD_LOGO;
    img.alt = "";
    img.style.cssText =
      `left:${left}%; top:${top}%; --s:${size}; --d:${delay}s; --r:${rotation}deg; --o:${opacity}`;
    img.onerror = () => img.remove();     // quietly skip if the file is missing
    container.appendChild(img);
  });
}

scatterLogos("gc",  HERO_LOGOS);
scatterLogos("gc2", FOOTER_LOGOS);


/* ==========================================================================
   SMOOTH MOUSE-WHEEL SCROLLING
   Skipped on touch screens and for "reduce motion" users.
   Tweak the 0.12 below: lower = floatier, higher = snappier.
   ========================================================================== */
(function () {
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touchDevice  = matchMedia("(pointer: coarse)").matches;
  if (reduceMotion || touchDevice) return;

  let current = scrollY;   // position being drawn
  let target  = scrollY;   // position we are heading to
  let frame   = 0;         // running animation frame (0 = idle)

  const maxScroll = () => document.documentElement.scrollHeight - innerHeight;
  const jumpTo    = (y) => scrollTo({ top: y, behavior: "instant" });

  function animate() {
    current += (target - current) * 0.12;

    if (Math.abs(target - current) < 0.5) {   // close enough: stop
      current = target;
      jumpTo(current);
      frame = 0;
      return;
    }
    jumpTo(current);
    frame = requestAnimationFrame(animate);
  }

  addEventListener("wheel", (e) => {
    if (e.ctrlKey || document.body.classList.contains("loading")) return;
    e.preventDefault();

    if (!frame) current = target = scrollY;
    const delta = e.deltaY * (e.deltaMode === 1 ? 32 : 1);   // lines -> pixels
    target = Math.max(0, Math.min(maxScroll(), target + delta));

    if (!frame) frame = requestAnimationFrame(animate);
  }, { passive: false });

  // Keep in sync when scrolled by keyboard, scrollbar or links
  addEventListener("scroll", () => {
    if (!frame) current = target = scrollY;
  }, { passive: true });
})();


/* ==========================================================================
   START
   Try to load fresh data, then draw the page and tell the loading screen
   it can finish.
   ========================================================================== */
const dataRequest = API_URL
  ? fetch(API_URL)
      .then((response) => response.json())
      .then((result) => {
        if (result.status === "success") {
          PARTICIPANTS = result.data;
          if (result.updated) $("#asof").textContent = result.updated;
        }
      })
      .catch(() => {})          // offline or error: keep the built-in data
  : Promise.resolve();

dataRequest.finally(() => {
  renderAll();
  window.__ready = true;
});
