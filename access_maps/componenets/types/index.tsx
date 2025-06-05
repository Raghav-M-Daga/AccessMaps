export interface Issue {
  id?: string;  // Document ID from Firestore
  location: { lng: number; lat: number };
  description: string;
  color: 'red' | 'green' | 'blue';
  userId?: string;  // ID of the user who created the pin
  upvotes?: number;  // Number of upvotes for the pin
  votedUserIds?: string[];  // Array of user IDs who have upvoted this pin
  createdAt?: string;  // Timestamp when the pin was created
}

declare global {
  interface Window {
    editPin: (pinId: string) => void;
    deletePin: (pinId: string, userId: string) => void;
  }
}