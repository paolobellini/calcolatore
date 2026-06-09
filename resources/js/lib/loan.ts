import type { LoanInput, LoanResult } from '@/types/loan';

export function calculateLoan(input: LoanInput): LoanResult {
    const { importo, tan, durataMesi, speseIstruttoria, polizza } = input;

    const tassoMensile = tan / 100 / 12;

    const rata = tassoMensile === 0
        ? importo / durataMesi
        : (importo * tassoMensile) / (1 - Math.pow(1 + tassoMensile, -durataMesi));

    const totale = rata * durataMesi + speseIstruttoria + polizza;

    return { rata, totale };
}
