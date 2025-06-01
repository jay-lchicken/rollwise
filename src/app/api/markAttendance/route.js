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

    // Retrieve the hashed_userid_email from the events table
    const eventResult = await client.query(
      `SELECT hashed_userid_email FROM events WHERE id = $1;`,
      [eventId]
    );

    if (eventResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    const hashed_userid_email = eventResult.rows[0].hashed_userid_email;

    // Insert or update attendance record
    const markResult = await client.query(
      `
      INSERT INTO mark (event_id, hashed_userid_email, name, email, isattended)
      VALUES ($1, $2, $3, $4, true)
      ON CONFLICT (event_id, email)
      DO UPDATE SET 
        name = EXCLUDED.name,
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