import prisma from '../client.ts';
import ApiError from '../utils/ApiError.ts';
import catchAsync from '../utils/catchAsync.ts';
import { Context } from 'hono';

export const getOpenings = catchAsync(async (c: Context) => {
  const query = c.req.query();
  const openings = await prisma.opening.findMany({
    where: {
      isDeleted: false,
      status: query.status || undefined,
      type: query.type || undefined,
      commitment: query.commitment || undefined,
      location: query.location || undefined,
    },
    include: {
      recruiter: {
        select: {
          id: true,
          name: true,
          strengthScore: true,
          avatarUrl: true,
        }
      },
      roles: {
        where: { isDeleted: false }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return c.json(openings);
});

export const getOpeningById = catchAsync(async (c: Context) => {
  const id = c.req.param('id');
  const opening = await prisma.opening.findUnique({
    where: { id },
    include: {
      recruiter: {
        select: {
          id: true,
          name: true,
          strengthScore: true,
          avatarUrl: true,
          bio: true,
          skills: true,
          experienceLevel: true,
          portfolio: true,
        }
      },
      roles: {
        where: { isDeleted: false }
      }
    }
  });

  if (!opening || opening.isDeleted) {
    throw new ApiError(404, 'Opening not found');
  }

  return c.json(opening);
});

export const createOpening = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const body = await c.req.json();

  const opening = await prisma.opening.create({
    data: {
      recruiterId: userId,
      title: body.title,
      type: body.type,
      stage: body.stage,
      description: body.description,
      timeline: body.timeline,
      commitment: body.commitment,
      compensation: body.compensation,
      location: body.location,
      tags: body.tags || [],
      roles: {
        create: body.roles.map((r: any) => ({
          name: r.name,
          slots: r.slots,
        }))
      }
    },
    include: {
      roles: true
    }
  });

  return c.json(opening, 201);
});

export const updateOpening = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const body = await c.req.json();

  const existingOpening = await prisma.opening.findUnique({
    where: { id }
  });

  if (!existingOpening || existingOpening.isDeleted) {
    throw new ApiError(404, 'Opening not found');
  }

  if (existingOpening.recruiterId !== userId) {
    throw new ApiError(403, 'You are not authorized to update this opening');
  }

  const opening = await prisma.opening.update({
    where: { id },
    data: {
      title: body.title,
      type: body.type,
      stage: body.stage,
      description: body.description,
      timeline: body.timeline,
      commitment: body.commitment,
      compensation: body.compensation,
      location: body.location,
      tags: body.tags || [],
      status: body.status,
    }
  });

  // Handle roles update if provided
  if (body.roles) {
    // This is a simplified version: delete old and create new
    // For production, you'd want more careful reconciliation
    await prisma.role.updateMany({
      where: { openingId: id },
      data: { isDeleted: true }
    });

    await prisma.opening.update({
      where: { id },
      data: {
        roles: {
          create: body.roles.map((r: any) => ({
            name: r.name,
            slots: r.slots,
            filled: r.filled || 0,
          }))
        }
      }
    });
  }

  return c.json(opening);
});

export const deleteOpening = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const id = c.req.param('id');

  const existingOpening = await prisma.opening.findUnique({
    where: { id }
  });

  if (!existingOpening || existingOpening.isDeleted) {
    throw new ApiError(404, 'Opening not found');
  }

  if (existingOpening.recruiterId !== userId) {
    throw new ApiError(403, 'You are not authorized to delete this opening');
  }

  await prisma.opening.update({
    where: { id },
    data: { isDeleted: true }
  });

  return c.json({ message: 'Opening deleted successfully' });
});
