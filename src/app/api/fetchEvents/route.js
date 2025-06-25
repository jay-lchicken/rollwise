import { NextResponse } from "next/server";
import { createHash } from 'crypto';
import { Client } from "pg";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(request) {
    const { userId, sessionClaims } = getAuth(request);
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log("sessionClaims:", sessionClaims);
    const email = sessionClaims?.email;
    if (!email) {
        return NextResponse.json({ error: 'Email not found in session claims' }, { status: 400 });
    }
    console.log({ userId, email });
    console.log("sessionClaims:", sessionClaims);
    const hash = createHash('sha256')
        .update(userId + email)
        .digest('hex');
    const client = new Client({
        user: 'postgres',
        host: process.env.PG_HOST,
        database: process.env.PG_DATABASE,
        password: process.env.PG_PASSWORD,
        port: parseInt(process.env.PG_PORT, 10),
    });
    console.log("Connecting to database with hash: ", hash);
    console.log("PG_HOST: ", process.env.PG_HOST);

    try {
        await client.connect();
        const res = await client.query(`
        SELECT id, name, dateadded FROM events WHERE hashed_userid_email = $1;`, [hash]);

        return NextResponse.json({ rows: res.rows }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: 'Database error', details: err.message }, { status: 500 });
    } finally {
        await client.end();
    }
}