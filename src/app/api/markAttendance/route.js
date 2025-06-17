import { NextResponse } from "next/server";
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

  const { eventId, name, email } = body;

  if (!eventId || !name || !email) {
    return NextResponse.json(
      { error: "Missing required fields: eventId, name, and email are required." },
      { status: 400 }
    );
  }

  const client = new Client({
    user: "postgres",
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: parseInt(process.env.PG_PORT, 10),
  });

  try {
    await client.connect();

    const eventResult = await client.query(
      `SELECT hashed_userid_email, isrestricted FROM events WHERE id = $1;`,
      [eventId]
    );

    if (eventResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const hashed_userid_email = eventResult.rows[0].hashed_userid_email;
    const isRestricted = eventResult.rows[0].isrestricted;

    let markResult;
    if (isRestricted) {
  const existingMark = await client.query(
    `SELECT 1 FROM mark WHERE event_id = $1 AND email = $2 LIMIT 1`,
    [eventId, email]
  );

  if (existingMark.rowCount === 0) {
    return NextResponse.json(
      {
         error: "Event Restricted", details: "User not registered, attendance cannot be marked."

      },
      { status: 403 }
    );
  }
}

markResult = await client.query(
  `
  INSERT INTO mark (event_id, hashed_userid_email, name, email, isattended)
  VALUES ($1, $2, $3, $4, true)
  ON CONFLICT (event_id, email)
  DO UPDATE SET 
    hashed_userid_email = EXCLUDED.hashed_userid_email,
    isattended = true
  RETURNING *;
  `,
  [eventId, hashed_userid_email, name, email]
);



    return NextResponse.json(
      {
        message: "Attendance marked successfully",
        data: markResult.rows[0],
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { error: "Database error", details: err.message },
      { status: 500 }
    );
  } finally {
    await client.end();
  }
}