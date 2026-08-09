import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
    try {
        const { amount } = await req.json();

        // Ensure amount is valid
        if (!amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        if (process.env.RAZORPAY_KEY_SECRET?.includes('*') || !process.env.RAZORPAY_KEY_SECRET) {
            console.log("Using Mock Order because Secret Key is missing or asterisked");
            return NextResponse.json({
                id: 'mock_order_' + Date.now(),
                amount: Math.round(amount * 100),
                currency: 'INR',
                isMock: true
            });
        }

        // Initialize Razorpay with fallback test keys if env variables are missing
        const instance = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_YourTestKeyHere', // Replace with your Test Key
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'YourTestSecretHere', // Replace with your Test Secret
        });

        const options = {
            amount: Math.round(amount * 100), // amount in essentially smallest currency unit (paise)
            currency: "INR",
            receipt: `receipt_order_${Date.now()}`,
        };

        const order = await instance.orders.create(options);

        return NextResponse.json(order);
    } catch (error) {
        console.error('Razorpay Error:', error);
        return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }
}
