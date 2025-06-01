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

    const { userId, email, name } = body;

    if (!userId || !email || !name) {
        return NextResponse.json({ error: 'Missing userId, email, or name' }, { status: 400 });
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
        console.log("Connected to database, inserting event:", name);

        const res = await client.query(`
            INSERT INTO events (name, hashed_userid_email)
            VALUES ($1, $2)
            RETURNING *;
        `, [name, hash]);
        console.log(res)
        return NextResponse.json({ rows: res.rows }, { status: 200 });
    } catch (err) {
        console.error("Database insert error:", err); // Add this for better debug
        return NextResponse.json({ error: 'Database error', details: err.message }, { status: 500 });
    } finally {
        await client.end();
    }
}