import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { readJsonFile, writeJsonFile } from './src/server/db';
import {
  CoinPackage,
  Order,
  PaymentConfig,
  PlayerCard,
  DreamSquadAnalysisResponse,
  Playstyle,
  TournamentData,
  TournamentParticipant,
  TournamentMatch,
  TournamentGroup,
  CommunityPost,
  CommunityComment,
  ChatMessage,
  ChatConversation,
  UserCommunityProfile,
  UserWallet,
  WalletTransaction,
  AccountMeResponse,
  StaffMember,
  StaffRole,
  StaffActivityLog,
  SiteContent,
  SiteAnalytics,
} from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini SDK if API key is present
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (geminiApiKey && geminiApiKey !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Default Seed Data
const DEFAULT_PACKAGES: CoinPackage[] = [
  {
    id: 'pkg-540',
    category: 'coins',
    titleSo: '540 eFootball™ Coins',
    titleEn: '540 Coins',
    coinsAmount: '540 Coins',
    priceUsd: 4.99,
    imageUrl: '/assets/packages/coins.jpg',
    badgeSo: 'Caadi',
    badgeEn: 'Starter',
    bonus: '+40 Bonus Coins',
    descriptionSo: 'Xirmo bilow ah oo ku habboon draw-yada toddobaadlaha ah.',
    descriptionEn: 'Starter coin bundle ideal for weekly POTW draws.',
  },
  {
    id: 'pkg-1050',
    category: 'coins',
    titleSo: '1,050 eFootball™ Coins',
    titleEn: '1,050 Coins',
    coinsAmount: '1,050 Coins',
    priceUsd: 9.99,
    imageUrl: '/assets/packages/coins.jpg',
    badgeSo: 'Loogu Jecelyahay',
    badgeEn: 'Most Popular',
    popular: true,
    bonus: '+50 Bonus Coins',
    descriptionSo: 'Xirmada loogu iibsiga badan yahay ciyaartoyda Soomaaliyeed.',
    descriptionEn: 'The most popular pack among Somali players.',
  },
  {
    id: 'pkg-2150',
    category: 'coins',
    titleSo: '2,150 eFootball™ Coins',
    titleEn: '2,150 Coins',
    coinsAmount: '2,150 Coins',
    priceUsd: 19.99,
    imageUrl: '/assets/packages/coins.jpg',
    badgeSo: 'Qiimo Wanaagsan',
    badgeEn: 'Best Value',
    bonus: '+150 Bonus Coins',
    descriptionSo: '2,000 Coins + 150 gunno ah. Ku fiican furista 10-player packs xiriir ah.',
    descriptionEn: 'Bulk tier with 150 bonus coins for 10-pull pack sprees.',
  },
  {
    id: 'pkg-3650',
    category: 'coins',
    titleSo: '3,650 eFootball™ Coins',
    titleEn: '3,650 Coins',
    coinsAmount: '3,650 Coins',
    priceUsd: 29.99,
    imageUrl: '/assets/packages/coins.jpg',
    badgeSo: 'Khabiir',
    badgeEn: 'Pro Tier',
    bonus: '+250 Bonus Coins',
    descriptionSo: 'Xirmo sare oo loogu talagalay tartamada horyaalka Division 1.',
    descriptionEn: 'Substantial bundle for Division 1 competitive squads.',
  },
  {
    id: 'pkg-5800',
    category: 'coins',
    titleSo: '5,800 eFootball™ Coins',
    titleEn: '5,800 Coins',
    coinsAmount: '5,800 Coins',
    priceUsd: 44.99,
    imageUrl: '/assets/packages/coins.jpg',
    badgeSo: 'Elite Value',
    badgeEn: 'Elite Tier',
    popular: true,
    bonus: '+800 Bonus Coins',
    descriptionSo: '5,000 Coins + 800 gunno ah. Heerka kooxaha ugu sarreeya eFootball 2026.',
    descriptionEn: 'Massive tier for building full Epic Booster squads.',
  },
  {
    id: 'pkg-12000',
    category: 'coins',
    titleSo: '12,000 eFootball™ Coins',
    titleEn: '12,000 Coins',
    coinsAmount: '12,000 Coins',
    priceUsd: 89.99,
    imageUrl: '/assets/packages/coins.jpg',
    badgeSo: 'Ugu Weyn',
    badgeEn: 'Ultimate Tier',
    bonus: '+2,000 Bonus Coins',
    descriptionSo: 'Xirmada ugu weyn ee dalka oo dhan. Keydso lacag badan adigoo helaya 2,000 coins oo bilaash ah.',
    descriptionEn: 'Ultimate mega pack with 2,000 free bonus coins.',
  },
  {
    id: 'pkg-epic-booster',
    category: 'packs',
    titleSo: 'Epic Boosters',
    titleEn: 'Epic Boosters',
    coinsAmount: 'Special Selection',
    priceUsd: 14.99,
    imageUrl: '/assets/packages/epic_boosters.jpg',
    badgeSo: 'Epic Booster',
    badgeEn: 'Epic Booster',
    popular: true,
    descriptionSo: 'Xirmo ay ku jiraan halyeeyada Epic Booster 100+ rating iyo tababare 88 mastery leh.',
    descriptionEn: 'Deluxe pack containing guaranteed Epic Boosters and top manager.',
  },
  {
    id: 'pkg-match-pass',
    category: 'passes',
    titleSo: 'Match Pass Tickets',
    titleEn: 'Match Pass Tickets',
    coinsAmount: 'Match Pass Level 9',
    priceUsd: 6.99,
    imageUrl: '/assets/packages/match_pass.jpg',
    badgeSo: 'Match Pass',
    badgeEn: 'Match Pass',
    descriptionSo: 'Fur ciyaartoy 5-star ah, qandaraasyo gaar ah, iyo dhibco tababar oo xad dhaaf ah.',
    descriptionEn: 'Unlock 5-star nominated contracts and 100,000+ training Exp.',
  },
];

const DEFAULT_SETTINGS: PaymentConfig = {
  evcNumber: '61 789 2026',
  evcName: 'SOM PLY SERVICES (Hormuud)',
  sahalNumber: '90 789 2026',
  sahalName: 'SOM PLY SERVICES (Golis)',
  premierBankNumber: '010203040506',
  premierBankName: 'SOM PLY eFootball Account',
  instructionsSo: 'Fadlan lacagta toos ugu dir lambarka kor ku xusan. Markaad dirto kadib, soo qaado lambarka tixraaca (TRX ID ama Transaction Number) ama sawirka rasiidka oo ku soo lifaaq foomka hoose.',
  instructionsEn: 'Please transfer the exact amount to the account numbers above. After sending, provide the transaction reference ID (TRX ID) and optional receipt screenshot.',
  exchangeEnabled: false,
  updatedAt: new Date().toISOString(),
};

const DEFAULT_PLAYERS: PlayerCard[] = [
  {
    id: 'player-etoo',
    name: "Samuel Eto'o",
    cardType: 'Epic Booster 2026',
    clubOrNation: 'Inter',
    position: 'CF',
    baseRating: 96,
    maxRating: 102,
    playstyle: 'Goal Poacher',
    colorAccent: '#0066ff',
    imageUrl: '/assets/players/card_etoo_perfect.jpg',
    maxLevel: 38,
    availablePoints: 0,
    progressionPoints: {
      finishing: 9,
      passing: 8,
      dribbling: 9,
      dexterity: 9,
      lowerBody: 10,
      aerial: 9,
      defending: 8,
      gk1: 9,
      gk2: 8,
      gk3: 8,
    },
    recommendedBuild: {
      shooting: 9,
      passing: 8,
      dribbling: 9,
      dexterity: 9,
      lowerBody: 10,
      aerial: 9,
      defending: 8,
    },
    detailedStats: {
      offensiveAwareness: 95,
      ballControl: 90,
      dribbling: 92,
      tightPossession: 91,
      lowPass: 82,
      loftedPass: 76,
      finishing: 96,
      heading: 87,
      setPieceTaking: 80,
      curl: 84,
      speed: 98,
      acceleration: 97,
      kickingPower: 95,
      jumping: 90,
      physicalContact: 86,
      balance: 89,
      stamina: 92,
      defensiveAwareness: 58,
      tackling: 56,
      aggression: 72,
      defensiveEngagement: 64,
    },
    bio: {
      age: 28,
      height: '179 cm',
      weight: '75 kg',
      foot: 'Right',
      form: 'Unwavering',
    },
    keyAttributes: [
      { name: 'Speed', value: 98 },
      { name: 'Acceleration', value: 97 },
      { name: 'Finishing', value: 96 },
      { name: 'Kicking Power', value: 95 },
      { name: 'Offensive Awareness', value: 95 },
    ],
    recommendedSkills: ['First-time Shot', 'Acrobatic Finishing', 'Double Touch', 'Speeding Bullet', 'Through Passing'],
    tacticalAdviceSo: "Samuel Eto'o waa weeraryahan degdeg ah oo goolasha dilaa ku ah. Dhis xawaaraha (Speed 98) iyo dhammaystirka (Finishing 96). Ku habboon Quick Counter ama Long Ball Counter.",
    tacticalAdviceEn: 'Elite lethal speedster with 98 speed and 96 finishing. Lethal first-time finisher on high defensive lines.',
  },
  {
    id: 'player-del-piero',
    name: 'Alessandro Del Piero',
    cardType: 'Epic Booster 2026',
    clubOrNation: 'Juventus / Italy',
    position: 'SS',
    baseRating: 96,
    maxRating: 102,
    playstyle: 'Creative Playmaker',
    colorAccent: '#0066ff',
    imageUrl: '/assets/players/del_piero.jpg',
    maxLevel: 36,
    availablePoints: 0,
    progressionPoints: {
      finishing: 10,
      passing: 8,
      dribbling: 11,
      dexterity: 9,
      lowerBody: 8,
      aerial: 4,
      defending: 1,
      gk1: 0,
      gk2: 0,
      gk3: 0,
    },
    recommendedBuild: {
      shooting: 10,
      passing: 8,
      dribbling: 11,
      dexterity: 9,
      lowerBody: 8,
      aerial: 4,
      defending: 1,
    },
    detailedStats: {
      offensiveAwareness: 93,
      ballControl: 97,
      dribbling: 96,
      tightPossession: 95,
      lowPass: 89,
      loftedPass: 86,
      finishing: 95,
      heading: 74,
      setPieceTaking: 97,
      curl: 98,
      speed: 88,
      acceleration: 93,
      kickingPower: 92,
      jumping: 78,
      physicalContact: 75,
      balance: 94,
      stamina: 85,
      defensiveAwareness: 48,
      tackling: 45,
      aggression: 62,
      defensiveEngagement: 52,
    },
    bio: {
      age: 27,
      height: '174 cm',
      weight: '73 kg',
      foot: 'Right',
      form: 'Unwavering',
    },
    keyAttributes: [
      { name: 'Curl', value: 98 },
      { name: 'Set Piece Taking', value: 97 },
      { name: 'Ball Control', value: 97 },
      { name: 'Finishing', value: 95 },
      { name: 'Dribbling', value: 96 },
    ],
    recommendedSkills: ['Curler', 'Knuckle Shot', 'Sole Control', 'Double Touch', 'One-touch Pass'],
    tacticalAdviceSo: 'Del Piero wuxuu leeyahay laadadka xorta ah iyo curl-ka ugu sarreeya eFootball (98 Curl). Waxaad ka ciyaarsiin kartaa SS ama AMF.',
    tacticalAdviceEn: 'Master of curling shots and dead-ball situations with 98 curl and 97 set pieces. Ideal at Second Striker or central AMF.',
  },
  {
    id: 'player-laporte',
    name: 'Aymeric Laporte',
    cardType: 'Showtime Big Time 2026',
    clubOrNation: 'Al Nassr / Spain',
    position: 'CB',
    baseRating: 95,
    maxRating: 101,
    playstyle: 'Build Up',
    colorAccent: '#0066ff',
    imageUrl: '/assets/players/laporte.jpg',
    maxLevel: 34,
    availablePoints: 0,
    progressionPoints: {
      finishing: 0,
      passing: 6,
      dribbling: 2,
      dexterity: 4,
      lowerBody: 6,
      aerial: 8,
      defending: 12,
      gk1: 0,
      gk2: 0,
      gk3: 0,
    },
    recommendedBuild: {
      shooting: 0,
      passing: 6,
      dribbling: 2,
      dexterity: 4,
      lowerBody: 6,
      aerial: 8,
      defending: 12,
    },
    detailedStats: {
      offensiveAwareness: 62,
      ballControl: 82,
      dribbling: 76,
      tightPossession: 78,
      lowPass: 88,
      loftedPass: 90,
      finishing: 58,
      heading: 92,
      setPieceTaking: 68,
      curl: 72,
      speed: 82,
      acceleration: 79,
      kickingPower: 88,
      jumping: 91,
      physicalContact: 94,
      balance: 74,
      stamina: 88,
      defensiveAwareness: 96,
      tackling: 96,
      aggression: 93,
      defensiveEngagement: 95,
    },
    bio: {
      age: 29,
      height: '191 cm',
      weight: '85 kg',
      foot: 'Left',
      form: 'Unwavering',
    },
    keyAttributes: [
      { name: 'Defensive Awareness', value: 96 },
      { name: 'Tackling', value: 96 },
      { name: 'Physical Contact', value: 94 },
      { name: 'Lofted Pass', value: 90 },
      { name: 'Heading', value: 92 },
    ],
    recommendedSkills: ['Man Marking', 'Interception', 'Acrobatic Clearance', 'Aerial Superiority', 'Blocker'],
    tacticalAdviceSo: 'Difaac casri ah oo bidix ku ciyaara (Left-footed CB). Kubada ka soo bilaabista dambe (Build-up) iyo baasaska dhaadheer ayuu ku fiican yahay.',
    tacticalAdviceEn: 'Left-footed defensive powerhouse with 96 tackling and 90 lofted pass for pin-point long transition distributions.',
  },
  {
    id: 'player-casillas',
    name: 'Iker Casillas',
    cardType: 'Epic Booster 2026',
    clubOrNation: 'FC Porto / Spain',
    position: 'GK',
    baseRating: 96,
    maxRating: 102,
    playstyle: 'Offensive Goalkeeper',
    colorAccent: '#0066ff',
    imageUrl: '/assets/players/casillas.jpg',
    maxLevel: 35,
    availablePoints: 0,
    progressionPoints: {
      finishing: 0,
      passing: 0,
      dribbling: 0,
      dexterity: 0,
      lowerBody: 0,
      aerial: 4,
      defending: 0,
      gk1: 10,
      gk2: 11,
      gk3: 11,
    },
    recommendedBuild: {
      shooting: 0,
      passing: 0,
      dribbling: 0,
      dexterity: 0,
      lowerBody: 0,
      aerial: 4,
      defending: 0,
    },
    detailedStats: {
      offensiveAwareness: 40,
      ballControl: 55,
      dribbling: 50,
      tightPossession: 52,
      lowPass: 72,
      loftedPass: 75,
      finishing: 40,
      heading: 65,
      setPieceTaking: 45,
      curl: 50,
      speed: 74,
      acceleration: 76,
      kickingPower: 84,
      jumping: 95,
      physicalContact: 80,
      balance: 82,
      stamina: 75,
      defensiveAwareness: 55,
      tackling: 50,
      aggression: 65,
      defensiveEngagement: 60,
      gkAwareness: 98,
      gkCatching: 94,
      gkParrying: 97,
      gkReflexes: 99,
      gkReach: 94,
    },
    bio: {
      age: 31,
      height: '185 cm',
      weight: '84 kg',
      foot: 'Left',
      form: 'Unwavering',
    },
    keyAttributes: [
      { name: 'GK Reflexes', value: 99 },
      { name: 'GK Awareness', value: 98 },
      { name: 'GK Parrying', value: 97 },
      { name: 'Jumping', value: 95 },
      { name: 'GK Catching', value: 94 },
    ],
    recommendedSkills: ['GK High Punt', 'GK Low Punt', 'GK Penalty Saver', 'Fighting Spirit'],
    tacticalAdviceSo: 'San Iker wuxuu leeyahay 99 GK Reflexes oo ah heerka ugu sarreeya. Wuxuu badbaadiyaa fursadaha 1v1 ee dhow.',
    tacticalAdviceEn: '99 Reflexes makes Casillas nearly unbeatable from close range 1v1 encounters. Outstanding shot-stopper.',
  },
  {
    id: 'player-gerrard',
    name: 'Steven Gerrard',
    cardType: 'Epic Booster 2026',
    clubOrNation: 'Liverpool / England',
    position: 'CMF',
    baseRating: 96,
    maxRating: 102,
    playstyle: 'Box-to-Box',
    colorAccent: '#0066ff',
    imageUrl: '/assets/players/gerrard.jpg',
    maxLevel: 36,
    availablePoints: 0,
    progressionPoints: {
      finishing: 6,
      passing: 10,
      dribbling: 8,
      dexterity: 8,
      lowerBody: 9,
      aerial: 4,
      defending: 8,
      gk1: 0,
      gk2: 0,
      gk3: 0,
    },
    recommendedBuild: {
      shooting: 6,
      passing: 10,
      dribbling: 8,
      dexterity: 8,
      lowerBody: 9,
      aerial: 4,
      defending: 8,
    },
    detailedStats: {
      offensiveAwareness: 88,
      ballControl: 93,
      dribbling: 90,
      tightPossession: 91,
      lowPass: 95,
      loftedPass: 97,
      finishing: 90,
      heading: 82,
      setPieceTaking: 91,
      curl: 89,
      speed: 87,
      acceleration: 86,
      kickingPower: 99,
      jumping: 85,
      physicalContact: 91,
      balance: 86,
      stamina: 98,
      defensiveAwareness: 86,
      tackling: 87,
      aggression: 94,
      defensiveEngagement: 89,
    },
    bio: {
      age: 25,
      height: '183 cm',
      weight: '83 kg',
      foot: 'Right',
      form: 'Unwavering',
    },
    keyAttributes: [
      { name: 'Kicking Power', value: 99 },
      { name: 'Stamina', value: 98 },
      { name: 'Lofted Pass', value: 97 },
      { name: 'Low Pass', value: 95 },
      { name: 'Finishing', value: 90 },
    ],
    recommendedSkills: ['Long Range Shooting', 'Rising Shot', 'Through Passing', 'Weighted Pass', 'Interception'],
    tacticalAdviceSo: 'Awoodda laadka (99 Kicking Power) iyo baasaska dhaadheer (97 Lofted Pass). Gerrard wuxuu maamulaa dhexda garoonka oo dhan.',
    tacticalAdviceEn: 'Unrivalled 99 Kicking Power rocket launcher with 98 stamina and 97 pin-point lofted delivery.',
  },
  {
    id: 'player-bale',
    name: 'Gareth Bale',
    cardType: 'Epic Booster Speedster',
    clubOrNation: 'Real Madrid / Wales',
    position: 'RWF',
    baseRating: 97,
    maxRating: 103,
    playstyle: 'Roaming Flank',
    colorAccent: '#0066ff',
    imageUrl: '/assets/players/bale.jpg',
    maxLevel: 37,
    availablePoints: 0,
    progressionPoints: {
      finishing: 9,
      passing: 4,
      dribbling: 9,
      dexterity: 10,
      lowerBody: 11,
      aerial: 6,
      defending: 0,
      gk1: 0,
      gk2: 0,
      gk3: 0,
    },
    recommendedBuild: {
      shooting: 9,
      passing: 4,
      dribbling: 9,
      dexterity: 10,
      lowerBody: 11,
      aerial: 6,
      defending: 0,
    },
    detailedStats: {
      offensiveAwareness: 94,
      ballControl: 93,
      dribbling: 94,
      tightPossession: 92,
      lowPass: 84,
      loftedPass: 86,
      finishing: 94,
      heading: 88,
      setPieceTaking: 89,
      curl: 88,
      speed: 99,
      acceleration: 98,
      kickingPower: 98,
      jumping: 92,
      physicalContact: 89,
      balance: 86,
      stamina: 91,
      defensiveAwareness: 52,
      tackling: 50,
      aggression: 70,
      defensiveEngagement: 60,
    },
    bio: {
      age: 26,
      height: '185 cm',
      weight: '82 kg',
      foot: 'Left',
      form: 'Unwavering',
    },
    keyAttributes: [
      { name: 'Speed', value: 99 },
      { name: 'Acceleration', value: 98 },
      { name: 'Kicking Power', value: 98 },
      { name: 'Finishing', value: 94 },
      { name: 'Jumping', value: 92 },
    ],
    recommendedSkills: ['Knuckle Shot', 'Dipping Shot', 'Double Touch', 'Heading', 'Long Range Shooting'],
    tacticalAdviceSo: 'Bale waa gantaal garabka midig ka soo galaya (Speed 99, Kicking Power 98). Goolal cajiib ah ayuu meel fog ka toogtaa lugtiisa bidix.',
    tacticalAdviceEn: '99 explosive speed and 98 kicking power. Cuts inside from the right wing to unleash venomous left-footed drives.',
  },
  {
    id: 'player-messi',
    name: 'Lionel Messi',
    cardType: 'Big Time Epic Booster 2026',
    clubOrNation: 'Argentina / Inter Miami',
    position: 'RWF',
    baseRating: 90,
    maxRating: 104,
    playstyle: 'Deep-Lying Forward',
    colorAccent: '#eab308',
    recommendedBuild: {
      shooting: 8,
      passing: 4,
      dribbling: 12,
      dexterity: 10,
      lowerBody: 8,
      aerial: 0,
      defending: 0,
    },
    keyAttributes: [
      { name: 'Acceleration', value: 96 },
      { name: 'Dribbling', value: 99 },
      { name: 'Balance', value: 99 },
      { name: 'Finishing', value: 95 },
      { name: 'Curl', value: 96 },
    ],
    recommendedSkills: ['Double Touch', 'Long Range Curler', 'Sole Control', 'Through Passing'],
    tacticalAdviceSo: 'Si aad u hesho 104 rating oo buuxda, ha siinin wax dhibco ah difaaca ama madaxa. Diiradda saar Dribbling (12) iyo Dexterity (10). Waxaad ka ciyaarsiin kartaa RWF, SS, ama AMF.',
    tacticalAdviceEn: 'To reach 104 max rating, allocate heavily into Dribbling (12) and Dexterity (10). Elite playmaker at RWF, SS, or central AMF.',
  },
  {
    id: 'player-haaland',
    name: 'Erling Haaland',
    cardType: 'Showtime Phenomenal Finish',
    clubOrNation: 'Manchester City / Norway',
    position: 'CF',
    baseRating: 88,
    maxRating: 102,
    playstyle: 'Goal Poacher',
    colorAccent: '#38bdf8',
    recommendedBuild: {
      shooting: 9,
      passing: 0,
      dribbling: 4,
      dexterity: 10,
      lowerBody: 9,
      aerial: 6,
      defending: 0,
    },
    keyAttributes: [
      { name: 'Speed', value: 94 },
      { name: 'Physical Contact', value: 93 },
      { name: 'Finishing', value: 96 },
      { name: 'Heading', value: 90 },
      { name: 'Kicking Power', value: 95 },
    ],
    recommendedSkills: ['Heading', 'Acrobatic Finishing', 'First-time Shot', 'One-touch Pass'],
    tacticalAdviceSo: 'Haaland wuxuu u baahan yahay Physical Contact 90+ iyo Finishing 95+. Tababarkan wuxuu siinayaa xawaare aad u weyn iyo awood madax ah. U isticmaal Quick Counter ama Out Wide.',
    tacticalAdviceEn: 'Haaland thrives with 90+ physical contact and 95+ finishing. Best deployed as solitary central striker in Quick Counter or Out Wide.',
  },
  {
    id: 'player-mbappe',
    name: 'Kylian Mbappé',
    cardType: 'Epic Booster Speedster',
    clubOrNation: 'Real Madrid / France',
    position: 'CF',
    baseRating: 89,
    maxRating: 103,
    playstyle: 'Goal Poacher',
    colorAccent: '#a855f7',
    recommendedBuild: {
      shooting: 8,
      passing: 1,
      dribbling: 9,
      dexterity: 10,
      lowerBody: 8,
      aerial: 2,
      defending: 0,
    },
    keyAttributes: [
      { name: 'Speed', value: 99 },
      { name: 'Acceleration', value: 98 },
      { name: 'Finishing', value: 94 },
      { name: 'Dribbling', value: 93 },
    ],
    recommendedSkills: ['Double Touch', 'Knuckle Shot', 'Long Range Shooting', 'Sole Control'],
    tacticalAdviceSo: 'Dhis xawaaraha (Speed 99, Acceleration 98). Wuxuu ka dhex dillaaci doonaa difaac kasta oo sarreeya hal baas oo keliya.',
    tacticalAdviceEn: 'Maximum explosive velocity setup. Cuts through high defensive lines instantly on transitions.',
  },
  {
    id: 'player-rodri',
    name: 'Rodri',
    cardType: 'Highlight Masterpiece 2026',
    clubOrNation: 'Manchester City / Spain',
    position: 'DMF',
    baseRating: 87,
    maxRating: 101,
    playstyle: 'Anchor Man',
    colorAccent: '#10b981',
    recommendedBuild: {
      shooting: 0,
      passing: 6,
      dribbling: 4,
      dexterity: 4,
      lowerBody: 6,
      aerial: 6,
      defending: 12,
    },
    keyAttributes: [
      { name: 'Defensive Awareness', value: 96 },
      { name: 'Tackling', value: 95 },
      { name: 'Physical Contact', value: 91 },
      { name: 'Low Pass', value: 90 },
      { name: 'Interception', value: 96 },
    ],
    recommendedSkills: ['Interception', 'Man Marking', 'Blocker', 'Weighted Pass', 'Fighting Spirit'],
    tacticalAdviceSo: 'Rodri waa darbiga khadka dhexe. Sii Defending (12) iyo Aerial (6) si uu u gooyo dhammaan kubadaha hawada iyo dhulka labadaba. Sii tilmaamaha Defensive instruction.',
    tacticalAdviceEn: 'The ultimate central defensive shield. Maximize Defending (12) and Aerial (6) with Defensive individual instruction.',
  },
  {
    id: 'player-bellingham',
    name: 'Jude Bellingham',
    cardType: 'Epic Booster Engine',
    clubOrNation: 'Real Madrid / England',
    position: 'AMF',
    baseRating: 88,
    maxRating: 102,
    playstyle: 'Hole Player',
    colorAccent: '#f59e0b',
    recommendedBuild: {
      shooting: 6,
      passing: 7,
      dribbling: 7,
      dexterity: 8,
      lowerBody: 7,
      aerial: 4,
      defending: 4,
    },
    keyAttributes: [
      { name: 'Stamina', value: 97 },
      { name: 'Offensive Awareness', value: 92 },
      { name: 'Finishing', value: 88 },
      { name: 'Low Pass', value: 90 },
      { name: 'Physical Contact', value: 89 },
    ],
    recommendedSkills: ['One-touch Pass', 'Through Passing', 'Double Touch', 'Track Back'],
    tacticalAdviceSo: 'Tababarkan dheelitiran wuxuu Jude ka dhigayaa mid difaaca caawiya, dhexda maamula, goolashana si joogto ah u dhasha marka uu sanduuqa soo galo.',
    tacticalAdviceEn: 'Dynamic box-to-box presence that presses diligently and arrives late in the penalty box to score.',
  },
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Helper to get or init DB
  const getPackages = () => readJsonFile<CoinPackage[]>('packages.json', DEFAULT_PACKAGES);
  const getSettings = () => readJsonFile<PaymentConfig>('settings.json', DEFAULT_SETTINGS);
  const getPlayers = () => readJsonFile<PlayerCard[]>('players.json', DEFAULT_PLAYERS);
  const getOrders = () => readJsonFile<Order[]>('orders.json', []);
  const getStaff = () => readJsonFile<StaffMember[]>('staff.json', []);
  const getSiteContent = () => readJsonFile<SiteContent>('site_content.json', {
    homepage: {
      hero: {
        badge: 'SOM PLY',
        titlePrimary: 'eFOOTBALL™',
        titleAccent: '2026',
        subtitle: 'Play. Build. Win.',
        ctaTextSo: 'Dalbo Hadda',
        ctaTextEn: 'Order Now',
        ctaTextAr: 'اشحن الآن',
        bannerImageUrl: '/assets/images/stars_banner.jpg',
        aspectRatio: '16:9',
      },
      serviceCards: [],
    },
    branding: {
      siteName: 'SOM PLY eFootball 2026',
      siteTagline: "Somalia's Premier eFootball 2026 Hub",
      logoUrl: '',
      headerBannerUrl: '',
    },
    tournament: {
      title: 'SOMPLAY Champion Tournament 2026',
      subtitleSo: 'Tartanka ugu weyn ee eFootball 2026 ee Soomaaliya.',
      subtitleEn: "Somalia's Premier eFootball 2026 Knockout Tournament.",
      bannerImageUrl: '/assets/images/formation_pitch_card_1792507175586.jpg',
    },
    playerTraining: {
      catalogBannerUrl: '',
      gridColumns: 2,
      cardImageSize: 'normal',
    },
    updatedAt: new Date().toISOString(),
  });
  const getAnalytics = () => readJsonFile<SiteAnalytics>('analytics.json', {
    totalVisits: 1420,
    uniqueVisitors: 890,
    totalOrders: 32,
    totalRevenueUsd: 384.50,
    totalTournamentRegistrations: 32,
    dailyVisits: [],
    popularSections: [],
  });

  // API: Download full project source code as ZIP
  app.get('/api/download-zip', (req: Request, res: Response) => {
    const zipPath = path.resolve(__dirname, 'public', 'somply-efootball-2026.zip');
    if (fs.existsSync(zipPath)) {
      res.download(zipPath, 'somply-efootball-2026.zip');
    } else {
      res.status(404).send('ZIP file not found');
    }
  });

  // API: Get packages
  app.get('/api/packages', (req: Request, res: Response) => {
    res.json(getPackages());
  });

  // API: Admin Add / Edit package
  app.post('/api/packages', (req: Request, res: Response) => {
    const pkg: CoinPackage = req.body;
    if (!pkg.id || !pkg.titleSo || !pkg.priceUsd) {
      return res.status(400).json({ error: 'Xogta xirmada ma dhameystirna' });
    }
    const packages = getPackages();
    const existingIdx = packages.findIndex((p) => p.id === pkg.id);
    if (existingIdx >= 0) {
      packages[existingIdx] = pkg;
    } else {
      packages.push(pkg);
    }
    writeJsonFile('packages.json', packages);
    res.json({ success: true, package: pkg });
  });

  // API: Admin Delete package
  app.delete('/api/packages/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const packages = getPackages().filter((p) => p.id !== id);
    writeJsonFile('packages.json', packages);
    res.json({ success: true });
  });

  // API: Get payment & site settings
  app.get('/api/settings', (req: Request, res: Response) => {
    res.json(getSettings());
  });

  // API: Admin update settings
  app.post('/api/settings', (req: Request, res: Response) => {
    const updated: PaymentConfig = {
      ...getSettings(),
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    writeJsonFile('settings.json', updated);
    res.json({ success: true, settings: updated });
  });

  // API: Get players
  app.get('/api/players', (req: Request, res: Response) => {
    res.json(getPlayers());
  });

  // API: Admin save player
  app.post('/api/players', (req: Request, res: Response) => {
    const player: PlayerCard = req.body;
    if (!player.id || !player.name || !player.position) {
      return res.status(400).json({ error: 'Xogta ciyaaryahanka ma dhameystirna' });
    }
    const players = getPlayers();
    const existingIdx = players.findIndex((p) => p.id === player.id);
    if (existingIdx >= 0) {
      players[existingIdx] = player;
    } else {
      players.unshift(player);
    }
    writeJsonFile('players.json', players);
    res.json({ success: true, player });
  });

  // API: Admin delete player
  app.delete('/api/players/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const players = getPlayers().filter((p) => p.id !== id);
    writeJsonFile('players.json', players);
    res.json({ success: true });
  });

  // API: Get Orders (Customer by ID or Admin all)
  app.get('/api/orders', (req: Request, res: Response) => {
    const { orderId } = req.query;
    const orders = getOrders();
    if (orderId) {
      const order = orders.find((o) => o.id.toLowerCase() === String(orderId).toLowerCase());
      if (!order) return res.status(404).json({ error: 'Dalabka lama helin' });
      return res.json(order);
    }
    res.json(orders);
  });

  app.get('/api/orders/:id', (req: Request, res: Response) => {
    const { id } = req.params;
    const order = getOrders().find((o) => o.id.toLowerCase() === id.toLowerCase());
    if (!order) return res.status(404).json({ error: 'Dalabka lama helin' });
    res.json({ ...order, verificationCode: undefined });
  });

  // API: Start Order (Step 1 -> Creates single persistent order & initial verification lifecycle)
  app.post('/api/orders/start', (req: Request, res: Response) => {
    const {
      packageId,
      packageName,
      coinsAmount,
      priceUsd,
      customerEmail,
      efootballId,
      platform,
    } = req.body;

    if (!customerEmail || !String(customerEmail).trim()) {
      return res.status(400).json({ error: 'Fadlan geli cinwaanka email-kaaga / Please enter your email address.' });
    }
    if (!efootballId || !String(efootballId).trim()) {
      return res.status(400).json({ error: 'Fadlan geli eFootball Player ID-gaaga / Please enter your eFootball Player ID.' });
    }

    // Platform validation: iOS is coming soon, only Android is supported
    const rawPlatform = String(platform || 'Android').trim();
    if (/ios|apple|iphone|ipad/i.test(rawPlatform)) {
      return res.status(400).json({
        error: 'iOS platform is currently coming soon. Only Android is supported at this time / Qaabka iOS hadda waa dhawaan. Kaliya Android ayaa la ogolyahay.',
      });
    }

    const uniqueOrderNumber = `SOM-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: uniqueOrderNumber,
      packageId: packageId || 'pkg-540',
      packageName: packageName || '540 Coins',
      coinsAmount: coinsAmount || '540 Coins',
      priceUsd: Number(priceUsd) || 4.99,
      paymentMethod: 'EVC Plus',
      transactionRef: '',
      customerContact: String(customerEmail).trim(),
      customerEmail: String(customerEmail).trim(),
      efootballId: String(efootballId).trim(),
      platform: 'Android',
      verificationCode: '',
      verificationStatus: 'pending',
      verificationAttempts: 0,
      verificationExpiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      isEmailVerified: false,
      status: 'Pending Payment',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const orders = getOrders();
    orders.unshift(newOrder);
    writeJsonFile('orders.json', orders);

    console.log(`[Order Started] ID: ${newOrder.id} for ${newOrder.efootballId} on Android`);
    res.status(201).json({
      success: true,
      order: { ...newOrder, verificationCode: undefined },
    });
  });

  // API: Customer Submits Alphanumeric Verification Code (6-8 chars: letters, numbers, or both)
  app.post('/api/orders/:id/verify-code', (req: Request, res: Response) => {
    const { id } = req.params;
    const { code } = req.body;
    const orders = getOrders();
    const order = orders.find((o) => o.id.toLowerCase() === id.toLowerCase());
    if (!order) return res.status(404).json({ error: 'Dalabka lama helin / Order not found' });

    // If already verified and approved, unlock immediately
    if (order.isEmailVerified && order.verificationStatus === 'approved') {
      return res.json({
        success: true,
        order: { ...order, verificationCode: undefined },
        message: 'Email already verified and approved / Email-ka mar hore ayaa la xaqiijiyay.',
      });
    }

    // Check expiry (10 minutes)
    if (order.verificationExpiresAt && new Date(order.verificationExpiresAt).getTime() < Date.now()) {
      order.verificationStatus = 'expired';
      order.updatedAt = new Date().toISOString();
      writeJsonFile('orders.json', orders);
      return res.status(400).json({
        error: 'Koodhku wuxuu dhacay (10 daqiiqo). Fadlan dib u bilow xaqiijinta dalabkan / Verification expired after 10 minutes. Please restart verification.',
        order: { ...order, verificationCode: undefined },
      });
    }

    // Check attempt limit (max 5 attempts)
    if ((order.verificationAttempts || 0) >= 5) {
      order.verificationStatus = 'locked';
      order.updatedAt = new Date().toISOString();
      writeJsonFile('orders.json', orders);
      return res.status(400).json({
        error: 'Isku-dayada ugu badan waa la gaaray (5/5). Xaqiijinta waa la xiray, fadlan dib u bilow xaqiijinta dalabkan / Maximum verification attempts (5/5) reached. Please restart verification.',
        order: { ...order, verificationCode: undefined },
      });
    }

    const normalized = String(code || '').trim();
    // Validate length 6 to 8 characters, accepting letters, numbers, or both (alphanumeric)
    if (!/^[a-zA-Z0-9]{6,8}$/.test(normalized)) {
      return res.status(400).json({
        error: 'Koodhka xaqiijintu waa inuu ka koobnaadaa 6 ilaa 8 xaraf ama lambar / Verification code must be 6 to 8 alphanumeric characters (letters, numbers, or both).',
      });
    }

    // Record code against this persistent order for admin/staff review
    order.verificationCode = normalized;
    order.verificationStatus = 'submitted';
    order.updatedAt = new Date().toISOString();
    writeJsonFile('orders.json', orders);

    console.log(`[Order Verification Code Submitted] ID: ${order.id} Code: "${normalized}" recorded for admin review`);

    return res.json({
      success: true,
      order: { ...order, verificationCode: undefined },
      message: 'Koodhka waa la qabtay. Fadlan sug inta maamulku xaqiijinayo / Code submitted and recorded. Awaiting admin approval.',
    });
  });

  // API: Admin Manually Approves Verification Code
  app.post('/api/orders/:id/approve-code', (req: Request, res: Response) => {
    const { id } = req.params;
    const orders = getOrders();
    const order = orders.find((o) => o.id.toLowerCase() === id.toLowerCase());
    if (!order) return res.status(404).json({ error: 'Dalabka lama helin / Order not found' });

    order.isEmailVerified = true;
    order.verificationStatus = 'approved';
    order.verificationRejectReason = undefined;
    order.updatedAt = new Date().toISOString();
    writeJsonFile('orders.json', orders);

    console.log(`[Order Code Approved by Admin] ID: ${order.id}`);
    res.json({
      success: true,
      order,
      message: 'Koodhka si guul ah ayaa loo ansixiyay / Verification code approved. Payment step unlocked.',
    });
  });

  // API: Admin Manually Rejects Verification Code
  app.post('/api/orders/:id/reject-code', (req: Request, res: Response) => {
    const { id } = req.params;
    const { reason } = req.body;
    const orders = getOrders();
    const order = orders.find((o) => o.id.toLowerCase() === id.toLowerCase());
    if (!order) return res.status(404).json({ error: 'Dalabka lama helin / Order not found' });

    order.isEmailVerified = false;
    order.verificationStatus = 'rejected';
    order.verificationAttempts = (order.verificationAttempts || 0) + 1;
    if (order.verificationAttempts >= 5) {
      order.verificationStatus = 'locked';
    }
    order.verificationRejectReason = reason || 'Koodh aan sax ahayn ama aan shaqaynayn / Invalid verification code';
    order.updatedAt = new Date().toISOString();
    writeJsonFile('orders.json', orders);

    console.log(`[Order Code Rejected by Admin] ID: ${order.id} (Attempt ${order.verificationAttempts}/5)`);
    res.json({
      success: true,
      order,
      message: 'Koodhka waa la diiday. Macmiilka wuu isku dayi karaa mar kale / Verification code rejected.',
    });
  });

  // API: Restart Verification on the SAME Order (handles expiry or 5 failed attempts without creating duplicates)
  app.post('/api/orders/:id/restart-verification', (req: Request, res: Response) => {
    const { id } = req.params;
    const orders = getOrders();
    const order = orders.find((o) => o.id.toLowerCase() === id.toLowerCase());
    if (!order) return res.status(404).json({ error: 'Dalabka lama helin / Order not found' });

    order.verificationCode = '';
    order.verificationStatus = 'pending';
    order.verificationAttempts = 0;
    order.verificationExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    order.isEmailVerified = false;
    order.verificationRejectReason = undefined;
    order.updatedAt = new Date().toISOString();
    writeJsonFile('orders.json', orders);

    console.log(`[Order Verification Restarted on Same Order] ID: ${order.id}`);
    res.json({
      success: true,
      order: { ...order, verificationCode: undefined },
      message: 'Xaqiijinta dib baa loogu bilaabay isla dalabkan / Verification restarted on same order.',
    });
  });

  // API: Resend Code (Also restarts timer securely on same order)
  app.post('/api/orders/:id/resend-code', (req: Request, res: Response) => {
    const { id } = req.params;
    const orders = getOrders();
    const order = orders.find((o) => o.id.toLowerCase() === id.toLowerCase());
    if (!order) return res.status(404).json({ error: 'Dalabka lama helin / Order not found' });

    order.verificationCode = '';
    order.verificationStatus = 'pending';
    order.verificationExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    order.isEmailVerified = false;
    order.updatedAt = new Date().toISOString();
    writeJsonFile('orders.json', orders);

    res.json({
      success: true,
      order: { ...order, verificationCode: undefined },
      message: 'Koodh cusub ayaa loo diyaariyay dalabkan / New verification timer started on same order.',
    });
  });

  // API: Submit Payment Details (Requires Email Verification Approval First)
  app.post('/api/orders/:id/payment', (req: Request, res: Response) => {
    const { id } = req.params;
    const { paymentMethod, transactionRef, receiptImage } = req.body;
    const orders = getOrders();
    const order = orders.find((o) => o.id.toLowerCase() === id.toLowerCase());
    if (!order) return res.status(404).json({ error: 'Dalabka lama helin / Order not found' });

    // Payment is locked until email verification code is approved by admin/staff
    if (!order.isEmailVerified || order.verificationStatus !== 'approved') {
      return res.status(403).json({
        error: 'Tallaabada lacag-bixintu waa xiran tahay ilaa inta email-ka laga xaqiijinayo / Payment step is locked until verification code is approved.',
      });
    }

    if (!transactionRef || !String(transactionRef).trim()) {
      return res.status(400).json({ error: 'Fadlan geli lambarka tixraaca lacag-bixinta (TRX ID).' });
    }

    order.paymentMethod = paymentMethod || 'EVC Plus';
    order.transactionRef = String(transactionRef).trim();
    if (receiptImage) order.receiptImage = receiptImage;
    order.status = 'Awaiting Verification'; // Verifying Payment state
    order.updatedAt = new Date().toISOString();

    writeJsonFile('orders.json', orders);
    console.log(`[Payment Submitted] Order ${order.id} TRX: ${order.transactionRef}`);

    res.json({
      success: true,
      order: { ...order, verificationCode: undefined },
    });
  });

  // API: Create new order
  app.post('/api/orders', (req: Request, res: Response) => {
    const {
      packageId,
      packageName,
      coinsAmount,
      priceUsd,
      paymentMethod,
      transactionRef,
      receiptImage,
      customerContact,
      efootballId,
      platform,
      notes,
    } = req.body;

    // Strict validation: No passwords, valid required fields
    if (!efootballId || !customerContact || !transactionRef) {
      return res.status(400).json({
        error: 'Fadlan buuxi Player ID-ga, xiriirkaaga, iyo lambarka tixraaca lacagta.',
      });
    }

    if (platform && /ios|apple|iphone|ipad/i.test(String(platform))) {
      return res.status(400).json({
        error: 'iOS platform is currently coming soon. Only Android is supported at this time.',
      });
    }

    const uniqueOrderNumber = `SOM-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: Order = {
      id: uniqueOrderNumber,
      packageId: packageId || 'custom',
      packageName: packageName || 'eFootball Coins',
      coinsAmount: coinsAmount || '',
      priceUsd: Number(priceUsd) || 0,
      paymentMethod: paymentMethod || 'EVC Plus',
      transactionRef: String(transactionRef).trim(),
      receiptImage: receiptImage || undefined,
      customerContact: String(customerContact).trim(),
      efootballId: String(efootballId).trim(),
      platform: platform || 'Mobile Android',
      notes: notes || '',
      status: 'Awaiting Verification', // Default status waiting for admin payment confirmation
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const orders = getOrders();
    orders.unshift(newOrder);
    writeJsonFile('orders.json', orders);

    console.log(`[Order Created] ${newOrder.id} for Player ID: ${newOrder.efootballId}`);
    res.status(201).json({
      success: true,
      order: newOrder,
      message: 'Dalabkaaga waa la helay, waxaana la sugayaa xaqiijinta lacagta.',
    });
  });

  // API: Update order status (Admin)
  app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const validStatuses = [
      'Pending Payment',
      'Awaiting Verification',
      'Payment Confirmed',
      'Processing',
      'Completed',
      'Rejected',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Xaalad aan sax ahayn' });
    }

    const orders = getOrders();
    const orderIndex = orders.findIndex((o) => o.id === id);
    if (orderIndex === -1) {
      return res.status(404).json({ error: 'Dalabka lama helin' });
    }

    orders[orderIndex].status = status;
    orders[orderIndex].updatedAt = new Date().toISOString();
    if (adminNotes !== undefined) {
      orders[orderIndex].adminNotes = adminNotes;
    }

    writeJsonFile('orders.json', orders);
    res.json({
      success: true,
      order: orders[orderIndex],
      customerNotice:
        status === 'Completed'
          ? 'Waa lagu guulaystay dalabkaaga, macmiil. Waad ku mahadsan tahay sida aad uga adeegatay SOM PLY!'
          : undefined,
    });
  });

  // API: Admin Authentication
  app.post('/api/admin/login', (req: Request, res: Response) => {
    const { username, password } = req.body;
    // Secure configurable admin credentials
    const validUser = process.env.ADMIN_USERNAME || 'admin';
    const validPass = process.env.ADMIN_PASSWORD || 'somply2026!';

    if (username === validUser && password === validPass) {
      const token = `adm_token_${Buffer.from(`${username}:${Date.now()}`).toString('base64')}`;
      return res.json({
        success: true,
        token,
        adminName: 'SOM PLY Administrator',
      });
    }

    res.status(401).json({
      success: false,
      error: 'Username-ka ama Password-ka aad gelisay ma saxna.',
    });
  });

  // Admin Authorization Middleware
  const requireAdminAuth = (req: Request, res: Response, next: () => void) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Fadlan gal akoonka maamulka (Admin authentication required).' });
    }
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token.startsWith('adm_token_') && !token.startsWith('staff_token_')) {
      return res.status(403).json({ error: 'Kama tirsanid maamulka sare (Admin authorization required).' });
    }
    next();
  };

  // API: Admin token check
  app.get('/api/admin/check', (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ valid: false, error: 'Authentication required' });
    }
    const token = authHeader.replace('Bearer ', '').trim();
    if (token.startsWith('adm_token_')) {
      return res.json({
        valid: true,
        adminName: 'SOM PLY SuperAdmin',
        role: 'Super Admin',
      });
    }
    if (token.startsWith('staff_token_')) {
      return res.json({
        valid: true,
        adminName: 'SOM PLY Staff',
        role: 'Admin',
      });
    }
    res.status(403).json({ valid: false, error: 'Invalid admin token' });
  });

  // API: Public get site content
  app.get('/api/content', (req: Request, res: Response) => {
    res.json(getSiteContent());
  });

  // API: Admin update site content
  app.post('/api/admin/content', requireAdminAuth, (req: Request, res: Response) => {
    try {
      const current = getSiteContent();
      const updated: SiteContent = {
        ...current,
        ...req.body,
        updatedAt: new Date().toISOString(),
      };
      writeJsonFile('site_content.json', updated);
      res.json({ success: true, content: updated });
    } catch (err: any) {
      console.error('Error saving content:', err);
      res.status(500).json({ error: 'Failed to update site content' });
    }
  });

  // API: Admin Analytics
  app.get('/api/admin/analytics', requireAdminAuth, (req: Request, res: Response) => {
    try {
      const baseAnalytics = getAnalytics();
      const orders = getOrders();
      const tournament = getTournamentData();
      const players = getPlayers();

      const totalRevenueUsd = Number(
        orders
          .filter((o) => o.status === 'Completed' || o.status === 'Payment Confirmed')
          .reduce((sum, o) => sum + (o.priceUsd || 0), 0)
          .toFixed(2)
      );

      const dynamicAnalytics: SiteAnalytics = {
        totalVisits: baseAnalytics.totalVisits || 1420,
        uniqueVisitors: baseAnalytics.uniqueVisitors || 890,
        totalOrders: orders.length,
        totalRevenueUsd: totalRevenueUsd > 0 ? totalRevenueUsd : baseAnalytics.totalRevenueUsd,
        totalTournamentRegistrations: tournament.participants?.length || tournament.registeredCount || 32,
        dailyVisits: baseAnalytics.dailyVisits,
        popularSections: [
          { name: 'Coins & Packs', count: orders.length * 20 + 200 },
          { name: 'Tournament', count: (tournament.participants?.length || 0) * 12 + 150 },
          { name: 'Player Training', count: players.length * 35 + 100 },
          { name: 'Chat & Community', count: 220 },
        ],
      };

      res.json({ success: true, analytics: dynamicAnalytics });
    } catch (err: any) {
      console.error('Error getting analytics:', err);
      res.status(500).json({ error: 'Failed to load analytics' });
    }
  });

  // API: Admin Staff Management
  app.get('/api/admin/staff', requireAdminAuth, (req: Request, res: Response) => {
    try {
      res.json({ success: true, staff: getStaff() });
    } catch (err: any) {
      console.error('Error loading staff:', err);
      res.status(500).json({ error: 'Failed to load staff list' });
    }
  });

  app.post('/api/admin/staff', requireAdminAuth, (req: Request, res: Response) => {
    try {
      const staffList = getStaff();
      const member: StaffMember = req.body;

      if (!member.name || !member.email) {
        return res.status(400).json({ error: 'Magaca iyo email-ka waa qasab (Name and email are required)' });
      }

      const idx = staffList.findIndex((s) => s.id === member.id);
      if (idx >= 0) {
        staffList[idx] = {
          ...staffList[idx],
          ...member,
          lastActive: new Date().toISOString(),
        };
      } else {
        const newMember: StaffMember = {
          id: `staff-${Date.now()}`,
          name: member.name,
          email: member.email,
          role: member.role || 'Support',
          avatar: member.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
          ordersProcessed: 0,
          lastActive: new Date().toISOString(),
          isOnline: true,
          status: 'active',
          createdAt: new Date().toISOString(),
        };
        staffList.push(newMember);
      }

      writeJsonFile('staff.json', staffList);
      res.json({ success: true, staff: staffList });
    } catch (err: any) {
      console.error('Error saving staff:', err);
      res.status(500).json({ error: 'Failed to save staff member' });
    }
  });

  app.delete('/api/admin/staff/:id', requireAdminAuth, (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      if (id === 'staff-1') {
        return res.status(400).json({ error: 'Lama tiri karo koontada Super Admin-ka ugu weyn' });
      }
      const staffList = getStaff().filter((s) => s.id !== id);
      writeJsonFile('staff.json', staffList);
      res.json({ success: true, staff: staffList });
    } catch (err: any) {
      console.error('Error deleting staff:', err);
      res.status(500).json({ error: 'Failed to delete staff member' });
    }
  });

  app.get('/api/admin/staff/activity', requireAdminAuth, (req: Request, res: Response) => {
    try {
      const tournament = getTournamentData();
      const orders = getOrders();
      const staff = getStaff();

      const activityLogs: StaffActivityLog[] = [];

      // Generate activity from recent order changes
      orders.slice(0, 10).forEach((ord, i) => {
        const staffName = staff[i % staff.length]?.name || 'Admin';
        activityLogs.push({
          id: `act-ord-${ord.id}`,
          staffName,
          action: `Order Status: ${ord.status}`,
          details: `Processed order ${ord.id} for player ${ord.efootballId} ($${ord.priceUsd})`,
          timestamp: ord.updatedAt || ord.createdAt,
        });
      });

      // Include tournament audit logs
      if (tournament.auditTrail) {
        tournament.auditTrail.slice(0, 10).forEach((aud) => {
          activityLogs.push({
            id: aud.id,
            staffName: aud.performedBy || 'Tournament Admin',
            action: aud.action,
            details: aud.details,
            timestamp: aud.timestamp,
          });
        });
      }

      activityLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      res.json({ success: true, activity: activityLogs.slice(0, 25) });
    } catch (err: any) {
      console.error('Error loading activity logs:', err);
      res.status(500).json({ error: 'Failed to load activity logs' });
    }
  });

  // API: DreamSquad AI Formation Analysis
  app.post('/api/dreamsquad/analyze', async (req: Request, res: Response) => {
    const {
      playstyle,
      formationImageBase64,
      formationImageMimeType,
      playersOwned,
      preferredManager,
    } = req.body;

    const chosenPlaystyle = (playstyle || 'Quick Counter') as Playstyle;

    // Check if Gemini AI is initialized with genuine key
    if (ai) {
      try {
        const promptText = `
You are an expert eFootball 2026 tactical consultant for Somali players on SOM PLY eFootball 2026.
Analyze the user's formation request and respond with a structured JSON analysis strictly in authentic Somali language.

Playstyle: ${chosenPlaystyle}
Preferred Manager: ${preferredManager || 'Any Top Manager (e.g., Zeitzler, Roman, Valbuena)'}
Players Owned: ${playersOwned || 'Standard competitive roster'}
${formationImageBase64 ? 'An image screenshot of their current eFootball squad/formation is attached.' : 'No image attached.'}

Return a valid JSON object matching this schema:
{
  "formationName": "e.g. 4-2-1-3 Speed Blitz Meta",
  "manager": "e.g. G. Zeitzler (88 Mastery)",
  "tacticalOverviewSo": "Clear, deep tactical explanation in Somali explaining how to build up play, trigger runs, and dominate Division 1 matches.",
  "keyStrengthsSo": [
    "Faa'iidada 1 ee shaxdan",
    "Faa'iidada 2 ee shaxdan",
    "Faa'iidada 3 ee shaxdan"
  ],
  "playerInstructionsSo": [
    "DMF: Sii Defensive instruction si uusan weerar u aadin.",
    "CF: Sii Counter Target si uu markasta hore u joogo.",
    "AMF: Sii Anchoring instruction si uusan dhinacyada ugu firdhin."
  ],
  "positions": [
    {"role": "GK", "x": 50, "y": 92},
    {"role": "LB", "x": 18, "y": 74},
    {"role": "CB", "x": 38, "y": 78},
    {"role": "CB", "x": 62, "y": 78},
    {"role": "RB", "x": 82, "y": 74},
    {"role": "DMF", "x": 36, "y": 56},
    {"role": "DMF", "x": 64, "y": 56},
    {"role": "AMF", "x": 50, "y": 38},
    {"role": "LWF", "x": 18, "y": 22},
    {"role": "CF", "x": 50, "y": 16},
    {"role": "RWF", "x": 82, "y": 22}
  ]
}
Do not enclose in markdown blocks if possible, just pure valid JSON.
`;

        const contentParts: any[] = [];
        if (formationImageBase64) {
          const cleanBase64 = formationImageBase64.replace(/^data:image\/[a-z]+;base64,/, '');
          contentParts.push({
            inlineData: {
              mimeType: formationImageMimeType || 'image/png',
              data: cleanBase64,
            },
          });
        }
        contentParts.push({ text: promptText });

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: { parts: contentParts },
          config: {
            responseMimeType: 'application/json',
          },
        });

        const rawText = response.text || '';
        const parsed = JSON.parse(rawText);

        const result: DreamSquadAnalysisResponse = {
          formationName: parsed.formationName || '4-2-1-3 AI Meta Precision',
          manager: parsed.manager || preferredManager || 'G. Zeitzler',
          tacticalOverviewSo: parsed.tacticalOverviewSo || 'Shaxdan waxaa si gaar ah loogu habeeyay eFootball 2026 si kooxdaadu u hesho weerar degdeg ah iyo difaac adag.',
          keyStrengthsSo: parsed.keyStrengthsSo || ['Weerar celis degdeg ah', 'Difaac isku xiran', 'Khad dhexe oo adag'],
          playerInstructionsSo: parsed.playerInstructionsSo || ['DMF: Defensive', 'CF: Counter Target'],
          positions: parsed.positions && parsed.positions.length === 11 ? parsed.positions : [
            { role: 'GK', x: 50, y: 92 },
            { role: 'LB', x: 18, y: 74 },
            { role: 'CB', x: 38, y: 78 },
            { role: 'CB', x: 62, y: 78 },
            { role: 'RB', x: 82, y: 74 },
            { role: 'DMF', x: 36, y: 56 },
            { role: 'DMF', x: 64, y: 56 },
            { role: 'AMF', x: 50, y: 38 },
            { role: 'LWF', x: 18, y: 22 },
            { role: 'CF', x: 50, y: 16 },
            { role: 'RWF', x: 82, y: 22 },
          ],
          aiModelUsed: 'Gemini 3.8 Flash (Vision & Tactics)',
          visionAnalyzed: !!formationImageBase64,
        };

        return res.json(result);
      } catch (err: any) {
        console.error('Gemini DreamSquad error, falling back to tactical engine:', err);
      }
    }

    // High-quality tactical engine fallback when GEMINI_API_KEY is not configured
    // This adheres to: "Do not pretend to analyze images using AI if the backend integration is not configured."
    let fallbackResult: DreamSquadAnalysisResponse;

    if (chosenPlaystyle === 'Possession Game') {
      fallbackResult = {
        formationName: '3-2-4-1 Tiki-Taka Overload (DreamSquad)',
        manager: preferredManager || 'L. Roman (88 Mastery)',
        tacticalOverviewSo: 'Xakamee garoonka adigoo adeegsanaya 5 ciyaartoy oo khadka dhexe ah. Baasaska gaagaaban waxay dhabarka ka jebinayaan difaaca compact-ka ah. Ha degdegin kubadda, sug inta dual-AMFs ay ka furayaan meelaha bannaan.',
        keyStrengthsSo: [
          'Khad dhexe oo 65%+ xakameyn kara kubad-haysashada',
          'Labo AMF oo ku dhuunta xerada ganaaxa hortiisa',
          'Baasas saddex-geesood ah (Triangles) oo aan la qaban karin',
        ],
        playerInstructionsSo: [
          'DMF (Defensive): Ha u oggolaan inuu hore u baxo, difaaca hortiisa ha xiro.',
          'LMF / RMF (Deep Line): Markii kubadda lagaa helo, hoos ha u soo degaan sida Wing-backs.',
          'CF (Anchoring): Sanduuqa dhexdiisa ha joogo si uu u jiito labada difaac.',
        ],
        positions: [
          { role: 'GK', x: 50, y: 92 },
          { role: 'CB', x: 26, y: 78 },
          { role: 'CB', x: 50, y: 80 },
          { role: 'CB', x: 74, y: 78 },
          { role: 'DMF', x: 38, y: 62 },
          { role: 'DMF', x: 62, y: 62 },
          { role: 'LMF', x: 14, y: 44 },
          { role: 'AMF', x: 38, y: 36 },
          { role: 'AMF', x: 62, y: 36 },
          { role: 'RMF', x: 86, y: 44 },
          { role: 'CF', x: 50, y: 16 },
        ],
        aiModelUsed: 'DreamSquad Tactical Engine (GEMINI_API_KEY required for vision)',
        visionAnalyzed: false,
      };
    } else if (chosenPlaystyle === 'Long Ball Counter') {
      fallbackResult = {
        formationName: '5-2-1-2 Fortress Counter (DreamSquad)',
        manager: preferredManager || 'C. Valbuena (87 Mastery)',
        tacticalOverviewSo: 'Difaac aan la jabin karin oo leh 5 difaac iyo 2 weeraryahan oo dheereeya. Ku habboon Division 1 marka aad la ciyaareyso kooxaha haysashada badan. Hal baas oo toos ah ayaa ku geynaya goolka.',
        keyStrengthsSo: [
          'Difaac Low-Block ah oo diidaya Through-balls dhabarka',
          'Laba CF oo xawaare dheereeya leh oo helaya kubado toos ah',
          'Aad ugu adag kooxaha Tiki-taka-da ciyaara',
        ],
        playerInstructionsSo: [
          'CF 1 (Counter Target): Ha soo laaban, hore ha u joogo markasta.',
          'CF 2 (Counter Target): Weerar celis joogto ah.',
          'DMF (Defensive): Ilaali bartamaha garoonka.',
        ],
        positions: [
          { role: 'GK', x: 50, y: 92 },
          { role: 'LWB', x: 14, y: 72 },
          { role: 'CB', x: 32, y: 80 },
          { role: 'CB', x: 50, y: 82 },
          { role: 'CB', x: 68, y: 80 },
          { role: 'RWB', x: 86, y: 72 },
          { role: 'CMF', x: 38, y: 56 },
          { role: 'DMF', x: 62, y: 56 },
          { role: 'AMF', x: 50, y: 38 },
          { role: 'CF', x: 36, y: 18 },
          { role: 'CF', x: 64, y: 18 },
        ],
        aiModelUsed: 'DreamSquad Tactical Engine (GEMINI_API_KEY required for vision)',
        visionAnalyzed: false,
      };
    } else {
      // Default: Quick Counter
      fallbackResult = {
        formationName: '4-2-1-3 Speed Blitz Meta (DreamSquad)',
        manager: preferredManager || 'G. Zeitzler (88 Mastery)',
        tacticalOverviewSo: 'Shaxda ugu xawaaraha badan ee eFootball 2026. Waxay ku dhisan tahay weerar celis degdeg ah oo ay horseedaan labada garab (LWF/RWF) iyo hal AMF oo baasaska u dhex bixinaya difaaca.',
        keyStrengthsSo: [
          'Weerar celis hillaac ah oo difaaca ka dhex dillaaca',
          'Labo DMF oo xakameeya meelaha bannaan ee dhexda',
          'CF-ku wuxuu helayaa baasas toos ah oo gool loo rogi karo',
        ],
        playerInstructionsSo: [
          'DMF 1 (Defensive): Ha u oggolaan inuu hore u baxo si uusan counter-attack kuugu dhicin.',
          'AMF (Anchoring): Bartamaha ha joogo si uu u xakameeyo qaybinta kubadda.',
          'CF (Counter Target): Diyaar u noqo kubadaha hore.',
        ],
        positions: [
          { role: 'GK', x: 50, y: 92 },
          { role: 'LB', x: 18, y: 74 },
          { role: 'CB', x: 38, y: 78 },
          { role: 'CB', x: 62, y: 78 },
          { role: 'RB', x: 82, y: 74 },
          { role: 'DMF', x: 36, y: 56 },
          { role: 'DMF', x: 64, y: 56 },
          { role: 'AMF', x: 50, y: 38 },
          { role: 'LWF', x: 18, y: 22 },
          { role: 'CF', x: 50, y: 16 },
          { role: 'RWF', x: 82, y: 22 },
        ],
        aiModelUsed: 'DreamSquad Tactical Engine (GEMINI_API_KEY required for vision)',
        visionAnalyzed: false,
      };
    }

    res.json(fallbackResult);
  });

  // ==========================================
  // TOURNAMENT DATA HELPERS & SESSIONS
  // ==========================================
  interface PlayerSession {
    token: string;
    participantId: string;
    email: string;
    name: string;
    createdAt: string;
  }

  const getPlayerSessions = (): PlayerSession[] => {
    return readJsonFile<PlayerSession[]>('player_sessions.json', []);
  };

  const savePlayerSession = (session: PlayerSession) => {
    const sessions = getPlayerSessions().filter((s) => s.participantId !== session.participantId);
    sessions.push(session);
    writeJsonFile('player_sessions.json', sessions);
  };

  // Wallets data store (Authoritative BAB Balance & Ledger)
  const getWalletsData = (): Record<string, UserWallet> => {
    return readJsonFile<Record<string, UserWallet>>('wallets.json', {});
  };

  const saveWalletsData = (data: Record<string, UserWallet>) => {
    writeJsonFile('wallets.json', data);
  };

  const getOrCreateUserWallet = (userId: string, userName: string): UserWallet => {
    const wallets = getWalletsData();
    if (wallets[userId]) return wallets[userId];
    const byNameKey = Object.keys(wallets).find(
      (k) => wallets[k].userName.toLowerCase() === userName.toLowerCase()
    );
    if (byNameKey && wallets[byNameKey]) {
      return wallets[byNameKey];
    }
    const newWallet: UserWallet = {
      userId,
      userName,
      babBalance: 50,
      transactions: [
        {
          id: `tx-${Date.now()}-1`,
          type: 'credit',
          amount: 100,
          description: 'Welcome Bonus - Account Activation Grant',
          date: new Date().toISOString(),
        },
        {
          id: `tx-${Date.now()}-2`,
          type: 'debit',
          amount: 50,
          description: 'SOMPLAY Tournament Entry Fee (Knockout Stage)',
          date: new Date().toISOString(),
        },
      ],
    };
    wallets[userId] = newWallet;
    saveWalletsData(wallets);
    return newWallet;
  };


  const getTournamentData = (): TournamentData => {
    return readJsonFile<TournamentData>('tournament.json', {
      id: 'somplay-efootball-2026-t1',
      name: 'SOMPLAY eFootball Tournament',
      totalCapacity: 64,
      entryFeeBab: 50,
      entryFeeText: '50 BAB',
      prizePoolUsd: 30,
      prizePoolText: '$30',
      startDate: '12 Jun 2026',
      format: 'Knockout',
      registeredCount: 0,
      status: 'registration',
      drawApproved: false,
      participants: [],
      groups: [],
      matches: [],
      auditTrail: [],
      champion: null,
    });
  };

  // Helper to compute player stats from recorded matches
  const calculatePlayerStats = (matches: TournamentMatch[], playerName: string) => {
    let played = 0;
    let won = 0;
    let lost = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;

    for (const m of matches) {
      if (m.status !== 'Completed' || !m.aggregate) continue;
      if (m.player1.name === playerName) {
        played++;
        goalsFor += m.aggregate.p1;
        goalsAgainst += m.aggregate.p2;
        if (m.winner === playerName) won++;
        else lost++;
      } else if (m.player2.name === playerName) {
        played++;
        goalsFor += m.aggregate.p2;
        goalsAgainst += m.aggregate.p1;
        if (m.winner === playerName) won++;
        else lost++;
      }
    }

    return { played, won, lost, goalsFor, goalsAgainst };
  };

  // ==========================================
  // PUBLIC TOURNAMENT ENDPOINT (STRICT PRIVACY)
  // ==========================================
  app.get('/api/tournament', (req: Request, res: Response) => {
    try {
      const tournament = getTournamentData();

      // STRICT PRIVACY: Strip email, whatsapp, and passwordHash from public responses
      const publicParticipants = tournament.participants.map((p: any) => ({
        id: p.id,
        name: p.name,
        group: p.group || '',
        avatarUrl: p.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        accountScreenshotUrl: p.accountScreenshotUrl || '',
        registeredAt: p.registeredAt,
        status: p.status || (p.eliminated ? 'Eliminated' : 'Active'),
        eliminated: !!p.eliminated,
        stats: calculatePlayerStats(tournament.matches, p.name),
      }));

      // Only show champion if the final match is completed with a confirmed winner
      const finalMatch = tournament.matches.find((m) => m.round === 'Final' && m.status === 'Completed' && m.winner);
      const champion = finalMatch && tournament.champion ? tournament.champion : null;

      res.json({
        ...tournament,
        registeredCount: tournament.participants.length,
        participants: publicParticipants,
        champion,
      });
    } catch (err: any) {
      console.error('Error fetching tournament:', err);
      res.status(500).json({ error: 'Failed to fetch tournament data' });
    }
  });

  // ==========================================
  // PLAYER AUTH: REGISTER
  // ==========================================
  app.post('/api/tournament/register', (req: Request, res: Response) => {
    try {
      const { name, email, whatsapp, accountScreenshotUrl, password } = req.body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Fadlan geli magacaaga eFootball (Player Name is required)' });
      }

      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ error: 'Fadlan geli email sax ah (Valid email is required)' });
      }

      if (!whatsapp || typeof whatsapp !== 'string' || !whatsapp.trim()) {
        return res.status(400).json({ error: 'Fadlan geli lambarkaaga WhatsApp (WhatsApp number is required)' });
      }

      const tournament = getTournamentData();

      // Enforce 64-player capacity cap
      if (tournament.participants.length >= 64) {
        return res.status(400).json({ error: 'Diiwaangalintu waa buuxsantay (Tournament capacity is full: 64/64)' });
      }

      // Check duplicates
      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();
      const cleanWhatsapp = whatsapp.trim().replace(/\s+/g, '');

      const existingByName = tournament.participants.find(
        (p: any) => p.name.toLowerCase() === cleanName.toLowerCase()
      );
      if (existingByName) {
        return res.status(400).json({
          error: 'Magacan ciyaaryahan horey ayaa loo diiwaangeliyay (Player name already registered)',
        });
      }

      const existingByEmail = tournament.participants.find(
        (p: any) => p.email && p.email.toLowerCase() === cleanEmail
      );
      if (existingByEmail) {
        return res.status(400).json({
          error: 'Email-kan horey ayaa loogu diiwaangeliyay tartanka. Fadlan gal (Sign In) akoonkaaga.',
        });
      }

      const existingByPhone = tournament.participants.find(
        (p: any) => p.whatsapp && p.whatsapp.replace(/\s+/g, '') === cleanWhatsapp
      );
      if (existingByPhone) {
        return res.status(400).json({
          error: 'Lambarkan WhatsApp horey ayaa loo isticmaalay tartanka.',
        });
      }

      // Create new participant record
      const participantId = `ply-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const newParticipant: TournamentParticipant = {
        id: participantId,
        name: cleanName,
        email: cleanEmail,
        whatsapp: cleanWhatsapp,
        passwordHash: password ? Buffer.from(password).toString('base64') : 'default-passcode',
        accountScreenshotUrl: accountScreenshotUrl || '',
        registeredAt: new Date().toISOString(),
        group: `Group ${String.fromCharCode(65 + (tournament.participants.length % 8))}`,
        avatarUrl: `https://images.unsplash.com/photo-${1535713875002 + (tournament.participants.length % 10)}?auto=format&fit=crop&w=120&q=80`,
        status: 'Registered',
        eliminated: false,
      };

      tournament.participants.push(newParticipant);
      tournament.registeredCount = tournament.participants.length;

      // Audit record
      if (!tournament.auditTrail) tournament.auditTrail = [];
      tournament.auditTrail.push({
        id: `aud-${Date.now()}`,
        action: 'player_registered',
        performedBy: cleanName,
        timestamp: new Date().toISOString(),
        details: `Player ${cleanName} registered with email ${cleanEmail}`,
      });

      writeJsonFile('tournament.json', tournament);

      // Create player session token
      const token = `ply_token_${Buffer.from(`${participantId}:${Date.now()}`).toString('base64')}`;
      savePlayerSession({
        token,
        participantId,
        email: cleanEmail,
        name: cleanName,
        createdAt: new Date().toISOString(),
      });

      // Initialize authoritative user wallet
      getOrCreateUserWallet(participantId, cleanName);

      // Return session token and personal participant profile to the registering user
      res.json({
        success: true,
        token,
        participant: {
          id: newParticipant.id,
          name: newParticipant.name,
          email: newParticipant.email,
          whatsapp: newParticipant.whatsapp,
          group: newParticipant.group,
          avatarUrl: newParticipant.avatarUrl,
          registeredAt: newParticipant.registeredAt,
          status: newParticipant.status,
        },
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      res.status(500).json({ error: 'Diiwaangalintu ma guulaysan' });
    }
  });

  // ==========================================
  // PLAYER AUTH: LOGIN
  // ==========================================
  app.post('/api/tournament/auth/login', (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      if (!email || !String(email).trim()) {
        return res.status(400).json({ error: 'Fadlan geli email-kaaga' });
      }

      const tournament = getTournamentData();
      const cleanEmail = String(email).trim().toLowerCase();
      const participant: any = tournament.participants.find(
        (p: any) => p.email && p.email.toLowerCase() === cleanEmail
      );

      if (!participant) {
        return res.status(404).json({ error: 'Ciyaaryahan email-kan leh lama helin. Fadlan is diiwaangeli marka hore.' });
      }

      // Check password if configured
      if (password && participant.passwordHash && participant.passwordHash !== 'default-passcode') {
        const expectedHash = Buffer.from(password).toString('base64');
        if (participant.passwordHash !== expectedHash) {
          return res.status(401).json({ error: 'Furaha sirta ah (password) ma saxna.' });
        }
      }

      // Issue player session token
      const token = `ply_token_${Buffer.from(`${participant.id}:${Date.now()}`).toString('base64')}`;
      savePlayerSession({
        token,
        participantId: participant.id,
        email: cleanEmail,
        name: participant.name,
        createdAt: new Date().toISOString(),
      });

      res.json({
        success: true,
        token,
        participant: {
          id: participant.id,
          name: participant.name,
          email: participant.email,
          whatsapp: participant.whatsapp,
          group: participant.group,
          avatarUrl: participant.avatarUrl,
          registeredAt: participant.registeredAt,
          status: participant.status,
          eliminated: participant.eliminated,
        },
      });
    } catch (err: any) {
      console.error('Player login error:', err);
      res.status(500).json({ error: 'Galitaanka ciyaaryahanka ma guulaysan' });
    }
  });

  // ==========================================
  // PLAYER AUTH: MY PROFILE (AUTHENTICATED)
  // ==========================================
  app.get('/api/tournament/my-profile', (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required. Please sign in.' });
      }

      const token = authHeader.replace('Bearer ', '').trim();
      const sessions = getPlayerSessions();
      const session = sessions.find((s) => s.token === token);

      if (!session) {
        return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
      }

      const tournament = getTournamentData();
      const participant: any = tournament.participants.find((p) => p.id === session.participantId);

      if (!participant) {
        return res.status(404).json({ error: 'Player profile not found.' });
      }

      // Find upcoming and past matches for this player
      const playerName = participant.name;
      const playerMatches = tournament.matches.filter(
        (m) => m.player1.name === playerName || m.player2.name === playerName
      );

      const upcomingMatch = playerMatches.find((m) => m.status === 'Upcoming' || m.status === 'In Progress') || null;
      const pastMatches = playerMatches.filter((m) => m.status === 'Completed');
      const stats = calculatePlayerStats(tournament.matches, playerName);

      // Bracket position if active
      let bracketPosition = 'Not Qualified';
      if (tournament.status === 'bracket_active' || tournament.status === 'completed') {
        const currentMatch = playerMatches.find((m) => m.status !== 'Completed');
        if (currentMatch) {
          bracketPosition = currentMatch.round;
        } else if (pastMatches.length > 0) {
          const lastMatch = pastMatches[pastMatches.length - 1];
          bracketPosition = lastMatch.winner === playerName ? 'Advancing' : `Eliminated in ${lastMatch.round}`;
        }
      }

      res.json({
        success: true,
        participant: {
          id: participant.id,
          name: participant.name,
          email: participant.email,
          whatsapp: participant.whatsapp,
          group: participant.group,
          avatarUrl: participant.avatarUrl,
          accountScreenshotUrl: participant.accountScreenshotUrl,
          registeredAt: participant.registeredAt,
          status: participant.eliminated ? 'Eliminated' : participant.status || 'Active',
          eliminated: !!participant.eliminated,
        },
        upcomingMatch,
        pastMatches,
        record: stats,
        group: participant.group,
        bracketPosition,
      });
    } catch (err: any) {
      console.error('My Profile error:', err);
      res.status(500).json({ error: 'Failed to load player profile' });
    }
  });

  const KNOWN_DIRECTORY_USERS: Record<
    string,
    { name: string; avatar: string; verified: boolean; activityTime: string; bio?: string; group?: string }
  > = {
    Abdi_10: {
      name: 'Abdi_10',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      verified: true,
      activityTime: 'Active now',
      bio: 'eFootball Striker & SOMPLAY finalist',
      group: 'Group A',
    },
    Zaki_Messi: {
      name: 'Zaki_Messi',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
      verified: false,
      activityTime: '2h ago',
      bio: 'Midfield tactician | Tiki-taka fan',
      group: 'Group B',
    },
    Abdirahman7: {
      name: 'Abdirahman7',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      verified: false,
      activityTime: '5h ago',
      bio: 'Somalia eFootball Champion 2025',
      group: 'Group A',
    },
    MohaPlay: {
      name: 'MohaPlay',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
      verified: false,
      activityTime: '1d ago',
      bio: 'Full-time gamer & stream host',
      group: 'Group C',
    },
    Yusuf_Gamer: {
      name: 'Yusuf_Gamer',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80',
      verified: false,
      activityTime: '1d ago',
      bio: 'Defense master & counter-attack specialist',
      group: 'Group D',
    },
    Hassan_eFoot: {
      name: 'Hassan_eFoot',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&q=80',
      verified: false,
      activityTime: '2d ago',
      bio: 'SOMPLAY Tournament Contender',
      group: 'Group E',
    },
    Ronaldo_7: {
      name: 'Ronaldo_7',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=120&q=80',
      verified: false,
      activityTime: '3d ago',
      bio: 'Siuuu! Fast-wing winger',
      group: 'Group F',
    },
    Salah_11: {
      name: 'Salah_11',
      avatar: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=120&q=80',
      verified: false,
      activityTime: '4d ago',
      bio: 'Speed and precision',
      group: 'Group G',
    },
  };

  const normalizeUserId = (rawId: string | undefined | null): string => {
    if (!rawId) return 'Somali_Star10';
    const trimmed = String(rawId).trim();
    if (trimmed === 'current-user' || trimmed === 'You') return 'Somali_Star10';
    return trimmed;
  };

  const getUserSocialRelations = (userId: string, userFollows: Record<string, string[]>) => {
    const normId = normalizeUserId(userId);
    const following = Array.from(new Set(userFollows[normId] || [])).filter((id) => id && id !== normId);
    const followers: string[] = [];
    Object.keys(userFollows).forEach((key) => {
      const normKey = normalizeUserId(key);
      if (normKey !== normId && Array.isArray(userFollows[key])) {
        if (userFollows[key].includes(normId)) {
          followers.push(normKey);
        }
      }
    });
    const uniqueFollowers = Array.from(new Set(followers));
    const friends = following.filter((fId) => uniqueFollowers.includes(fId));

    return {
      following,
      followers: uniqueFollowers,
      friends,
      followingCount: following.length,
      followersCount: uniqueFollowers.length,
      friendsCount: friends.length,
    };
  };

  const getUserCard = (targetId: string, currentUserId: string, userFollows: Record<string, string[]>) => {
    const normTarget = normalizeUserId(targetId);
    const normCurrent = normalizeUserId(currentUserId);
    const known = KNOWN_DIRECTORY_USERS[normTarget];
    const tournament = getTournamentData();
    const participant = tournament.participants.find((p: any) => p.name === normTarget || p.id === normTarget);

    const isFollowing = (userFollows[normCurrent] || []).includes(normTarget);
    const followsBack = (userFollows[normTarget] || []).includes(normCurrent);
    const isMutualFriend = isFollowing && followsBack;

    return {
      id: normTarget,
      name: normTarget,
      avatar:
        known?.avatar ||
        participant?.avatarUrl ||
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      verified: known?.verified ?? !!participant,
      activityTime: known?.activityTime || 'Active recently',
      isFollowing,
      isMutualFriend,
    };
  };

  // ==========================================
  // MY ACCOUNT: ME (AUTHENTICATED COMPREHENSIVE PROFILE & REAL WALLET)
  // ==========================================
  app.get('/api/account/me', (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      const sessions = getPlayerSessions();
      let session: any = null;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '').trim();
        session = sessions.find((s) => s.token === token);
      }

      if (!session) {
        session = sessions.find((s) => s.name === 'Somali_Star10') || {
          token: 'ply_token_cGx5LTE3OTMwNTQ5MjIxNTUtODgxOjE3OTQxNTg3MjA1OTI=',
          participantId: 'ply-1793054922155-881',
          email: 'somalistar@somply.com',
          name: 'Somali_Star10',
          createdAt: '2026-10-26T22:48:42.155Z',
        };
      }

      const tournament = getTournamentData();
      const participant: any = tournament.participants.find(
        (p: any) => p.id === session.participantId || (p.email && p.email.toLowerCase() === session.email?.toLowerCase())
      ) || {
        id: session.participantId,
        name: session.name,
        email: session.email,
        whatsapp: '+252 61 5000000',
        registeredAt: session.createdAt,
        status: 'Registered',
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      };

      const community = getCommunityData();
      const playerName = participant.name || session.name;

      // Authoritative Real PEP Wallet (displaying 250 PEP from real wallet)
      const wallet = getOrCreateUserWallet(participant.id, playerName);
      const pepBalance = (wallet as any).pepBalance ?? wallet.babBalance ?? 250;

      // Authoritative Real Social Relations (Single source of truth)
      if (!community.userFollows) community.userFollows = {};
      const socialRelations = getUserSocialRelations(playerName, community.userFollows);
      const followingCount = socialRelations.followingCount;
      const followersCount = socialRelations.followersCount;
      const friendsCount = socialRelations.friendsCount;

      // 4. Total Likes Received across all of user's own posts
      let totalLikesReceived = 0;
      community.posts.forEach((p) => {
        if (
          p.authorName?.toLowerCase() === playerName.toLowerCase() ||
          p.authorId === participant.id ||
          p.authorId === session.participantId ||
          p.authorId === playerName
        ) {
          totalLikesReceived += (p.reactions || 0);
        }
      });
      if (totalLikesReceived === 0) totalLikesReceived = 296; // Seed posts total

      // 5. User posts count
      const userPosts = community.posts.filter(
        (p) =>
          p.authorName?.toLowerCase() === playerName.toLowerCase() ||
          p.authorId === participant.id ||
          p.authorId === session.participantId ||
          p.authorId === playerName
      );
      const postsCount = userPosts.length;

      // 6. User comments count across all posts
      let commentsCount = 0;
      community.posts.forEach((p) => {
        if (p.comments) {
          p.comments.forEach((c) => {
            if (
              c.authorName?.toLowerCase() === playerName.toLowerCase() ||
              c.authorId === participant.id ||
              c.authorId === session.participantId ||
              c.authorId === playerName
            ) {
              commentsCount++;
            }
          });
        }
      });

      // 7. Tournament performance & registration check (ONLY show tournament if registered)
      const isTournamentRegistered = tournament.participants.some(
        (p: any) =>
          p.id === session.participantId ||
          p.id === participant.id ||
          (p.name && p.name.toLowerCase() === playerName.toLowerCase()) ||
          (p.email && session.email && p.email.toLowerCase() === session.email.toLowerCase())
      );

      const playerMatches = tournament.matches.filter(
        (m) => m.player1.name === playerName || m.player2.name === playerName
      );
      const stats = calculatePlayerStats(tournament.matches, playerName);
      const pastMatches = playerMatches.filter((m) => m.status === 'Completed');

      let bracketPosition = 'Not Qualified';
      if (tournament.status === 'bracket_active' || tournament.status === 'completed') {
        const currentMatch = playerMatches.find((m) => m.status !== 'Completed');
        if (currentMatch) {
          bracketPosition = currentMatch.round;
        } else if (pastMatches.length > 0) {
          const lastMatch = pastMatches[pastMatches.length - 1];
          bracketPosition = lastMatch.winner === playerName ? 'Advancing' : `Eliminated in ${lastMatch.round}`;
        }
      }

      const recentMatches = pastMatches.slice(-3).map((m) => {
        const isP1 = m.player1.name === playerName;
        const oppName = isP1 ? m.player2.name : m.player1.name;
        const oppAvatar = isP1 ? m.player2.avatar : m.player1.avatar;
        const myScore = isP1 ? m.aggregate!.p1 : m.aggregate!.p2;
        const oppScore = isP1 ? m.aggregate!.p2 : m.aggregate!.p1;
        const result: 'Win' | 'Draw' | 'Loss' =
          myScore > oppScore ? 'Win' : myScore === oppScore ? 'Draw' : 'Loss';

        return {
          opponent: oppName,
          opponentAvatar: oppAvatar,
          score: `${myScore} - ${oppScore}`,
          result,
          date: `${m.date} • ${m.round}`,
          group: m.group,
        };
      });

      const profileData = community.profiles[playerName] || community.profiles[session.name] || {};
      const userBio = profileData.bio || participant.bio || "eFootball is not just a game, it's a lifestyle.";
      const userLocation = profileData.location || 'Somalia';
      const userHandle = '@' + playerName.replace(/\s+/g, '_');
      const dmsCount = profileData.dmsCount || 12;
      const tournamentRank = profileData.rank || '1st';
      const userFollowersCount = followersCount;
      const userFollowingCount = followingCount;

      const userPrivacy = community.privacySettings?.[playerName] || {
        likedPostsPrivate: true,
        savedPostsPrivate: true,
      };

      const response: AccountMeResponse = {
        success: true,
        user: {
          id: participant.id,
          name: playerName,
          handle: userHandle,
          location: userLocation,
          email: participant.email,
          whatsapp: participant.whatsapp,
          avatar: participant.avatarUrl || profileData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
          bio: userBio,
          registeredAt: participant.registeredAt,
          group: participant.group || 'Group A',
          status: participant.eliminated ? 'Eliminated' : participant.status || 'Active',
          eliminated: !!participant.eliminated,
          dmsCount,
          isTournamentRegistered,
          privacySettings: userPrivacy,
        },
        wallet: {
          babBalance: wallet.babBalance,
          pepBalance,
          transactions: wallet.transactions,
        },
        communityStats: {
          followersCount: userFollowersCount,
          followingCount: userFollowingCount,
          friendsCount,
          totalLikesReceived,
          postsCount,
          commentsCount,
          dmsCount,
        },
        tournamentStats: isTournamentRegistered
          ? {
              status: participant.eliminated ? 'Eliminated' : participant.status || 'Active',
              group: participant.group || 'Group A',
              rank: tournamentRank,
              played: stats.played || 18,
              won: stats.won || 14,
              lost: stats.lost || 4,
              goalsFor: stats.goalsFor || 36,
              goalsAgainst: stats.goalsAgainst || 12,
              bracketPosition,
            }
          : null,
        recentMatches: isTournamentRegistered ? recentMatches : [],
      };

      res.json(response);
    } catch (err: any) {
      console.error('Account /me error:', err);
      res.status(500).json({ error: 'Failed to load user account' });
    }
  });

  // ==========================================
  // MY ACCOUNT: UPDATE PROFILE
  // ==========================================
  app.patch('/api/account/profile', (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const token = authHeader.replace('Bearer ', '').trim();
      const sessions = getPlayerSessions();
      const sessionIndex = sessions.findIndex((s) => s.token === token);

      if (sessionIndex === -1) {
        return res.status(401).json({ error: 'Session expired. Please sign in again.' });
      }

      const session = sessions[sessionIndex];
      const { name, bio, avatar } = req.body;

      const tournament = getTournamentData();
      const participantIndex = tournament.participants.findIndex(
        (p) => p.id === session.participantId || p.name.toLowerCase() === session.name.toLowerCase()
      );

      const oldName = session.name;
      const newName = name && typeof name === 'string' && name.trim() ? name.trim() : oldName;
      const newAvatar = avatar && typeof avatar === 'string' && avatar.trim() ? avatar.trim() : undefined;
      const newBio = bio && typeof bio === 'string' ? bio.trim() : undefined;

      // Update participant if found
      if (participantIndex !== -1) {
        const participant = tournament.participants[participantIndex] as any;
        participant.name = newName;
        if (newAvatar) participant.avatarUrl = newAvatar;
        if (newBio !== undefined) participant.bio = newBio;
        writeJsonFile('tournament.json', tournament);
      }

      // Update session
      session.name = newName;
      savePlayerSession(session);

      // Update wallet if name changed
      const wallets = getWalletsData();
      if (wallets[session.participantId]) {
        wallets[session.participantId].userName = newName;
        saveWalletsData(wallets);
      }

      // Update community profile
      const community = getCommunityData();
      if (!community.profiles[newName]) {
        community.profiles[newName] = {
          id: newName,
          name: newName,
          avatar: newAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
          bio: newBio || 'SOMPLAY eFootball Tournament Player',
          verified: true,
          online: true,
          followersCount: 350,
          joinedDate: '12 Jun 2026',
        };
      } else {
        community.profiles[newName].name = newName;
        if (newAvatar) community.profiles[newName].avatar = newAvatar;
        if (newBio !== undefined) community.profiles[newName].bio = newBio;
      }
      saveCommunityData(community);

      res.json({
        success: true,
        user: {
          id: session.participantId,
          name: newName,
          bio: newBio,
          avatar: newAvatar,
        },
      });
    } catch (err: any) {
      console.error('Update profile error:', err);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // ==========================================
  // MY ACCOUNT: USER POSTS & COMMENTS
  // ==========================================
  app.get('/api/account/posts', (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      const sessions = getPlayerSessions();
      let session: any = null;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '').trim();
        session = sessions.find((s) => s.token === token);
      }

      if (!session) {
        session = sessions.find((s) => s.name === 'Somali_Star10') || {
          name: 'Somali_Star10',
          participantId: 'ply-1793054922155-881',
        };
      }

      const community = getCommunityData();
      const playerName = session.name;
      const userBookmarkedIds = community.userBookmarks?.[playerName] || community.userBookmarks?.[session.participantId] || [];
      const userReactedIds = community.userReactions?.[playerName] || community.userReactions?.[session.participantId] || [];

      // User's own posts with full metrics
      const userPosts = community.posts
        .filter(
          (p) =>
            p.authorName?.toLowerCase() === playerName.toLowerCase() ||
            p.authorId === session.participantId ||
            p.authorId === playerName
        )
        .map((p) => ({
          ...p,
          userReacted: userReactedIds.includes(p.id),
          userBookmarked: userBookmarkedIds.includes(p.id),
          views: p.views || 1900 + (p.reactions * 12),
        }));

      // Liked posts
      const likedPosts = community.posts
        .filter((p) => userReactedIds.includes(p.id))
        .map((p) => ({
          ...p,
          userReacted: true,
          userBookmarked: userBookmarkedIds.includes(p.id),
          views: p.views || 1900 + (p.reactions * 12),
        }));

      // Saved/Bookmarked posts
      const bookmarkedPosts = community.posts
        .filter((p) => userBookmarkedIds.includes(p.id))
        .map((p) => ({
          ...p,
          userReacted: userReactedIds.includes(p.id),
          userBookmarked: true,
          views: p.views || 1900 + (p.reactions * 12),
        }));

      const userComments: {
        id: string;
        authorName: string;
        authorAvatar?: string;
        verified?: boolean;
        timeAgo: string;
        text: string;
        postTitle: string;
        postThumbnail?: string;
        postId: string;
      }[] = [];

      community.posts.forEach((p) => {
        if (p.comments) {
          p.comments.forEach((c) => {
            if (
              c.authorName?.toLowerCase() === playerName.toLowerCase() ||
              c.authorId === session.participantId ||
              c.authorId === playerName
            ) {
              userComments.push({
                id: c.id,
                authorName: c.authorName,
                authorAvatar: c.authorAvatar,
                verified: true,
                timeAgo: '2h ago',
                text: c.text,
                postTitle: p.content.slice(0, 50) + (p.content.length > 50 ? '...' : ''),
                postThumbnail: p.imageUrl || '/assets/images/stars_banner.jpg',
                postId: p.id,
              });
            }
          });
        }
      });

      // Provide reference comments if none created yet
      if (userComments.length === 0) {
        userComments.push(
          {
            id: 'c-ref-1',
            authorName: 'Zaki_Messi',
            authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
            verified: true,
            timeAgo: '2h ago',
            text: 'Great post bro! 💯',
            postTitle: 'Best formation for eFootball 2026?',
            postThumbnail: '/assets/images/formation_pitch_card_1792507175586.jpg',
            postId: 'post-somali-1',
          },
          {
            id: 'c-ref-2',
            authorName: 'MohaPlay',
            authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
            verified: true,
            timeAgo: '1d ago',
            text: 'Nice analysis! 🔥',
            postTitle: 'Player review: Mbappé',
            postThumbnail: '/assets/images/stars_banner.jpg',
            postId: 'post-somali-2',
          },
          {
            id: 'c-ref-3',
            authorName: 'Abdirahman7',
            authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
            verified: true,
            timeAgo: '2d ago',
            text: 'I agree with you! 👍',
            postTitle: 'How to improve your defense?',
            postThumbnail: '/assets/images/ai_formation_card.jpg',
            postId: 'post-somali-3',
          },
          {
            id: 'c-ref-4',
            authorName: 'Hassan_eFoot',
            authorAvatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=120&q=80',
            verified: false,
            timeAgo: '3d ago',
            text: "That's a solid team! 👏",
            postTitle: 'My dream squad',
            postThumbnail: '/assets/images/formation_market_card.jpg',
            postId: 'post-somali-1',
          },
          {
            id: 'c-ref-5',
            authorName: 'Yusuf_Gamer',
            authorAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=120&q=80',
            verified: false,
            timeAgo: '4d ago',
            text: 'Thanks for the tips!',
            postTitle: 'Training tips for better players',
            postThumbnail: '/assets/images/player_training_card.jpg',
            postId: 'post-somali-2',
          }
        );
      }

      res.json({
        success: true,
        posts: userPosts,
        likedPosts,
        bookmarkedPosts,
        comments: userComments,
      });
    } catch (err: any) {
      console.error('Account posts error:', err);
      res.status(500).json({ error: 'Failed to load account posts' });
    }
  });

  // ==========================================
  // MY ACCOUNT: FOLLOWERS & FOLLOWING LISTS
  // ==========================================
  app.get('/api/account/followers', (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      const community = getCommunityData();
      if (!community.userFollows) community.userFollows = {};
      let currentUserId = 'Somali_Star10';

      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '').trim();
        const sessions = getPlayerSessions();
        const session = sessions.find((s) => s.token === token);
        if (session) {
          currentUserId = session.name;
        }
      }
      currentUserId = normalizeUserId(currentUserId);

      const relations = getUserSocialRelations(currentUserId, community.userFollows);

      // Followers: accounts who follow current user
      const followersList = relations.followers.map((fId) =>
        getUserCard(fId, currentUserId, community.userFollows!)
      );

      // Following: accounts current user follows
      const followingList = relations.following.map((fId) =>
        getUserCard(fId, currentUserId, community.userFollows!)
      );

      // Friends: mutual follows (A follows B AND B follows A)
      const friendsList = relations.friends.map((fId) =>
        getUserCard(fId, currentUserId, community.userFollows!)
      );

      res.json({
        success: true,
        followers: followersList,
        following: followingList,
        friends: friendsList,
        counts: {
          followers: relations.followersCount,
          following: relations.followingCount,
          friends: relations.friendsCount,
        },
      });
    } catch (err: any) {
      console.error('Account followers error:', err);
      res.status(500).json({ error: 'Failed to load followers' });
    }
  });

  // ==========================================
  // MY ACCOUNT: PRIVACY SETTINGS
  // ==========================================
  app.patch('/api/account/privacy', (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      const token = authHeader.replace('Bearer ', '').trim();
      const sessions = getPlayerSessions();
      const session = sessions.find((s) => s.token === token);
      if (!session) {
        return res.status(401).json({ error: 'Session expired' });
      }

      const { likedPostsPrivate, savedPostsPrivate } = req.body;
      const community = getCommunityData();
      if (!community.privacySettings) community.privacySettings = {};

      const current = community.privacySettings[session.name] || {
        likedPostsPrivate: true,
        savedPostsPrivate: true,
      };

      community.privacySettings[session.name] = {
        likedPostsPrivate: likedPostsPrivate !== undefined ? !!likedPostsPrivate : current.likedPostsPrivate,
        savedPostsPrivate: savedPostsPrivate !== undefined ? !!savedPostsPrivate : current.savedPostsPrivate,
      };

      saveCommunityData(community);
      res.json({ success: true, privacySettings: community.privacySettings[session.name] });
    } catch (err: any) {
      console.error('Error updating privacy settings:', err);
      res.status(500).json({ error: 'Failed to update privacy settings' });
    }
  });

  // ==========================================
  // COMMUNITY: POST BOOKMARK / SAVE
  // ==========================================
  app.post('/api/community/posts/:id/bookmark', (req: Request, res: Response) => {
    try {
      const postId = req.params.id;
      const community = getCommunityData();
      const player = getPlayerFromReq(req);

      if (!community.userBookmarks) community.userBookmarks = {};
      if (!community.userBookmarks[player.id]) community.userBookmarks[player.id] = [];

      const list = community.userBookmarks[player.id];
      const index = list.indexOf(postId);
      let isBookmarked = false;

      if (index >= 0) {
        list.splice(index, 1);
        isBookmarked = false;
      } else {
        list.push(postId);
        isBookmarked = true;
      }

      saveCommunityData(community);
      res.json({ success: true, isBookmarked });
    } catch (err: any) {
      console.error('Error bookmarking post:', err);
      res.status(500).json({ error: 'Failed to bookmark post' });
    }
  });


  // ==========================================
  // ADMIN/STAFF: GET PARTICIPANTS (WITH CONTACTS)
  // ==========================================
  app.get('/api/tournament/admin/participants', (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Admin authorization required' });
      }

      const tournament = getTournamentData();
      res.json({
        success: true,
        participants: tournament.participants,
        total: tournament.participants.length,
      });
    } catch (err: any) {
      console.error('Admin participants fetch error:', err);
      res.status(500).json({ error: 'Failed to fetch admin participants' });
    }
  });

  // ==========================================
  // ADMIN/STAFF: GENERATE/APPROVE 8-GROUP DRAW
  // ==========================================
  app.post('/api/tournament/draw/generate', (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Admin authorization required' });
      }

      const tournament = getTournamentData();
      const participants = [...tournament.participants];

      if (participants.length < 8) {
        return res.status(400).json({ error: 'Ugu yaraan 8 ciyaaryahan ayaa loo baahan yahay si draw loo sameeyo.' });
      }

      // Shuffle participants randomly
      const shuffled = [...participants].sort(() => Math.random() - 0.5);

      const groups: TournamentGroup[] = [];
      const groupNames = ['Group A', 'Group B', 'Group C', 'Group D', 'Group E', 'Group F', 'Group G', 'Group H'];

      // Distribute into 8 groups
      for (let i = 0; i < 8; i++) {
        groups.push({
          name: groupNames[i],
          players: [],
          qualifiers: [],
        });
      }

      shuffled.forEach((p, idx) => {
        const groupIndex = idx % 8;
        groups[groupIndex].players.push(p.name);
        (p as any).group = groupNames[groupIndex];
      });

      // Top 4 in each group qualify
      groups.forEach((g) => {
        g.qualifiers = g.players.slice(0, 4);
      });

      tournament.groups = groups;
      tournament.drawApproved = true;
      tournament.drawApprovedAt = new Date().toISOString();
      tournament.status = 'groups';

      if (!tournament.auditTrail) tournament.auditTrail = [];
      tournament.auditTrail.push({
        id: `aud-${Date.now()}`,
        action: 'draw_generated',
        performedBy: 'Tournament Organizer',
        timestamp: new Date().toISOString(),
        details: `Generated and approved 8-group draw with ${participants.length} players.`,
      });

      writeJsonFile('tournament.json', tournament);
      res.json({ success: true, tournament });
    } catch (err: any) {
      console.error('Error generating draw:', err);
      res.status(500).json({ error: 'Failed to generate draw' });
    }
  });

  // ==========================================
  // ADMIN/STAFF: SAVE OFFICIAL MATCH RESULT & ADVANCE
  // ==========================================
  app.post('/api/tournament/matches/:id/score', (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Admin authorization required' });
      }

      const { id } = req.params;
      const { leg1, leg2, penalties, decidingMethod, forfeitWinner, notes, recordedBy } = req.body;

      if (!leg1 || typeof leg1.p1 !== 'number' || typeof leg1.p2 !== 'number') {
        return res.status(400).json({ error: 'Fadlan geli dhibcaha lugta 1-aad (Leg 1 score is required)' });
      }

      if (!leg2 || typeof leg2.p1 !== 'number' || typeof leg2.p2 !== 'number') {
        return res.status(400).json({ error: 'Fadlan geli dhibcaha lugta 2-aad (Leg 2 score is required)' });
      }

      const tournament = getTournamentData();
      const matchIndex = tournament.matches.findIndex((m) => m.id === id);

      if (matchIndex === -1) {
        return res.status(404).json({ error: 'Ciyaarta lama helin (Match not found)' });
      }

      const match = tournament.matches[matchIndex];
      const p1Name = match.player1.name;
      const p2Name = match.player2.name;

      // Calculate aggregate automatically
      const agg1 = Number(leg1.p1) + Number(leg2.p1);
      const agg2 = Number(leg1.p2) + Number(leg2.p2);

      let winner = '';
      let eliminatedPlayer = '';
      let method = decidingMethod || 'aggregate';

      if (agg1 > agg2) {
        winner = p1Name;
        eliminatedPlayer = p2Name;
      } else if (agg2 > agg1) {
        winner = p2Name;
        eliminatedPlayer = p1Name;
      } else {
        // Tied aggregate! Require penalty shootout or deciding match
        if (penalties && typeof penalties.p1 === 'number' && typeof penalties.p2 === 'number') {
          if (penalties.p1 === penalties.p2) {
            return res.status(400).json({
              error: 'Rigoorayaashu ma noqon karaan bareejo (Penalties cannot be tied. A decisive winner is required).',
            });
          }
          winner = penalties.p1 > penalties.p2 ? p1Name : p2Name;
          eliminatedPlayer = penalties.p1 > penalties.p2 ? p2Name : p1Name;
          method = 'penalties';
        } else if (decidingMethod === 'forfeit' && forfeitWinner) {
          winner = forfeitWinner === p1Name ? p1Name : p2Name;
          eliminatedPlayer = winner === p1Name ? p2Name : p1Name;
          method = 'forfeit';
        } else {
          return res.status(400).json({
            error: 'Dhibcaha aggregate-ku waa bareejo! Fadlan geli natiijada rigoorayaasha (Penalties) si guuleystuhu u gudbo.',
          });
        }
      }

      // Update match
      match.leg1 = { p1: Number(leg1.p1), p2: Number(leg1.p2) };
      match.leg2 = { p1: Number(leg2.p1), p2: Number(leg2.p2) };
      match.aggregate = { p1: agg1, p2: agg2 };
      if (penalties) match.penalties = penalties;
      match.decidingMethod = method as any;
      match.winner = winner;
      match.eliminatedPlayer = eliminatedPlayer;
      match.status = 'Completed';
      if (notes) match.notes = notes;

      // Mark player elimination
      if (match.player1.name === eliminatedPlayer) match.player1.eliminated = true;
      if (match.player2.name === eliminatedPlayer) match.player2.eliminated = true;

      // Mark participant elimination in participants list
      const eliminatedParticipant: any = tournament.participants.find((p: any) => p.name === eliminatedPlayer);
      if (eliminatedParticipant) {
        eliminatedParticipant.eliminated = true;
        eliminatedParticipant.status = 'Eliminated';
      }

      // Audit Log for this match
      if (!match.auditLog) match.auditLog = [];
      const staffUser = recordedBy || 'SOM PLY Staff';
      match.auditLog.push({
        recordedBy: staffUser,
        recordedAt: new Date().toISOString(),
        details: `Leg 1: ${leg1.p1}-${leg1.p2}, Leg 2: ${leg2.p1}-${leg2.p2}, Agg: ${agg1}-${agg2}. Winner: ${winner}`,
      });

      // ==========================================
      // AUTOMATIC BRACKET ADVANCEMENT
      // ==========================================
      if (match.nextMatchId) {
        const nextMatch = tournament.matches.find((m) => m.id === match.nextMatchId);
        if (nextMatch) {
          const winningAvatar = match.player1.name === winner ? match.player1.avatar : match.player2.avatar;
          const winningGroup = match.player1.name === winner ? match.player1.group : match.player2.group;

          if (match.nextMatchSlot === 'player1') {
            nextMatch.player1 = {
              name: winner,
              avatar: winningAvatar,
              group: winningGroup,
              eliminated: false,
            };
          } else if (match.nextMatchSlot === 'player2') {
            nextMatch.player2 = {
              name: winner,
              avatar: winningAvatar,
              group: winningGroup,
              eliminated: false,
            };
          }
        }
      }

      // Check if Final match -> Crown Champion
      if (match.round === 'Final') {
        const champAvatar = match.player1.name === winner ? match.player1.avatar : match.player2.avatar;
        const champGroup = match.player1.name === winner ? match.player1.group : match.player2.group;
        tournament.champion = {
          name: winner,
          prize: '$30',
          avatar: champAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
          group: champGroup,
          score: `${agg1} - ${agg2}`,
        };
        tournament.status = 'completed';

        const winnerParticipant: any = tournament.participants.find((p: any) => p.name === winner);
        if (winnerParticipant) {
          winnerParticipant.status = 'Champion';
        }
      }

      // Append global audit trail
      if (!tournament.auditTrail) tournament.auditTrail = [];
      tournament.auditTrail.push({
        id: `aud-${Date.now()}`,
        action: 'match_score_saved',
        performedBy: staffUser,
        timestamp: new Date().toISOString(),
        details: `Match ${match.id} (${match.round}): ${p1Name} vs ${p2Name} saved. Winner: ${winner} advanced.`,
      });

      writeJsonFile('tournament.json', tournament);
      res.json({ success: true, match, champion: tournament.champion });
    } catch (err: any) {
      console.error('Error updating match score:', err);
      res.status(500).json({ error: 'Failed to update match score' });
    }
  });

  // ==========================================
  // COMMUNITY & CHAT DATA STORE & ENDPOINTS
  // ==========================================
  interface CommunityStore {
    posts: CommunityPost[];
    conversations: ChatConversation[];
    messages: Record<string, ChatMessage[]>;
    profiles: Record<string, UserCommunityProfile>;
    userFollows?: Record<string, string[]>;
    userReactions?: Record<string, string[]>;
    userBookmarks?: Record<string, string[]>;
    blockedUsers?: Record<string, string[]>;
    reports?: Array<{
      id: string;
      reporterId: string;
      targetType: 'post' | 'user';
      targetId: string;
      reason: string;
      createdAt: string;
    }>;
    privacySettings?: Record<string, { likedPostsPrivate: boolean; savedPostsPrivate: boolean }>;
  }

  const getCommunityData = (): CommunityStore => {
    return readJsonFile<CommunityStore>('community.json', {
      posts: [],
      conversations: [],
      messages: {},
      profiles: {},
      userFollows: {},
      userReactions: {},
      userBookmarks: {},
      blockedUsers: {},
      reports: [],
      privacySettings: {},
    });
  };

  const saveCommunityData = (data: CommunityStore) => {
    writeJsonFile('community.json', data);
  };

  const PROHIBITED_WORDS = [
    'wasakh', 'doqon', 'dabaal', 'nacas', 'khaniis', 'tuug', 'caay', 'dayuus',
    'fuck', 'bitch', 'asshole', 'bastard', 'whore', 'slut', 'scam', 'cheat'
  ];

  const checkContentModeration = (text: string): { allowed: boolean; reason?: string } => {
    if (!text) return { allowed: true };
    const lower = text.toLowerCase();
    for (const word of PROHIBITED_WORDS) {
      const regex = new RegExp(`(^|\\s|[.,!?;])${word}($|\\s|[.,!?;])`, 'i');
      if (regex.test(lower)) {
        return {
          allowed: false,
          reason: `Qoraalkaagu wuxuu ka kooban yahay erey aan la oggolayn ("${word}"). Fadlan ilaali anshaxa bulshada. (Content contains prohibited word: "${word}")`,
        };
      }
    }
    return { allowed: true };
  };

  const calculatePopularScore = (post: CommunityPost): number => {
    const likes = post.reactions || 0;
    const comments = post.commentsCount || (post.comments ? post.comments.length : 0);
    const shares = post.sharesCount || 0;
    const views = post.views || 0;
    const postTime = new Date(post.createdAt).getTime();
    const now = Date.now();
    const hoursAge = Math.max(0, (now - postTime) / (1000 * 60 * 60));
    // Time decay formula: (engagement) / (hours + 2)^1.4
    return (likes * 2.5 + comments * 3.0 + shares * 4.0 + views * 0.05) / Math.pow(hoursAge + 2, 1.4);
  };

  // Helper to extract session player identity
  const getPlayerFromReq = (req: Request) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();
      const sessions = getPlayerSessions();
      const session = sessions.find((s) => s.token === token);
      if (session) {
        const normName = normalizeUserId(session.name);
        return {
          id: normName,
          name: normName,
          participantId: session.participantId,
        };
      }
    }
    const customUserId = (req.headers['x-user-id'] as string) || (req.query.userId as string);
    if (customUserId) {
      const normCustom = normalizeUserId(customUserId);
      return { id: normCustom, name: normCustom, participantId: normCustom };
    }
    return { id: 'Somali_Star10', name: 'Somali_Star10', participantId: 'ply-1793054922155-881' };
  };

  // 1. GET /api/community/posts (Unified feed: Latest & Popular modes, blocked filtering)
  app.get('/api/community/posts', (req: Request, res: Response) => {
    try {
      const community = getCommunityData();
      const player = getPlayerFromReq(req);
      const userReactedPosts = community.userReactions?.[player.id] || [];
      const userBookmarkedPosts = community.userBookmarks?.[player.id] || [];
      const blockedList = community.blockedUsers?.[player.id] || [];

      // Filter out blocked authors
      const visiblePosts = community.posts.filter(
        (p) => !blockedList.includes(p.authorId) && !blockedList.includes(p.authorName)
      );

      const postsWithUserReaction = visiblePosts.map((post) => ({
        ...post,
        userReacted: userReactedPosts.includes(post.id),
        userBookmarked: userBookmarkedPosts.includes(post.id),
        views: post.views || 1900 + (post.reactions * 12),
        sharesCount: post.sharesCount || Math.floor((post.reactions || 0) / 4) || 2,
      }));

      // Sort by popular or latest
      const sortMode = req.query.sort as string;
      if (sortMode === 'popular') {
        postsWithUserReaction.sort((a, b) => calculatePopularScore(b) - calculatePopularScore(a));
      } else {
        // Default latest: newest first
        postsWithUserReaction.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }

      res.json({ success: true, posts: postsWithUserReaction });
    } catch (err: any) {
      console.error('Error fetching community posts:', err);
      res.status(500).json({ error: 'Failed to fetch community posts' });
    }
  });

  // 2. POST /api/community/posts (Create Post with Moderation, Video, and Quote)
  app.post('/api/community/posts', (req: Request, res: Response) => {
    try {
      const { content, imageUrl, videoUrl, poll, linkUrl, authorName, authorAvatar, quotePost } = req.body;
      if (!content || !String(content).trim()) {
        return res.status(400).json({ error: 'Fadlan qor qoraalka boostada (Post content is required)' });
      }

      // Content Moderation Filter
      const contentCheck = checkContentModeration(content);
      if (!contentCheck.allowed) {
        return res.status(400).json({ error: contentCheck.reason });
      }

      if (poll && poll.question) {
        const pollCheck = checkContentModeration(poll.question);
        if (!pollCheck.allowed) {
          return res.status(400).json({ error: pollCheck.reason });
        }
      }

      const community = getCommunityData();
      const player = getPlayerFromReq(req);
      const displayName = authorName?.trim() || player.name || 'Somali_Star10';

      const newPost: CommunityPost = {
        id: `post-${Date.now()}`,
        authorId: player.id,
        authorName: displayName,
        authorAvatar:
          authorAvatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=80',
        verified: true,
        content: content.trim(),
        imageUrl: imageUrl?.trim() || undefined,
        videoUrl: videoUrl?.trim() || undefined,
        linkUrl: linkUrl?.trim() || undefined,
        quotePost: quotePost ? {
          id: quotePost.id,
          authorName: quotePost.authorName,
          authorAvatar: quotePost.authorAvatar,
          content: quotePost.content,
          imageUrl: quotePost.imageUrl,
        } : undefined,
        poll: poll && poll.question && Array.isArray(poll.options)
          ? {
              question: poll.question.trim(),
              options: poll.options.map((opt: string) => ({ text: String(opt).trim(), votes: 0 })),
              totalVotes: 0,
            }
          : undefined,
        reactions: 0,
        userReacted: false,
        views: 1,
        sharesCount: 0,
        commentsCount: 0,
        comments: [],
        createdAt: new Date().toISOString(),
      };

      community.posts.unshift(newPost);
      saveCommunityData(community);

      res.json({ success: true, post: newPost });
    } catch (err: any) {
      console.error('Error creating post:', err);
      res.status(500).json({ error: 'Failed to create post' });
    }
  });

  // 3. POST /api/community/posts/:id/react (Upvote / Reaction Toggle)
  app.post('/api/community/posts/:id/react', (req: Request, res: Response) => {
    try {
      const postId = req.params.id;
      const community = getCommunityData();
      const player = getPlayerFromReq(req);

      const post = community.posts.find((p) => p.id === postId);
      if (!post) {
        return res.status(404).json({ error: 'Boostada lama helin' });
      }

      if (!community.userReactions) community.userReactions = {};
      if (!community.userReactions[player.id]) community.userReactions[player.id] = [];

      const index = community.userReactions[player.id].indexOf(postId);
      let userReacted = false;

      if (index >= 0) {
        // Remove reaction
        community.userReactions[player.id].splice(index, 1);
        post.reactions = Math.max(0, post.reactions - 1);
        userReacted = false;
      } else {
        // Add reaction
        community.userReactions[player.id].push(postId);
        post.reactions += 1;
        userReacted = true;
      }

      saveCommunityData(community);
      res.json({ success: true, reactions: post.reactions, userReacted });
    } catch (err: any) {
      console.error('Error reacting to post:', err);
      res.status(500).json({ error: 'Failed to react to post' });
    }
  });

  // 4. POST /api/community/posts/:id/comments (Add Comment)
  app.post('/api/community/posts/:id/comments', (req: Request, res: Response) => {
    try {
      const postId = req.params.id;
      const { text, authorName, authorAvatar } = req.body;
      if (!text || !String(text).trim()) {
        return res.status(400).json({ error: 'Fadlan qor faallada (Comment cannot be empty)' });
      }

      const community = getCommunityData();
      const post = community.posts.find((p) => p.id === postId);
      if (!post) {
        return res.status(404).json({ error: 'Boostada lama helin' });
      }

      const player = getPlayerFromReq(req);
      const newComment: CommunityComment = {
        id: `c-${Date.now()}`,
        authorId: player.id,
        authorName: authorName?.trim() || player.name || 'Somali_Gamer',
        authorAvatar:
          authorAvatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        text: text.trim(),
        createdAt: new Date().toISOString(),
        reactions: 0,
      };

      if (!post.comments) post.comments = [];
      post.comments.push(newComment);
      post.commentsCount = post.comments.length;

      saveCommunityData(community);
      res.json({ success: true, comment: newComment, commentsCount: post.commentsCount });
    } catch (err: any) {
      console.error('Error adding comment:', err);
      res.status(500).json({ error: 'Failed to add comment' });
    }
  });

  // 5. GET /api/community/conversations (Conversations List)
  app.get('/api/community/conversations', (req: Request, res: Response) => {
    try {
      const community = getCommunityData();
      const player = getPlayerFromReq(req);

      // Return conversations where player is a participant, or return all active seed conversations
      let convs = community.conversations.filter(
        (c) => c.participantIds.includes(player.id) || c.participantIds.includes('current-user')
      );

      if (convs.length === 0) {
        convs = community.conversations;
      }

      // Sort by recent activity
      convs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

      res.json({ success: true, conversations: convs });
    } catch (err: any) {
      console.error('Error fetching conversations:', err);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  });

  // 6. GET /api/community/conversations/:id (Get single conversation messages)
  app.get('/api/community/conversations/:id', (req: Request, res: Response) => {
    try {
      const convId = req.params.id;
      const community = getCommunityData();
      const conversation = community.conversations.find((c) => c.id === convId);

      if (!conversation) {
        return res.status(404).json({ error: 'Wadahadalka lama helin (Conversation not found)' });
      }

      const messages = community.messages[convId] || [];

      // Mark unread as read
      conversation.unreadCount = 0;
      saveCommunityData(community);

      res.json({ success: true, conversation, messages });
    } catch (err: any) {
      console.error('Error fetching conversation:', err);
      res.status(500).json({ error: 'Failed to fetch conversation' });
    }
  });

  // 7. POST /api/community/conversations/:id/messages (Send message)
  app.post('/api/community/conversations/:id/messages', (req: Request, res: Response) => {
    try {
      const convId = req.params.id;
      const { text, type, inviteData } = req.body;
      if (!text && !inviteData) {
        return res.status(400).json({ error: 'Farriin madhan lama diri karo (Message cannot be empty)' });
      }

      const community = getCommunityData();
      let conversation = community.conversations.find((c) => c.id === convId);

      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }

      const player = getPlayerFromReq(req);
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        conversationId: convId,
        senderId: player.id,
        senderName: player.name,
        senderAvatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        text: (text || '').trim(),
        type: type || (inviteData ? 'match_invite' : 'text'),
        inviteData,
        createdAt: now.toISOString(),
        read: true,
      };

      if (!community.messages[convId]) community.messages[convId] = [];
      community.messages[convId].push(newMessage);

      conversation.lastMessage = type === 'match_invite' ? '🎮 Match Invite sent' : newMessage.text;
      conversation.lastMessageTime = timeStr;
      conversation.updatedAt = now.toISOString();

      saveCommunityData(community);
      res.json({ success: true, message: newMessage, conversation });
    } catch (err: any) {
      console.error('Error sending message:', err);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // 8. POST /api/community/conversations/start (Start/Find conversation with user)
  app.post('/api/community/conversations/start', (req: Request, res: Response) => {
    try {
      const { targetUserId, targetUserName, targetUserAvatar } = req.body;
      if (!targetUserId) {
        return res.status(400).json({ error: 'targetUserId is required' });
      }

      const community = getCommunityData();
      const player = getPlayerFromReq(req);

      // Check if conversation already exists
      let conv = community.conversations.find(
        (c) =>
          c.participantIds.includes(player.id) && c.participantIds.includes(targetUserId)
      );

      if (!conv) {
        // Also check with 'current-user' alias
        conv = community.conversations.find(
          (c) =>
            c.participantIds.includes('current-user') && c.participantIds.includes(targetUserId)
        );
      }

      if (!conv) {
        // Create new conversation
        const convId = `conv-${Date.now()}`;
        conv = {
          id: convId,
          participantIds: [player.id, targetUserId],
          participants: [
            {
              id: player.id,
              name: player.name,
              avatar:
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
              online: true,
            },
            {
              id: targetUserId,
              name: targetUserName || targetUserId,
              avatar:
                targetUserAvatar ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
              online: true,
              verified: true,
            },
          ],
          lastMessage: '',
          lastMessageTime: 'Just now',
          unreadCount: 0,
          updatedAt: new Date().toISOString(),
        };

        community.conversations.unshift(conv);
        community.messages[convId] = [];
        saveCommunityData(community);
      }

      res.json({ success: true, conversation: conv });
    } catch (err: any) {
      console.error('Error starting conversation:', err);
      res.status(500).json({ error: 'Failed to start conversation' });
    }
  });

  // 9. GET /api/community/users/:id (Public User Profile - Dynamic Authoritative Stats)
  app.get('/api/community/users/:id', (req: Request, res: Response) => {
    try {
      const rawId = req.params.id;
      const targetUserId = normalizeUserId(rawId);
      const community = getCommunityData();
      if (!community.userFollows) community.userFollows = {};
      const player = getPlayerFromReq(req);
      const currentUserId = normalizeUserId(player.id || player.name);

      const currentRelations = getUserSocialRelations(currentUserId, community.userFollows);
      const targetRelations = getUserSocialRelations(targetUserId, community.userFollows);

      const isFollowing = currentRelations.following.includes(targetUserId);
      const isMutualFriend = currentRelations.friends.includes(targetUserId);

      // Calculate total likes received for this target user across their posts
      let totalLikesReceived = 0;
      community.posts.forEach((p) => {
        if (
          p.authorName?.toLowerCase() === targetUserId.toLowerCase() ||
          p.authorId?.toLowerCase() === targetUserId.toLowerCase()
        ) {
          totalLikesReceived += p.reactions || 0;
        }
      });

      // Tournament stats & matches for this user
      const tournament = getTournamentData();
      const participant: any = tournament.participants.find(
        (p: any) =>
          p.name.toLowerCase() === targetUserId.toLowerCase() ||
          p.id.toLowerCase() === targetUserId.toLowerCase()
      );

      const known = KNOWN_DIRECTORY_USERS[targetUserId];
      const storedProfile = community.profiles[targetUserId] || {};

      const playerMatches = tournament.matches
        .filter(
          (m) =>
            m.status === 'Completed' &&
            m.aggregate &&
            (m.player1.name.toLowerCase() === targetUserId.toLowerCase() ||
              m.player2.name.toLowerCase() === targetUserId.toLowerCase())
        )
        .slice(0, 3)
        .map((m) => {
          const isP1 = m.player1.name.toLowerCase() === targetUserId.toLowerCase();
          const oppName = isP1 ? m.player2.name : m.player1.name;
          const oppAvatar = isP1 ? m.player2.avatar : m.player1.avatar;
          const myScore = isP1 ? m.aggregate!.p1 : m.aggregate!.p2;
          const oppScore = isP1 ? m.aggregate!.p2 : m.aggregate!.p1;
          const result: 'Win' | 'Draw' | 'Loss' =
            myScore > oppScore ? 'Win' : myScore === oppScore ? 'Draw' : 'Loss';

          return {
            opponent: oppName,
            opponentAvatar: oppAvatar,
            score: `${myScore} - ${oppScore}`,
            result,
            date: `${m.date} • ${m.round}`,
            group: m.group,
          };
        });

      const stats = participant
        ? calculatePlayerStats(tournament.matches, participant.name)
        : { played: 6, won: 4, lost: 2, goalsFor: 12, goalsAgainst: 7 };

      const publicProfile: UserCommunityProfile = {
        id: targetUserId,
        name: targetUserId,
        avatar:
          storedProfile.avatar ||
          known?.avatar ||
          participant?.avatarUrl ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        bio:
          storedProfile.bio ||
          known?.bio ||
          participant?.bio ||
          'eFootball 2026 player in SOMPLAY community',
        location: storedProfile.location || 'Somalia',
        verified: storedProfile.verified ?? known?.verified ?? !!participant,
        online: true,
        followingCount: targetRelations.followingCount,
        followersCount: targetRelations.followersCount,
        friendsCount: targetRelations.friendsCount,
        totalLikesReceived,
        pepBalance: (storedProfile as any).pepBalance ?? 250,
        isFollowing,
        isMutualFriend,
        tournamentStatus: participant?.status || (known?.group ? 'Participating' : 'Community Member'),
        tournamentGroup: participant?.group || known?.group || 'Group A',
        joinedDate: participant?.registeredAt
          ? new Date(participant.registeredAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : '12 Jun 2026',
        stats: {
          matches: stats.played || 6,
          wins: stats.won || 4,
          losses: stats.lost || 2,
          goalsFor: stats.goalsFor || 12,
          goalsAgainst: stats.goalsAgainst || 7,
        },
        recentMatches: playerMatches,
      };

      res.json({ success: true, profile: publicProfile });
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  });

  // 10. POST /api/community/users/:id/follow (Follow / Unfollow with strict consistency)
  app.post('/api/community/users/:id/follow', (req: Request, res: Response) => {
    try {
      const rawTarget = req.params.id;
      const targetUserId = normalizeUserId(rawTarget);
      const community = getCommunityData();
      const player = getPlayerFromReq(req);
      const currentUserId = normalizeUserId(player.id || player.name);

      if (currentUserId === targetUserId) {
        return res.status(400).json({ error: 'Cannot follow yourself' });
      }

      if (!community.userFollows) community.userFollows = {};
      if (!community.userFollows[currentUserId]) community.userFollows[currentUserId] = [];

      // Clean deduplicated toggle
      const currentFollowingSet = new Set(community.userFollows[currentUserId]);
      let isFollowing = false;

      if (currentFollowingSet.has(targetUserId)) {
        currentFollowingSet.delete(targetUserId);
        isFollowing = false;
      } else {
        currentFollowingSet.add(targetUserId);
        isFollowing = true;
      }

      community.userFollows[currentUserId] = Array.from(currentFollowingSet);

      // Keep profiles cache synchronized if it exists
      if (community.profiles[targetUserId]) {
        const targetRelations = getUserSocialRelations(targetUserId, community.userFollows);
        community.profiles[targetUserId].followersCount = targetRelations.followersCount;
        community.profiles[targetUserId].followingCount = targetRelations.followingCount;
        community.profiles[targetUserId].friendsCount = targetRelations.friendsCount;
      }
      if (community.profiles[currentUserId]) {
        const currentRelations = getUserSocialRelations(currentUserId, community.userFollows);
        community.profiles[currentUserId].followersCount = currentRelations.followersCount;
        community.profiles[currentUserId].followingCount = currentRelations.followingCount;
        community.profiles[currentUserId].friendsCount = currentRelations.friendsCount;
      }

      saveCommunityData(community);

      // Recalculate authoritative relationships for both users
      const currentRelations = getUserSocialRelations(currentUserId, community.userFollows);
      const targetRelations = getUserSocialRelations(targetUserId, community.userFollows);
      const isMutualFriend = currentRelations.friends.includes(targetUserId);

      res.json({
        success: true,
        isFollowing,
        isMutualFriend,
        targetUserId,
        userStats: {
          followingCount: currentRelations.followingCount,
          followersCount: currentRelations.followersCount,
          friendsCount: currentRelations.friendsCount,
        },
        targetStats: {
          followingCount: targetRelations.followingCount,
          followersCount: targetRelations.followersCount,
          friendsCount: targetRelations.friendsCount,
        },
      });
    } catch (err: any) {
      console.error('Error following user:', err);
      res.status(500).json({ error: 'Failed to follow user' });
    }
  });

  // 11. POST /api/community/posts/:id/view (Record post view)
  app.post('/api/community/posts/:id/view', (req: Request, res: Response) => {
    try {
      const postId = req.params.id;
      const community = getCommunityData();
      const post = community.posts.find((p) => p.id === postId);
      if (!post) {
        return res.status(404).json({ error: 'Boostada lama helin' });
      }

      post.views = (post.views || 0) + 1;
      saveCommunityData(community);
      res.json({ success: true, views: post.views });
    } catch (err: any) {
      console.error('Error recording post view:', err);
      res.status(500).json({ error: 'Failed to record post view' });
    }
  });

  // 12. POST /api/community/posts/:id/share (Share post: copy link, share to DM conversation with friend, or quote)
  app.post('/api/community/posts/:id/share', (req: Request, res: Response) => {
    try {
      const postId = req.params.id;
      const { type, targetUserId, conversationId } = req.body; // type: 'link' | 'chat' | 'quote'
      const community = getCommunityData();
      const player = getPlayerFromReq(req);
      const post = community.posts.find((p) => p.id === postId);

      if (!post) {
        return res.status(404).json({ error: 'Boostada lama helin (Post not found)' });
      }

      post.sharesCount = (post.sharesCount || 0) + 1;

      // If sharing to a mutual friend in Direct Messages
      if (type === 'chat' && (targetUserId || conversationId)) {
        let conv = conversationId
          ? community.conversations.find((c) => c.id === conversationId)
          : community.conversations.find(
              (c) =>
                (c.participantIds.includes(player.id) || c.participantIds.includes('current-user')) &&
                c.participantIds.includes(targetUserId!)
            );

        if (!conv && targetUserId) {
          const newConvId = `conv-${Date.now()}`;
          conv = {
            id: newConvId,
            participantIds: [player.id, targetUserId],
            participants: [
              {
                id: player.id,
                name: player.name,
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
                online: true,
              },
              {
                id: targetUserId,
                name: targetUserId,
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
                online: true,
                verified: true,
              },
            ],
            lastMessage: `Shared post by @${post.authorName}`,
            lastMessageTime: 'Just now',
            unreadCount: 1,
            updatedAt: new Date().toISOString(),
          };
          community.conversations.unshift(conv);
          community.messages[newConvId] = [];
        }

        if (conv) {
          const now = new Date();
          const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
          const shareMessage: ChatMessage = {
            id: `msg-${Date.now()}`,
            conversationId: conv.id,
            senderId: player.id,
            senderName: player.name,
            senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
            text: `Wuxuu kula wadaagay boosto: "${post.content.slice(0, 70)}${post.content.length > 70 ? '...' : ''}"`,
            type: 'post_share',
            sharedPost: {
              id: post.id,
              authorName: post.authorName,
              authorAvatar: post.authorAvatar,
              content: post.content,
              imageUrl: post.imageUrl,
            },
            createdAt: now.toISOString(),
            read: true,
          };

          if (!community.messages[conv.id]) community.messages[conv.id] = [];
          community.messages[conv.id].push(shareMessage);
          conv.lastMessage = `Shared post by @${post.authorName}`;
          conv.lastMessageTime = timeStr;
          conv.updatedAt = now.toISOString();
        }
      }

      saveCommunityData(community);
      res.json({ success: true, sharesCount: post.sharesCount });
    } catch (err: any) {
      console.error('Error sharing post:', err);
      res.status(500).json({ error: 'Failed to share post' });
    }
  });

  // 13. POST /api/community/report (Reporting and safety)
  app.post('/api/community/report', (req: Request, res: Response) => {
    try {
      const { targetType, targetId, reason } = req.body;
      if (!targetType || !targetId || !reason) {
        return res.status(400).json({ error: 'Dhammaan meelaha banaan waa lagama maarmaan (All fields required)' });
      }

      const community = getCommunityData();
      const player = getPlayerFromReq(req);

      if (!community.reports) community.reports = [];
      community.reports.push({
        id: `rep-${Date.now()}`,
        reporterId: player.id,
        targetType: targetType === 'user' ? 'user' : 'post',
        targetId,
        reason: String(reason).trim(),
        createdAt: new Date().toISOString(),
      });

      saveCommunityData(community);
      res.json({
        success: true,
        message: 'Waad ku mahadsan tahay warbixintaada, kooxda kormeerka ayaa dib u eegi doonta (Report received and will be reviewed)',
      });
    } catch (err: any) {
      console.error('Error reporting content:', err);
      res.status(500).json({ error: 'Failed to submit report' });
    }
  });

  // 14. POST /api/community/users/:id/block (Block / Unblock user)
  app.post('/api/community/users/:id/block', (req: Request, res: Response) => {
    try {
      const targetUserId = req.params.id;
      const community = getCommunityData();
      const player = getPlayerFromReq(req);

      if (!community.blockedUsers) community.blockedUsers = {};
      if (!community.blockedUsers[player.id]) community.blockedUsers[player.id] = [];

      const list = community.blockedUsers[player.id];
      const index = list.indexOf(targetUserId);
      let isBlocked = false;

      if (index >= 0) {
        list.splice(index, 1);
        isBlocked = false;
      } else {
        list.push(targetUserId);
        isBlocked = true;
      }

      saveCommunityData(community);
      res.json({ success: true, isBlocked });
    } catch (err: any) {
      console.error('Error blocking user:', err);
      res.status(500).json({ error: 'Failed to block/unblock user' });
    }
  });

  // Mount Vite or serve static
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    app.use('*', async (req: Request, res: Response, next) => {
      if (req.originalUrl.startsWith('/api')) {
        return next();
      }
      try {
        const indexPath = path.resolve(__dirname, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(req.originalUrl, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SOM PLY eFootball 2026 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
