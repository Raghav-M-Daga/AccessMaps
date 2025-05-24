export interface Issue {
  location: { lng: number; lat: number };
  description: string;
  color: 'red' | 'green' | 'blue';
}