// src/app/api/bookings/[id]/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { withAuth } from '@/lib/auth';

/**
 * @method PUT
 * ویرایش نوبت
 */
const updateBooking = withAuth(async (req: Request, userId: number, params: { id: string }) => {
    try {
        const { id } = params;
        const { client_name, client_phone, booking_date, booking_time, booking_description, status } = await req.json();

        // فیلدهای مورد نظر برای ویرایش را بسازید
        const fields = [];
        const values = [];
        
        if (client_name) { fields.push('client_name = ?'); values.push(client_name); }
        if (client_phone) { fields.push('client_phone = ?'); values.push(client_phone); }
        if (booking_date) { fields.push('booking_date = ?'); values.push(booking_date); }
        if (booking_time) { fields.push('booking_time = ?'); values.push(booking_time); }
        if (booking_description) { fields.push('booking_description = ?'); values.push(booking_description); }
        if (status) { fields.push('status = ?'); values.push(status); }

        if (fields.length === 0) {
            return NextResponse.json({ message: 'No fields provided for update' }, { status: 400 });
        }

        const updateSql = `
            UPDATE booking 
            SET ${fields.join(', ')}
            WHERE id = ? AND user_id = ?
        `;
        const result = await query<any>(updateSql, [...values, id, userId]);
        
        if (result[0].affectedRows === 0) {
            return NextResponse.json({ message: 'Booking not found or not authorized' }, { status: 404 });
        }
        
        return NextResponse.json({ 
            message: `Booking ${id} updated successfully` 
        });

    } catch (error) {
        return NextResponse.json({ message: 'Failed to update booking' }, { status: 500 });
    }
});

/**
 * @method DELETE
 * کنسل کردن نوبت (تغییر وضعیت به 'cancelled')
 */
const cancelBooking = withAuth(async (req: Request, userId: number, params: { id: string }) => {
    try {
        const { id } = params;
        
        // فقط نوبت‌های فعال را کنسل می‌کنیم
        const result = await query<any>(
            'UPDATE booking SET status = \'cancelled\' WHERE id = ? AND user_id = ? AND status = \'active\'', 
            [id, userId]
        );

        if (result[0].affectedRows === 0) {
            return NextResponse.json({ message: 'Active booking not found or not authorized' }, { status: 404 });
        }
        
        return NextResponse.json({ 
            message: `Booking ${id} cancelled successfully` 
        });

    } catch (error) {
        return NextResponse.json({ message: 'Failed to cancel booking' }, { status: 500 });
    }
});

// اصلاح شده: export مستقیم تابع‌های بسته‌بندی شده
export { updateBooking as PUT, cancelBooking as DELETE };