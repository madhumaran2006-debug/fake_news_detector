export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: string;
}

export interface NewsCheck {
  id?: string;
  userId: string;
  text: string;
  label: 'Real' | 'Fake';
  confidence: number;
  explanation: string;
  timestamp: any; // Firestore Timestamp
}
