import prisma from '../client.ts';
import ApiError from '../utils/ApiError.ts';
import catchAsync from '../utils/catchAsync.ts';
import { Context } from 'hono';

export const getUserProfile = catchAsync(async (c: Context) => {
  const id = c.req.param('id');
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      portfolio: { where: { isDeleted: false } },
      openings: { where: { isDeleted: false } },
    }
  });

  if (!user || user.isDeleted) {
    throw new ApiError(404, 'User not found');
  }

  return c.json(user);
});

export const getUserApplications = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const applications = await prisma.application.findMany({
    where: {
      applicantId: userId,
      isDeleted: false
    },
    include: {
      opening: {
        select: {
          id: true,
          title: true,
          status: true,
          type: true,
          recruiterId: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return c.json(applications);
});

export const updateMe = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const body = await c.req.json();

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      name: body.name,
      bio: body.bio,
      skills: body.skills,
      experienceLevel: body.experienceLevel,
      availability: body.availability,
      interests: body.interests,
      strengthScore: body.strengthScore,
      avatarUrl: body.avatarUrl,
      primaryRole: body.primaryRole,
      socialLinks: body.socialLinks,
    }
  });

  // Handle portfolio updates if provided
  if (body.portfolio) {
    await prisma.project.updateMany({
      where: { userId },
      data: { isDeleted: true }
    });

    if (body.portfolio.length > 0) {
      await prisma.project.createMany({
        data: body.portfolio.map((p: any) => ({
          userId,
          title: p.title,
          url: p.url,
          description: p.description,
        }))
      });
    }
  }

  return c.json(user);
});
