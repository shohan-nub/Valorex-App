import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

type Body = {
  orderId: string;
  value: number;
  phone?: string;
  email?: string;
  products?: string[];
  numItems?: number;
};

function sha256(value: string) {
  return crypto
    .createHash("sha256")
    .update(value.trim().toLowerCase())
    .digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const {
      orderId,
      value,
      phone,
      email,
      products = [],
      numItems = 1,
    } = body;

    if (!orderId || typeof value !== "number") {
      return NextResponse.json(
        { error: "orderId and value are required" },
        { status: 400 }
      );
    }

    const PIXEL_ID = process.env.FACEBOOK_PIXEL_ID;
    const ACCESS_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;
    const TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE; // test-এর সময় রাখবে, পরে remove করবে

    if (!PIXEL_ID || !ACCESS_TOKEN) {
      return NextResponse.json(
        { error: "Meta config missing" },
        { status: 500 }
      );
    }

    const user_data: Record<string, string[]> = {};

    if (email?.trim()) {
      user_data.em = [sha256(email)];
    }

    if (phone?.trim()) {
      const cleanPhone = phone.replace(/\D/g, "");
      if (cleanPhone) {
        user_data.ph = [sha256(cleanPhone)];
      }
    }

    const payload: Record<string, unknown> = {
      data: [
        {
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          event_id: orderId, // browser pixel এর eventID এর সাথে same রাখবে
          action_source: "website",
          user_data,
          custom_data: {
            currency: "BDT",
            value,
            content_type: "product",
            content_ids: Array.isArray(products) ? products : [],
            num_items: Number.isFinite(numItems) ? numItems : 1,
            order_id: orderId,
          },
        },
      ],
    };

    if (TEST_EVENT_CODE?.trim()) {
      payload.test_event_code = TEST_EVENT_CODE.trim();
    }

    const response = await fetch(
      `https://graph.facebook.com/v21.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

   const result = await response.json();

console.log("META RESULT:", result);

return NextResponse.json(result, {
  status: response.ok ? 200 : 400,
});
  } catch (error) {
    console.error("Meta CAPI error:", error);
    return NextResponse.json(
      { error: "Meta CAPI failed" },
      { status: 500 }
    );
  }
}