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
    const eventId = body.eventId;


    const client = new Client({
        user: 'postgres',
        host: process.env.PG_HOST,
        database: process.env.PG_DATABASE,
        password: process.env.PG_PASSWORD,
        port: parseInt(process.env.PG_PORT, 10),
    });
    console.log("PG_HOST: ", process.env.PG_HOST);
    try {
        await client.connect();
        const res = await client.query(`
        SELECT isrestricted FROM events where id = $1`, [eventId]);
        return NextResponse.json({rows: res.rows[0].isrestricted}, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: 'Database error', details: err.message }, { status: 500 });
    } finally {
        await client.end();
    }
}