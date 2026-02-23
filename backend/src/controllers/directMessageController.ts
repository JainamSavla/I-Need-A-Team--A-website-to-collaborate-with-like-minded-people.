import prisma from '../client.ts';
import ApiError from '../utils/ApiError.ts';
import catchAsync from '../utils/catchAsync.ts';
import { Context } from 'hono';

export const getDirectMessages = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const otherUserId = c.req.param('userId');

  const messages = await prisma.directMessage.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ],
      isDeleted: false
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          primaryRole: true,
        }
      },
      receiver: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          primaryRole: true,
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  return c.json(messages);
});

export const sendDirectMessage = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const receiverId = c.req.param('userId');
  const { text } = await c.req.json();

  if (userId === receiverId) {
    throw new ApiError(400, 'You cannot send a message to yourself');
  }

  // Check if receiver exists
  const receiver = await prisma.user.findUnique({
    where: { id: receiverId, isDeleted: false }
  });

  if (!receiver) {
    throw new ApiError(404, 'User not found');
  }

  const message = await prisma.directMessage.create({
    data: {
      senderId: userId,
      receiverId,
      text
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          primaryRole: true,
        }
      },
      receiver: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          primaryRole: true,
        }
      }
    }
  });

  return c.json(message, 201);
});

export const getConversations = catchAsync(async (c: Context) => {
  const userId = c.get('userId');

  // Find all unique users the current user has exchanged messages with
  const sentMessages = await prisma.directMessage.findMany({
    where: { senderId: userId, isDeleted: false },
    select: { receiverId: true }
  });

  const receivedMessages = await prisma.directMessage.findMany({
    where: { receiverId: userId, isDeleted: false },
    select: { senderId: true }
  });

  const participantIds = new Set([
    ...sentMessages.map(m => m.receiverId),
    ...receivedMessages.map(m => m.senderId)
  ]);

  const conversations = await prisma.user.findMany({
    where: {
      id: { in: Array.from(participantIds) },
      isDeleted: false
    },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      primaryRole: true,
    }
  });

  return c.json(conversations);
});
