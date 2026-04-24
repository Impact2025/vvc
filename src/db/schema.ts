import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  real,
  date,
} from "drizzle-orm/pg-core";

// ─── Matches ────────────────────────────────────────────────────────────────
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  opponent: varchar("opponent", { length: 255 }).notNull(),
  date: date("date").notNull(),
  time: varchar("time", { length: 10 }),
  location: varchar("location", { length: 255 }),
  home_score: integer("home_score").default(0),
  away_score: integer("away_score").default(0),
  status: varchar("status", { length: 20 }).default("upcoming"), // upcoming | live | finished
  home_scorers: text("home_scorers").default("[]"), // JSON array of scorer names
  created_at: timestamp("created_at").defaultNow(),
});

// ─── Photos ─────────────────────────────────────────────────────────────────
export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  caption: text("caption"),
  uploader_name: varchar("uploader_name", { length: 255 }),
  uploader_parent_id: integer("uploader_parent_id"),
  match_id: integer("match_id"),
  approved: boolean("approved").default(false),
  created_at: timestamp("created_at").defaultNow(),
});

// ─── Comments ───────────────────────────────────────────────────────────────
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  author_name: varchar("author_name", { length: 255 }).notNull(),
  message: text("message").notNull(),
  approved: boolean("approved").default(false),
  created_at: timestamp("created_at").defaultNow(),
});

// ─── Man of the Match Votes ──────────────────────────────────────────────────
export const motm_votes = pgTable("motm_votes", {
  id: serial("id").primaryKey(),
  match_id: integer("match_id").notNull(),
  player_name: varchar("player_name", { length: 255 }).notNull(),
  voter_ip: varchar("voter_ip", { length: 64 }),
  created_at: timestamp("created_at").defaultNow(),
});

// ─── Players ─────────────────────────────────────────────────────────────────
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  number: integer("number"),
  goals: integer("goals").default(0),
  assists: integer("assists").default(0),
  photo_url: text("photo_url"),
  position: varchar("position", { length: 100 }),
  award: varchar("award", { length: 100 }),
});

// ─── Diary Entries ───────────────────────────────────────────────────────────
export const diary_entries = pgTable("diary_entries", {
  id: serial("id").primaryKey(),
  player_id: integer("player_id").notNull(),
  content: text("content").notNull(),
  day: integer("day").notNull(), // 1 | 2 | 3
  created_at: timestamp("created_at").defaultNow(),
});

// ─── Donations ───────────────────────────────────────────────────────────────
export const donations = pgTable("donations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  message: text("message"),
  amount: integer("amount"), // in cents
  type: varchar("type", { length: 20 }).default("free"), // free | pakket_s | pakket_l
  status: varchar("status", { length: 20 }).default("pending"), // pending | betaald
  company_name: varchar("company_name", { length: 255 }),
  company_email: varchar("company_email", { length: 255 }),
  company_phone: varchar("company_phone", { length: 50 }),
  app_wens: text("app_wens"),
  tier: varchar("tier", { length: 20 }),   // supporter | vriend | sponsor | hoofdsponsor
  email: varchar("email", { length: 255 }),
  created_at: timestamp("created_at").defaultNow(),
});

// ─── Check-ins ───────────────────────────────────────────────────────────────
export const checkins = pgTable("checkins", {
  id: serial("id").primaryKey(),
  location_name: varchar("location_name", { length: 255 }).notNull(),
  lat: real("lat").notNull(),
  lng: real("lng").notNull(),
  description: text("description"),
  emoji: varchar("emoji", { length: 10 }),
  created_at: timestamp("created_at").defaultNow(),
});

// ─── Parents ─────────────────────────────────────────────────────────────────
export const parents = pgTable("parents", {
  id: serial("id").primaryKey(),
  naam: varchar("naam", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  telefoon: varchar("telefoon", { length: 50 }),
  kind_naam: varchar("kind_naam", { length: 255 }),
  rol: varchar("rol", { length: 50 }).default("ouder"),
  toestemming_fotos: boolean("toestemming_fotos").default(false),
  toestemming_app: boolean("toestemming_app").default(false),
  kan_fotos_uploaden: boolean("kan_fotos_uploaden").default(false),
  kan_commentaar: boolean("kan_commentaar").default(false),
  kan_scores_bijhouden: boolean("kan_scores_bijhouden").default(false),
  goedgekeurd: boolean("goedgekeurd").default(false),
  invite_token: varchar("invite_token", { length: 255 }),
  token_expires_at: timestamp("token_expires_at"),
  pincode: varchar("pincode", { length: 64 }),
  pincode_is_tijdelijk: boolean("pincode_is_tijdelijk").default(false),
  created_at: timestamp("created_at").defaultNow(),
});

// ─── Settings ────────────────────────────────────────────────────────────────
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 255 }).unique().notNull(),
  value: text("value"),
});

// ─── Push Subscriptions ──────────────────────────────────────────────────────
export const push_subscriptions = pgTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  endpoint: text("endpoint").unique().notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  parent_id: integer("parent_id"),
  created_at: timestamp("created_at").defaultNow(),
});

// ─── Push Log ────────────────────────────────────────────────────────────────
export const push_log = pgTable("push_log", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  sent_at: timestamp("sent_at").defaultNow(),
});

// ─── Blog Posts ──────────────────────────────────────────────────────────────
export const blog_posts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  content: text("content").notNull().default(""),
  excerpt: text("excerpt"),
  cover_image: text("cover_image"),
  published: boolean("published").default(false),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// ─── App Installs ────────────────────────────────────────────────────────────
export const app_installs = pgTable("app_installs", {
  id: serial("id").primaryKey(),
  event: varchar("event", { length: 20 }).notNull(), // 'prompted' | 'accepted' | 'dismissed' | 'ios_shown'
  platform: varchar("platform", { length: 10 }), // 'android' | 'ios'
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// ─── Type Exports ─────────────────────────────────────────────────────────────
export type Match = typeof matches.$inferSelect;
export type NewMatch = typeof matches.$inferInsert;

export type Photo = typeof photos.$inferSelect;
export type NewPhoto = typeof photos.$inferInsert;

export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;

export type MotmVote = typeof motm_votes.$inferSelect;
export type NewMotmVote = typeof motm_votes.$inferInsert;

export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;

export type DiaryEntry = typeof diary_entries.$inferSelect;
export type NewDiaryEntry = typeof diary_entries.$inferInsert;

export type Donation = typeof donations.$inferSelect;
export type NewDonation = typeof donations.$inferInsert;

export type Checkin = typeof checkins.$inferSelect;
export type NewCheckin = typeof checkins.$inferInsert;

export type Parent = typeof parents.$inferSelect;
export type NewParent = typeof parents.$inferInsert;

export type Setting = typeof settings.$inferSelect;

export type PushLog = typeof push_log.$inferSelect;

export type PushSubscription = typeof push_subscriptions.$inferSelect;
export type NewPushSubscription = typeof push_subscriptions.$inferInsert;

export type BlogPost = typeof blog_posts.$inferSelect;
export type NewBlogPost = typeof blog_posts.$inferInsert;

// ─── Default Settings for Seeding ────────────────────────────────────────────
export const defaultSettings: { key: string; value: string }[] = [
  { key: "donatie_raised", value: "0" },
  { key: "donatie_goal", value: "150000" },
  { key: "tour_active", value: "false" },
  { key: "live_match_id", value: "" },
  { key: "welkom_bericht", value: "VVC gaat naar Londen! Volg de jongens live." },
];
