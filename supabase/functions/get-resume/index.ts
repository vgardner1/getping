import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function parsePublicUrl(url: string): { bucket: string; path: string } | null {
  try {
    const marker = "/storage/v1/object/public/";
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    const rest = url.slice(idx + marker.length);
    const firstSlash = rest.indexOf("/");
    if (firstSlash === -1) return null;
    const bucket = rest.slice(0, firstSlash);
    const path = decodeURIComponent(rest.slice(firstSlash + 1));
    return { bucket, path };
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const urlObj = new URL(req.url);
    const resumeUrl = urlObj.searchParams.get("url");
    const asDownload = urlObj.searchParams.get("download") === "1";

    if (!resumeUrl) {
      return new Response(JSON.stringify({ error: "Missing 'url' query param" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Try to parse bucket/path for a direct storage download (best reliability)
    const parsed = parsePublicUrl(resumeUrl);
    let arrayBuffer: ArrayBuffer | null = null;
    let fileName = "resume.pdf";

    if (parsed) {
      const { bucket, path } = parsed;
      const { data, error } = await supabase.storage.from(bucket).download(path);
      if (!error && data) {
        arrayBuffer = await data.arrayBuffer();
        const last = path.split("/").pop();
        if (last) fileName = last;
      }
    }

    // Fallback: fetch the public URL directly from server-side
    if (!arrayBuffer) {
      const resp = await fetch(resumeUrl);
      if (!resp.ok) {
        const body = await resp.text().catch(() => "");
        console.error("get-resume fetch failed:", resp.status, body);
        return new Response(JSON.stringify({ error: "Failed to fetch resume" }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      arrayBuffer = await resp.arrayBuffer();
      const urlPath = new URL(resumeUrl).pathname;
      const last = urlPath.split("/").pop();
      if (last) fileName = last;
    }

    const headers: Record<string, string> = {
      ...corsHeaders,
      "Content-Type": "application/pdf",
      "Cache-Control": "public, max-age=60, s-maxage=300",
      "Content-Disposition": `${asDownload ? "attachment" : "inline"}; filename="${fileName}"`,
    };

    return new Response(arrayBuffer, { headers });
  } catch (e) {
    console.error("get-resume error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
