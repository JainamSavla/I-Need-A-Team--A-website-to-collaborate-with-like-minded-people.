import prisma from '../client.ts';
import ApiError from '../utils/ApiError.ts';
import catchAsync from '../utils/catchAsync.ts';
import { Context } from 'hono';

export const applyToOpening = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const openingId = c.req.param('id');
  const body = await c.req.json();

  const opening = await prisma.opening.findUnique({
    where: { id: openingId },
    include: { roles: true }
  });

  if (!opening || opening.isDeleted) {
    throw new ApiError(404, 'Opening not found');
  }

  if (opening.status !== 'Open') {
    throw new ApiError(400, 'This opening is no longer accepting applications');
  }

  if (opening.recruiterId === userId) {
    throw new ApiError(400, 'You cannot apply to your own opening');
  }

  // Check if already applied
  const existingApplication = await prisma.application.findFirst({
    where: {
      openingId,
      applicantId: userId,
      isDeleted: false
    }
  });

  if (existingApplication) {
    throw new ApiError(400, 'You have already applied to this opening');
  }

  const application = await prisma.application.create({
    data: {
      openingId,
      applicantId: userId,
      coverLetter: body.coverLetter,
      preferredRoleId: body.preferredRoleId,
    }
  });

  return c.json(application, 201);
});

export const getApplicationsForOpening = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const openingId = c.req.param('id');

  const opening = await prisma.opening.findUnique({
    where: { id: openingId }
  });

  if (!opening || opening.isDeleted) {
    throw new ApiError(404, 'Opening not found');
  }

  if (opening.recruiterId !== userId) {
    throw new ApiError(403, 'Unauthorized');
  }

  const applications = await prisma.application.findMany({
    where: {
      openingId,
      isDeleted: false
    },
    include: {
      applicant: {
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
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return c.json(applications);
});

export const updateApplicationStatus = catchAsync(async (c: Context) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const { status, roleId } = await c.req.json();

  const application = await prisma.application.findUnique({
    where: { id },
    include: { opening: true }
  });

  if (!application || application.isDeleted) {
    throw new ApiError(404, 'Application not found');
  }

  if (application.opening.recruiterId !== userId) {
    throw new ApiError(403, 'Unauthorized');
  }

  const updatedApplication = await prisma.application.update({
    where: { id },
    data: { status }
  });

      if (status === 'Accepted' && roleId) {
      // Update role filled count
      const role = await prisma.role.findUnique({
        where: { id: roleId }
      });
  
      if (role && role.filled < role.slots) {
        await prisma.role.update({
          where: { id: roleId },
          data: { filled: { increment: 1 } }
        });
      }
  
      // Check if all roles are filled
      const allRoles = await prisma.role.findMany({
        where: { openingId: application.openingId, isDeleted: false }
      });
  
      const allFilled = allRoles.every(r => r.filled >= r.slots);
      if (allFilled) {
        await prisma.opening.update({
          where: { id: application.openingId },
          data: { status: 'Closed / Team Formed' }
        });
      }
  
      // Add to team if accepted
      let team = await prisma.team.findUnique({
        where: { openingId: application.openingId }
      });
  
      if (!team) {
        // Create team
        team = await prisma.team.create({
          data: {
            openingId: application.openingId,
            name: application.opening.title,
            code: `INAT-TEAM-${Math.floor(1000 + Math.random() * 9000)}`,
          }
        });
  
        // Add recruiter to team
        await prisma.teamMember.create({
          data: {
            teamId: team.id,
            userId: userId,
            roleName: 'Originator'
          }
        });
      }
  
      // Add applicant to team
      await prisma.teamMember.upsert({
        where: {
          teamId_userId: {
            teamId: team.id,
            userId: application.applicantId
          }
        },
        update: {
          roleName: role?.name || 'Collaborator'
        },
        create: {
          teamId: team.id,
          userId: application.applicantId,
          roleName: role?.name || 'Collaborator'
        }
      });
    }
  return c.json(updatedApplication);
});
