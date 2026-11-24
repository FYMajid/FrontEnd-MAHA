'use client';

import { useSyncExternalStore } from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Clock,
  CreditCard,
  Gavel,
  LayoutDashboard,
} from 'lucide-react';

const cardSurface =
  'min-w-0 rounded-2xl border border-[#2B2A2A]/10 bg-white transition-colors duration-300 dark:border-[#F5F2F2]/10 dark:bg-[#333232]';

const mutedText = 'text-[#2B2A2A]/70 dark:text-[#F5F2F2]/70';
const brandText = 'text-[#4664B5] dark:text-[#A9BDF0]';
const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5A7ACD] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5F2F2] dark:focus-visible:ring-[#A9BDF0] dark:focus-visible:ring-offset-[#333232]';
const primaryAction = `inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#4664B5] px-4 text-sm font-bold text-white transition-colors hover:bg-[#3A559E] active:bg-[#334B8B] motion-reduce:transition-none ${focusRing}`;

const subscribeToSeconds = (onTick: () => void) => {
  const timer = window.setInterval(onTick, 1000);
  return () => window.clearInterval(timer);
};

const getSecondSnapshot = () => Math.floor(Date.now() / 1000);
const getServerSecondSnapshot = (): number | null => null;

const DigitalClock = () => {
  const currentSecond = useSyncExternalStore(
    subscribeToSeconds,
    getSecondSnapshot,
    getServerSecondSnapshot,
  );

  const pad = (value: number) => value.toString().padStart(2, '0');

  if (currentSecond === null) {
    return (
      <div className="flex flex-col items-center gap-4" aria-hidden="true">
        <div className="flex items-baseline justify-center gap-2 font-mono leading-none">
          <span className="text-5xl font-black tracking-tight tabular-nums sm:text-6xl">--:--</span>
          <span className="w-9 text-2xl font-bold tabular-nums text-[#4664B5] dark:text-[#A9BDF0]">--</span>
        </div>
        <span className="rounded-full border border-[#2B2A2A]/10 bg-[#F5F2F2] px-4 py-1.5 text-xs font-semibold dark:border-[#F5F2F2]/10 dark:bg-[#232323]">
          Memuat tanggal
        </span>
      </div>
    );
  }

  const time = new Date(currentSecond * 1000);
  const dateLabel = time.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-baseline justify-center gap-2 font-mono leading-none">
        <time
          dateTime={time.toISOString()}
          className="text-5xl font-black tracking-tight tabular-nums sm:text-6xl"
        >
          {pad(time.getHours())}:{pad(time.getMinutes())}
        </time>
        <span
          className="w-9 text-2xl font-bold tabular-nums text-[#4664B5] dark:text-[#A9BDF0]"
          aria-hidden="true"
        >
          {pad(time.getSeconds())}
        </span>
      </div>
      <p className="rounded-full border border-[#2B2A2A]/10 bg-[#F5F2F2] px-4 py-1.5 text-xs font-semibold dark:border-[#F5F2F2]/10 dark:bg-[#232323]">
        {dateLabel}
      </p>
    </div>
  );
};

type InvoiceTone = 'muted' | 'accent' | 'default';

const invoiceTone: Record<InvoiceTone, string> = {
  muted: 'text-[#2B2A2A]/70 dark:text-[#F5F2F2]/70',
  accent: 'text-[#965C0F] dark:text-[#FEB05D]',
  default: 'text-[#2B2A2A] dark:text-[#F5F2F2]',
};

const InvoiceRow = ({
  label,
  count,
  amount,
  tone = 'default',
}: {
  label: string;
  count: string;
  amount: string;
  tone?: InvoiceTone;
}) => (
  <div className="flex items-center justify-between gap-4 py-3.5">
    <div className="min-w-0">
      <dt className="text-sm font-semibold">{label}</dt>
      <dd className={`mt-0.5 text-xs ${mutedText}`}>{count} invoice</dd>
    </div>
    <dd className={`shrink-0 text-sm font-black tabular-nums ${invoiceTone[tone]}`}>{amount}</dd>
  </div>
);

export default function Dashboard() {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-clip text-[#2B2A2A] transition-colors duration-300 dark:text-[#F5F2F2]">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#5A7ACD] text-white">
              <LayoutDashboard size={22} aria-hidden="true" />
            </span>
            <h1 className="min-w-0 text-2xl font-black leading-tight tracking-tight sm:text-3xl">
              Papan Informasi Personal
            </h1>
          </div>
          <p className={`mt-2 text-sm sm:text-base ${mutedText}`}>
            Selamat datang kembali,{' '}
            <span className="font-bold text-[#2B2A2A] dark:text-[#F5F2F2]">Aufa Hajran</span>
          </p>
        </div>

        <div className="flex w-full min-w-0 items-center gap-3 rounded-2xl border border-[#2B2A2A]/10 bg-white p-2 pr-4 sm:w-auto dark:border-[#F5F2F2]/10 dark:bg-[#333232]">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#5A7ACD] text-xl font-black text-white">
            AH
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-tight">Aufa Hajran</p>
            <p className={`truncate text-[11px] font-semibold uppercase tracking-wide ${mutedText}`}>
              Senior Associate
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12 xl:gap-6">
        <div className="min-w-0 space-y-5 xl:col-span-8 xl:space-y-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:gap-6">
            <section
              className={`relative flex min-h-[200px] items-center justify-center p-5 sm:p-6 ${cardSurface}`}
            >
              <Clock
                size={18}
                aria-hidden="true"
                className="absolute right-5 top-5 text-[#2B2A2A]/30 dark:text-[#F5F2F2]/30"
              />
              <DigitalClock />
            </section>

            <section className={`relative flex flex-col overflow-hidden p-5 sm:p-6 ${cardSurface}`}>
              <Gavel
                size={160}
                aria-hidden="true"
                className="pointer-events-none absolute -bottom-10 -right-8 text-[#2B2A2A]/5 dark:text-[#F5F2F2]/5"
              />
              <div className="relative z-10 flex h-full flex-col">
                <h2 className="text-xl font-black">Agenda Sidang</h2>
                <p className={`mt-2 max-w-[34ch] text-sm leading-relaxed ${mutedText}`}>
                  Belum ada agenda sidang untuk hari ini. Waktu ini bisa dipakai untuk meninjau
                  berkas atau riset hukum.
                </p>
                <Link href="/calendar" className={`mt-5 w-fit md:mt-auto ${primaryAction}`}>
                  <CalendarIcon size={16} aria-hidden="true" />
                  Buka kalender
                </Link>
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:gap-6">
            <section className={`flex h-full flex-col ${cardSurface}`}>
              <div className="flex items-center gap-2.5 border-b border-[#2B2A2A]/10 px-5 py-4 dark:border-[#F5F2F2]/10">
                <CreditCard size={18} aria-hidden="true" className={brandText} />
                <h2 className="text-base font-black">Ringkasan Invoice</h2>
              </div>
              <dl className="flex flex-1 flex-col justify-center divide-y divide-[#2B2A2A]/10 px-5 dark:divide-[#F5F2F2]/10">
                <InvoiceRow label="Draft" count="0" amount="Rp 0" tone="muted" />
                <InvoiceRow label="Belum dibayar" count="12" amount="Rp 4.500.000" tone="accent" />
                <InvoiceRow label="Sudah dibayar" count="8" amount="Rp 12.000.000" />
              </dl>
            </section>

            <section className={`flex h-full flex-col p-5 sm:p-6 ${cardSurface}`}>
              <div className="flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-base font-black">
                  <Gavel size={18} aria-hidden="true" className={brandText} />
                  Perkara Aktif
                </h2>
                <span className="shrink-0 rounded-full border border-[#5A7ACD]/25 bg-[#5A7ACD]/10 px-3 py-1 text-[11px] font-bold text-[#4664B5] dark:border-[#5A7ACD]/30 dark:bg-[#5A7ACD]/15 dark:text-[#A9BDF0]">
                  Berjalan
                </span>
              </div>
              <p className={`mt-1.5 text-[11px] font-semibold ${mutedText}`}>CASE ID: #25110002</p>

              <div className="mt-4 min-w-0">
                <h3 className="break-words text-xl font-black">Test Person 01</h3>
                <p className={`mt-1 text-sm font-bold ${brandText}`}>Pidana Lalu Lintas</p>
                <div className="mt-4 rounded-xl bg-[#F5F2F2] p-3.5 dark:bg-[#232323]">
                  <p className={`text-[11px] font-semibold uppercase tracking-wide ${mutedText}`}>
                    Sisa tagihan
                  </p>
                  <p className="mt-1 text-xl font-black tabular-nums text-[#965C0F] dark:text-[#FEB05D]">
                    Rp 1.250.000
                  </p>
                </div>
              </div>

              <Link
                href="/matters"
                className={`mt-4 inline-flex min-h-11 w-fit items-center text-sm font-bold underline-offset-4 hover:underline motion-reduce:transition-none md:mt-auto ${brandText} ${focusRing}`}
              >
                Lihat detail perkara
              </Link>
            </section>
          </div>
        </div>

        <div className="min-w-0 space-y-5 xl:col-span-4 xl:space-y-6">
          <section className={`flex flex-col p-5 sm:p-6 ${cardSurface}`}>
            <h2 className="flex items-center gap-2 text-base font-black">
              <CalendarIcon size={18} aria-hidden="true" className={brandText} />
              Jadwal Bulanan
            </h2>
            <div className="mt-4 flex min-h-[190px] flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-[#2B2A2A]/15 px-4 py-8 text-center dark:border-[#F5F2F2]/15">
              <CalendarIcon
                size={32}
                aria-hidden="true"
                className="text-[#2B2A2A]/30 dark:text-[#F5F2F2]/30"
              />
              <p className="mt-3 text-sm font-bold">Belum ada jadwal</p>
              <p className={`mt-1 max-w-[28ch] text-xs leading-relaxed ${mutedText}`}>
                Agenda sidang dan pertemuan akan tampil di sini.
              </p>
              <Link
                href="/calendar"
                className={`mt-4 inline-flex min-h-11 items-center rounded-xl border border-[#2B2A2A]/15 px-4 text-xs font-bold transition-colors hover:bg-[#F5F2F2] motion-reduce:transition-none dark:border-[#F5F2F2]/15 dark:hover:bg-[#232323] ${focusRing}`}
              >
                Buka kalender
              </Link>
            </div>
          </section>

          <section className={`flex flex-col p-5 sm:p-6 ${cardSurface}`}>
            <h2 className="text-base font-black">Informasi Akun</h2>
            <dl className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-4 border-b border-[#2B2A2A]/10 pb-3 dark:border-[#F5F2F2]/10">
                <dt className={`text-xs font-semibold ${mutedText}`}>Status</dt>
                <dd className="text-right text-sm font-bold">Mahasiswa Hukum</dd>
              </div>
              <div className="flex items-center justify-between gap-4 border-b border-[#2B2A2A]/10 pb-3 dark:border-[#F5F2F2]/10">
                <dt className={`text-xs font-semibold ${mutedText}`}>Tipe akun</dt>
                <dd className="text-right text-sm font-bold">Advance</dd>
              </div>
            </dl>
            <Link href="/me" className={`mt-5 w-full ${primaryAction}`}>
              Pengaturan profil
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
