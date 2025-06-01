import { NextResponse } from "next/server";
import { createHash } from 'crypto';
import { Client } from "pg";

export async function POST(request) {
    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid or missing JSON body' }, { status: 400 });
    }

    const { userId, email, id } = body;

    if (!userId || !email || !id) {
        return NextResponse.json({ error: 'Missing userId, email, or id' }, { status: 400 });
    }
    const hash = createHash('sha256')
        .update(`${userId}${email}`)
        .digest('hex');

    const client = new Client({
        user: 'postgres',
        host: process.env.PG_HOST,
        database: process.env.PG_DATABASE,
        password: process.env.PG_PASSWORD,
        port: parseInt(process.env.PG_PORT, 10),
    });

    console.log("Connecting to database with hash:", hash);
    try {
        await client.connect();
        console.log("Connected to database, inserting event:", id);

        const res = await client.query(`
            DELETE FROM events
WHERE id = $1 AND hashed_userid_email = $2;
        `, [id,  hash]);
        console.log(res)
        return NextResponse.json({ rows: res.rows }, { status: 200 });
    } catch (err) {
        console.error("Database insert error:", err);
        return NextResponse.json({ error: 'Database error', details: err.message }, { status: 500 });
    } finally {
        await client.end();
    }
}