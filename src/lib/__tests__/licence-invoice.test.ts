import { describe, it, expect, vi, beforeEach } from "vitest";

const mockNotify = vi.hoisted(() => vi.fn().mockResolvedValue(true));
const mockCreateLicence = vi.hoisted(() => vi.fn());
const mockFindByCustomer = vi.hoisted(() => vi.fn());
const mockRename = vi.hoisted(() => vi.fn().mockResolvedValue(true));
const mockSendLicence = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const mockGa = vi.hoisted(() => vi.fn().mockResolvedValue(true));
const mockUserFind = vi.hoisted(() => vi.fn());
const mockLicenceFindFirst = vi.hoisted(() => vi.fn().mockResolvedValue(null));
const mockLicenceUpdate = vi.hoisted(() => vi.fn());
const mockEmailSendCreate = vi.hoisted(() => vi.fn().mockResolvedValue({}));

vi.mock("@/lib/notify", () => ({ notifyOwner: mockNotify }));
vi.mock("@/lib/db", () => ({
  prisma: {
    user: { findUnique: mockUserFind },
    licence: { findFirst: mockLicenceFindFirst, update: mockLicenceUpdate },
    emailSend: { create: mockEmailSendCreate },
  },
}));
vi.mock("@/lib/licence", () => ({
  createLicence: mockCreateLicence,
  findLicenceByStripeCustomer: mockFindByCustomer,
  renameLicence: mockRename,
  isLicenceKind: (x: unknown) => x === "classroom" || x === "school",
  seatsForKind: (k: string) => (k === "school" ? 0 : 31),
}));
vi.mock("@/lib/email", () => ({ sendLicenceEmail: mockSendLicence }));
vi.mock("@/lib/ga-server", () => ({ sendPurchaseToGA4: mockGa }));

import type Stripe from "stripe";
import {
  LICENCE_INVOICE_PRODUCT,
  fulfilLicenceInvoice,
  invoiceCurrency,
  isLicenceInvoice,
  isStripePermissionError,
  issueLicenceInvoice,
  parseInvoiceRequest,
  requestLicenceInvoice,
  type InvoiceRequest,
} from "@/lib/licence-invoice";

const valid = {
  plan: "school",
  schoolName: "  St Mary's   Primary ",
  contactName: "Jo Bloggs",
  contactEmail: "Finance@StMarys.sch.uk",
  line1: "1 Church Lane",
  city: "York",
  postcode: "YO1 7HH",
  country: "gb",
  poNumber: "PO-1234",
};

const req: InvoiceRequest = {
  plan: "school",
  schoolName: "St Mary's Primary",
  contactName: "Jo Bloggs",
  contactEmail: "finance@stmarys.sch.uk",
  line1: "1 Church Lane",
  line2: "",
  city: "York",
  postcode: "YO1 7HH",
  country: "GB",
  poNumber: "PO-1234",
  vatNumber: "",
  renewLicenceId: "",
};
const owner = { userId: "user_1", email: "teacher@stmarys.sch.uk" };

function fakeStripe(overrides: Partial<Record<string, ReturnType<typeof vi.fn>>> = {}) {
  const calls = {
    customersCreate: overrides.customersCreate ?? vi.fn().mockResolvedValue({ id: "cus_1" }),
    invoicesCreate: overrides.invoicesCreate ?? vi.fn().mockResolvedValue({ id: "in_1" }),
    invoiceItemsCreate: overrides.invoiceItemsCreate ?? vi.fn().mockResolvedValue({ id: "ii_1" }),
    finalize: overrides.finalize ?? vi.fn().mockResolvedValue({ id: "in_1" }),
    send: overrides.send ?? vi.fn().mockResolvedValue({ id: "in_1", number: "ABC-0001", hosted_invoice_url: "https://invoice.stripe.com/i/x" }),
  };
  const stripe = {
    customers: { create: calls.customersCreate },
    invoices: { create: calls.invoicesCreate, finalizeInvoice: calls.finalize, sendInvoice: calls.send },
    invoiceItems: { create: calls.invoiceItemsCreate },
  } as unknown as Stripe;
  return { stripe, calls };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockFindByCustomer.mockResolvedValue(null);
  mockCreateLicence.mockResolvedValue({ id: "lic_1", code: "ABCD-EFGH", schoolName: null });
  mockUserFind.mockResolvedValue({ id: "user_1", email: "teacher@stmarys.sch.uk", name: "Ms Teacher" });
});

describe("parseInvoiceRequest", () => {
  it("tidies a valid request", () => {
    const r = parseInvoiceRequest(valid);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.value.schoolName).toBe("St Mary's Primary");
    expect(r.value.contactEmail).toBe("finance@stmarys.sch.uk");
    expect(r.value.country).toBe("GB");
    expect(r.value.vatNumber).toBe("");
  });

  it.each([
    [{ ...valid, plan: "lifetime" }, /Classroom or School/],
    [{ ...valid, schoolName: "" }, /school's name/],
    [{ ...valid, contactEmail: "nope" }, /email/],
    [{ ...valid, postcode: "" }, /billing address/],
    [{ ...valid, country: "Britain" }, /country/i],
  ])("rejects %#", (body, msg) => {
    const r = parseInvoiceRequest(body);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(msg);
  });

  it("rejects a missing body", () => {
    expect(parseInvoiceRequest(null).ok).toBe(false);
  });
});

describe("currency and errors", () => {
  it("invoices UK schools in GBP and everyone else in USD", () => {
    expect(invoiceCurrency("GB")).toBe("GBP");
    expect(invoiceCurrency("IE")).toBe("USD");
    expect(invoiceCurrency("US")).toBe("USD");
  });

  it("spots a restricted-key refusal", () => {
    expect(isStripePermissionError({ type: "StripePermissionError" })).toBe(true);
    expect(isStripePermissionError({ statusCode: 403 })).toBe(true);
    expect(isStripePermissionError({ type: "StripeInvalidRequestError", statusCode: 400 })).toBe(false);
  });

  it("only treats our own invoices as licence invoices", () => {
    expect(isLicenceInvoice({ metadata: { product: LICENCE_INVOICE_PRODUCT } })).toBe(true);
    expect(isLicenceInvoice({ metadata: {} })).toBe(false);
    expect(isLicenceInvoice({ metadata: null } as never)).toBe(false);
  });
});

describe("issueLicenceInvoice", () => {
  it("creates the customer, a 30-day send_invoice invoice in GBP with the PO, the line, then finalises and sends", async () => {
    const { stripe, calls } = fakeStripe();
    const out = await issueLicenceInvoice(stripe, req, owner);
    expect(out).toEqual({ invoiceId: "in_1", customerId: "cus_1", number: "ABC-0001", hostedInvoiceUrl: "https://invoice.stripe.com/i/x" });

    const customer = calls.customersCreate.mock.calls[0][0];
    expect(customer).toMatchObject({ name: "St Mary's Primary", email: "finance@stmarys.sch.uk", address: { country: "GB", postal_code: "YO1 7HH" } });

    const inv = calls.invoicesCreate.mock.calls[0][0];
    expect(inv).toMatchObject({ customer: "cus_1", collection_method: "send_invoice", days_until_due: 30, currency: "gbp" });
    expect(inv.metadata).toMatchObject({ product: "licence-invoice", plan: "school", owner_email: "teacher@stmarys.sch.uk", owner_user_id: "user_1", school: "St Mary's Primary", po_number: "PO-1234" });
    expect(inv.custom_fields).toContainEqual({ name: "Purchase order", value: "PO-1234" });
    expect(inv.payment_settings.payment_method_types).toContain("customer_balance");

    expect(calls.invoiceItemsCreate.mock.calls[0][0]).toMatchObject({ invoice: "in_1", amount: 9950, currency: "gbp" });
    expect(calls.finalize).toHaveBeenCalledWith("in_1", expect.anything());
    expect(calls.send).toHaveBeenCalledWith("in_1");
  });

  it("charges a US school the dollar price", async () => {
    const { stripe, calls } = fakeStripe();
    await issueLicenceInvoice(stripe, { ...req, plan: "classroom", country: "US" }, owner);
    expect(calls.invoiceItemsCreate.mock.calls[0][0]).toMatchObject({ amount: 2950, currency: "usd" });
  });

  it("retries without bank transfer when the account cannot offer it", async () => {
    const invoicesCreate = vi
      .fn()
      .mockRejectedValueOnce(Object.assign(new Error("customer_balance is not enabled"), { type: "StripeInvalidRequestError", statusCode: 400 }))
      .mockResolvedValueOnce({ id: "in_2" });
    const { stripe } = fakeStripe({ invoicesCreate, finalize: vi.fn().mockResolvedValue({ id: "in_2" }), send: vi.fn().mockResolvedValue({ id: "in_2", number: null }) });
    const out = await issueLicenceInvoice(stripe, req, owner);
    expect(out.invoiceId).toBe("in_2");
    expect(invoicesCreate.mock.calls[1][0].payment_settings).toBeUndefined();
  });
});

describe("requestLicenceInvoice", () => {
  it("returns the sent invoice and tells the owner", async () => {
    const { stripe } = fakeStripe();
    const out = await requestLicenceInvoice(stripe, req, owner);
    expect(out.mode).toBe("sent");
    expect(mockNotify.mock.calls[0][0].subject).toMatch(/^Licence invoice sent/);
  });

  it("falls back to ACTION NEEDED when the restricted key is refused", async () => {
    const { stripe } = fakeStripe({ customersCreate: vi.fn().mockRejectedValue(Object.assign(new Error("does not have the required permissions"), { type: "StripePermissionError", statusCode: 403 })) });
    const out = await requestLicenceInvoice(stripe, req, owner);
    expect(out).toEqual({ mode: "manual" });
    const mail = mockNotify.mock.calls[0][0];
    expect(mail.subject).toMatch(/^ACTION NEEDED: issue invoice by hand in the Stripe dashboard/);
    expect(mail.text).toContain("PO number: PO-1234");
    expect(mail.text).toContain("finance@stmarys.sch.uk");
    expect(mail.text).toContain("product = licence-invoice");
    expect(mail.text).toMatch(/write access to Customers, Invoices and Invoice items/);
    expect(mail.replyTo).toBe("finance@stmarys.sch.uk");
  });

  it("falls back with no Stripe at all", async () => {
    const out = await requestLicenceInvoice(null, req, owner);
    expect(out).toEqual({ mode: "manual" });
    expect(mockNotify.mock.calls[0][0].text).toContain("no Stripe key configured");
  });
});

describe("fulfilLicenceInvoice", () => {
  const paid = {
    id: "in_1",
    number: "ABC-0001",
    customer: "cus_1",
    amount_paid: 9950,
    currency: "gbp",
    metadata: { product: "licence-invoice", plan: "school", owner_user_id: "user_1", owner_email: "teacher@stmarys.sch.uk", school: "St Mary's Primary", contact_name: "Jo", po_number: "PO-1234" },
  } as unknown as Stripe.Invoice;
  const now = new Date("2026-10-16T12:00:00Z");

  it("creates a year's licence for the teacher, names it after the school and emails the code", async () => {
    expect(await fulfilLicenceInvoice(paid, now)).toBe("created");
    expect(mockCreateLicence).toHaveBeenCalledWith({
      ownerUserId: "user_1",
      kind: "school",
      stripeCustomerId: "cus_1",
      stripeSubscriptionId: null,
      currentPeriodEnd: new Date("2027-10-16T12:00:00Z"),
    });
    expect(mockRename).toHaveBeenCalledWith("user_1", "lic_1", "St Mary's Primary");
    expect(mockSendLicence).toHaveBeenCalledWith({ name: "Ms Teacher", email: "teacher@stmarys.sch.uk", kind: "school", code: "ABCD-EFGH" });
    expect(mockGa).toHaveBeenCalledWith(expect.objectContaining({ transactionId: "in_1", value: 99.5, currency: "gbp" }));
  });

  it("does nothing twice on a webhook retry (the invoice id is already marked)", async () => {
    mockEmailSendCreate.mockRejectedValueOnce(new Error("Unique constraint failed"));
    mockCreateLicence.mockClear();
    expect(await fulfilLicenceInvoice(paid, now)).toBe("duplicate");
    expect(mockCreateLicence).not.toHaveBeenCalled();
    expect(mockSendLicence).not.toHaveBeenCalled();
  });

  it("falls back to the owner email when the user id is gone, and flags a missing account", async () => {
    mockUserFind.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
    expect(await fulfilLicenceInvoice(paid, now)).toBe("no-account");
    expect(mockUserFind).toHaveBeenLastCalledWith(expect.objectContaining({ where: { email: "teacher@stmarys.sch.uk" } }));
    expect(mockCreateLicence).not.toHaveBeenCalled();
    expect(mockNotify.mock.calls[0][0].subject).toMatch(/^ACTION NEEDED/);
  });

  it("flags an invoice with no usable plan", async () => {
    const bad = { ...paid, metadata: { ...paid.metadata, plan: "lifetime" } } as unknown as Stripe.Invoice;
    expect(await fulfilLicenceInvoice(bad, now)).toBe("bad-metadata");
    expect(mockCreateLicence).not.toHaveBeenCalled();
  });

  it("still succeeds when the licence email fails", async () => {
    mockSendLicence.mockRejectedValueOnce(new Error("resend down"));
    expect(await fulfilLicenceInvoice(paid, now)).toBe("created");
  });
});

describe("fulfilLicenceInvoice: renewal", () => {
  it("runs the teacher's existing invoiced licence on, same code, instead of minting a new one", async () => {
    const oldEnd = new Date(Date.now() + 10 * 86_400_000);
    mockFindByCustomer.mockResolvedValueOnce(null);
    mockUserFind.mockResolvedValueOnce({ id: "u1", email: "t@school.org", name: "Teacher" });
    mockLicenceFindFirst.mockResolvedValueOnce({ id: "lic1", kind: "school", currentPeriodEnd: oldEnd, _count: { members: 3 } });
    mockLicenceUpdate.mockImplementationOnce(async ({ data }: { data: { currentPeriodEnd: Date } }) => ({ id: "lic1", code: "KEEP01", schoolName: "Hill", ...data }));
    mockCreateLicence.mockClear();
    const invoice = { id: "in_r", number: "R-1", customer: "cus_new", amount_paid: 9950, currency: "gbp", metadata: { plan: "school", owner_user_id: "u1", owner_email: "t@school.org", school: "Hill", renew_licence_id: "lic1abcdef" } } as unknown as Stripe.Invoice;
    expect(await fulfilLicenceInvoice(invoice)).toBe("created");
    expect(mockLicenceFindFirst.mock.calls.at(-1)![0].where).toEqual({ id: "lic1abcdef", ownerUserId: "u1", stripeSubscriptionId: null });
    expect(mockCreateLicence).not.toHaveBeenCalled();
    const data = mockLicenceUpdate.mock.calls[0][0].data;
    expect(data.stripeCustomerId).toBe("cus_new");
    expect(data.currentPeriodEnd.getTime()).toBe(oldEnd.getTime() + 365 * 86_400_000);
  });
});

describe("fulfilLicenceInvoice: second licence", () => {
  it("makes a new licence when the invoice names no licence to renew", async () => {
    mockUserFind.mockResolvedValueOnce({ id: "u2", email: "t2@school.org", name: "T" });
    mockLicenceFindFirst.mockClear();
    mockLicenceUpdate.mockClear();
    mockCreateLicence.mockResolvedValueOnce({ id: "new", code: "NEW001", schoolName: null, currentPeriodEnd: new Date() });
    const invoice = { id: "in_2", number: "N-2", customer: "cus_b", amount_paid: 2950, currency: "gbp", metadata: { plan: "classroom", owner_user_id: "u2", owner_email: "t2@school.org", school: "School B" } } as unknown as Stripe.Invoice;
    expect(await fulfilLicenceInvoice(invoice)).toBe("created");
    expect(mockLicenceFindFirst).not.toHaveBeenCalled();
    expect(mockLicenceUpdate).not.toHaveBeenCalled();
    expect(mockCreateLicence).toHaveBeenCalled();
  });

  it("never shrinks a renewed licence below the pupils already in it", async () => {
    mockUserFind.mockResolvedValueOnce({ id: "u3", email: "t3@school.org", name: "T" });
    mockLicenceFindFirst.mockResolvedValueOnce({ id: "big", kind: "school", currentPeriodEnd: null, _count: { members: 80 } });
    mockLicenceUpdate.mockImplementationOnce(async ({ data }: { data: object }) => ({ id: "big", code: "BIG001", schoolName: "X", ...data }));
    const invoice = { id: "in_3", number: "N-3", customer: "cus_c", amount_paid: 2950, currency: "gbp", metadata: { plan: "classroom", owner_user_id: "u3", owner_email: "t3@school.org", renew_licence_id: "bigabcdefg" } } as unknown as Stripe.Invoice;
    await fulfilLicenceInvoice(invoice);
    expect(mockLicenceUpdate.mock.calls.at(-1)![0].data.kind).toBe("school");
  });
});
