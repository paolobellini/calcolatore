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

    it('adds spese istruttoria and polizza to totale, not to rata', () => {
        const { rata, totale } = calculateLoan({
            importo: 5000,
            tan: 0,
            durataMesi: 10,
            speseIstruttoria: 150,
            polizza: 50,
        });

        expect(rata).toBe(500);
        expect(totale).toBe(5000 + 150 + 50);
    });
});
