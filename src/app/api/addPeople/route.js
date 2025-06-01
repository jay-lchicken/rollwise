import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { Client } from "pg";

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid or missing JSON body" },
      { status: 400 }
    );
  }

  const { eventId, userId, email, people } = body;

  if (!eventId || !userId || !email || !Array.isArray(people)) {
    return NextResponse.json(
      { error: "Missing required fields or invalid people array" },
      { status: 400 }
    );
  }

  const hash = createHash("sha256").update(userId + email).digest("hex");

  const client = new Client({
    user: "postgres",
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: parseInt(process.env.PG_PORT, 10),
  });

  try {
    await client.connect();

    const results = [];

    for (const person of people) {
      const { name, email: personEmail } = person;

      const res = await client.query(
        `
        INSERT INTO mark (event_id, hashed_userid_email, name, email)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (event_id, email)
        DO UPDATE SET name = EXCLUDED.name, hashed_userid_email = EXCLUDED.hashed_userid_email
        RETURNING *;
      `,
        [eventId, hash, name, personEmail]
      );

      results.push(res.rows[0]);
    }

    return NextResponse.json({ rows: results }, { status: 200 });
  } catch (err) {
    console.error("DB insert error:", err);
    return NextResponse.json(
      { error: "Database error", details: err.message },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}