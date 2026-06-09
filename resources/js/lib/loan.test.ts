import { describe, expect, it } from 'vitest';
import { calculateLoan } from '@/lib/loan';

describe('calculateLoan', () => {
    it('computes French amortization installment', () => {
        const { rata, totale } = calculateLoan({
            importo: 10000,
            tan: 6,
            durataMesi: 24,
            speseIstruttoria: 0,
            polizza: 0,
        });

        expect(rata).toBeCloseTo(443.21, 2);
        expect(totale).toBeCloseTo(rata * 24, 10);
    });

    it('falls back to linear split when TAN is zero', () => {
        const { rata, totale } = calculateLoan({
            importo: 1200,
            tan: 0,
            durataMesi: 12,
            speseIstruttoria: 0,
            polizza: 0,
        });

        expect(rata).toBe(100);
        expect(totale).toBe(1200);
    });

    it('finances spese istruttoria and polizza inside the capital base', () => {
        const { rata, totale } = calculateLoan({
            importo: 5000,
            tan: 0,
            durataMesi: 10,
            speseIstruttoria: 150,
            polizza: 50,
        });

        expect(rata).toBe(520);
        expect(totale).toBe(5200);
    });

    it('matches car-loan exercise: 20k + 300 + 800, TAN 7%, 36 mesi', () => {
        const { rata, totale } = calculateLoan({
            importo: 20000,
            tan: 7,
            durataMesi: 36,
            speseIstruttoria: 300,
            polizza: 800,
        });

        expect(rata).toBeCloseTo(651.51, 2);
        expect(totale).toBeCloseTo(rata * 36, 10);
    });
});
