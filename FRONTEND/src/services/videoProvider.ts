// Phase 8: Telemedicine & Virtual Video Consultation Provider Abstraction
import { TelemedicineRoom, TelemedicineStatus } from '../types';

export interface VideoSessionParticipant {
  userId: string;
  role: 'DOCTOR' | 'PATIENT';
  token: string;
  expiresAt: string;
}

export interface VideoProvider {
  createRoom(params: {
    appointmentId: string;
    appointmentNumber: string;
    doctorId: string;
    doctorName: string;
    patientId: string;
    patientName: string;
    scheduledStartTime: string;
  }): Promise<TelemedicineRoom>;
  generateParticipantToken(roomId: string, role: 'DOCTOR' | 'PATIENT', userId: string): Promise<string>;
  validateParticipant(roomId: string, token: string): Promise<{ valid: boolean; role?: 'DOCTOR' | 'PATIENT' }>;
  endRoom(roomId: string): Promise<boolean>;
  getRoomStatus(roomId: string): Promise<TelemedicineStatus>;
}

// Development & Mock WebRTC Provider (Production ready abstraction)
export class MockWebRTCVideoProvider implements VideoProvider {
  private activeTokens: Map<string, { roomId: string; role: 'DOCTOR' | 'PATIENT'; userId: string; expiresAt: number }> = new Map();

  public async createRoom(params: {
    appointmentId: string;
    appointmentNumber: string;
    doctorId: string;
    doctorName: string;
    patientId: string;
    patientName: string;
    scheduledStartTime: string;
  }): Promise<TelemedicineRoom> {
    const roomId = `room-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const doctorToken = `tok-doc-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const patientToken = `tok-pat-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const oneHour = 3600 * 1000;
    this.activeTokens.set(doctorToken, {
      roomId,
      role: 'DOCTOR',
      userId: params.doctorId,
      expiresAt: Date.now() + oneHour,
    });
    this.activeTokens.set(patientToken, {
      roomId,
      role: 'PATIENT',
      userId: params.patientId,
      expiresAt: Date.now() + oneHour,
    });

    const room: TelemedicineRoom = {
      id: `tel-${Date.now()}`,
      appointmentId: params.appointmentId,
      appointmentNumber: params.appointmentNumber,
      doctorId: params.doctorId,
      doctorName: params.doctorName,
      patientId: params.patientId,
      patientName: params.patientName,
      scheduledStartTime: params.scheduledStartTime,
      status: 'Scheduled',
      roomId,
      roomTokenDoctor: doctorToken,
      roomTokenPatient: patientToken,
    };

    return room;
  }

  public async generateParticipantToken(roomId: string, role: 'DOCTOR' | 'PATIENT', userId: string): Promise<string> {
    const token = `tok-${role.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    this.activeTokens.set(token, {
      roomId,
      role,
      userId,
      expiresAt: Date.now() + 3600000,
    });
    return token;
  }

  public async validateParticipant(roomId: string, token: string): Promise<{ valid: boolean; role?: 'DOCTOR' | 'PATIENT' }> {
    const record = this.activeTokens.get(token);
    if (!record) return { valid: false };
    if (record.roomId !== roomId) return { valid: false };
    if (Date.now() > record.expiresAt) return { valid: false };
    return { valid: true, role: record.role };
  }

  public async endRoom(roomId: string): Promise<boolean> {
    // Clear tokens for this room
    for (const [token, data] of this.activeTokens.entries()) {
      if (data.roomId === roomId) {
        this.activeTokens.delete(token);
      }
    }
    return true;
  }

  public async getRoomStatus(roomId: string): Promise<TelemedicineStatus> {
    return 'Completed';
  }
}

export const videoProvider: VideoProvider = new MockWebRTCVideoProvider();
