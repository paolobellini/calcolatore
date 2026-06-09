<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3';
import { ArrowLeftRight, Calculator, Car, X } from '@lucide/vue';
import { computed, ref } from 'vue';
import type { LoanInput } from '@/types/loan';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { calculateLoan } from '@/lib/loan';
import { login, register } from '@/routes';

const tanOptions = [7, 7.5, 8] as const;
const durataOptions = [36, 48, 60] as const;

const importo = ref<number>(20000);
const tan = ref<number>(7);
const durataMesi = ref<number>(36);
const speseIstruttoria = ref<number>(300);
const polizza = ref<number>(800);

const capitale = computed(
    () => Number(importo.value) + Number(speseIstruttoria.value) + Number(polizza.value),
);

const result = computed(() =>
    calculateLoan({
        importo: Number(importo.value),
        tan: Number(tan.value),
        durataMesi: Number(durataMesi.value),
        speseIstruttoria: Number(speseIstruttoria.value),
        polizza: Number(polizza.value),
    }),
);

const interessi = computed(
    () => result.value.totale - capitale.value,
);

function eur(n: number): string {
    return new Intl.NumberFormat('it-IT', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 2,
    }).format(n);
}

function pct(n: number): string {
    return new Intl.NumberFormat('it-IT', {
        minimumFractionDigits: n % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 2,
    }).format(n) + ' %';
}

function fmtInt(n: number): string {
    return new Intl.NumberFormat('it-IT').format(n);
}

const importoFocused = ref(false);
const speseFocused = ref(false);
const polizzaFocused = ref(false);

function display(n: number, focused: boolean): string {
    return focused ? String(n) : fmtInt(n);
}

function parseDigits(v: string | number): number {
    const digits = String(v).replace(/\D/g, '');

    return digits === '' ? 0 : Number(digits);
}

const snapshot = ref<LoanInput | null>(null);

const snapshotResult = computed(
    () => (snapshot.value ? calculateLoan(snapshot.value) : null),
);

const snapshotCapitale = computed(() => {
    if (!snapshot.value) {
        return 0;
    }

    return (
        snapshot.value.importo
        + snapshot.value.speseIstruttoria
        + snapshot.value.polizza
    );
});

const snapshotInteressi = computed(() => {
    if (!snapshotResult.value) {
        return 0;
    }

    return snapshotResult.value.totale - snapshotCapitale.value;
});

const deltaTotale = computed(() => {
    if (!snapshotResult.value) {
        return 0;
    }

    return result.value.totale - snapshotResult.value.totale;
});

const deltaRata = computed(() => {
    if (!snapshotResult.value) {
        return 0;
    }

    return result.value.rata - snapshotResult.value.rata;
});

function toggleCompare(): void {
    if (snapshot.value) {
        snapshot.value = null;

        return;
    }

    snapshot.value = {
        importo: Number(importo.value),
        tan: Number(tan.value),
        durataMesi: Number(durataMesi.value),
        speseIstruttoria: Number(speseIstruttoria.value),
        polizza: Number(polizza.value),
    };
}

function eurSigned(n: number): string {
    const sign = n > 0 ? '+' : n < 0 ? '−' : '';

    return sign + eur(Math.abs(n));
}
</script>

<template>
    <Head title="Calcola la rata del tuo finanziamento auto" />

    <div
        class="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 via-white to-blue-50/40 text-slate-900 lg:h-screen lg:overflow-hidden dark:from-slate-950 dark:via-slate-950 dark:to-blue-950/30 dark:text-slate-100"
    >
        <header
            class="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 sm:py-5"
        >
            <div class="flex items-center gap-2">
                <div
                    class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700 text-white shadow-sm sm:h-9 sm:w-9"
                >
                    <Car class="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <span
                    class="text-xs font-semibold tracking-tight sm:text-sm"
                >
                    Calcolatore Rata Auto
                </span>
            </div>

            <nav
                v-if="!$page.props.auth?.user"
                class="flex items-center gap-1.5 sm:gap-2"
            >
                <Link
                    :href="login()"
                    class="rounded-md px-2 py-1.5 text-xs font-medium text-slate-600 transition hover:text-blue-700 sm:px-3 sm:text-sm dark:text-slate-300 dark:hover:text-blue-300"
                >
                    Accedi
                </Link>
                <Link
                    :href="register()"
                    class="rounded-md bg-slate-900 px-2 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800 sm:px-3 sm:text-sm dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                    Registrati
                </Link>
            </nav>
        </header>

        <main
            class="flex flex-1 flex-col items-center gap-6 px-4 py-6 sm:px-6 lg:min-h-0 lg:justify-center lg:py-4"
        >
            <section class="max-w-2xl text-center">
                <h1
                    class="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl lg:text-3xl dark:text-white"
                >
                    Calcola la rata del tuo
                    <span class="text-blue-700 dark:text-blue-400">
                        finanziamento auto
                    </span>
                </h1>
                <p
                    class="mx-auto mt-2 text-xs text-slate-600 sm:text-sm dark:text-slate-400"
                >
                    Inserisci importo, TAN e durata: rata e costo totale subito.
                    Istruttoria e polizza finanziate dentro il capitale — come
                    fanno le captive in concessionaria.
                </p>
            </section>

            <Card
                class="w-full max-w-5xl gap-0 overflow-hidden border-slate-200/80 py-0 shadow-xl shadow-blue-900/5 dark:border-slate-800"
            >
                <div class="grid lg:grid-cols-[1.1fr_1fr]">
                    <div class="p-5 sm:p-6 lg:p-8">
                        <CardHeader class="px-0 pt-0 pb-5">
                            <CardTitle
                                class="flex items-center gap-2 text-lg"
                            >
                                <Calculator
                                    class="h-5 w-5 text-blue-700 dark:text-blue-400"
                                />
                                Configura il tuo prestito
                            </CardTitle>
                            <CardDescription class="mt-1">
                                Modifica i parametri per vedere la rata
                                aggiornarsi.
                            </CardDescription>
                        </CardHeader>

                        <CardContent class="space-y-5 px-0">
                            <div class="space-y-2">
                                <Label for="importo">
                                    Importo richiesto
                                </Label>
                                <div class="relative">
                                    <Input
                                        id="importo"
                                        :model-value="display(importo, importoFocused)"
                                        type="text"
                                        inputmode="numeric"
                                        class="h-12 pr-10 text-lg font-semibold"
                                        @update:model-value="(v) => (importo = parseDigits(v))"
                                        @focus="importoFocused = true"
                                        @blur="importoFocused = false"
                                    />
                                    <span
                                        class="absolute top-1/2 right-3 -translate-y-1/2 text-sm font-medium text-slate-500 dark:text-slate-400"
                                    >
                                        €
                                    </span>
                                </div>
                            </div>

                            <div class="space-y-2">
                                <Label>TAN</Label>
                                <div class="grid grid-cols-3 gap-3">
                                    <Button
                                        v-for="t in tanOptions"
                                        :key="t"
                                        type="button"
                                        variant="outline"
                                        :class="[
                                            'h-11 font-semibold transition',
                                            tan === t
                                                ? 'border-blue-700 bg-blue-700 text-white shadow-sm hover:bg-blue-700 hover:text-white dark:border-blue-500 dark:bg-blue-600'
                                                : 'border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800',
                                        ]"
                                        @click="tan = t"
                                    >
                                        {{ pct(t) }}
                                    </Button>
                                </div>
                            </div>

                            <div class="space-y-2">
                                <Label>Durata</Label>
                                <div class="grid grid-cols-3 gap-3">
                                    <Button
                                        v-for="d in durataOptions"
                                        :key="d"
                                        type="button"
                                        variant="outline"
                                        :class="[
                                            'h-11 font-semibold transition',
                                            durataMesi === d
                                                ? 'border-blue-700 bg-blue-700 text-white shadow-sm hover:bg-blue-700 hover:text-white dark:border-blue-500 dark:bg-blue-600'
                                                : 'border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800',
                                        ]"
                                        @click="durataMesi = d"
                                    >
                                        {{ d }} mesi
                                    </Button>
                                </div>
                            </div>

                            <Separator />

                            <div class="grid gap-6 sm:grid-cols-2">
                                <div class="space-y-2">
                                    <Label for="spese">
                                        Spese di istruttoria
                                    </Label>
                                    <div class="relative">
                                        <Input
                                            id="spese"
                                            :model-value="display(speseIstruttoria, speseFocused)"
                                            type="text"
                                            inputmode="numeric"
                                            class="pr-8"
                                            @update:model-value="(v) => (speseIstruttoria = parseDigits(v))"
                                            @focus="speseFocused = true"
                                            @blur="speseFocused = false"
                                        />
                                        <span
                                            class="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400"
                                        >
                                            €
                                        </span>
                                    </div>
                                </div>
                                <div class="space-y-2">
                                    <Label for="polizza">
                                        Polizza
                                    </Label>
                                    <div class="relative">
                                        <Input
                                            id="polizza"
                                            :model-value="display(polizza, polizzaFocused)"
                                            type="text"
                                            inputmode="numeric"
                                            class="pr-8"
                                            @update:model-value="(v) => (polizza = parseDigits(v))"
                                            @focus="polizzaFocused = true"
                                            @blur="polizzaFocused = false"
                                        />
                                        <span
                                            class="absolute top-1/2 right-3 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400"
                                        >
                                            €
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                class="w-full gap-2 border-blue-200 text-blue-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-900 dark:text-blue-300 dark:hover:bg-blue-950/40"
                                @click="toggleCompare"
                            >
                                <ArrowLeftRight
                                    v-if="!snapshot"
                                    class="h-4 w-4"
                                />
                                <X v-else class="h-4 w-4" />
                                {{
                                    snapshot
                                        ? 'Esci dal confronto'
                                        : 'Confronta con un\'altra configurazione'
                                }}
                            </Button>
                        </CardContent>
                    </div>

                    <aside
                        class="relative flex flex-col justify-between gap-6 bg-gradient-to-br from-slate-900 via-blue-900 to-blue-800 p-5 text-white sm:p-6 lg:p-8 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900"
                    >
                        <template v-if="!snapshot">
                            <div>
                                <p
                                    class="text-xs font-medium tracking-widest text-blue-200/80 uppercase"
                                >
                                    Rata mensile
                                </p>
                                <p
                                    class="mt-2 text-3xl font-bold tabular-nums sm:text-4xl lg:text-5xl"
                                >
                                    {{ eur(result.rata) }}
                                </p>
                                <p class="mt-1 text-sm text-blue-200/80">
                                    per {{ durataMesi }} mesi · TAN
                                    {{ pct(tan) }}
                                </p>
                            </div>

                            <div class="space-y-3 text-sm">
                                <div
                                    class="flex items-center justify-between border-b border-white/10 pb-3"
                                >
                                    <span class="text-blue-100/80">TAN</span>
                                    <span class="font-semibold tabular-nums">
                                        {{ pct(tan) }}
                                    </span>
                                </div>
                                <div
                                    class="flex items-center justify-between border-b border-white/10 pb-3"
                                >
                                    <span class="text-blue-100/80">
                                        Capitale ammortizzato
                                    </span>
                                    <span class="font-semibold tabular-nums">
                                        {{ eur(capitale) }}
                                    </span>
                                </div>
                                <div
                                    class="flex items-center justify-between border-b border-white/10 pb-3"
                                >
                                    <span class="text-blue-100/80">
                                        Interessi
                                    </span>
                                    <span class="font-semibold tabular-nums">
                                        {{ eur(interessi) }}
                                    </span>
                                </div>
                                <div
                                    class="flex items-center justify-between"
                                >
                                    <span class="text-blue-100/80">
                                        Totale dovuto
                                    </span>
                                    <span
                                        class="text-lg font-bold tabular-nums text-emerald-300"
                                    >
                                        {{ eur(result.totale) }}
                                    </span>
                                </div>
                            </div>
                        </template>

                        <template v-else-if="snapshotResult">
                            <div>
                                <p
                                    class="text-xs font-medium tracking-widest text-blue-200/80 uppercase"
                                >
                                    Confronto rate
                                </p>
                                <div class="mt-3 grid grid-cols-2 gap-4">
                                    <div>
                                        <span
                                            class="inline-flex items-center rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-bold tracking-wider"
                                        >
                                            A
                                        </span>
                                        <p
                                            class="mt-1 text-[11px] text-blue-200/80"
                                        >
                                            TAN {{ pct(snapshot.tan) }} ·
                                            {{ snapshot.durataMesi }} mesi
                                        </p>
                                        <p
                                            class="mt-2 text-xl font-bold tabular-nums sm:text-2xl"
                                        >
                                            {{ eur(snapshotResult.rata) }}
                                        </p>
                                    </div>
                                    <div>
                                        <span
                                            class="inline-flex items-center rounded-md bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-300"
                                        >
                                            B
                                        </span>
                                        <p
                                            class="mt-1 text-[11px] text-blue-200/80"
                                        >
                                            TAN {{ pct(tan) }} ·
                                            {{ durataMesi }} mesi
                                        </p>
                                        <p
                                            class="mt-2 text-xl font-bold tabular-nums sm:text-2xl"
                                        >
                                            {{ eur(result.rata) }}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div class="space-y-2.5 text-xs">
                                <div
                                    class="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-white/10 pb-2.5"
                                >
                                    <span class="text-blue-100/80">
                                        Capitale
                                    </span>
                                    <span class="tabular-nums">
                                        {{ eur(snapshotCapitale) }}
                                    </span>
                                    <span
                                        class="font-semibold tabular-nums"
                                    >
                                        {{ eur(capitale) }}
                                    </span>
                                </div>
                                <div
                                    class="grid grid-cols-[1fr_auto_auto] items-center gap-3 border-b border-white/10 pb-2.5"
                                >
                                    <span class="text-blue-100/80">
                                        Interessi
                                    </span>
                                    <span class="tabular-nums">
                                        {{ eur(snapshotInteressi) }}
                                    </span>
                                    <span
                                        class="font-semibold tabular-nums"
                                    >
                                        {{ eur(interessi) }}
                                    </span>
                                </div>
                                <div
                                    class="grid grid-cols-[1fr_auto_auto] items-center gap-3 pb-1"
                                >
                                    <span class="text-blue-100/80">
                                        Totale
                                    </span>
                                    <span class="tabular-nums">
                                        {{ eur(snapshotResult.totale) }}
                                    </span>
                                    <span
                                        class="font-semibold tabular-nums text-emerald-300"
                                    >
                                        {{ eur(result.totale) }}
                                    </span>
                                </div>

                                <div
                                    class="mt-2 rounded-lg bg-white/5 p-3 text-[11px]"
                                >
                                    <p class="text-blue-200/80">
                                        Differenza B − A
                                    </p>
                                    <div
                                        class="mt-1.5 flex items-center justify-between"
                                    >
                                        <span class="text-blue-100/80">
                                            Rata
                                        </span>
                                        <span
                                            :class="[
                                                'font-semibold tabular-nums',
                                                deltaRata > 0
                                                    ? 'text-rose-300'
                                                    : deltaRata < 0
                                                        ? 'text-emerald-300'
                                                        : 'text-blue-100/80',
                                            ]"
                                        >
                                            {{ eurSigned(deltaRata) }}
                                        </span>
                                    </div>
                                    <div
                                        class="mt-1 flex items-center justify-between"
                                    >
                                        <span class="text-blue-100/80">
                                            Totale
                                        </span>
                                        <span
                                            :class="[
                                                'font-semibold tabular-nums',
                                                deltaTotale > 0
                                                    ? 'text-rose-300'
                                                    : deltaTotale < 0
                                                        ? 'text-emerald-300'
                                                        : 'text-blue-100/80',
                                            ]"
                                        >
                                            {{ eurSigned(deltaTotale) }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </template>
                    </aside>
                </div>
            </Card>

        </main>

        <footer
            class="mx-auto max-w-6xl px-4 pb-4 text-center text-[11px] text-slate-500 sm:px-6 sm:pb-5 sm:text-xs dark:text-slate-500"
        >
            Strumento di simulazione. Le condizioni effettive dipendono dalla
            banca o dalla captive del concessionario.
        </footer>
    </div>
</template>
