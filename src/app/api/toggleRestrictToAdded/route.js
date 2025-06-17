import { NextResponse } from "next/server";
import { Client } from "pg";
import { createHash } from 'crypto';
export async function POST(request) {
    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid or missing JSON body' }, { status: 400 });
    }

    const eventId = body.eventId;
    const email = body.email;
    const userId = body.userId;
    const hash = createHash('sha256')
        .update(userId + email)
        .digest('hex');
    if (!eventId|| !hash) {
        return NextResponse.json({ error: 'Missing eventId' }, { status: 400 });
    }
    console.log(hash)

    const client = new Client({
        user: 'postgres',
        host: process.env.PG_HOST,
        database: process.env.PG_DATABASE,
        password: process.env.PG_PASSWORD,
        port: parseInt(process.env.PG_PORT, 10),
    });

    console.log("PG_HOST:", process.env.PG_HOST);

    try {
        await client.connect();

        const selectRes = await client.query(
            `SELECT isrestricted FROM events WHERE id = $1 and  hashed_userid_email = $2`,
            [eventId, hash]
        );

        if (selectRes.rowCount === 0) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }
        const currentValue = selectRes.rows[0].isrestricted;
        const newValue = !currentValue;
        await client.query(
            `UPDATE events SET isrestricted = $1 WHERE id = $2`,
            [newValue, eventId]
        );

        return NextResponse.json({ success: true, ispublic: newValue }, { status: 200 });

    } catch (err) {
        return NextResponse.json({ error: 'Database error', details: err.message }, { status: 500 });
    } finally {
        await client.end();
    }
}