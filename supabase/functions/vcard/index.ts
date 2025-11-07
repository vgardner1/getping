// Supabase Edge Function: vcard
// Serves a vCard (.vcf) file built from query parameters to trigger native "Add to Contacts"
// Public endpoint: GET /vcard?fullName=&title=&company=&email=&phone=&website=&location=&linkedin=&filename=

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

function esc(val?: string) {
  return (val ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function toTitleCase(s: string) {
  return (s || "").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

serve(async (req) => {
  try {
    const url = new URL(req.url);
    const p = url.searchParams;

    const fullName = (p.get("fullName") || "").trim();
    const title = p.get("title") || "";
    const company = p.get("company") || "";
    const email = p.get("email") || "";
    const phone = p.get("phone") || "";
    const website = p.get("website") || "";
    const location = p.get("location") || "";
    const linkedin = p.get("linkedin") || "";
    const filenameParam = (p.get("filename") || fullName || "contact").replace(/[^a-z0-9_\-]+/gi, "_");

    // Split name
    const parts = fullName.split(/\s+/).filter(Boolean);
    let firstName = parts[0] || "";
    let lastName = parts.length > 1 ? parts[parts.length - 1] : "";
    let middleName = parts.length > 2 ? parts.slice(1, -1).join(" ") : "";

    firstName = toTitleCase(firstName);
    if (middleName) middleName = toTitleCase(middleName);
    if (lastName) lastName = toTitleCase(lastName);

    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${esc(lastName)};${esc(firstName)};${esc(middleName)};;`,
      `FN:${esc(fullName)}`,
      "X-ABShowAs:PERSON",
      title ? `TITLE:${esc(title)}` : "",
      company ? `ORG:${esc(company)}` : "",
      email ? `EMAIL;TYPE=INTERNET:${esc(email)}` : "",
      phone ? `TEL;TYPE=CELL:${esc(phone)}` : "",
      website ? `URL;TYPE=WORK:${esc(website)}` : "",
      linkedin ? `URL;TYPE=LinkedIn:${esc(linkedin)}` : "",
      location ? `ADR;TYPE=HOME:;;${esc(location)};;;;` : "",
      "END:VCARD",
    ].filter(Boolean);

    const vcard = lines.join("\r\n");

    const headers = new Headers({
      // Use text/x-vcard for broader mobile compatibility
      "Content-Type": "text/x-vcard; charset=utf-8",
      "Content-Disposition": `inline; filename=\"${filenameParam}.vcf\"`,
      "Cache-Control": "no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
    });

    return new Response(vcard, { status: 200, headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
});
