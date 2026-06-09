# Calcolatore Rata Finanziamento Auto

Calcolatore di rata di finanziamento per prestiti auto, costruito su Laravel + Inertia + Vue 3 + TypeScript.

## Stack

- **Backend**: Laravel 13 (PHP 8.3+), Pest 4, Fortify (auth, 2FA, passkeys)
- **Frontend**: Vue 3 + TypeScript, Inertia v3 SSR, Tailwind v4, shadcn-vue (`new-york-v4`, neutral, icone lucide)
- **Tooling**: Vite, Wayfinder (route/action types generati), ESLint v9, Prettier, Pint
- **Test**: Pest (PHP), Vitest (TypeScript)
- **DB**: SQLite

## Setup

```bash
composer setup     # install + .env + key + migrate + npm install + build
composer dev       # serve + queue + pail + vite, tutto concorrente
```

## Comandi utili

| Comando | Cosa fa |
|---|---|
| `composer dev` | Avvia stack di sviluppo completo |
| `composer test` | Pint check + suite PHP |
| `composer ci:check` | Lint + format + types + test (gate pre-push) |
| `npx vitest run` | Test TypeScript |
| `npm run types:check` | `vue-tsc --noEmit` |
| `npm run lint` | ESLint con auto-fix |
| `npm run build:ssr` | Build client + SSR |

## Data Layer

### Tipi (`resources/js/types/loan.ts`)

```ts
type LoanInput = {
    importo: number;          // capitale netto richiesto (es. 20000)
    tan: number;              // tasso annuo nominale in % (es. 7)
    durataMesi: number;       // numero rate mensili (es. 36)
    speseIstruttoria: number; // commissione di istruttoria
    polizza: number;          // premio unico polizza (CPI / furto-incendio)
};

type LoanResult = {
    rata: number;             // rata mensile
    totale: number;           // importo totale dovuto = rata * durataMesi
};
```

### Funzione (`resources/js/lib/loan.ts`)

Ammortamento alla francese (rata costante) con **spese istruttoria e polizza finanziate dentro il capitale**.

```
capitale = importo + speseIstruttoria + polizza
i        = TAN / 12 / 100
rata     = capitale · i / (1 - (1 + i)^-n)        // se i > 0
rata     = capitale / n                            // se i = 0
totale   = rata · n
```

## Modello di prodotto: prestito auto

### Vincoli dell'esercizio

- Importo richiesto: **20.000 €**
- Tassi disponibili (TAN): **7%**, **7,50%**, **8%**
- Durate: **36**, **48**, **60** mesi
- Spese istruttoria: **300 €**
- Polizza: **800 €**

### Decisione di prodotto: istruttoria e polizza finanziate dentro l'importo

Sia istruttoria che polizza vengono **caricate nel capitale ammortizzato** (capitale base = 21.100 €), non fatte pagare in cash a parte alla firma.

**Motivazioni — specifiche per prestito auto**:

1. **Cliente già esposto su cash**. Anticipo, IPT, immatricolazione e passaggio bruciano già liquidità a firma; aggiungere 1.100 € di esborso vivo è il principale ostacolo alla vendita osservato dai concessionari.
2. **Pratica delle captive bank**. FCA Bank, VW Financial Services, Santander Consumer, Findomestic auto, Agos finanziano sempre istruttoria e polizza dentro la pratica. Modellare il calcolatore sul comportamento di mercato evita differenze tra preventivo e contratto reale.
3. **Polizza come premio unico finanziato**. Le coperture CPI e furto-incendio collegate al finanziamento sono nello standard di mercato premi unici anticipati e finanziati: sono parte integrante della pratica, non un acquisto separato.
4. **TAN promozionali e confronto**. I tassi promo dei concessionari (es. "TAN agevolato 6,99%") sono già calcolati assumendo spese dentro la pratica. Estrarle fuori dal capitale falserebbe il confronto fra preventivi.
5. **Tutela del collaterale**. Capitale residuo che include polizza rende il portafoglio crediti più resiliente in caso di sinistro o default precoce.
6. **UX più semplice**. Cliente chiede 20.000 € e li riceve netti al dealer; firma un'unica somma lorda con un'unica rata, senza voci separate da spiegare.

**Trade-off accettato**: rata leggermente più alta rispetto al modello "spese fuori capitale", ma riflette il costo reale e allinea TAEG visibile a TAEG di contratto.

### Esempio: 20.000 € + 300 € + 800 €, TAN 7%, 36 mesi

- Capitale ammortizzato: **21.100 €**
- Tasso mensile *i*: 7 / 12 / 100 ≈ 0,005833
- Rata mensile: **≈ 651,51 €**
- Totale dovuto: **≈ 23.454,38 €**

## Test

Test TypeScript del data layer in `resources/js/lib/loan.test.ts`:

```bash
npx vitest run resources/js/lib/loan.test.ts
```

Casi coperti:

- Ammortamento alla francese standard
- Fallback lineare quando TAN = 0
- Spese e polizza finanziate dentro il capitale
- Esercizio auto (20.000 € + 300 € + 800 €, TAN 7%, 36 mesi)

## Struttura

- `resources/js/types/loan.ts` — tipi di dominio del prestito
- `resources/js/lib/loan.ts` — funzione `calculateLoan`
- `resources/js/lib/loan.test.ts` — test Vitest
- `CLAUDE.md` — guida per Claude Code (comandi, architettura, convenzioni)
