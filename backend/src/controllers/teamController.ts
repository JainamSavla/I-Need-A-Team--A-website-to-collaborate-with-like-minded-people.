import prisma from '../client.ts';
import ApiError from '../utils/ApiError.ts';
import catchAsync from '../utils/catchAsync.ts';
import { Context } from 'hono';

export const getMyTeams = catchAsync(async (c: Context) => {
  const userId = c.get('userId');

  const teams = await prisma.team.findMany({
    where: {
      members: { some: { userId, isDeleted: false } },
      isDeleted: false
    },
    include: {
      opening: {
        select: {
          title: true,
          type: true,
        }
      },
      members: {
        where: { isDeleted: false },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      }
    }
  });

  return c.json(teams);
});

export const getTeamMessages = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const teamId = c.req.param('id');

  // Verify membership
  const membership = await prisma.teamMember.findFirst({
    where: { teamId, userId, isDeleted: false }
  });

  if (!membership) {
    throw new ApiError(403, 'You are not a member of this team');
  }

  const messages = await prisma.message.findMany({
    where: { teamId, isDeleted: false },
    include: {
      sender: {
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

export const sendMessage = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const teamId = c.req.param('id');
  const { text } = await c.req.json();

  // Verify membership
  const membership = await prisma.teamMember.findFirst({
    where: { teamId, userId, isDeleted: false }
  });

  if (!membership) {
    throw new ApiError(403, 'You are not a member of this team');
  }

  const message = await prisma.message.create({
    data: {
      teamId,
      senderId: userId,
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
      }
    }
  });

  return c.json(message, 201);
});

export const getTeamMembers = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const teamId = c.req.param('id');

  // Verify membership
  const membership = await prisma.teamMember.findFirst({
    where: { teamId, userId, isDeleted: false }
  });

  if (!membership) {
    throw new ApiError(403, 'You are not a member of this team');
  }

  const members = await prisma.teamMember.findMany({
    where: { teamId, isDeleted: false },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          primaryRole: true,
          email: true,
          bio: true,
        }
      }
    }
  });

  return c.json(members.map(m => ({
    ...m.user,
    joinedAt: m.createdAt,
    teamRole: m.roleName
  })));
});
