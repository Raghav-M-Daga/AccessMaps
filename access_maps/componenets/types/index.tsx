export interface Issue {
  id?: string;  // Document ID from Firestore
  location: { lng: number; lat: number };
  description: string;
  color: 'red' | 'green' | 'blue';
  userId?: string;  // ID of the user who created the pin
  createdAt?: string;  // Timestamp when the pin was created
}