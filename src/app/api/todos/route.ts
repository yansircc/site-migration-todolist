import { Redis } from "@upstash/redis";
import { env } from "@/env";
import type { TodoMap } from "@/types/todo";
import { NextResponse } from "next/server";

const redis = new Redis({
  url: env.KV_URL,
  token: env.KV_TOKEN,
});

export async function GET() {
  try {
    const todos = await redis.get<TodoMap>("todos");
    return NextResponse.json(todos ?? {});
  } catch (error) {
    console.error("Failed to get todos:", error);
    return NextResponse.json({ error: "Failed to get todos" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const todos: TodoMap = (await request.json()) as TodoMap;
    await redis.set("todos", todos);
    return NextResponse.json(todos);
  } catch (error) {
    console.error("Failed to update todos:", error);
    return NextResponse.json(
      { error: "Failed to update todos" },
      { status: 500 },
    );
  }
}
