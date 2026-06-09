export type LoanInput = {
    importo: number;
    tan: number;
    durataMesi: number;
    speseIstruttoria: number;
    polizza: number;
};

export type LoanResult = {
    rata: number;
    totale: number;
};
