export interface NewCheckinPayload {
  id: number;
  name: string;
  message: string;
  photoUrl: string;
  createdAt?: string;
}
