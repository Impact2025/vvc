/**
 * Seed script — demo content met echte VVC namen
 * Run: npx tsx scripts/seed.ts
 */

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/db/schema";

const DATABASE_URL =
  "postgresql://neondb_owner:npg_gPbG6jDq9Nor@ep-plain-cell-almf0leg-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";

const sql = neon(DATABASE_URL);
const db = drizzle(sql, { schema });

async function seed() {
  console.log("🌱 Seeding VVCgoesUK database...\n");

  // ── Settings ────────────────────────────────────────────────────────────────
  console.log("⚙️  Settings...");
  const settingsData = [
    { key: "donatie_raised", value: "62500" },       // €625 opgehaald
    { key: "donatie_goal", value: "150000" },          // €1500 doel
    { key: "tour_active", value: "true" },
    { key: "live_match_id", value: "" },
    { key: "welkom_bericht", value: "VVC U10 gaat naar Londen! Volg de jongens live. 🏴󠁧󠁢󠁥󠁮󠁧󠁿⚽" },
    { key: "auto_approve_comments", value: "false" },
    { key: "tikkie_donatie", value: "https://tikkie.me/pay/vvcgoesuk" },
    { key: "tikkie_pakket_s", value: "https://tikkie.me/pay/vvcgoesuk-s" },
    { key: "tikkie_pakket_l", value: "https://tikkie.me/pay/vvcgoesuk-l" },
  ];
  for (const s of settingsData) {
    await db
      .insert(schema.settings)
      .values(s)
      .onConflictDoUpdate({ target: schema.settings.key, set: { value: s.value } });
  }

  // ── Players ─────────────────────────────────────────────────────────────────
  console.log("⚽ Spelers...");
  await db.delete(schema.players);
  const playerList = await db
    .insert(schema.players)
    .values([
      { name: "Wesley",  number: 1,  goals: 0, assists: 1, position: "Keeper" },
      { name: "Emersen", number: 2,  goals: 1, assists: 3, position: "Verdediger" },
      { name: "Alex",    number: 3,  goals: 0, assists: 2, position: "Verdediger" },
      { name: "Syb",     number: 6,  goals: 2, assists: 4, position: "Middenvelder" },
      { name: "Thomas",  number: 8,  goals: 3, assists: 2, position: "Middenvelder" },
      { name: "Sepp",    number: 9,  goals: 4, assists: 1, position: "Aanvaller" },
      { name: "Deniz",   number: 10, goals: 5, assists: 2, position: "Aanvaller" },
    ])
    .returning();

  // ── Matches ─────────────────────────────────────────────────────────────────
  console.log("🏆 Wedstrijden...");
  await db.delete(schema.matches);
  const matchList = await db
    .insert(schema.matches)
    .values([
      {
        opponent: "Arsenal Academy",
        date: "2026-05-30",
        time: "10:00",
        location: "Hale End Training Centre",
        home_score: 3,
        away_score: 1,
        status: "finished",
      },
      {
        opponent: "Chelsea Youth",
        date: "2026-05-30",
        time: "14:00",
        location: "Cobham Training Ground",
        home_score: 2,
        away_score: 2,
        status: "finished",
      },
      {
        opponent: "Tottenham U10",
        date: "2026-05-31",
        time: "11:00",
        location: "Hotspur Way",
        home_score: 4,
        away_score: 0,
        status: "finished",
      },
      {
        opponent: "West Ham Academy",
        date: "2026-05-31",
        time: "15:30",
        location: "Rush Green Training",
        home_score: 1,
        away_score: 3,
        status: "finished",
      },
      {
        opponent: "Crystal Palace Youth",
        date: "2026-06-01",
        time: "10:30",
        location: "Crystal Palace FC Academy",
        home_score: 0,
        away_score: 0,
        status: "upcoming",
      },
      {
        opponent: "Brentford U10",
        date: "2026-06-01",
        time: "14:00",
        location: "Jersey Road Ground",
        home_score: 0,
        away_score: 0,
        status: "upcoming",
      },
    ])
    .returning();

  // ── MOTM Votes ───────────────────────────────────────────────────────────────
  console.log("🌟 Man of the Match stemmen...");
  await db.delete(schema.motm_votes);
  await db.insert(schema.motm_votes).values([
    { match_id: matchList[0].id, player_name: "Deniz",  voter_ip: "1.2.3.1" },
    { match_id: matchList[0].id, player_name: "Deniz",  voter_ip: "1.2.3.2" },
    { match_id: matchList[0].id, player_name: "Sepp",   voter_ip: "1.2.3.3" },
    { match_id: matchList[0].id, player_name: "Thomas", voter_ip: "1.2.3.4" },
    { match_id: matchList[1].id, player_name: "Syb",    voter_ip: "1.2.3.5" },
    { match_id: matchList[1].id, player_name: "Syb",    voter_ip: "1.2.3.6" },
    { match_id: matchList[2].id, player_name: "Sepp",   voter_ip: "1.2.3.7" },
    { match_id: matchList[2].id, player_name: "Sepp",   voter_ip: "1.2.3.8" },
    { match_id: matchList[2].id, player_name: "Deniz",  voter_ip: "1.2.3.9" },
  ]);

  // ── Parents ──────────────────────────────────────────────────────────────────
  console.log("👨‍👩‍👦 Ouders...");
  await db.delete(schema.parents);
  await db.insert(schema.parents).values([
    {
      naam: "Ouder van Alex",
      email: "chat@weareimpact.nl",
      telefoon: "06-44556677",
      kind_naam: "Alex",
      rol: "begeleider",
      toestemming_fotos: true,
      toestemming_app: true,
      kan_fotos_uploaden: true,
      kan_commentaar: true,
      goedgekeurd: true,
    },
    {
      naam: "Ouder van Wesley",
      email: "wesley.ouder@example.nl",
      kind_naam: "Wesley",
      rol: "ouder",
      toestemming_fotos: true,
      toestemming_app: true,
      kan_fotos_uploaden: true,
      kan_commentaar: true,
      goedgekeurd: true,
    },
    {
      naam: "Ouder van Emersen",
      email: "emersen.ouder@example.nl",
      kind_naam: "Emersen",
      rol: "ouder",
      toestemming_fotos: true,
      toestemming_app: true,
      kan_fotos_uploaden: true,
      kan_commentaar: true,
      goedgekeurd: true,
    },
    {
      naam: "Ouder van Sepp",
      email: "sepp.ouder@example.nl",
      kind_naam: "Sepp",
      rol: "ouder",
      toestemming_fotos: true,
      toestemming_app: true,
      kan_fotos_uploaden: true,
      kan_commentaar: true,
      goedgekeurd: true,
    },
    {
      naam: "Ouder van Deniz",
      email: "thomas.ouder@example.nl",
      kind_naam: "Deniz",
      rol: "ouder",
      toestemming_fotos: true,
      toestemming_app: true,
      kan_fotos_uploaden: false,
      kan_commentaar: true,
      goedgekeurd: true,
    },
    {
      naam: "Ouder van Tyren",
      email: "tyren.ouder@example.nl",
      kind_naam: "Tyren",
      rol: "ouder",
      toestemming_fotos: true,
      toestemming_app: true,
      kan_fotos_uploaden: false,
      kan_commentaar: true,
      goedgekeurd: true,
    },
  ]);

  // ── Donations ────────────────────────────────────────────────────────────────
  console.log("💛 Donaties...");
  await db.delete(schema.donations);
  await db.insert(schema.donations).values([
    {
      name: "Familie Wesley",
      message: "Wesley, laat zien wat je kunt! 💪",
      amount: 5000,
      type: "free",
      status: "betaald",
    },
    {
      name: "Familie Emersen",
      message: "Trots op jullie allemaal! Maak er iets onvergetelijks van!",
      amount: 10000,
      type: "free",
      status: "betaald",
    },
    {
      name: "Familie Sepp",
      message: "Go go go VVC! Laat Londen zien wat jullie kunnen! 🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      amount: 2500,
      type: "free",
      status: "betaald",
    },
    {
      name: "Familie Thomas",
      message: "Thomas, mama en papa zijn zo trots op jou! ❤️",
      amount: 7500,
      type: "free",
      status: "betaald",
    },
    {
      name: "Familie Deniz",
      message: "Genieten in Londen! Groeten van thuis 🧡",
      amount: 5000,
      type: "free",
      status: "betaald",
    },
    {
      name: "WeAreImpact BV",
      message: "Proud sponsor van VVC Goes UK! 🚀",
      amount: 150000,
      type: "pakket_s",
      status: "betaald",
      company_name: "WeAreImpact BV",
      company_email: "chat@weareimpact.nl",
    },
    {
      name: "Familie Syb",
      message: "Syb, schiet ze er lekker in! ⚽",
      amount: 3500,
      type: "free",
      status: "betaald",
    },
    {
      name: "Familie Alex",
      message: "Alex, we volgen je op de voet!",
      amount: 5000,
      type: "free",
      status: "betaald",
    },
  ]);

  // Update raised amount to match donations
  const totalRaised = 5000 + 10000 + 2500 + 7500 + 5000 + 150000 + 3500 + 50000; // 233500 = €2335
  // But let's set a more realistic display amount
  await db
    .insert(schema.settings)
    .values({ key: "donatie_raised", value: "62500" }) // €625 ter demo
    .onConflictDoUpdate({ target: schema.settings.key, set: { value: "62500" } });

  // ── Comments ─────────────────────────────────────────────────────────────────
  console.log("💬 Reacties...");
  await db.delete(schema.comments);
  await db.insert(schema.comments).values([
    {
      author_name: "Familie Wesley",
      message: "Wat een geweldig sfeertje! Wesley speelt echt fantastisch mee 🧡",
      approved: true,
    },
    {
      author_name: "Familie Sepp",
      message: "3-1 winst tegen Arsenal! Ongelofelijk, zo trots! ⚽🏆",
      approved: true,
    },
    {
      author_name: "Familie Emersen",
      message: "Emersen heeft zijn eerste assist gemaakt! Wat een assist was dat zeg!",
      approved: true,
    },
    {
      author_name: "Familie Alex",
      message: "De jongens genieten enorm. Al bij de Tower Bridge geweest!",
      approved: true,
    },
    {
      author_name: "Oma van Deniz",
      message: "Lief kind, veel success! Oma volgt alles op de voet 💛",
      approved: true,
    },
    {
      author_name: "Coach Vincent",
      message: "Geweldig team! Ze hebben vandaag echt gevochten voor elke bal. Trots!",
      approved: true,
    },
    {
      author_name: "Anoniem bezoeker",
      message: "Is er een livestream van de wedstrijden?",
      approved: false,
    },
  ]);

  // ── Diary Entries ────────────────────────────────────────────────────────────
  console.log("📓 Dagboekentries...");
  await db.delete(schema.diary_entries);
  // playerList: [Wesley, Emersen, Alex, Syb, Thomas, Sepp, Deniz]
  const wesleyId = playerList[0].id;
  const emersonId = playerList[1].id;
  const seppId = playerList[5].id;
  const denizId = playerList[6].id;
  const thomasId = playerList[4].id;

  await db.insert(schema.diary_entries).values([
    {
      player_id: wesleyId,
      day: 1,
      content: "We zijn aangekomen op Heathrow! Het vliegveld is mega groot. We zijn daarna naar ons hotel gegaan en we konden de London Eye zien! Morgen onze eerste wedstrijd tegen Arsenal.",
    },
    {
      player_id: emersonId,
      day: 1,
      content: "Vandaag hebben we gewonnen van Arsenal met 3-1! Ik heb een assist gegeven aan Deniz. Coach zei dat we heel goed speelden. London is echt super cool.",
    },
    {
      player_id: thomasId,
      day: 2,
      content: "Dag 2! We hebben twee wedstrijden gespeeld. Chelsea was heel moeilijk, gelijkspel 2-2. Maar daarna hebben we Tottenham met 4-0 verslagen! De stad is zo groot, we hebben pizza gegeten bij een echte Italiaan.",
    },
    {
      player_id: seppId,
      day: 2,
      content: "Ik heb vandaag twee keer gescoord! Een keer van dichtbij en een keer van ver. Coach zei dat ik de Man of the Match was. Best trots. Vanavond Tower Bridge gezien, waanzinnig mooi.",
    },
    {
      player_id: denizId,
      day: 3,
      content: "Laatste dag vandaag. We hebben verloren van West Ham (1-3) maar dat geeft niet. We hebben van 4 van de 5 wedstrijden gewonnen of gelijkgespeeld. Ik wil graag nog een keer terugkomen naar London!",
    },
  ]);

  // ── Check-ins ─────────────────────────────────────────────────────────────────
  console.log("📍 Londen check-ins...");
  await db.delete(schema.checkins);
  await db.insert(schema.checkins).values([
    {
      location_name: "London Heathrow Airport",
      lat: 51.4700,
      lng: -0.4543,
      description: "Geland! De reis naar Londen is begonnen 🛬",
      emoji: "✈️",
    },
    {
      location_name: "Tower Bridge",
      lat: 51.5055,
      lng: -0.0754,
      description: "Iconisch! De jongens poseert voor Tower Bridge 📸",
      emoji: "🌉",
    },
    {
      location_name: "Hale End Training Centre (Arsenal)",
      lat: 51.5868,
      lng: -0.0125,
      description: "Onze eerste wedstrijd — 3-1 winst tegen Arsenal Academy! ⚽",
      emoji: "🏆",
    },
    {
      location_name: "Wembley Stadium (buitenkant)",
      lat: 51.5560,
      lng: -0.2796,
      description: "Het heilige voetbalstadion van buiten gezien. Indrukwekkend!",
      emoji: "🏟️",
    },
    {
      location_name: "Buckingham Palace",
      lat: 51.5014,
      lng: -0.1419,
      description: "Op de foto voor het paleis van de Koning van Engeland 👑",
      emoji: "👑",
    },
    {
      location_name: "Hyde Park",
      lat: 51.5073,
      lng: -0.1657,
      description: "Even bijkomen in het park na twee wedstrijden. IJsje verdiend! 🍦",
      emoji: "🌳",
    },
    {
      location_name: "Cobham Training Ground (Chelsea)",
      lat: 51.3297,
      lng: -0.3763,
      description: "2-2 gelijkspel tegen Chelsea Youth. Goede strijd!",
      emoji: "⚽",
    },
  ]);

  // ── Photos (echte VVC foto's) ────────────────────────────────────────────────
  console.log("📸 Echte VVC foto's...");
  await db.delete(schema.photos);
  await db.insert(schema.photos).values([
    {
      url: "/photos/dropjes-stand.jpeg",
      caption: "De Londen Dropjes staan klaar! Onze speler verkoopt ze trots voor de London Tour. Met Tikkie QR code erbij 🍬🧡",
      uploader_name: "Ouder van Alex",
      approved: true,
    },
    {
      url: "/photos/duimpjes-omhoog.jpeg",
      caption: "Duimpjes omhoog! Twee VVC-ers in volle glorie na een succesvolle verkoopdag 👍👍",
      uploader_name: "Rick de Vries",
      approved: true,
    },
    {
      url: "/photos/dropjes-tafel.jpeg",
      caption: "Volle bakken Londen Dropjes klaar voor de verkoop bij FC VVC Business Club 📦",
      uploader_name: "Ouder van Alex",
      approved: true,
    },
    {
      url: "/photos/dropjes-verkoop.jpeg",
      caption: "De verkoop is begonnen! Iedereen wil de Londen Dropjes hebben 🍬",
      uploader_name: "Rachel Peters",
      approved: true,
    },
    {
      url: "/photos/team-pose.jpeg",
      caption: "Het team bij de VVC sponsorkantine — klaar voor Londen! 🏴󠁧󠁢󠁥󠁮󠁧󠁿⚽",
      uploader_name: "Edwin Janssen",
      approved: true,
    },
    {
      url: "/photos/dropjes-actie.jpeg",
      caption: "Op pad met de dropjes! De jongens verkopen bij andere clubs om de reis te bekostigen 🚀",
      uploader_name: "Dick Bakker",
      approved: true,
    },
    {
      url: "/photos/dropjes-stand.jpeg",
      caption: "Wachten op goedkeuring...",
      uploader_name: "Anoniem",
      approved: true,
    },
    {
      url: "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=800",
      caption: "Wachten op goedkeuring...",
      uploader_name: "Anoniem",
      approved: false,
    },
  ]);

  console.log("\n✅ Seed compleet!");
  console.log("─────────────────────────────────────");
  console.log(`  👨‍👩‍👦 5 ouders`);
  console.log(`  ⚽ 7 spelers (Wesley, Emersen, Alex, Syb, Thomas, Sepp, Deniz)`);
  console.log(`  🏆 6 wedstrijden (4 gespeeld, 2 upcoming)`);
  console.log(`  💛 8 donaties (incl. WeAreImpact zakelijk pakket)`);
  console.log(`  💬 7 reacties (6 goedgekeurd, 1 wachtrij)`);
  console.log(`  📓 5 dagboekentries`);
  console.log(`  📍 7 Londen check-ins`);
  console.log(`  📸 8 foto's (7 goedgekeurd, 1 wachtrij)`);
  console.log("─────────────────────────────────────\n");
}

seed().catch((e) => {
  console.error("❌ Seed mislukt:", e);
  process.exit(1);
});
