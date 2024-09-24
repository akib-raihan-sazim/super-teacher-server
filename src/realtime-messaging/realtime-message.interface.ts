export interface IMessagePayload {
  id: number;
  content: string;
  classroomId: number;
  attachmentUrl?: string;
  userId: number;
}
