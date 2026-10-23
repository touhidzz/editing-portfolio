import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Loader2, Printer, Copy, Check } from 'lucide-react';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const METHODS = ['bKash', 'Rocket', 'Nagad', 'Bank', 'Other'];

function money(n) {
  return '৳' + Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function fmtDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUS_STYLES = {
  Paid: 'bg-green-100 text-green-700',
  Partial: 'bg-amber-100 text-amber-700',
  Unpaid: 'bg-red-100 text-red-700',
  Cancelled: 'bg-neutral-200 text-neutral-600',
  Pending: 'bg-blue-100 text-blue-700',
  Confirmed: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

function Badge({ label, tone }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
        STATUS_STYLES[tone || label] || 'bg-neutral-100 text-neutral-600'
      }`}
    >
      {label}
    </span>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt('Copy this number:', text);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded-full border border-neutral-300 px-2.5 py-1 text-xs font-medium text-neutral-600 transition hover:border-indigo-500 hover:text-indigo-600"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

const INPUT_CLASS =
  'w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500';

export default function InvoicePage({ token }) {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [tab, setTab] = useState('invoice');

  const [form, setForm] = useState({ method: 'bKash', amount: '', trx_id: '', sender: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  async function load(isFirst) {
    if (!UUID_RE.test(token || '')) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.rpc('get_invoice', { p_token: token });

    if (error) {
      setLoadError(error.message);
      setLoading(false);
      return;
    }

    if (!data) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    setInvoice(data);
    if (isFirst) {
      const due = Math.max(0, Number(data.amount) - Number(data.amount_paid));
      setForm((prev) => ({ ...prev, amount: due > 0 ? String(due) : '' }));
    }
    setLoading(false);
  }

  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    setSubmitted(false);

    const balanceDue = Math.max(0, Number(invoice.amount) - Number(invoice.amount_paid));
    const amount = Number(form.amount);

    if (!amount || amount <= 0) {
      setFormError('Please enter the amount you paid.');
      return;
    }
    if (amount > balanceDue) {
      setFormError(`The amount cannot be more than the balance due (${money(balanceDue)}).`);
      return;
    }
    if (!form.trx_id.trim()) {
      setFormError('Please enter the transaction ID (TrxID).');
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.rpc('submit_payment', {
      p_token: token,
      p_amount: amount,
      p_method: form.method,
      p_trx_id: form.trx_id.trim(),
      p_sender: form.sender.trim(),
    });

    setSubmitting(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    setSubmitted(true);
    setForm((prev) => ({ ...prev, trx_id: '', sender: '' }));
    await load(false);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
      </div>
    );
  }

  if (notFound || loadError || !invoice) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-100 px-6 text-center">
        <div>
          <h1 className="text-xl font-semibold text-neutral-900">Invoice not found</h1>
          <p className="mt-2 text-sm text-neutral-500">
            {loadError
              ? `Something went wrong: ${loadError}`
              : 'This link may be incorrect or expired. Please check it or contact the sender.'}
          </p>
        </div>
      </div>
    );
  }

  const payments = invoice.payments || [];
  const confirmed = payments.filter((p) => p.status === 'Confirmed');
  const pending = payments.filter((p) => p.status === 'Pending');
  const total = Number(invoice.amount);
  const paid = Number(invoice.amount_paid);
  const balance = Math.max(0, total - paid);
  const canPay = invoice.status !== 'Paid' && invoice.status !== 'Cancelled' && balance > 0;
  const settings = invoice.settings || {};
  const numbers = [
    { label: 'bKash', value: settings.bkash_number },
    { label: 'Rocket', value: settings.rocket_number },
    { label: 'Nagad', value: settings.nagad_number },
  ].filter((n) => n.value);

  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-8 text-neutral-900 print:bg-white print:p-0">
      <div className="mx-auto max-w-2xl">
        {/* Tabs + print */}
        <div className="mb-4 flex items-center justify-between gap-3 print:hidden">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTab('invoice')}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                tab === 'invoice'
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-neutral-300 bg-white text-neutral-600 hover:border-neutral-400'
              }`}
            >
              Invoice
            </button>
            {confirmed.length > 0 && (
              <button
                type="button"
                onClick={() => setTab('receipt')}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  tab === 'receipt'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-neutral-300 bg-white text-neutral-600 hover:border-neutral-400'
                }`}
              >
                Receipt{confirmed.length > 1 ? 's' : ''}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:border-indigo-500 hover:text-indigo-600"
          >
            <Printer className="h-4 w-4" />
            Print / Save PDF
          </button>
        </div>

        {/* Document */}
        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm sm:p-10 print:rounded-none print:p-0 print:shadow-none">
          {invoice.status === 'Paid' && (
            <div className="pointer-events-none absolute right-6 top-24 -rotate-12 rounded-lg border-4 border-green-600 px-4 py-1 text-3xl font-extrabold tracking-widest text-green-600/80 sm:right-10">
              PAID
            </div>
          )}

          <div className="flex items-start justify-between gap-4 border-b border-neutral-200 pb-6">
            <div>
              <div className="text-lg font-extrabold tracking-wide">
                PIXEL <span className="text-indigo-600">NARRATIVE</span>
              </div>
              <div className="mt-1 text-xs text-neutral-500">Video editing</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
                {tab === 'receipt' ? 'Payment receipt' : 'Invoice'}
              </div>
              <div className="mt-1 text-lg font-bold">{invoice.invoice_no}</div>
            </div>
          </div>

          {tab === 'invoice' && (
            <>
              <div className="grid grid-cols-2 gap-6 py-6 text-sm sm:grid-cols-4">
                <div>
                  <div className="text-xs uppercase tracking-wide text-neutral-400">Billed to</div>
                  <div className="mt-1 font-semibold">{invoice.client_name}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-neutral-400">Issued</div>
                  <div className="mt-1 font-semibold">{fmtDate(invoice.issue_date)}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-neutral-400">Due</div>
                  <div className="mt-1 font-semibold">{fmtDate(invoice.due_date)}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-neutral-400">Status</div>
                  <div className="mt-1">
                    <Badge label={invoice.status} />
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-neutral-50 p-5">
                <div className="font-semibold">{invoice.project_name}</div>
                {invoice.description && (
                  <p className="mt-1 whitespace-pre-line text-sm text-neutral-600">
                    {invoice.description}
                  </p>
                )}
              </div>

              <div className="mt-6 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Total</span>
                  <span className="font-semibold">{money(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Paid</span>
                  <span className="font-semibold">{money(paid)}</span>
                </div>
                <div className="flex justify-between border-t border-neutral-200 pt-3 text-base">
                  <span className="font-semibold">Balance due</span>
                  <span className="text-xl font-extrabold">{money(balance)}</span>
                </div>
              </div>

              {invoice.notes && (
                <p className="mt-6 whitespace-pre-line text-sm text-neutral-500">{invoice.notes}</p>
              )}

              {payments.length > 0 && (
                <div className="mt-8">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                    Payments
                  </div>
                  <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200">
                    {payments.map((p, i) => (
                      <div
                        key={i}
                        className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
                      >
                        <div>
                          <div className="font-medium">
                            {money(p.amount)} · {p.method}
                          </div>
                          <div className="text-xs text-neutral-500">
                            TrxID {p.trx_id} · {fmtDate(p.paid_at || p.submitted_at)}
                          </div>
                        </div>
                        <Badge
                          label={p.status === 'Rejected' ? 'Not verified' : p.status}
                          tone={p.status}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {tab === 'receipt' && (
            <div className="space-y-5 py-6">
              {confirmed.map((p, i) => (
                <div key={i} className="rounded-xl border border-neutral-200 p-5 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="font-bold">{p.receipt_no || 'Receipt'}</div>
                    <Badge label="Payment received" tone="Confirmed" />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                      <div className="text-xs uppercase tracking-wide text-neutral-400">Received from</div>
                      <div className="mt-0.5 font-semibold">{invoice.client_name}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-neutral-400">Date paid</div>
                      <div className="mt-0.5 font-semibold">{fmtDate(p.paid_at)}</div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-neutral-400">For</div>
                      <div className="mt-0.5 font-semibold">
                        {invoice.project_name} ({invoice.invoice_no})
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-neutral-400">Method</div>
                      <div className="mt-0.5 font-semibold">{p.method}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs uppercase tracking-wide text-neutral-400">Transaction ID</div>
                      <div className="mt-0.5 font-semibold">{p.trx_id}</div>
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-neutral-200 pt-4">
                    <span className="font-semibold">Amount received</span>
                    <span className="text-xl font-extrabold">{money(p.amount)}</span>
                  </div>
                </div>
              ))}

              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Invoice total</span>
                  <span className="font-semibold">{money(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Total paid</span>
                  <span className="font-semibold">{money(paid)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Balance due</span>
                  <span className="font-semibold">{money(balance)}</span>
                </div>
              </div>
            </div>
          )}

          <p className="mt-8 border-t border-neutral-200 pt-5 text-center text-xs text-neutral-400">
            Thank you for your business.
          </p>
        </div>

        {/* Payment section (hidden when printing) */}
        {canPay && (
          <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8 print:hidden">
            <h2 className="text-lg font-bold">Pay this invoice</h2>

            {numbers.length > 0 || settings.other_details || settings.instructions ? (
              <div className="mt-4 space-y-3 rounded-xl bg-neutral-50 p-4 text-sm">
                <div className="text-neutral-600">
                  Send <span className="font-bold text-neutral-900">{money(balance)}</span> to one of
                  these, then enter your transaction ID below.
                </div>
                {numbers.map((n) => (
                  <div key={n.label} className="flex items-center justify-between gap-3">
                    <div>
                      <span className="font-semibold">{n.label}</span>
                      <span className="ml-2 text-neutral-700">{n.value}</span>
                    </div>
                    <CopyButton text={n.value} />
                  </div>
                ))}
                {settings.other_details && (
                  <p className="whitespace-pre-line text-neutral-600">{settings.other_details}</p>
                )}
                {settings.instructions && (
                  <p className="whitespace-pre-line text-neutral-500">{settings.instructions}</p>
                )}
              </div>
            ) : (
              <p className="mt-3 text-sm text-neutral-500">
                Please contact me for payment details.
              </p>
            )}

            {pending.length > 0 && (
              <p className="mt-4 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
                {pending.length === 1 ? 'A payment is' : `${pending.length} payments are`} waiting to
                be verified. This page will update once confirmed.
              </p>
            )}

            <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Paid with
                <select
                  name="method"
                  value={form.method}
                  onChange={handleChange}
                  className={INPUT_CLASS}
                >
                  {METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Amount paid (৳)
                <input
                  type="number"
                  name="amount"
                  min="1"
                  step="any"
                  value={form.amount}
                  onChange={handleChange}
                  className={INPUT_CLASS}
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Transaction ID (TrxID)
                <input
                  type="text"
                  name="trx_id"
                  value={form.trx_id}
                  onChange={handleChange}
                  placeholder="e.g. 9K4L2M8XQ1"
                  className={INPUT_CLASS}
                />
              </label>

              <label className="flex flex-col gap-1.5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Number you paid from
                <input
                  type="text"
                  name="sender"
                  value={form.sender}
                  onChange={handleChange}
                  placeholder="01XXXXXXXXX"
                  className={INPUT_CLASS}
                />
              </label>

              {formError && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600 sm:col-span-2">
                  {formError}
                </p>
              )}

              {submitted && (
                <p className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700 sm:col-span-2">
                  Thank you! Your payment details were sent. Your receipt will appear here after I
                  verify the payment.
                </p>
              )}

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "I've paid — submit details"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
