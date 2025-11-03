"use client";

import { useMemo, useRef, useState } from "react";
import QRCode from "react-qr-code";

type AddressType = "home" | "work" | "other";

interface BuildVCardArgs {
  fullName: string;
  email: string;
  phones: string[];
  address: string;
  addressType: AddressType;
  company: string;
  jobTitle: string;
  birthday: string;
  website: string;
  notes: string;
}

const escapeValue = (value: string) =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");

const parsePhoneNumbers = (value: string) =>
  value
    .split(/[\n,;]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);

const buildVCard = ({
  fullName,
  email,
  phones,
  address,
  addressType,
  company,
  jobTitle,
  birthday,
  website,
  notes,
}: BuildVCardArgs) => {
  const lines = ["BEGIN:VCARD", "VERSION:3.0"];

  if (fullName) {
    lines.push(`FN:${escapeValue(fullName)}`);
  }
  if (company) {
    lines.push(`ORG:${escapeValue(company)}`);
  }
  if (jobTitle) {
    lines.push(`TITLE:${escapeValue(jobTitle)}`);
  }

  phones.forEach((number) => {
    lines.push(`TEL;TYPE=CELL:${escapeValue(number)}`);
  });

  if (email) {
    lines.push(`EMAIL;TYPE=INTERNET:${escapeValue(email)}`);
  }
  if (address) {
    const typePrefix =
      addressType === "other" ? "" : `;TYPE=${addressType.toUpperCase()}`;
    lines.push(`ADR${typePrefix}:;;${escapeValue(address)};;;;`);
  }
  if (birthday) {
    lines.push(`BDAY:${birthday}`);
  }
  if (website) {
    lines.push(`URL:${escapeValue(website)}`);
  }
  if (notes) {
    lines.push(`NOTE:${escapeValue(notes)}`);
  }

  if (lines.length === 2) {
    return "";
  }

  lines.push("END:VCARD");
  return lines.join("\n");
};

const inputClasses =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-sky-500 focus:outline-none focus:ring-4 focus:ring-sky-100";

const mutedHelperClasses = "text-xs text-slate-500";

const toggleButtonClasses =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-700 transition hover:border-sky-300 hover:bg-sky-100";

const actionButtonClasses =
  "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-4";

export default function Home() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [address, setAddress] = useState("");
  const [addressType, setAddressType] = useState<AddressType>("home");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [birthday, setBirthday] = useState("");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [lastCopiedValue, setLastCopiedValue] = useState<string | null>(null);
  const qrContainerRef = useRef<HTMLDivElement>(null);

  const vCard = useMemo(
    () =>
      buildVCard({
        fullName,
        email,
        phones: parsePhoneNumbers(phoneInput),
        address,
        addressType,
        company,
        jobTitle,
        birthday,
        website,
        notes,
      }),
    [
      fullName,
      email,
      phoneInput,
      address,
      addressType,
      company,
      jobTitle,
      birthday,
      website,
      notes,
    ],
  );

  const hasContactInfo = Boolean(vCard);
  const hasCopiedCurrent = hasContactInfo && lastCopiedValue === vCard;

  const handleCopy = async () => {
    if (!hasContactInfo || typeof navigator === "undefined") {
      return;
    }

    try {
      await navigator.clipboard?.writeText(vCard);
      setLastCopiedValue(vCard);
    } catch (error) {
      console.error("Failed to copy vCard", error);
    }
  };

  const resetForm = () => {
    setFullName("");
    setEmail("");
    setPhoneInput("");
    setAddress("");
    setAddressType("home");
    setCompany("");
    setJobTitle("");
    setBirthday("");
    setWebsite("");
    setNotes("");
    setShowMore(false);
    setLastCopiedValue(null);
  };

  const handleDownloadVCard = () => {
    if (!hasContactInfo || typeof window === "undefined") {
      return;
    }

    const blob = new Blob([vCard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${fullName || "contact"}.vcf`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const handleDownloadQr = () => {
    if (!hasContactInfo || typeof window === "undefined") {
      return;
    }

    const svgElement = qrContainerRef.current?.querySelector("svg");
    if (!svgElement) {
      return;
    }

    const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;
    clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clonedSvg);
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = image.width;
      canvas.height = image.height;

      const context = canvas.getContext("2d");
      context?.drawImage(image, 0, 0);

      const pngDataUrl = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");

      downloadLink.href = pngDataUrl;
      downloadLink.download = `${fullName || "contact"}-qr.png`;

      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      URL.revokeObjectURL(url);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
    };

    image.src = url;
  };

  return (
    <main className="min-h-screen bg-slate-100 py-12">
      <div className="mx-auto max-w-4xl px-4">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-semibold text-slate-900">
            QR Contact Generator
          </h1>
          <p className="mt-3 text-base text-slate-600">
            Fill in the basics, generate your QR code instantly, and add extra
            details only when you need them.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr),minmax(260px,1fr)]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Contact basics
                </h2>
                <p className={mutedHelperClasses}>
                  These four fields are all you need for a solid contact card.
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="flex flex-col gap-1 md:col-span-2">
                    <span className="text-sm font-medium text-slate-700">
                      Full name
                    </span>
                    <input
                      className={inputClasses}
                      placeholder="Ada Lovelace"
                      value={fullName}
                      onChange={(event) => setFullName(event.target.value)}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-slate-700">
                      Email
                    </span>
                    <input
                      className={inputClasses}
                      placeholder="you@example.com"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-slate-700">
                      Phone numbers
                    </span>
                    <textarea
                      className={`${inputClasses} min-h-[88px] resize-y leading-relaxed`}
                      placeholder={"+84 907 741 147\n+1 408 592 1508"}
                      value={phoneInput}
                      onChange={(event) => setPhoneInput(event.target.value)}
                    />
                    <span className={mutedHelperClasses}>
                      One number per line works best. Commas or semicolons are
                      fine too.
                    </span>
                  </label>
                  <label className="flex flex-col gap-1 md:col-span-2">
                    <span className="text-sm font-medium text-slate-700">
                      Address
                    </span>
                    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr),max-content] sm:items-center">
                      <input
                        className={inputClasses}
                        placeholder="123 Main St, City, Country"
                        value={address}
                        onChange={(event) => setAddress(event.target.value)}
                      />
                      <select
                        className={`${inputClasses} sm:h-full sm:min-w-[140px]`}
                        value={addressType}
                        onChange={(event) =>
                          setAddressType(event.target.value as AddressType)
                        }
                      >
                        <option value="home">Home</option>
                        <option value="work">Work</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <span className={mutedHelperClasses}>
                      Choose how the address should be labeled in the saved
                      contact.
                    </span>
                  </label>
                </div>
              </div>

              <div className="border-t border-slate-200 pt-6">
                <button
                  type="button"
                  className={toggleButtonClasses}
                  onClick={() => setShowMore((previous) => !previous)}
                >
                  {showMore ? "Hide extra details" : "Add more details"}
                </button>

                {showMore && (
                  <div className="mt-6 space-y-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-slate-700">
                          Company
                        </span>
                        <input
                          className={inputClasses}
                          placeholder="Analytical Engines Co."
                          value={company}
                          onChange={(event) => setCompany(event.target.value)}
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-slate-700">
                          Job title
                        </span>
                        <input
                          className={inputClasses}
                          placeholder="Chief Mathematician"
                          value={jobTitle}
                          onChange={(event) => setJobTitle(event.target.value)}
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-slate-700">
                          Website
                        </span>
                        <input
                          className={inputClasses}
                          placeholder="https://example.com"
                          value={website}
                          onChange={(event) => setWebsite(event.target.value)}
                        />
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-slate-700">
                          Birthday
                        </span>
                        <input
                          className={inputClasses}
                          type="date"
                          value={birthday}
                          onChange={(event) => setBirthday(event.target.value)}
                        />
                      </label>
                    </div>

                    <label className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-slate-700">
                        Notes
                      </span>
                      <textarea
                        className={`${inputClasses} min-h-[96px] resize-y leading-relaxed`}
                        placeholder="Personal details, how you met, or anything helpful"
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Preview &amp; QR
              </h2>
              <p className={mutedHelperClasses}>
                Your QR code updates automatically as you edit the details.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
              {hasContactInfo ? (
                <div className="flex flex-col items-center gap-4">
                  <div
                    ref={qrContainerRef}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <QRCode value={vCard} size={220} />
                  </div>
                  <p className="text-sm text-slate-600">
                    Scan to save this contact instantly.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-600">
                  Add at least one detail to generate your QR code.
                </p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                vCard preview
              </h3>
              <textarea
                className={`${inputClasses} mt-2 min-h-[180px] resize-y font-mono text-xs`}
                value={vCard}
                readOnly
                placeholder="The vCard content will appear here once you add details."
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className={`${actionButtonClasses} border border-sky-500 bg-sky-500 text-white hover:bg-sky-600 focus:ring-sky-200`}
                onClick={handleCopy}
                disabled={!hasContactInfo}
              >
                {hasCopiedCurrent ? "Copied!" : "Copy vCard"}
              </button>
              <button
                type="button"
                className={`${actionButtonClasses} border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 focus:ring-slate-100`}
                onClick={handleDownloadQr}
                disabled={!hasContactInfo}
              >
                Download QR
              </button>
              <button
                type="button"
                className={`${actionButtonClasses} border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 focus:ring-slate-100`}
                onClick={handleDownloadVCard}
                disabled={!hasContactInfo}
              >
                Download vCard
              </button>
              <button
                type="button"
                className={`${actionButtonClasses} border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 focus:ring-slate-100`}
                onClick={resetForm}
              >
                Reset form
              </button>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
