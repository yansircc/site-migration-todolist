import { Redis } from "@upstash/redis";
import { env } from "@/env";
import type { UrlSettings } from "@/types/todo";
import { NextResponse } from "next/server";

const redis = new Redis({
  url: env.KV_REST_API_URL,
  token: env.KV_REST_API_TOKEN,
});

export async function GET() {
  try {
    const settings = await redis.get<UrlSettings>("settings");
    return NextResponse.json(
      settings ?? {
        source: "https://zetarmold.com",
        target: "https://google.com",
      },
    );
  } catch (error) {
    console.error("Failed to get settings:", error);
    return NextResponse.json(
      { error: "Failed to get settings" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const settings = (await request.json()) as UrlSettings;
    await redis.set("settings", settings);
    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to update settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
