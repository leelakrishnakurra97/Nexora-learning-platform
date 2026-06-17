import { Router } from 'express';
import { AccessToken, RoomServiceClient, TrackSource } from 'livekit-server-sdk';
import { requireAuth } from '../middleware/auth.js';
import net from 'net';

const router = Router();

const livekitHost = 'http://localhost:7880';
const apiKey = 'devkey';
const apiSecret = 'secret';

router.get('/live-class/token', requireAuth, async (req, res) => {
  const room = req.query.room as string;
  const participant = req.query.participant as string;
  const isTeacher = req.query.isTeacher === 'true';

  if (!room || !participant) {
    return res.status(400).json({ error: 'Room and participant are required' });
  }

  const identity = isTeacher 
    ? `${participant}_Teacher_${Date.now()}` 
    : `${participant}_Student_${Date.now()}`;

  const at = new AccessToken(apiKey, apiSecret, {
    identity: identity,
    name: participant,
  });

  const studentSources = [TrackSource.CAMERA, TrackSource.MICROPHONE];
  const teacherSources = [TrackSource.CAMERA, TrackSource.MICROPHONE, TrackSource.SCREEN_SHARE, TrackSource.SCREEN_SHARE_AUDIO];

  at.addGrant({
    roomJoin: true,
    room: room,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    canUpdateOwnMetadata: true, // Needed for "Raise Hand" feature
  });

  try {
    const token = await at.toJwt();
    res.json({ token });
  } catch (error) {
    console.error('Failed to generate LiveKit token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

router.post('/live-class/grant-publish', requireAuth, async (req, res) => {
  const { room, identity } = req.body;

  if (!room || !identity) {
    return res.status(400).json({ error: 'Room and identity are required' });
  }

  const roomService = new RoomServiceClient(livekitHost, apiKey, apiSecret);
  try {
    await roomService.updateParticipant(room, identity, undefined, {
      canPublish: true,
      canPublishSources: [TrackSource.CAMERA, TrackSource.MICROPHONE, TrackSource.SCREEN_SHARE, TrackSource.SCREEN_SHARE_AUDIO],
      canSubscribe: true,
      canPublishData: true,
      canUpdateMetadata: true
    });
    res.json({ success: true });
  } catch (e) {
    console.error("Failed to grant publish permission", e);
    res.status(500).json({ success: false, error: 'Failed to grant publish permission' });
  }
});

// ==========================================
// SIMULATED MOCK CLASSROOM BACKEND SYNC SYSTEM
// ==========================================

interface MockParticipant {
  identity: string;
  name: string;
  isTeacher: boolean;
  videoEnabled: boolean;
  audioEnabled: boolean;
  handRaised: boolean;
  screenShareState: 'none' | 'requested' | 'sharing';
  lastSeen: number;
}

interface MockChatMessage {
  id: string;
  fromIdentity: string;
  fromName: string;
  message: string;
  timestamp: number;
}

interface MockRoom {
  roomName: string;
  teacherName: string;
  subjectTitle: string;
  createdAt: number;
  participants: Record<string, MockParticipant>;
  chatMessages: MockChatMessage[];
  whiteboardData: string;
  muteAllActive: boolean;
  stopVideoAllActive: boolean;
  className?: string;
}

const mockRooms: Record<string, MockRoom> = {};

async function checkLivekitServer(): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(300);
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(7880, 'localhost');
  });
}

router.get('/live-class/status', async (req, res) => {
  const isAvailable = await checkLivekitServer();
  res.json({ livekitAvailable: isAvailable });
});

router.get('/live-class/mock/active', (req, res) => {
  const activeRooms = Object.values(mockRooms)
    .filter(room => Object.values(room.participants).some(p => p.isTeacher))
    .map(room => {
      const teacher = Object.values(room.participants).find(p => p.isTeacher);
      return {
        roomName: room.roomName,
        teacherName: teacher?.name || room.teacherName || 'Teacher',
        subjectTitle: room.subjectTitle || 'General Lecture',
        className: room.className || 'Class 11',
        createdAt: room.createdAt
      };
    });
  res.json({ rooms: activeRooms });
});

router.get('/live-class/mock/verify', (req, res) => {
  const roomName = req.query.roomName as string;
  if (!roomName) {
    return res.status(400).json({ error: 'roomName is required' });
  }

  const room = mockRooms[roomName];
  const isAvailable = room && Object.values(room.participants).some(p => p.isTeacher);

  res.json({ 
    exists: !!isAvailable,
    teacherName: room ? Object.values(room.participants).find(p => p.isTeacher)?.name : undefined,
    subjectTitle: room ? room.subjectTitle : undefined
  });
});

router.post('/live-class/mock/join', (req, res) => {
  const { roomName, participantName, identity, isTeacher, videoEnabled, audioEnabled, subjectTitle, className } = req.body;
  if (!roomName || !identity) {
    return res.status(400).json({ error: 'roomName and identity are required' });
  }

  if (!mockRooms[roomName]) {
    mockRooms[roomName] = {
      roomName,
      teacherName: isTeacher ? participantName : '',
      subjectTitle: subjectTitle || 'General Lecture',
      className: className || 'Class 11',
      createdAt: Date.now(),
      participants: {},
      chatMessages: [],
      whiteboardData: '[]',
      muteAllActive: false,
      stopVideoAllActive: false,
    };
  } else {
    if (isTeacher) {
      mockRooms[roomName].teacherName = participantName;
      if (subjectTitle) {
        mockRooms[roomName].subjectTitle = subjectTitle;
      }
      if (className) {
        mockRooms[roomName].className = className;
      }
    }
  }

  const room = mockRooms[roomName];
  room.participants[identity] = {
    identity,
    name: participantName,
    isTeacher: !!isTeacher,
    videoEnabled: !!videoEnabled,
    audioEnabled: !!audioEnabled,
    handRaised: false,
    screenShareState: 'none',
    lastSeen: Date.now(),
  };

  res.json({ success: true, room });
});

router.post('/live-class/mock/sync', (req, res) => {
  const { roomName, identity, videoEnabled, audioEnabled, handRaised, screenShareState, whiteboardData, newChatMessage } = req.body;
  if (!roomName || !identity) {
    return res.status(400).json({ error: 'roomName and identity are required' });
  }

  const room = mockRooms[roomName];
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  const part = room.participants[identity];
  if (part) {
    part.lastSeen = Date.now();
    if (videoEnabled !== undefined) part.videoEnabled = !!videoEnabled;
    if (audioEnabled !== undefined) part.audioEnabled = !!audioEnabled;
    if (handRaised !== undefined) part.handRaised = !!handRaised;
    if (screenShareState !== undefined) part.screenShareState = screenShareState;
  } else {
    room.participants[identity] = {
      identity,
      name: identity.split('_')[0],
      isTeacher: identity.includes('_Teacher_'),
      videoEnabled: !!videoEnabled,
      audioEnabled: !!audioEnabled,
      handRaised: !!handRaised,
      screenShareState: screenShareState || 'none',
      lastSeen: Date.now(),
    };
  }

  const updatedPart = room.participants[identity];

  if (room.muteAllActive && !updatedPart?.isTeacher) {
    if (updatedPart) updatedPart.audioEnabled = false;
  }
  if (room.stopVideoAllActive && !updatedPart?.isTeacher) {
    if (updatedPart) updatedPart.videoEnabled = false;
  }

  if (whiteboardData !== undefined) {
    room.whiteboardData = whiteboardData;
  }

  if (newChatMessage) {
    const chatMsg: MockChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fromIdentity: identity,
      fromName: updatedPart?.name || identity.split('_')[0],
      message: newChatMessage,
      timestamp: Date.now(),
    };
    room.chatMessages.push(chatMsg);
  }

  const now = Date.now();
  Object.keys(room.participants).forEach((id) => {
    if (now - room.participants[id].lastSeen > 8000) {
      delete room.participants[id];
    }
  });

  res.json({
    success: true,
    participants: Object.values(room.participants),
    chatMessages: room.chatMessages,
    whiteboardData: room.whiteboardData,
    muteAllActive: room.muteAllActive,
    stopVideoAllActive: room.stopVideoAllActive,
  });
});

router.post('/live-class/mock/host-command', (req, res) => {
  const { roomName, command, targetIdentity } = req.body;
  const room = mockRooms[roomName];
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  if (command === 'mute-all') {
    room.muteAllActive = true;
    Object.values(room.participants).forEach((p) => {
      if (!p.isTeacher) p.audioEnabled = false;
    });
    setTimeout(() => { room.muteAllActive = false; }, 1500);
  } else if (command === 'stop-video-all') {
    room.stopVideoAllActive = true;
    Object.values(room.participants).forEach((p) => {
      if (!p.isTeacher) p.videoEnabled = false;
    });
    setTimeout(() => { room.stopVideoAllActive = false; }, 1500);
  } else if (command === 'approve-screenshare') {
    if (room.participants[targetIdentity]) {
      room.participants[targetIdentity].screenShareState = 'sharing';
      Object.values(room.participants).forEach((p) => {
        if (p.identity !== targetIdentity && p.screenShareState === 'sharing') {
          p.screenShareState = 'none';
        }
      });
    }
  } else if (command === 'deny-screenshare') {
    if (room.participants[targetIdentity]) {
      room.participants[targetIdentity].screenShareState = 'none';
    }
  } else if (command === 'kick') {
    delete room.participants[targetIdentity];
  }

  res.json({ success: true });
});

router.post('/live-class/mock/leave', (req, res) => {
  const { roomName, identity } = req.body;
  const room = mockRooms[roomName];
  if (room && room.participants[identity]) {
    delete room.participants[identity];
  }
  res.json({ success: true });
});

export default router;
