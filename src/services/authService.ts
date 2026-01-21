import { auth, db } from './firebase.ts'; 
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, collection, deleteDoc, query, onSnapshot } from 'firebase/firestore';
import { User, TestResult } from '../types.ts';

export const authService = {
  // 1. Fetch user data from Firestore by UID (Defensive version)
  async getUserProfile(uid: string): Promise<User | null> {
    try {
      if (!uid) return null;
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          ...data,
          id: uid, // Ensure id is always present
          testAttempts: data.testAttempts || []
        } as User;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },

  // 2. Register a new user
  async register(email: string, name: string, password: string, grade: string): Promise<User> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser: User = {
      id: userCredential.user.uid,
      email,
      name,
      gradeTaught: grade,
      intendToTeach: true,
      testAttempts: [],
      isAdmin: false
    };
    
    await setDoc(doc(db, 'users', newUser.id), newUser);
    return newUser;
  },

  // 3. Login with password (Defensive version)
  async login(email: string, password: string): Promise<User> {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    
    if (!userDoc.exists()) {
      throw new Error("User record not found in database.");
    }
    
    const data = userDoc.data();
    return {
      ...data,
      id: userCredential.user.uid, // Ensure id is always present
      testAttempts: data.testAttempts || []
    } as User;
  },

  // 4. Update Test Results
  async addTestResult(userId: string, result: TestResult) {
    const userRef = doc(db, 'users', userId);
    
    const updateData: any = {
      testAttempts: arrayUnion(result)
    };

    if (result.passed) {
      updateData.lastTestDate = result.date;
    }

    await updateDoc(userRef, updateData);
  },

  // 5. Update user profile
  async updateUser(uid: string, data: Partial<User>) {
    try {
      if (!uid) {
        throw new Error("User ID is missing, cannot update profile.");
      }
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, data);
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },

  // 6. Listen for real-time updates on all users for the admin dashboard
  listenToUsers(callback: (users: User[]) => void): () => void {
    const usersCollection = collection(db, 'users');
    const q = query(usersCollection);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
      callback(users);
    });
    return unsubscribe;
  },

  // 7. Delete a user
  async deleteUser(uid: string) {
    try {
      const userRef = doc(db, 'users', uid);
      await deleteDoc(userRef);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },

  // 8. Logout
  async logout() {
    return signOut(auth);
  }
};