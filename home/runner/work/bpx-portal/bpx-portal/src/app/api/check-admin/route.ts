
import { type NextRequest, NextResponse } from 'next/server';
import { auth as adminAuth, db } from '@/lib/firebase/admin';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized: No token provided.' }, { status: 401 });
    }
    const idToken = authorization.split('Bearer ')[1];
    if (!idToken) {
      return NextResponse.json({ error: 'Unauthorized: No token provided.' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return NextResponse.json({ isAdmin: false, error: 'User not found.' }, { status: 404 });
    }

    const userData = userDoc.data();
    const isAdmin = userData?.role === 'Admin';
    return NextResponse.json({ isAdmin });

  } catch (error) {
    console.error('Error verifying token or checking admin status:', error);
    return NextResponse.json({ isAdmin: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
