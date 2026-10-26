import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { readJsonFile, writeJsonFile } from './src/server/db';
import { CoinPackage, Order, PaymentConfig, PlayerCard, DreamSquadAnalysisResponse, Playstyle } from './src/types';

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

  // API: Start Order (Step 1 -> Creates single persistent order & generates code)
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
      return res.status(400).json({ error: 'Fadlan geli cinwaanka email-kaaga.' });
    }
    if (!efootballId || !String(efootballId).trim()) {
      return res.status(400).json({ error: 'Fadlan geli eFootball Player ID-gaaga.' });
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
      platform: platform === 'Apple / iOS' ? 'Apple / iOS' : 'Android',
      verificationCode: '',
      isEmailVerified: false,
      status: 'Pending Payment',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const orders = getOrders();
    orders.unshift(newOrder);
    writeJsonFile('orders.json', orders);

    console.log(`[Order Started] ID: ${newOrder.id} for ${newOrder.efootballId}`);
    res.status(201).json({
      success: true,
      order: { ...newOrder, verificationCode: undefined },
    });
  });

  // API: Verify Custom Code (6 to 8 chars: any language, Arabic, English, numbers, symbols)
  app.post('/api/orders/:id/verify-code', (req: Request, res: Response) => {
    const { id } = req.params;
    const { code } = req.body;
    const orders = getOrders();
    const order = orders.find((o) => o.id.toLowerCase() === id.toLowerCase());
    if (!order) return res.status(404).json({ error: 'Dalabka lama helin' });

    const normalized = String(code || '').trim();
    if (normalized.length < 6 || normalized.length > 8) {
      return res.status(400).json({
        error: 'Koodhka xaqiijintu waa inuu u dhexeeyaa 6 ilaa 8 xaraf ama tiro / Verification code must be 6 to 8 characters / يجب أن يتكون رمز التحقق من 6 إلى 8 خانات.',
      });
    }

    // Accepts manual verification code received from admin via email
    order.verificationCode = normalized;
    order.isEmailVerified = true;
    order.updatedAt = new Date().toISOString();
    writeJsonFile('orders.json', orders);
    console.log(`[Order Verified] ID: ${order.id} Code entered: "${normalized}"`);

    return res.json({
      success: true,
      order: { ...order, verificationCode: undefined },
      message: 'Koodhka waa la aqbalay / Code accepted successfully / تم قبول الرمز وجارٍ المتابعة',
    });
  });

  // API: Resend Code
  app.post('/api/orders/:id/resend-code', (req: Request, res: Response) => {
    const { id } = req.params;
    const orders = getOrders();
    const order = orders.find((o) => o.id.toLowerCase() === id.toLowerCase());
    if (!order) return res.status(404).json({ error: 'Dalabka lama helin' });

    order.verificationCode = String(Math.floor(100000 + Math.random() * 900000));
    order.updatedAt = new Date().toISOString();
    writeJsonFile('orders.json', orders);

    res.json({ success: true, message: 'Koodh cusub ayaa loo diray email-kaaga.' });
  });

  // API: Submit Payment Details (Step 3 & 4 -> updates same persistent order)
  app.post('/api/orders/:id/payment', (req: Request, res: Response) => {
    const { id } = req.params;
    const { paymentMethod, transactionRef, receiptImage } = req.body;
    const orders = getOrders();
    const order = orders.find((o) => o.id.toLowerCase() === id.toLowerCase());
    if (!order) return res.status(404).json({ error: 'Dalabka lama helin' });

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
