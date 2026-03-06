import type Database from 'better-sqlite3'

interface SpotSeed {
  id: string
  number: number
  service: 'EEE' | 'EEE50' | 'EE' | 'NAT' | 'CHALET'
  status: 'REGULAR' | 'SEASONAL' | 'BACKUP' | 'GROUP'
  price_per_night: number
  longueur: number | null
  largeur: number | null
  soleil: number | null
  motorise_range_min: number | null
  motorise_range_max: number | null
  fifthwheel_range_min: number | null
  fifthwheel_range_max: number | null
  roulotte_range_min: number | null
  roulotte_range_max: number | null
  campeur_porte: number
  tente_roulotte: number
  tente: number
  sol: string | null
  particularite: string | null
}

function s(
  number: number,
  service: SpotSeed['service'],
  status: SpotSeed['status'],
  opts: Partial<Omit<SpotSeed, 'id' | 'number' | 'service' | 'status' | 'price_per_night'>> & { price_per_night?: number } = {}
): SpotSeed {
  const defaultPrices: Record<string, number> = {
    EEE: 52, EEE50: 57, EE: 47, NAT: 42, CHALET: 165,
  }
  return {
    id: `spot-${number}`,
    number,
    service,
    status,
    price_per_night: opts.price_per_night ?? defaultPrices[service],
    longueur: opts.longueur ?? null,
    largeur: opts.largeur ?? null,
    soleil: opts.soleil ?? null,
    motorise_range_min: opts.motorise_range_min ?? null,
    motorise_range_max: opts.motorise_range_max ?? null,
    fifthwheel_range_min: opts.fifthwheel_range_min ?? null,
    fifthwheel_range_max: opts.fifthwheel_range_max ?? null,
    roulotte_range_min: opts.roulotte_range_min ?? null,
    roulotte_range_max: opts.roulotte_range_max ?? null,
    campeur_porte: opts.campeur_porte ?? 0,
    tente_roulotte: opts.tente_roulotte ?? 0,
    tente: opts.tente ?? 0,
    sol: opts.sol ?? null,
    particularite: opts.particularite ?? null,
  }
}

const SPOTS: SpotSeed[] = [
  // --- Chalets ---
  s(1, 'CHALET', 'SEASONAL'),
  s(5, 'CHALET', 'REGULAR', { particularite: '1ere chambre: lit queen - 2eme chambre: lit double - 3eme chambre: 2 lits simples superposés' }),
  s(27, 'CHALET', 'REGULAR', { particularite: '1 chambre avec lit queen et un divan-lit double dans le salon' }),
  s(29, 'CHALET', 'REGULAR', { particularite: '1ere chambre avec lit queen, 2eme chambre avec 2 petits lits simples superposés et un divan-lit double dans le salon' }),
  s(34, 'CHALET', 'REGULAR', { particularite: '1ere chambre avec lit double, 2 lits simples superposés et un futon dans le salon' }),
  s(38, 'CHALET', 'REGULAR', { particularite: 'Une chambre avec lit double, un futon dans la cuisine et un divan-lit double dans le salon' }),
  s(198, 'CHALET', 'REGULAR', { particularite: '1ere chambre avec lit queen, 2eme chambre avec un lit double en bas et un lit simple en haut, futon dans le salon' }),

  // --- EEE50 Saisonniers ---
  s(2, 'EEE50', 'SEASONAL'), s(3, 'EEE50', 'SEASONAL'), s(4, 'EEE50', 'SEASONAL'),
  s(6, 'EEE50', 'SEASONAL'), s(7, 'EEE50', 'SEASONAL'), s(9, 'EEE50', 'SEASONAL'),
  s(10, 'EEE50', 'SEASONAL'), s(11, 'EEE50', 'SEASONAL'), s(12, 'EEE50', 'SEASONAL'),
  s(20, 'EEE50', 'SEASONAL'), s(26, 'EEE50', 'SEASONAL'), s(28, 'EEE50', 'SEASONAL'),
  s(30, 'EEE50', 'SEASONAL'), s(31, 'EEE50', 'SEASONAL'), s(32, 'EEE50', 'SEASONAL'),
  s(33, 'EEE50', 'SEASONAL'), s(35, 'EEE50', 'SEASONAL'), s(37, 'EEE50', 'SEASONAL'),
  s(42, 'EEE50', 'SEASONAL'), s(200, 'EEE50', 'SEASONAL'), s(202, 'EEE50', 'SEASONAL'),
  s(204, 'EEE50', 'SEASONAL'), s(206, 'EEE50', 'SEASONAL'), s(208, 'EEE50', 'SEASONAL'),
  s(210, 'EEE50', 'SEASONAL'), s(212, 'EEE50', 'SEASONAL'), s(214, 'EEE50', 'SEASONAL'),
  s(216, 'EEE50', 'SEASONAL'),

  // --- EEE50 Backup ---
  s(36, 'EEE50', 'BACKUP'),

  // --- EEE50 Réguliers ---
  s(14, 'EEE50', 'REGULAR', { longueur: 60, largeur: 26, soleil: 50, motorise_range_min: 20, motorise_range_max: 40, fifthwheel_range_min: 25, fifthwheel_range_max: 40, roulotte_range_min: 25, roulotte_range_max: 40, sol: 'GRAVEL' }),
  s(16, 'EEE50', 'REGULAR', { longueur: 45, largeur: 25, soleil: 60, motorise_range_min: 20, motorise_range_max: 38, fifthwheel_range_min: 25, fifthwheel_range_max: 38, roulotte_range_min: 25, roulotte_range_max: 38, sol: 'GRAVEL' }),
  s(51, 'EEE50', 'REGULAR', { longueur: 45, largeur: 35, soleil: 90, motorise_range_min: 25, motorise_range_max: 40, fifthwheel_range_min: 25, fifthwheel_range_max: 40, roulotte_range_min: 25, roulotte_range_max: 40, sol: 'GRAVEL_GAZON' }),
  s(77, 'EEE50', 'REGULAR', { longueur: 46, largeur: 38, soleil: 100, motorise_range_min: 27, motorise_range_max: 42, fifthwheel_range_min: 30, fifthwheel_range_max: 42, roulotte_range_min: 30, roulotte_range_max: 42, sol: 'GRAVEL_GAZON', particularite: 'Coin de rue' }),
  s(103, 'EEE50', 'REGULAR', { longueur: 45, largeur: 21, soleil: 70, motorise_range_min: 0, motorise_range_max: 35, fifthwheel_range_min: 0, fifthwheel_range_max: 35, roulotte_range_min: 0, roulotte_range_max: 35, sol: 'ASPHALTE', particularite: 'Entrée direct' }),

  // --- NAT Backup ---
  s(8, 'NAT', 'BACKUP'), s(905, 'NAT', 'BACKUP'),

  // --- EEE Saisonniers ---
  s(41, 'EEE', 'SEASONAL'), s(43, 'EEE', 'SEASONAL'), s(44, 'EEE', 'SEASONAL'),
  s(45, 'EEE', 'SEASONAL'), s(46, 'EEE', 'SEASONAL'), s(47, 'EEE', 'SEASONAL'),
  s(48, 'EEE', 'SEASONAL'), s(49, 'EEE', 'SEASONAL'), s(50, 'EEE', 'SEASONAL'),
  s(62, 'EEE', 'SEASONAL'), s(64, 'EEE', 'SEASONAL'), s(67, 'EEE', 'SEASONAL'),
  s(69, 'EEE', 'SEASONAL'), s(70, 'EEE', 'SEASONAL'), s(71, 'EEE', 'SEASONAL'),
  s(72, 'EEE', 'SEASONAL'), s(73, 'EEE', 'SEASONAL'), s(74, 'EEE', 'SEASONAL'),
  s(75, 'EEE', 'SEASONAL'), s(76, 'EEE', 'SEASONAL'), s(80, 'EEE', 'SEASONAL'),
  s(81, 'EEE', 'SEASONAL'), s(82, 'EEE', 'SEASONAL'), s(83, 'EEE', 'SEASONAL'),
  s(84, 'EEE', 'SEASONAL'), s(85, 'EEE', 'SEASONAL'), s(86, 'EEE', 'SEASONAL'),
  s(87, 'EEE', 'SEASONAL'), s(89, 'EEE', 'SEASONAL'), s(90, 'EEE', 'SEASONAL'),
  s(91, 'EEE', 'SEASONAL'), s(113, 'EEE', 'SEASONAL'), s(115, 'EEE', 'SEASONAL'),
  s(117, 'EEE', 'SEASONAL'), s(119, 'EEE', 'SEASONAL'), s(121, 'EEE', 'SEASONAL'),
  s(123, 'EEE', 'SEASONAL'),

  // --- EEE Backup ---
  s(22, 'EEE', 'BACKUP'), s(68, 'EEE', 'BACKUP'), s(88, 'EEE', 'BACKUP'), s(125, 'EEE', 'BACKUP'),

  // --- EEE Réguliers ---
  s(15, 'EEE', 'REGULAR', { longueur: 30, largeur: 22, soleil: 50, motorise_range_min: 0, motorise_range_max: 29, fifthwheel_range_min: 0, fifthwheel_range_max: 29, roulotte_range_min: 0, roulotte_range_max: 29, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL_GAZON' }),
  s(18, 'EEE', 'REGULAR', { longueur: 45, largeur: 25, soleil: 60, motorise_range_min: 20, motorise_range_max: 35, fifthwheel_range_min: 20, fifthwheel_range_max: 30, roulotte_range_min: 20, roulotte_range_max: 35, sol: 'GRAVEL', particularite: 'Forêt derrière' }),
  s(23, 'EEE', 'REGULAR', { longueur: 30, largeur: 30, soleil: 60, motorise_range_min: 0, motorise_range_max: 28, fifthwheel_range_min: 0, fifthwheel_range_max: 28, roulotte_range_min: 0, roulotte_range_max: 28, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL_GAZON' }),
  s(24, 'EEE', 'REGULAR', { longueur: 45, largeur: 35, soleil: 90, motorise_range_min: 25, motorise_range_max: 40, fifthwheel_range_min: 25, fifthwheel_range_max: 40, roulotte_range_min: 25, roulotte_range_max: 40, sol: 'GRAVEL_GAZON', particularite: 'Forêt derrière' }),
  s(25, 'EEE', 'REGULAR', { longueur: 38, largeur: 27, soleil: 90, motorise_range_min: 20, motorise_range_max: 35, fifthwheel_range_min: 20, fifthwheel_range_max: 35, roulotte_range_min: 20, roulotte_range_max: 35, sol: 'GRAVEL_GAZON', particularite: 'Coin de rue' }),
  s(52, 'EEE', 'REGULAR', { longueur: 50, largeur: 26, soleil: 40, motorise_range_min: 27, motorise_range_max: 45, fifthwheel_range_min: 27, fifthwheel_range_max: 45, roulotte_range_min: 27, roulotte_range_max: 45, sol: 'GRAVEL' }),
  s(53, 'EEE', 'REGULAR', { longueur: 43, largeur: 22, soleil: 90, motorise_range_min: 0, motorise_range_max: 35, fifthwheel_range_min: 0, fifthwheel_range_max: 35, roulotte_range_min: 0, roulotte_range_max: 35, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL', particularite: 'Communique 55' }),
  s(54, 'EEE', 'REGULAR', { longueur: 40, largeur: 24, soleil: 60, motorise_range_min: 0, motorise_range_max: 27, fifthwheel_range_min: 0, fifthwheel_range_max: 27, roulotte_range_min: 0, roulotte_range_max: 27, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL' }),
  s(55, 'EEE', 'REGULAR', { longueur: 31, largeur: 37, soleil: 90, motorise_range_min: 0, motorise_range_max: 29, fifthwheel_range_min: 0, fifthwheel_range_max: 29, roulotte_range_min: 0, roulotte_range_max: 29, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL_SABLE', particularite: 'Communique 53' }),
  s(56, 'EEE', 'REGULAR', { longueur: 50, largeur: 25, soleil: 40, motorise_range_min: 25, motorise_range_max: 45, fifthwheel_range_min: 25, fifthwheel_range_max: 45, roulotte_range_min: 25, roulotte_range_max: 45, sol: 'GRAVEL' }),
  s(58, 'EEE', 'REGULAR', { longueur: 50, largeur: 25, soleil: 40, motorise_range_min: 25, motorise_range_max: 45, fifthwheel_range_min: 25, fifthwheel_range_max: 45, roulotte_range_min: 25, roulotte_range_max: 45, sol: 'GRAVEL' }),
  s(60, 'EEE', 'REGULAR', { longueur: 60, largeur: 30, soleil: 40, motorise_range_min: 30, motorise_range_max: 45, fifthwheel_range_min: 30, fifthwheel_range_max: 45, roulotte_range_min: 30, roulotte_range_max: 45, sol: 'GRAVEL' }),
  s(66, 'EEE', 'REGULAR', { longueur: 35, largeur: 24, soleil: 65, motorise_range_min: 0, motorise_range_max: 28, fifthwheel_range_min: 0, fifthwheel_range_max: 28, roulotte_range_min: 0, roulotte_range_max: 28, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL', particularite: 'Entrée direct' }),
  s(78, 'EEE', 'REGULAR', { longueur: 42, largeur: 35, soleil: 100, motorise_range_min: 0, motorise_range_max: 30, fifthwheel_range_min: 0, fifthwheel_range_max: 30, roulotte_range_min: 0, roulotte_range_max: 30, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL_GAZON' }),
  s(92, 'EEE', 'REGULAR', { longueur: 55, largeur: 25, soleil: 40, motorise_range_min: 0, motorise_range_max: 35, fifthwheel_range_min: 0, fifthwheel_range_max: 35, roulotte_range_min: 0, roulotte_range_max: 35, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL', particularite: 'Forêt derrière' }),
  s(93, 'EEE', 'REGULAR', { longueur: 33, largeur: 22, soleil: 50, motorise_range_min: 0, motorise_range_max: 26, fifthwheel_range_min: 0, fifthwheel_range_max: 26, roulotte_range_min: 0, roulotte_range_max: 26, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL' }),
  s(94, 'EEE', 'REGULAR', { longueur: 38, largeur: 22, soleil: 40, motorise_range_min: 0, motorise_range_max: 30, fifthwheel_range_min: 0, fifthwheel_range_max: 30, roulotte_range_min: 0, roulotte_range_max: 30, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL', particularite: 'Forêt derrière' }),
  s(95, 'EEE', 'REGULAR', { longueur: 35, largeur: 24, soleil: 50, motorise_range_min: 0, motorise_range_max: 26, fifthwheel_range_min: 0, fifthwheel_range_max: 26, roulotte_range_min: 0, roulotte_range_max: 26, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL' }),
  s(96, 'EEE', 'REGULAR', { longueur: 40, largeur: 23, soleil: 5, motorise_range_min: 0, motorise_range_max: 32, fifthwheel_range_min: 0, fifthwheel_range_max: 32, roulotte_range_min: 0, roulotte_range_max: 32, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL', particularite: 'Intime' }),
  s(97, 'EEE', 'REGULAR', { longueur: 31, largeur: 23, soleil: 50, motorise_range_min: 0, motorise_range_max: 30, fifthwheel_range_min: 0, fifthwheel_range_max: 30, roulotte_range_min: 0, roulotte_range_max: 30, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL' }),
  s(99, 'EEE', 'REGULAR', { longueur: 31, largeur: 28, soleil: 50, motorise_range_min: 0, motorise_range_max: 30, fifthwheel_range_min: 0, fifthwheel_range_max: 30, roulotte_range_min: 0, roulotte_range_max: 30, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL' }),
  s(105, 'EEE', 'REGULAR', { longueur: 30, largeur: 20, soleil: 80, motorise_range_min: 0, motorise_range_max: 25, roulotte_range_min: 0, roulotte_range_max: 23, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL' }),
  s(107, 'EEE', 'REGULAR', { longueur: 35, largeur: 25, soleil: 70, motorise_range_min: 0, motorise_range_max: 30, fifthwheel_range_min: 0, fifthwheel_range_max: 27, roulotte_range_min: 0, roulotte_range_max: 27, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL' }),
  s(108, 'EEE', 'REGULAR', { longueur: 33, largeur: 25, soleil: 40, motorise_range_min: 0, motorise_range_max: 30, fifthwheel_range_min: 0, fifthwheel_range_max: 26, roulotte_range_min: 0, roulotte_range_max: 28, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL', particularite: 'Communique 150' }),
  s(109, 'EEE', 'REGULAR', { longueur: 35, largeur: 20, soleil: 60, motorise_range_min: 0, motorise_range_max: 30, fifthwheel_range_min: 0, fifthwheel_range_max: 27, roulotte_range_min: 0, roulotte_range_max: 30, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL' }),
  s(110, 'EEE', 'REGULAR', { longueur: 45, largeur: 26, soleil: 50, motorise_range_min: 20, motorise_range_max: 32, fifthwheel_range_min: 20, fifthwheel_range_max: 30, roulotte_range_min: 20, roulotte_range_max: 30, sol: 'GRAVEL_SABLE' }),
  s(111, 'EEE', 'REGULAR', { longueur: 33, largeur: 27, soleil: 50, motorise_range_min: 0, motorise_range_max: 26, fifthwheel_range_min: 0, fifthwheel_range_max: 25, roulotte_range_min: 0, roulotte_range_max: 25, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL' }),
  s(112, 'EEE', 'REGULAR', { longueur: 43, largeur: 25, soleil: 40, motorise_range_min: 20, motorise_range_max: 32, fifthwheel_range_min: 20, fifthwheel_range_max: 30, roulotte_range_min: 20, roulotte_range_max: 30, sol: 'GRAVEL_SABLE' }),
  s(114, 'EEE', 'REGULAR', { longueur: 43, largeur: 21, soleil: 30, motorise_range_min: 20, motorise_range_max: 32, fifthwheel_range_min: 20, fifthwheel_range_max: 30, roulotte_range_min: 20, roulotte_range_max: 30, sol: 'GRAVEL_SABLE' }),
  s(116, 'EEE', 'REGULAR', { longueur: 38, largeur: 28, soleil: 40, motorise_range_min: 20, motorise_range_max: 30, fifthwheel_range_min: 20, fifthwheel_range_max: 28, roulotte_range_min: 20, roulotte_range_max: 28, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL' }),
  s(118, 'EEE', 'REGULAR', { longueur: 35, largeur: 23, soleil: 30, motorise_range_min: 0, motorise_range_max: 28, fifthwheel_range_min: 0, fifthwheel_range_max: 25, roulotte_range_min: 0, roulotte_range_max: 25, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL_SABLE', particularite: 'Intime' }),
  s(120, 'EEE', 'REGULAR', { longueur: 40, largeur: 28, soleil: 70, motorise_range_min: 15, motorise_range_max: 30, fifthwheel_range_min: 15, fifthwheel_range_max: 27, roulotte_range_min: 15, roulotte_range_max: 30, sol: 'GRAVEL_SABLE', particularite: 'Difficile à reculer' }),
  s(122, 'EEE', 'REGULAR', { longueur: 43, largeur: 23, soleil: 70, motorise_range_min: 15, motorise_range_max: 30, fifthwheel_range_min: 15, fifthwheel_range_max: 28, roulotte_range_min: 15, roulotte_range_max: 28, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL' }),
  s(124, 'EEE', 'REGULAR', { longueur: 48, largeur: 23, soleil: 75, motorise_range_min: 15, motorise_range_max: 32, fifthwheel_range_min: 15, fifthwheel_range_max: 30, roulotte_range_min: 15, roulotte_range_max: 30, sol: 'GRAVEL', particularite: 'Entrée direct' }),
  s(126, 'EEE', 'REGULAR', { longueur: 30, largeur: 20, soleil: 70, motorise_range_min: 0, motorise_range_max: 26, fifthwheel_range_min: 0, fifthwheel_range_max: 25, roulotte_range_min: 0, roulotte_range_max: 25, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL', particularite: 'Entrée direct' }),
  s(148, 'EEE', 'REGULAR', { longueur: 33, largeur: 20, soleil: 40, motorise_range_min: 0, motorise_range_max: 25, fifthwheel_range_min: 0, fifthwheel_range_max: 20, roulotte_range_min: 0, roulotte_range_max: 22, campeur_porte: 1, tente_roulotte: 1, tente: 1, sol: 'GRAVEL_SABLE', particularite: 'Forêt derrière' }),
  s(149, 'EEE', 'REGULAR', { longueur: 45, largeur: 24, soleil: 40, motorise_range_min: 0, motorise_range_max: 35, fifthwheel_range_min: 0, fifthwheel_range_max: 30, roulotte_range_min: 0, roulotte_range_max: 32, sol: 'GRAVEL', particularite: 'Entrée direct' }),
  s(150, 'EEE', 'REGULAR', { longueur: 37, largeur: 22, soleil: 40, motorise_range_min: 0, motorise_range_max: 27, fifthwheel_range_min: 0, fifthwheel_range_max: 25, roulotte_range_min: 0, roulotte_range_max: 27, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL_SABLE', particularite: 'Difficile à reculer, rue étroite' }),
  s(151, 'EEE', 'REGULAR', { longueur: 32, largeur: 20, soleil: 40, motorise_range_min: 0, motorise_range_max: 26, fifthwheel_range_min: 0, fifthwheel_range_max: 22, roulotte_range_min: 0, roulotte_range_max: 25, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL_SABLE', particularite: 'Difficile à reculer, rue étroite' }),
  s(152, 'EEE', 'REGULAR', { longueur: 30, largeur: 18, soleil: 40, motorise_range_min: 0, motorise_range_max: 26, fifthwheel_range_min: 0, fifthwheel_range_max: 22, roulotte_range_min: 0, roulotte_range_max: 24, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL_SABLE', particularite: 'Difficile à reculer, rue étroite' }),
  s(153, 'EEE', 'REGULAR', { longueur: 30, largeur: 18, soleil: 40, motorise_range_min: 0, motorise_range_max: 25, fifthwheel_range_min: 0, fifthwheel_range_max: 20, roulotte_range_min: 0, roulotte_range_max: 23, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL_SABLE', particularite: 'Difficile à reculer, rue étroite' }),
  s(154, 'EEE', 'REGULAR', { longueur: 30, largeur: 15, soleil: 40, motorise_range_min: 0, motorise_range_max: 25, fifthwheel_range_min: 0, fifthwheel_range_max: 20, roulotte_range_min: 0, roulotte_range_max: 23, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL_SABLE', particularite: 'Difficile à reculer, rue étroite' }),
  s(155, 'EEE', 'REGULAR', { longueur: 38, largeur: 22, soleil: 30, motorise_range_min: 0, motorise_range_max: 27, fifthwheel_range_min: 0, fifthwheel_range_max: 25, roulotte_range_min: 0, roulotte_range_max: 25, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL_SABLE', particularite: 'Difficile à reculer, rue étroite' }),
  s(156, 'EEE', 'REGULAR', { longueur: 35, largeur: 19, soleil: 30, motorise_range_min: 0, motorise_range_max: 27, fifthwheel_range_min: 0, fifthwheel_range_max: 25, roulotte_range_min: 0, roulotte_range_max: 25, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL_SABLE', particularite: 'Difficile à reculer, rue étroite' }),
  s(157, 'EEE', 'REGULAR', { longueur: 32, largeur: 20, soleil: 30, motorise_range_min: 0, motorise_range_max: 26, fifthwheel_range_min: 0, fifthwheel_range_max: 24, roulotte_range_min: 0, roulotte_range_max: 25, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL_SABLE', particularite: 'Difficile à reculer, rue étroite' }),
  s(158, 'EEE', 'REGULAR', { longueur: 25, largeur: 22, soleil: 90, motorise_range_min: 0, motorise_range_max: 21, roulotte_range_min: 0, roulotte_range_max: 20, campeur_porte: 1, tente_roulotte: 1, tente: 1, sol: 'GRAVEL_SABLE', particularite: 'Pas intime, en triangle' }),

  // --- EE Réguliers ---
  s(98, 'EE', 'REGULAR', { longueur: 34, largeur: 18, soleil: 50, motorise_range_min: 0, motorise_range_max: 20, roulotte_range_min: 0, roulotte_range_max: 17, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL', particularite: 'Pas intime' }),
  s(100, 'EE', 'REGULAR', { longueur: 39, largeur: 39, soleil: 60, motorise_range_min: 0, motorise_range_max: 25, roulotte_range_min: 0, roulotte_range_max: 20, campeur_porte: 1, tente_roulotte: 1, tente: 1, sol: 'GRAVEL_SABLE' }),
  s(101, 'EE', 'REGULAR', { longueur: 25, largeur: 18, soleil: 40, motorise_range_min: 0, motorise_range_max: 25, roulotte_range_min: 0, roulotte_range_max: 22, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL', particularite: 'Forêt derrière' }),
  s(102, 'EE', 'REGULAR', { longueur: 42, largeur: 21, soleil: 40, motorise_range_min: 0, motorise_range_max: 25, roulotte_range_min: 0, roulotte_range_max: 22, campeur_porte: 1, tente_roulotte: 1, tente: 1, sol: 'SABLE', particularite: 'Communique 127' }),
  s(104, 'EE', 'REGULAR', { longueur: 50, largeur: 18, soleil: 40, motorise_range_min: 0, motorise_range_max: 25, fifthwheel_range_min: 0, fifthwheel_range_max: 25, roulotte_range_min: 0, roulotte_range_max: 25, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL' }),
  s(106, 'EE', 'REGULAR', { longueur: 36, largeur: 25, soleil: 50, motorise_range_min: 0, motorise_range_max: 28, fifthwheel_range_min: 0, fifthwheel_range_max: 25, roulotte_range_min: 0, roulotte_range_max: 25, campeur_porte: 1, tente_roulotte: 1, tente: 1, sol: 'GRAVEL_SABLE' }),
  s(127, 'EE', 'REGULAR', { longueur: 35, largeur: 18, soleil: 40, motorise_range_min: 0, motorise_range_max: 25, fifthwheel_range_min: 0, fifthwheel_range_max: 22, roulotte_range_min: 0, roulotte_range_max: 22, campeur_porte: 1, tente_roulotte: 1, tente: 1, sol: 'SABLE', particularite: 'Communique 102' }),
  s(128, 'EE', 'REGULAR', { longueur: 48, largeur: 19, soleil: 20, motorise_range_min: 0, motorise_range_max: 26, fifthwheel_range_min: 0, fifthwheel_range_max: 22, roulotte_range_min: 0, roulotte_range_max: 22, campeur_porte: 1, tente_roulotte: 1, tente: 1, sol: 'GRAVEL_SABLE', particularite: 'Communique 130' }),
  s(129, 'EE', 'REGULAR', { longueur: 30, largeur: 18, soleil: 50, motorise_range_min: 0, motorise_range_max: 26, fifthwheel_range_min: 0, fifthwheel_range_max: 22, roulotte_range_min: 0, roulotte_range_max: 23, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL' }),
  s(130, 'EE', 'REGULAR', { longueur: 40, largeur: 23, soleil: 20, motorise_range_min: 0, motorise_range_max: 26, fifthwheel_range_min: 0, fifthwheel_range_max: 22, roulotte_range_min: 0, roulotte_range_max: 22, campeur_porte: 1, tente_roulotte: 1, tente: 1, sol: 'SABLE', particularite: 'Communique 128' }),
  s(131, 'EE', 'REGULAR', { longueur: 35, largeur: 18, soleil: 80, motorise_range_min: 0, motorise_range_max: 28, fifthwheel_range_min: 0, fifthwheel_range_max: 25, roulotte_range_min: 0, roulotte_range_max: 25, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL' }),
  s(132, 'EE', 'REGULAR', { longueur: 35, largeur: 27, soleil: 50, motorise_range_min: 0, motorise_range_max: 26, fifthwheel_range_min: 0, fifthwheel_range_max: 22, roulotte_range_min: 0, roulotte_range_max: 25, campeur_porte: 1, tente_roulotte: 1, tente: 1, sol: 'GRAVEL_SABLE' }),
  s(133, 'EE', 'REGULAR', { longueur: 40, largeur: 20, soleil: 90, motorise_range_min: 0, motorise_range_max: 30, fifthwheel_range_min: 0, fifthwheel_range_max: 30, roulotte_range_min: 0, roulotte_range_max: 30, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL', particularite: 'Recule bien' }),
  s(134, 'EE', 'REGULAR', { longueur: 37, largeur: 23, soleil: 20, motorise_range_min: 0, motorise_range_max: 25, fifthwheel_range_min: 0, fifthwheel_range_max: 22, roulotte_range_min: 0, roulotte_range_max: 22, campeur_porte: 1, tente_roulotte: 1, tente: 1, sol: 'SABLE', particularite: 'Coin de rue, boisé' }),
  s(135, 'EE', 'REGULAR', { longueur: 45, largeur: 20, soleil: 90, motorise_range_min: 0, motorise_range_max: 30, fifthwheel_range_min: 0, fifthwheel_range_max: 30, roulotte_range_min: 0, roulotte_range_max: 30, campeur_porte: 1, tente_roulotte: 1, sol: 'GRAVEL', particularite: 'Recule bien' }),
  s(145, 'EE', 'REGULAR', { longueur: 40, largeur: 20, soleil: 20, motorise_range_min: 0, motorise_range_max: 27, fifthwheel_range_min: 0, fifthwheel_range_max: 25, roulotte_range_min: 0, roulotte_range_max: 25, campeur_porte: 1, tente_roulotte: 1, tente: 1, sol: 'SABLE', particularite: 'Communique 144-143' }),
  s(146, 'EE', 'REGULAR', { longueur: 42, largeur: 30, soleil: 20, motorise_range_min: 0, motorise_range_max: 25, roulotte_range_min: 0, roulotte_range_max: 22, campeur_porte: 1, tente_roulotte: 1, tente: 1, sol: 'SABLE', particularite: 'Forêt derrière' }),
  s(147, 'EE', 'REGULAR', { longueur: 43, largeur: 17, soleil: 20, motorise_range_min: 0, motorise_range_max: 25, roulotte_range_min: 0, roulotte_range_max: 22, campeur_porte: 1, tente_roulotte: 1, tente: 1, sol: 'SABLE', particularite: 'Forêt derrière' }),

  // --- EE Backup ---
  s(901, 'EE', 'BACKUP'), s(902, 'EE', 'BACKUP'), s(903, 'EE', 'BACKUP'), s(904, 'EE', 'BACKUP'),

  // --- EE Groupe ---
  s(900, 'EE', 'GROUP'),

  // --- NAT Réguliers ---
  s(136, 'NAT', 'REGULAR', { longueur: 39, largeur: 19, soleil: 20, motorise_range_min: 0, motorise_range_max: 25, fifthwheel_range_min: 0, fifthwheel_range_max: 20, roulotte_range_min: 0, roulotte_range_max: 20, campeur_porte: 1, tente_roulotte: 1, tente: 1, sol: 'SABLE', particularite: 'Communique 137, forêt derrière' }),
  s(137, 'NAT', 'REGULAR', { longueur: 39, largeur: 22, soleil: 20, motorise_range_min: 0, motorise_range_max: 25, fifthwheel_range_min: 0, fifthwheel_range_max: 20, roulotte_range_min: 0, roulotte_range_max: 20, campeur_porte: 1, tente_roulotte: 1, tente: 1, sol: 'SABLE', particularite: 'Communique 136, forêt derrière' }),
  s(138, 'NAT', 'REGULAR', { longueur: 42, largeur: 20, soleil: 20, motorise_range_min: 0, motorise_range_max: 25, campeur_porte: 1, tente_roulotte: 1, tente: 1, sol: 'SABLE', particularite: 'Forêt derrière, rue étroite en avant' }),
  s(139, 'NAT', 'REGULAR', { longueur: 35, largeur: 35, soleil: 20, motorise_range_min: 0, motorise_range_max: 26, fifthwheel_range_min: 0, fifthwheel_range_max: 20, roulotte_range_min: 0, roulotte_range_max: 25, campeur_porte: 1, tente_roulotte: 1, tente: 1, sol: 'SABLE', particularite: 'Forêt derrière' }),
  s(140, 'NAT', 'REGULAR', { longueur: 49, largeur: 17, soleil: 20, motorise_range_min: 0, motorise_range_max: 30, fifthwheel_range_min: 0, fifthwheel_range_max: 27, roulotte_range_min: 0, roulotte_range_max: 27, campeur_porte: 1, tente_roulotte: 1, tente: 1, sol: 'SABLE', particularite: 'Forêt derrière' }),
  s(141, 'NAT', 'REGULAR', { longueur: 35, largeur: 20, soleil: 20, motorise_range_min: 0, motorise_range_max: 28, fifthwheel_range_min: 0, fifthwheel_range_max: 25, roulotte_range_min: 0, roulotte_range_max: 26, campeur_porte: 1, tente_roulotte: 1, tente: 1, sol: 'SABLE', particularite: 'Forêt derrière' }),
  s(142, 'NAT', 'REGULAR', { longueur: 35, largeur: 16, soleil: 20, motorise_range_min: 0, motorise_range_max: 22, campeur_porte: 1, tente_roulotte: 1, tente: 1, sol: 'SABLE', particularite: 'Forêt derrière' }),
  s(143, 'NAT', 'REGULAR', { longueur: 38, largeur: 22, soleil: 20, motorise_range_min: 0, motorise_range_max: 25, roulotte_range_min: 0, roulotte_range_max: 20, campeur_porte: 1, tente_roulotte: 1, tente: 1, sol: 'SABLE', particularite: 'Communique 144-145' }),
  s(144, 'NAT', 'REGULAR', { longueur: 30, largeur: 20, soleil: 20, campeur_porte: 1, tente: 1, sol: 'SABLE', particularite: 'Communique 143-145' }),
  s(300, 'NAT', 'REGULAR', { longueur: 31, largeur: 18, soleil: 20, motorise_range_min: 0, motorise_range_max: 23, roulotte_range_min: 0, roulotte_range_max: 20, campeur_porte: 1, tente_roulotte: 1, tente: 1, sol: 'SABLE', particularite: 'Forêt derrière' }),
  s(301, 'NAT', 'REGULAR', { longueur: 31, largeur: 21, soleil: 20, motorise_range_min: 0, motorise_range_max: 23, roulotte_range_min: 0, roulotte_range_max: 20, campeur_porte: 1, tente_roulotte: 1, tente: 1, sol: 'SABLE', particularite: 'Forêt derrière' }),
  s(302, 'NAT', 'REGULAR', { longueur: 30, largeur: 20, soleil: 20, motorise_range_min: 0, motorise_range_max: 22, roulotte_range_min: 0, roulotte_range_max: 20, campeur_porte: 1, tente_roulotte: 1, tente: 1, sol: 'SABLE', particularite: 'Forêt derrière' }),
  s(303, 'NAT', 'REGULAR', { longueur: 29, largeur: 19, soleil: 30, motorise_range_min: 0, motorise_range_max: 22, roulotte_range_min: 0, roulotte_range_max: 20, campeur_porte: 1, tente_roulotte: 1, tente: 1, sol: 'SABLE', particularite: 'Forêt derrière' }),
  s(304, 'NAT', 'REGULAR', { longueur: 37, largeur: 25, soleil: 40, motorise_range_min: 0, motorise_range_max: 25, roulotte_range_min: 0, roulotte_range_max: 23, campeur_porte: 1, tente_roulotte: 1, tente: 1, sol: 'SABLE', particularite: 'Forêt derrière' }),
  s(305, 'NAT', 'REGULAR', { longueur: 26, largeur: 23, soleil: 40, motorise_range_min: 0, motorise_range_max: 22, roulotte_range_min: 0, roulotte_range_max: 20, campeur_porte: 1, tente_roulotte: 1, tente: 1, sol: 'SABLE', particularite: 'Forêt derrière' }),
  s(306, 'NAT', 'REGULAR', { longueur: 24, largeur: 38, soleil: 40, motorise_range_min: 0, motorise_range_max: 25, roulotte_range_min: 0, roulotte_range_max: 22, campeur_porte: 1, tente_roulotte: 1, tente: 1, sol: 'SABLE', particularite: 'Forêt derrière' }),
]

export function seedSpots(db: Database.Database) {
  // Clear old spots and insert new ones
  db.exec('DELETE FROM spots')

  const insert = db.prepare(`
    INSERT INTO spots (
      id, number, service, status, price_per_night, is_active,
      longueur, largeur, soleil,
      motorise_range_min, motorise_range_max,
      fifthwheel_range_min, fifthwheel_range_max,
      roulotte_range_min, roulotte_range_max,
      campeur_porte, tente_roulotte, tente,
      sol, particularite
    ) VALUES (
      @id, @number, @service, @status, @price_per_night, 1,
      @longueur, @largeur, @soleil,
      @motorise_range_min, @motorise_range_max,
      @fifthwheel_range_min, @fifthwheel_range_max,
      @roulotte_range_min, @roulotte_range_max,
      @campeur_porte, @tente_roulotte, @tente,
      @sol, @particularite
    )
  `)

  const insertMany = db.transaction((spots: SpotSeed[]) => {
    for (const spot of spots) {
      insert.run(spot)
    }
  })

  insertMany(SPOTS)
  console.log(`[seed] Inserted ${SPOTS.length} spots`)
}
