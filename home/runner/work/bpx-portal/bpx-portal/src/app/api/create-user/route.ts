
import { type NextRequest, NextResponse } from 'next/server';
import { auth as adminAuth, db } from '@/lib/firebase/admin';
import { doc, setDoc, Timestamp, getDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate the admin making the request
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: Admin token required.' }, { status: 401 });
    }
    const adminIdToken = authorization.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(adminIdToken);
    const adminDoc = await getDoc(doc(db, "users", decodedToken.uid));
    
    if (!adminDoc.exists() || adminDoc.data()?.role !== 'Admin') {
      return NextResponse.json({ error: 'Forbidden: Not an admin.' }, { status: 403 });
    }

    // 2. Create the new user
    const {
      email,
      password,
      fullName,
      balance,
      status,
      role,
      bpexchUsername,
      bpexchPassword,
      adminMessage,
      adminVerified,
    } = await request.json();

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: 'Missing required fields: email, password, fullName.' }, { status: 400 });
    }

    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: fullName,
      emailVerified: adminVerified || false,
    });

    const newUser = {
      uid: userRecord.uid,
      fullName,
      email,
      balance: balance || 0,
      status: status || 'Pending',
      role: role || 'User',
      createdAt: Timestamp.now(),
      bpexchUsername: bpexchUsername || "",
      bpexchPassword: bpexchPassword || "",
      adminMessage: adminMessage || "",
      emailVerified: false, // User must verify their own email
      adminVerified: adminVerified || false,
    };

    await setDoc(doc(db, "users", userRecord.uid), newUser);

    return NextResponse.json({ success: true, uid: userRecord.uid }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating new user:', error);
    let message = "An internal error occurred while creating the user.";
    if (error.code === 'auth/email-already-exists') {
      message = "This email address is already in use.";
    }
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
