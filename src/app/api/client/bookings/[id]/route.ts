// File Path: src\app\api\bookings\[id]\route.ts

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { withAuth } from '@/lib/auth';
import type { NextRequest } from 'next/server';

const handler = withAuth(async (req: NextRequest, context) => {
    const { userId, params: paramsPromise } = context;
    const params = await paramsPromise;
    const { id } = params;

    // === PUT: ویرایش نوبت ===
    if (req.method === 'PUT') {
        try {
            const body = await req.json();
            const {
                client_name,
                client_phone,
                booking_date,
                booking_time,
                booking_description,
                status
            } = body;

            const fields: string[] = [];
            const values: any[] = [];

            if (client_name !== undefined) { fields.push('client_name = ?'); values.push(client_name); }
            if (client_phone !== undefined) { fields.push('client_phone = ?'); values.push(client_phone); }
            if (booking_date !== undefined) { fields.push('booking_date = ?'); values.push(booking_date); }
            if (booking_time !== undefined) { fields.push('booking_time = ?'); values.push(booking_time); }
            if (booking_description !== undefined) { fields.push('booking_description = ?'); values.push(booking_description); }
            if (status !== undefined) { fields.push('status = ?'); values.push(status); }

            if (fields.length === 0) {
                return NextResponse.json({ message: 'No fields provided for update' }, { status: 400 });
            }

            const sql = `
                UPDATE booking 
                SET ${fields.join(', ')}
                WHERE id = ? AND user_id = ?
            `;
            const result = await query<any>(sql, [...values, id, userId]);

            if (result[0]?.affectedRows === 0) {
                return NextResponse.json({ message: 'Booking not found or not authorized' }, { status: 404 });
            }

            return NextResponse.json({ message: `Booking ${id} updated successfully` });
        } catch (error) {
            console.error(error);
            return NextResponse.json({ message: 'Failed to update booking' }, { status: 500 });
        }
    }

    // === DELETE: کنسل کردن نوبت ===
    if (req.method === 'DELETE') {
        try {
            const result = await query<any>(
                "UPDATE booking SET status = 'cancelled' WHERE id = ? AND user_id = ? AND status = 'active'",
                [id, userId]
            );

            if (result[0]?.affectedRows === 0) {
                return NextResponse.json({ message: 'Active booking not found or not authorized' }, { status: 404 });
            }

            return NextResponse.json({ message: `Booking ${id} cancelled successfully` });
        } catch (error) {
            console.error(error);
            return NextResponse.json({ message: 'Failed to cancel booking' }, { status: 500 });
        }
    }

    return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
});

export { handler as PUT, handler as DELETE };