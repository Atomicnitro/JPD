/* Core helpers shared by every screen. */
(function () {
  'use strict';

  const GT = (window.GT = {});

  /* ---------- Small helpers ---------- */
  GT.$ = (s, r = document) => r.querySelector(s);
  GT.$$ = (s, r = document) => [...r.querySelectorAll(s)];
  GT.esc = (s) =>
    String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  GT.peso = (n) => {
    const v = Number(n || 0);
    return (v < 0 ? '-' : '') + '₱' + Math.abs(v).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  };
  GT.pad3 = (n) => String(n).padStart(3, '0');
  GT.sum = (arr, key) => arr.reduce((t, x) => t + (Number(x[key]) || 0), 0);

  const iso = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  GT.today = () => iso(new Date());
  const parse = (s) => {
    const [y, m, d] = String(s).slice(0, 10).split('-').map(Number);
    return new Date(y, m - 1, d);
  };
  GT.addDays = (s, n) => {
    const d = parse(s);
    d.setDate(d.getDate() + n);
    return iso(d);
  };
  GT.daysBetween = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);
  GT.fmtDate = (s) =>
    s ? parse(s).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
  GT.longDate = (s) =>
    parse(s).toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  GT.rate = (hatched, eggs) => (eggs ? Math.round((hatched / eggs) * 1000) / 10 + '%' : '–');
  GT.iso = iso;
  GT.parseDate = parse;

  /* ---------- Labels ---------- */
  GT.SEX = { tandang: 'Tandang', inahin: 'Inahin', sisiw: 'Sisiw' };
  GT.STATUS = { active: 'Active', sold: 'Sold', deceased: 'Deceased', culled: 'Culled' };
  GT.PAIR_STATUS = { active: 'Active', inactive: 'Inactive', retired: 'Retired' };
  GT.TRAIN_TYPES = ['Conditioning workout', 'Sparring', 'Flying / exercise', 'Weigh-in', 'Rest day', 'Other'];
  GT.CONDITION = { 1: '1 - Poor', 2: '2 - Fair', 3: '3 - Good', 4: '4 - Very good', 5: '5 - Excellent' };
  GT.RESULT = { win: 'Win', loss: 'Loss', draw: 'Draw', no_contest: 'No contest' };
  GT.NOTE_KIND = { good: 'Good', improve: 'Needs work', note: 'Note' };
  GT.CATEGORIES = [
    'Feed', 'Vitamins / Supplements', 'Medicine', 'Veterinary', 'Incubator', 'Equipment',
    'Electricity', 'Water', 'Transportation', 'Maintenance', 'Other',
  ];

  /* ---------- Icons ---------- */
  // Gamefowl silhouette (traced from the reference photo).
  GT.ROOSTER_PATH = 'M21.12 1.78Q20.99 1.65 20.89 1.57Q20.79 1.50 20.70 1.48Q20.61 1.46 20.57 1.41Q20.52 1.36 20.35 1.32Q20.18 1.28 20.09 1.22Q19.99 1.16 19.68 1.12Q19.36 1.08 19.29 1.04Q19.21 1.00 18.84 1.01Q18.46 1.01 18.33 1.08Q18.19 1.15 17.82 1.17Q17.44 1.19 17.31 1.27Q17.18 1.35 17.08 1.36Q16.97 1.36 16.64 1.47Q16.31 1.58 16.09 1.71Q15.88 1.85 15.75 1.97Q15.61 2.09 15.38 2.14Q15.14 2.18 14.78 2.39Q14.43 2.60 14.04 2.98Q13.66 3.35 13.45 3.60Q13.24 3.84 13.02 4.26Q12.79 4.68 12.69 4.92Q12.58 5.16 12.58 5.30Q12.57 5.45 12.54 5.51Q12.50 5.57 12.50 5.67Q12.49 5.76 12.44 5.83Q12.40 5.91 12.34 6.31Q12.29 6.72 12.26 6.75Q12.24 6.78 12.23 7.29Q12.22 7.79 12.24 7.91Q12.26 8.02 12.15 8.19Q12.05 8.36 11.89 8.50Q11.72 8.65 11.64 8.67Q11.56 8.68 11.46 8.78Q11.36 8.88 11.35 8.99Q11.33 9.11 11.30 9.16Q11.27 9.20 11.27 9.32Q11.27 9.43 11.23 9.47Q11.20 9.51 11.20 9.68Q11.20 9.85 11.17 9.90Q11.13 9.94 11.17 10.00Q11.20 10.05 11.19 10.11Q11.17 10.17 11.11 10.16Q11.05 10.16 10.94 10.07Q10.82 9.98 10.74 9.97Q10.66 9.96 10.53 9.83Q10.39 9.71 10.01 9.53Q9.63 9.34 9.43 9.19Q9.24 9.04 9.10 8.99Q8.95 8.95 8.91 8.89Q8.87 8.83 8.79 8.77Q8.70 8.71 8.68 8.63Q8.66 8.56 8.28 8.15Q7.89 7.74 7.45 6.99Q7.00 6.24 6.92 6.06Q6.84 5.88 6.20 4.94Q5.57 4.00 5.33 3.72Q5.09 3.43 5.08 3.39Q5.07 3.34 4.72 2.99Q4.37 2.64 4.26 2.60Q4.15 2.56 4.03 2.47Q3.91 2.37 3.68 2.37Q3.45 2.37 3.41 2.41Q3.36 2.44 3.29 2.45Q3.21 2.45 2.97 2.65Q2.73 2.86 2.53 2.94Q2.34 3.02 2.21 3.12Q2.08 3.22 2.03 3.31Q1.97 3.39 1.97 3.44Q1.97 3.49 2.24 3.47Q2.51 3.46 2.57 3.49Q2.63 3.51 2.80 3.66Q2.96 3.81 3.10 4.05Q3.25 4.28 3.20 4.39Q3.14 4.50 2.98 4.66Q2.82 4.82 2.55 5.46Q2.27 6.11 2.16 6.56Q2.06 7.01 2.05 7.19Q2.04 7.37 2.01 7.41Q1.97 7.45 1.97 7.55Q1.97 7.64 1.94 7.69Q1.91 7.74 1.91 8.58Q1.91 9.42 1.94 9.47Q1.97 9.51 1.98 9.73Q1.99 9.94 2.11 10.38Q2.23 10.82 2.27 10.89Q2.31 10.96 2.58 11.25Q2.85 11.54 2.94 11.74Q3.02 11.95 3.21 12.15Q3.40 12.36 3.41 12.44Q3.41 12.52 3.58 12.85Q3.75 13.17 3.96 13.43Q4.17 13.68 4.52 14.03Q4.88 14.38 4.97 14.55Q5.07 14.72 5.57 15.21Q6.06 15.70 6.24 15.91Q6.41 16.13 6.49 16.34Q6.56 16.55 6.84 16.97Q7.11 17.39 7.11 17.49Q7.11 17.59 7.17 17.72Q7.23 17.84 7.25 17.98Q7.27 18.13 7.25 18.44Q7.23 18.75 7.11 19.22Q6.98 19.69 6.76 20.31Q6.55 20.93 6.50 20.99Q6.45 21.05 6.31 21.13Q6.17 21.21 5.63 21.19Q5.08 21.17 5.07 21.19Q5.07 21.21 5.16 21.27Q5.26 21.32 5.26 21.35Q5.27 21.39 5.24 21.42Q5.20 21.45 4.74 21.53Q4.27 21.61 4.10 21.68Q3.92 21.74 3.80 21.74Q3.68 21.75 3.62 21.82Q3.56 21.90 3.74 21.88Q3.91 21.87 4.01 21.91Q4.10 21.95 4.19 21.95Q4.27 21.95 4.37 21.89Q4.46 21.83 5.12 21.82Q5.78 21.80 5.87 21.75Q5.96 21.70 6.12 21.68Q6.28 21.67 6.30 21.72Q6.32 21.78 6.26 21.88Q6.20 21.99 6.16 22.03Q6.12 22.06 5.98 22.09Q5.83 22.13 5.79 22.19Q5.74 22.26 5.86 22.27Q5.98 22.27 6.06 22.31Q6.13 22.34 6.33 22.34Q6.52 22.34 6.55 22.37Q6.59 22.41 6.47 22.48Q6.36 22.54 5.82 22.65Q5.28 22.76 5.18 22.86Q5.07 22.96 5.09 22.98Q5.12 23.00 5.19 22.99Q5.26 22.99 5.30 22.95Q5.34 22.92 5.44 22.96Q5.54 23.00 5.65 23.00Q5.77 23.00 5.83 22.96Q5.89 22.92 6.16 22.91Q6.43 22.89 6.53 22.84Q6.64 22.78 6.98 22.74Q7.31 22.70 7.47 22.64Q7.64 22.57 7.92 22.55Q8.20 22.53 8.28 22.55Q8.35 22.57 8.52 22.74Q8.70 22.91 8.87 22.95Q9.03 22.99 9.03 22.93Q9.02 22.87 8.90 22.73Q8.78 22.60 8.71 22.45Q8.63 22.30 8.63 22.04Q8.63 21.78 8.58 21.62Q8.52 21.47 8.52 21.36Q8.51 21.25 8.65 20.44Q8.79 19.62 8.81 19.39Q8.82 19.15 8.89 19.11Q8.97 19.06 8.97 18.93Q8.98 18.79 9.02 18.74Q9.06 18.70 9.09 18.36Q9.12 18.02 9.14 17.94Q9.17 17.86 9.18 17.41Q9.18 16.95 9.14 16.89Q9.10 16.83 9.01 16.50Q8.91 16.18 8.98 16.16Q9.05 16.14 9.15 16.19Q9.25 16.24 9.74 16.58Q10.23 16.92 10.46 17.02Q10.69 17.12 10.97 17.31Q11.25 17.50 11.35 17.51Q11.44 17.51 11.52 17.48Q11.60 17.45 11.67 17.38Q11.74 17.31 11.78 17.20Q11.83 17.10 12.00 16.96Q12.17 16.81 12.18 16.64Q12.19 16.46 12.26 16.40Q12.32 16.34 12.33 16.29Q12.34 16.24 12.42 16.16Q12.50 16.09 12.59 16.11Q12.68 16.13 12.83 15.94Q12.97 15.75 13.04 15.77Q13.11 15.79 13.12 15.91Q13.12 16.03 13.20 16.01Q13.27 15.98 13.30 16.01Q13.34 16.05 13.30 16.13Q13.26 16.21 13.26 16.38Q13.26 16.55 13.35 16.43Q13.45 16.32 13.47 16.33Q13.49 16.34 13.45 16.54Q13.41 16.73 13.49 16.60Q13.57 16.46 13.72 16.29Q13.88 16.11 13.95 15.95Q14.02 15.78 14.03 15.68Q14.04 15.58 14.09 15.52Q14.14 15.47 14.23 15.48Q14.32 15.48 14.35 15.57Q14.37 15.66 14.47 15.56Q14.56 15.47 14.61 15.50Q14.66 15.52 14.72 15.50Q14.79 15.47 14.84 15.60Q14.90 15.74 14.90 15.86Q14.91 15.98 14.96 16.01Q15.01 16.05 15.09 15.95Q15.18 15.85 15.21 15.65Q15.23 15.46 15.28 15.42Q15.33 15.39 15.38 15.45Q15.44 15.51 15.44 15.60Q15.45 15.70 15.49 15.78Q15.53 15.86 15.64 15.96Q15.75 16.06 15.75 15.45Q15.75 14.84 15.79 14.80Q15.84 14.77 15.89 14.77Q15.95 14.77 16.00 14.84Q16.05 14.90 16.06 15.07Q16.07 15.23 16.17 15.60Q16.27 15.97 16.30 15.98Q16.34 15.99 16.42 15.87Q16.51 15.74 16.58 15.70Q16.65 15.66 16.74 15.81Q16.83 15.95 16.87 15.97Q16.92 15.99 16.94 15.62Q16.97 15.24 17.00 15.21Q17.04 15.19 17.09 15.21Q17.14 15.24 17.15 15.47Q17.16 15.70 17.19 15.73Q17.22 15.77 17.25 15.74Q17.28 15.71 17.33 15.46Q17.37 15.20 17.49 14.94Q17.61 14.68 17.63 14.46Q17.65 14.25 17.76 14.00Q17.86 13.75 17.86 13.57Q17.87 13.40 17.89 13.38Q17.91 13.36 17.97 13.35Q18.03 13.34 18.48 13.45Q18.93 13.55 19.11 13.55Q19.28 13.56 19.50 13.63Q19.71 13.69 19.95 13.68Q20.18 13.67 20.14 13.55Q20.10 13.44 20.10 13.34Q20.10 13.25 19.95 13.20Q19.79 13.16 19.67 13.06Q19.54 12.97 19.51 12.91Q19.48 12.86 19.50 12.83Q19.52 12.81 19.64 12.77Q19.75 12.74 19.89 12.73Q20.02 12.71 20.13 12.65Q20.24 12.59 20.28 12.54Q20.33 12.48 20.29 12.30Q20.25 12.12 20.14 12.04Q20.02 11.96 19.69 11.83Q19.36 11.69 19.17 11.68Q18.99 11.68 18.91 11.64Q18.84 11.61 18.49 11.62Q18.14 11.62 18.10 11.58Q18.06 11.54 18.06 11.44Q18.07 11.34 18.11 11.31Q18.14 11.29 18.55 11.19Q18.96 11.09 19.29 11.04Q19.62 10.99 19.71 10.94Q19.79 10.88 19.91 10.88Q20.03 10.88 20.55 10.68Q21.06 10.47 21.18 10.38Q21.30 10.29 21.33 10.30Q21.37 10.31 21.39 10.35Q21.41 10.39 21.41 10.72Q21.42 11.05 21.44 10.99Q21.46 10.94 21.45 10.79Q21.43 10.64 21.49 10.53Q21.55 10.43 21.55 10.17Q21.55 9.92 21.58 9.89Q21.61 9.86 21.66 9.87Q21.70 9.88 21.75 9.93Q21.80 9.98 21.80 10.35Q21.81 10.72 21.84 10.76Q21.86 10.80 21.86 11.93Q21.86 13.05 21.83 13.10Q21.80 13.16 21.80 13.28Q21.80 13.40 21.76 13.45Q21.73 13.49 21.73 13.57Q21.73 13.65 21.76 13.64Q21.80 13.63 21.88 13.35Q21.96 13.08 21.96 12.94Q21.96 12.81 22.01 12.65Q22.07 12.48 22.09 12.25Q22.11 12.01 22.11 11.63Q22.11 11.25 22.07 11.15Q22.03 11.05 22.03 10.35Q22.03 9.65 21.99 9.44Q21.96 9.23 21.94 8.84Q21.93 8.45 21.88 8.32Q21.82 8.18 21.82 7.99Q21.81 7.79 21.76 7.56Q21.72 7.33 21.59 7.08Q21.47 6.84 21.46 6.73Q21.45 6.62 21.33 6.43Q21.22 6.23 21.22 6.14Q21.22 6.06 21.18 6.00Q21.14 5.94 21.12 5.85Q21.11 5.76 21.16 5.68Q21.20 5.60 21.20 5.47Q21.20 5.34 21.09 5.24Q20.98 5.13 20.95 5.05Q20.92 4.98 20.78 4.85Q20.64 4.72 20.57 4.72Q20.49 4.71 20.45 4.67Q20.41 4.63 20.39 4.54Q20.37 4.46 20.24 4.29Q20.12 4.12 20.12 4.08Q20.12 4.04 20.34 3.77Q20.56 3.50 20.57 3.39Q20.57 3.29 20.52 3.23Q20.47 3.17 20.46 3.11Q20.45 3.06 20.48 3.04Q20.51 3.02 20.63 3.02Q20.75 3.02 20.85 2.97Q20.95 2.92 21.07 2.93Q21.19 2.94 21.24 2.90Q21.29 2.86 21.22 2.68Q21.15 2.51 21.00 2.44Q20.86 2.37 20.79 2.30Q20.72 2.22 20.75 2.18Q20.77 2.14 20.98 2.14Q21.19 2.14 21.23 2.12Q21.27 2.10 21.26 2.01Q21.25 1.91 21.12 1.78ZM7.72 21.35Q7.89 21.47 7.84 21.64Q7.78 21.82 7.72 21.87Q7.66 21.92 7.41 22.00Q7.15 22.07 6.86 22.07Q6.57 22.07 6.55 22.05Q6.52 22.03 6.52 21.98Q6.52 21.94 6.56 21.90Q6.60 21.86 6.69 21.84Q6.78 21.82 7.08 21.51Q7.38 21.20 7.46 21.21Q7.54 21.22 7.72 21.35ZM8.03 18.16Q8.08 18.12 8.17 18.33Q8.27 18.55 8.29 18.97Q8.31 19.38 8.29 19.62Q8.27 19.85 8.23 19.92Q8.20 19.99 8.15 20.53Q8.11 21.08 8.06 21.13Q8.01 21.18 7.93 21.15Q7.85 21.12 7.68 20.97Q7.52 20.82 7.46 20.75Q7.41 20.67 7.39 20.55Q7.38 20.43 7.50 19.76Q7.61 19.09 7.79 18.64Q7.97 18.20 8.03 18.16ZM15.48 13.05Q15.52 13.02 15.57 13.06Q15.62 13.09 15.72 13.31Q15.81 13.53 15.93 13.92Q16.04 14.30 16.01 14.43Q15.97 14.56 15.92 14.60Q15.87 14.64 15.77 14.62Q15.68 14.61 15.64 14.54Q15.61 14.47 15.61 14.25Q15.61 14.03 15.52 13.61Q15.42 13.20 15.43 13.14Q15.44 13.08 15.48 13.05ZM20.90 9.53Q20.92 9.49 21.10 9.47Q21.29 9.46 21.35 9.51Q21.42 9.57 21.44 9.75Q21.46 9.93 21.43 9.98Q21.39 10.04 21.33 10.05Q21.26 10.06 21.20 9.98Q21.14 9.89 21.03 9.86Q20.92 9.82 20.90 9.76Q20.87 9.70 20.87 9.63Q20.87 9.57 20.90 9.53ZM19.30 8.96Q19.39 8.95 19.42 8.99Q19.46 9.04 19.44 9.14Q19.42 9.24 19.32 9.36Q19.21 9.47 19.17 9.49Q19.12 9.50 19.07 9.47Q19.01 9.44 18.98 9.40Q18.95 9.35 18.98 9.26Q19.01 9.18 19.11 9.08Q19.20 8.97 19.30 8.96ZM21.00 8.17Q21.08 8.19 21.15 8.42Q21.22 8.65 21.22 8.72Q21.22 8.79 21.18 8.83Q21.15 8.87 21.08 8.87Q21.02 8.87 20.92 8.83Q20.83 8.79 20.70 8.82Q20.57 8.85 20.47 8.85Q20.36 8.84 20.31 8.87Q20.26 8.89 20.09 8.89Q19.91 8.89 19.89 8.87Q19.87 8.85 19.87 8.79Q19.87 8.72 19.90 8.69Q19.93 8.65 20.18 8.57Q20.44 8.49 20.68 8.32Q20.92 8.14 21.00 8.17Z';
  const ICONS = {
    home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    bird: '<path d="' + GT.ROOSTER_PATH + '" fill="currentColor" stroke="none" fill-rule="evenodd"/>',
    pairs: '<circle cx="8" cy="12" r="4.5"/><circle cx="16" cy="12" r="4.5"/>',
    egg: '<path d="M12 3c4 0 7 6 7 11a7 7 0 0 1-14 0c0-5 3-11 7-11z"/>',
    incubator: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h8M10 17h4"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.2"/>',
    wallet: '<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 10h18M16 15h2"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-4 3-6 6.5-6s6.5 2 6.5 6M17 11a3 3 0 1 0 0-6M21.5 19c0-3-1.5-4.5-4-5"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
    more: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    logout: '<path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9"/>',
    download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    dumbbell: '<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/>',
    trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4.5a1 1 0 0 0-1 1c0 2.5 1.5 4 4 4M16 6h3.5a1 1 0 0 1 1 1c0 2.5-1.5 4-4 4M12 13v4M8.5 20h7M10 17h4"/>',
    video: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5l5 2.5-5 2.5z" fill="currentColor"/>',
  };
  GT.icon = (name) =>
    `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

  /* ---------- State ---------- */
  GT.S = {
    token: null,
    refresh: null,
    user: null,
    data: { birds: [], pairs: [], batches: [], sales: [], expenses: [], incubators: [], training: [], derbies: [], fights: [], vnotes: [], settings: {} },
    filters: { q: '', sex: '', status: '', bloodline: '', trainBird: '' },
    period: { key: 'month', from: '', to: '' },
  };
  const S = GT.S;

  GT.saveSession = () => {
    localStorage.setItem('gt_session', JSON.stringify({ token: S.token, refresh: S.refresh, user: S.user }));
  };
  GT.restoreSession = () => {
    try {
      const x = JSON.parse(localStorage.getItem('gt_session') || 'null');
      if (x && x.token) { S.token = x.token; S.refresh = x.refresh; S.user = x.user; }
    } catch (e) { /* ignore */ }
  };
  GT.clearSession = () => {
    S.token = S.refresh = S.user = null;
    localStorage.removeItem('gt_session');
  };

  /* ---------- API ---------- */
  async function refreshToken() {
    if (!S.refresh) return false;
    try {
      const r = await fetch('/api/refresh', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh: S.refresh }),
      });
      if (!r.ok) return false;
      const j = await r.json();
      S.token = j.token; S.refresh = j.refresh; GT.saveSession();
      return true;
    } catch (e) { return false; }
  }

  GT.refreshToken = refreshToken;

  GT.api = async function (path, opts = {}) {
    const send = () =>
      fetch('/api' + path, {
        method: opts.method || 'GET',
        headers: {
          ...(opts.body ? { 'Content-Type': 'application/json' } : {}),
          ...(S.token ? { Authorization: 'Bearer ' + S.token } : {}),
        },
        body: opts.body ? JSON.stringify(opts.body) : undefined,
      });
    let r;
    try { r = await send(); } catch (e) { throw new Error('Cannot reach the server. Check your internet connection.'); }
    if (r.status === 401 && !opts.noRefresh && S.refresh && (await refreshToken())) r = await send();
    if (opts.blob) {
      if (!r.ok) throw new Error('The download failed. Please try again.');
      return r.blob();
    }
    const j = await r.json().catch(() => ({}));
    if (r.status === 401 && !opts.noRefresh) {
      GT.clearSession();
      if (GT.onLoggedOut) GT.onLoggedOut();
      throw new Error(j.error || 'Please log in again.');
    }
    if (!r.ok) throw new Error(j.error || 'Something went wrong. Please try again.');
    return j;
  };

  GT.load = async function () {
    const d = await GT.api('/data');
    S.data = d;
    if (d.me) { S.user = d.me; GT.saveSession(); }
  };

  /* ---------- Lookups ---------- */
  GT.bird = (id) => S.data.birds.find((b) => b.id === id);
  GT.pair = (id) => S.data.pairs.find((p) => p.id === id);
  GT.batch = (id) => S.data.batches.find((b) => b.id === id);
  GT.incubator = (id) => S.data.incubators.find((i) => i.id === id);
  GT.derby = (id) => S.data.derbies.find((d) => d.id === id);
  GT.fight = (id) => S.data.fights.find((f) => f.id === id);
  GT.fmtTime = (sec) => {
    const t = Math.max(0, Math.floor(Number(sec) || 0));
    return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
  };
  GT.parseTime = (txt) => {
    const m = /^\s*(?:(\d+):)?(\d+)\s*$/.exec(String(txt));
    if (!m) return null;
    return m[1] === undefined ? Number(m[2]) : Number(m[1]) * 60 + Number(m[2]);
  };
  GT.record = (fights) => {
    const w = fights.filter((f) => f.result === 'win').length;
    const l = fights.filter((f) => f.result === 'loss').length;
    const d = fights.filter((f) => f.result === 'draw').length;
    return { w, l, d, n: fights.length, text: `${w}W ${l}L${d ? ' ' + d + 'D' : ''}`, rate: fights.length ? Math.round((w / fights.length) * 100) + '%' : '–' };
  };
  GT.pairLabel = (p) => (p ? 'PAIR-' + GT.pad3(p.pair_no) : 'Unknown pair');
  GT.batchLabel = (b) => (b ? 'BATCH-' + GT.pad3(b.batch_no) : '');
  GT.birdLabel = (b) => (b ? b.band_id + (b.name ? ' ' + b.name : '') : 'Unknown');
  GT.byBand = (a, b) => a.band_id.localeCompare(b.band_id, undefined, { numeric: true });
  GT.bloodlines = () => {
    const set = new Set();
    (S.data.settings.bloodlines || '').split(',').forEach((x) => x.trim() && set.add(x.trim()));
    S.data.birds.forEach((b) => b.bloodline && set.add(b.bloodline));
    return [...set].sort((a, b) => a.localeCompare(b));
  };

  /* ---------- Toast ---------- */
  GT.toast = (msg, type) => {
    const box = GT.$('#toast');
    const el = document.createElement('div');
    el.className = 'toast' + (type === 'err' ? ' err' : '');
    el.textContent = msg;
    box.appendChild(el);
    setTimeout(() => el.remove(), type === 'err' ? 5200 : 3200);
  };

  /* ---------- Photos ---------- */
  function resizeImage(file, max = 900) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * s);
        c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => reject(new Error('Could not read that photo.'));
      img.src = url;
    });
  }
  GT.uploadPhotoIfNew = async (vals) => {
    if (vals.photo_url && vals.photo_url.startsWith('data:')) {
      vals.photo_url = (await GT.api('/photos', { method: 'POST', body: { data: vals.photo_url } })).url;
    }
  };

  /* ---------- Forms in a dialog ---------- */
  const opt = (v, l, sel) => `<option value="${GT.esc(v)}"${String(sel) === String(v) ? ' selected' : ''}>${GT.esc(l)}</option>`;

  function fieldHtml(f, val) {
    val = val ?? f.def ?? '';
    const id = 'f_' + f.name;
    const e = GT.esc;
    let ctl = '';
    let labelTag = `<label for="${id}">${e(f.label)}</label>`;
    switch (f.type) {
      case 'select':
        ctl = `<select id="${id}" name="${f.name}"><option value="">${e(f.blank || 'Select')}</option>${(f.options || []).map((o) => opt(o.v, o.l, val)).join('')}</select>`;
        break;
      case 'seg':
        labelTag = `<span class="lbl">${e(f.label)}</span>`;
        ctl = `<div class="seg" role="radiogroup">${f.options.map((o) => `<label><input type="radio" name="${f.name}" value="${e(o.v)}"${val === o.v ? ' checked' : ''}><span>${e(o.l)}</span></label>`).join('')}</div>`;
        break;
      case 'checks': {
        labelTag = `<span class="lbl">${e(f.label)} <button type="button" class="linkbtn" data-checkall>Select all</button></span>`;
        const have = [].concat(val || []).map(String);
        ctl = `<div class="checks">${f.options.map((o) => `<label class="check"><input type="checkbox" name="${f.name}" value="${e(o.v)}"${have.includes(String(o.v)) ? ' checked' : ''}><span>${e(o.l)}</span></label>`).join('')}</div>`;
        break;
      }
      case 'textarea':
        ctl = `<textarea id="${id}" name="${f.name}" placeholder="${e(f.placeholder || '')}">${e(val)}</textarea>`;
        break;
      case 'photo':
        labelTag = `<span class="lbl">${e(f.label)}</span>`;
        ctl = `<div class="photo-box"><div class="photo-prev" data-prev>${val ? `<img src="${e(val)}" alt="">` : GT.icon('bird')}</div>
          <div><input type="file" accept="image/*" data-photo><input type="hidden" name="${f.name}" value="${e(val)}"><p class="help">Take a photo or choose one from your phone.</p></div></div>`;
        break;
      default: {
        const type = f.type || 'text';
        const attrs = [
          `type="${type}"`, `id="${id}"`, `name="${f.name}"`, `value="${e(val)}"`,
          f.placeholder ? `placeholder="${e(f.placeholder)}"` : '',
          type === 'number' ? `inputmode="decimal" step="${f.step || 'any'}" min="${f.min ?? 0}"` : '',
          f.list ? `list="dl_${f.name}"` : '',
          type === 'password' ? 'autocomplete="new-password"' : '',
          f.name === 'band_id' ? 'autocapitalize="characters"' : '',
        ].filter(Boolean).join(' ');
        ctl = `<input ${attrs}>`;
        if (f.list) ctl += `<datalist id="dl_${f.name}">${f.list.map((x) => `<option value="${e(x)}">`).join('')}</datalist>`;
      }
    }
    const help = f.help ? `<p class="help">${e(f.help)}</p>` : '';
    return `${f.section ? `<h3 class="sec">${e(f.section)}</h3>` : ''}<div class="f${f.w === 'half' ? ' half' : ''}">${labelTag}${ctl}${help}</div>`;
  }

  /*  openForm({ title, fields, values, submit, note, onSubmit(vals), after(result) })  */
  GT.openForm = function (cfg) {
    const dlg = GT.$('#dlg');
    const values = cfg.values || {};
    const main = cfg.fields.filter((f) => !f.more);
    const more = cfg.fields.filter((f) => f.more);
    dlg.innerHTML = `<form class="form" novalidate>
      <header><h2>${GT.esc(cfg.title)}</h2><button type="button" class="x" data-close aria-label="Close">×</button></header>
      <div class="fields">
        ${main.map((f) => fieldHtml(f, values[f.name])).join('')}
        ${more.length ? `<details class="more"><summary>More details</summary><div class="inner">${more.map((f) => fieldHtml(f, values[f.name])).join('')}</div></details>` : ''}
      </div>
      ${cfg.note ? `<p class="note-line">${GT.esc(cfg.note)}</p>` : ''}
      <p class="err" hidden></p>
      <footer><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn primary${cfg.danger ? ' danger' : ''}" type="submit">${GT.esc(cfg.submit || 'Save')}</button></footer>
    </form>`;
    const form = GT.$('form', dlg);
    const errBox = GT.$('.err', form);
    const showErr = (m) => { errBox.textContent = m; errBox.hidden = false; errBox.scrollIntoView({ block: 'nearest' }); };

    GT.$$('[data-photo]', form).forEach((inp) => {
      inp.addEventListener('change', async () => {
        const file = inp.files[0];
        if (!file) return;
        try {
          const dataUrl = await resizeImage(file);
          GT.$('input[type=hidden]', inp.parentElement).value = dataUrl;
          GT.$('[data-prev]', form).innerHTML = `<img src="${dataUrl}" alt="">`;
        } catch (e) { showErr(e.message); }
      });
    });

    form.addEventListener('submit', async (ev) => {
      ev.preventDefault();
      errBox.hidden = true;
      const vals = {};
      new FormData(form).forEach((v, k) => {
        v = typeof v === 'string' ? v.trim() : v;
        vals[k] = k in vals ? [].concat(vals[k], v) : v;
      });
      for (const f of cfg.fields) {
        if (f.required && !vals[f.name]) {
          const det = GT.$(`[name="${f.name}"]`, form)?.closest('details');
          if (det) det.open = true;
          return showErr(`${f.label} is required.`);
        }
      }
      const btn = GT.$('button[type=submit]', form);
      btn.disabled = true;
      try {
        const result = await cfg.onSubmit(vals);
        dlg.close();
        if (cfg.after) cfg.after(result);
      } catch (e) {
        showErr(e.message || 'Something went wrong.');
        btn.disabled = false;
      }
    });

    dlg.showModal();
    const first = GT.$('input:not([type=hidden]):not([type=radio]):not([type=file]), select', form);
    if (first && window.matchMedia('(min-width: 861px)').matches) first.focus();
  };

  GT.confirmBox = function (title, message, okLabel = 'Delete', danger = true) {
    return new Promise((resolve) => {
      const dlg = GT.$('#dlg');
      let answer = false;
      dlg.innerHTML = `<form class="form" novalidate>
        <header><h2>${GT.esc(title)}</h2></header>
        <div class="fields"><p class="f">${GT.esc(message)}</p></div>
        <footer><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn ${danger ? 'danger' : 'primary'}" type="submit">${GT.esc(okLabel)}</button></footer>
      </form>`;
      GT.$('form', dlg).addEventListener('submit', (e) => { e.preventDefault(); answer = true; dlg.close(); });
      dlg.addEventListener('close', () => resolve(answer), { once: true });
      dlg.showModal();
    });
  };

  document.addEventListener('click', (e) => {
    const dlg = GT.$('#dlg');
    const all = e.target.closest('[data-checkall]');
    if (all) {
      const boxes = GT.$$('input[type=checkbox]', all.closest('.f'));
      const on = boxes.some((b) => !b.checked);
      boxes.forEach((b) => { b.checked = on; });
      return;
    }
    if (e.target.closest('[data-close]') && dlg.open) { dlg.close(); return; }
    if (e.target === dlg) dlg.close();
  });

  GT.download = async function (path, filename) {
    try {
      const blob = await GT.api(path, { blob: true });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    } catch (e) { GT.toast(e.message, 'err'); }
  };
})();
