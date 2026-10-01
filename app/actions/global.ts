'use server';

import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { normalizeLocale } from '@/lib/locale';
import { formatTimeWithTimezone, normalizeTimezone } from '@/lib/timezone';
import { AppError, handleError } from '@/lib/error-handler';

export async function setUserGlobalPreferences(input: {
  locale?: string;
  timezone?: string;
  country?: string;
  region?: string;
}) {
  try {
    const { userId } = await auth();
    if (!userId) throw new AppError(401, 'Unauthorized', 'NOT_AUTHENTICATED');

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) throw new AppError(404, 'User not found', 'USER_NOT_FOUND');

    const updatedUser = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        locale: input.locale ? normalizeLocale(input.locale) : undefined,
        timezone: input.timezone ? normalizeTimezone(input.timezone) : undefined,
        country: input.country || undefined,
        region: input.region || undefined,
      },
    });

    return { success: true, data: updatedUser };
  } catch (error) {
    const result = handleError(error);
    return { success: false, ...result };
  }
}

export async function getGlobalFeed({
  locale = 'en',
  region,
  limit = 20,
  offset = 0,
}) {
  try {
    const normalizedLocale = normalizeLocale(locale);

    const posts = await prisma.post.findMany({
      where: {
        locale: normalizedLocale,
        region: region || undefined,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatar: true,
            timezone: true,
            country: true,
          },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
      take: limit,
      skip: offset,
    });

    return {
      success: true,
      data: posts.map((post) => ({
        ...post,
        formattedTime: formatTimeWithTimezone(
          post.createdAt,
          post.author.timezone
        ),
      })),
    };
  } catch (error) {
    const result = handleError(error);
    return { success: false, ...result };
  }
}

export async function discoverByStack({
  techStack,
  country,
  limit = 10,
}: {
  techStack: string[];
  country?: string;
  limit?: number;
}) {
  try {
    if (!Array.isArray(techStack) || techStack.length === 0) {
      throw new AppError(400, 'Tech stack is required', 'INVALID_INPUT');
    }

    const users = await prisma.user.findMany({
      where: {
        techStack: {
          hasSome: techStack,
        },
        country: country || undefined,
        publicProfile: true,
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
        techStack: true,
        country: true,
        region: true,
      },
      take: limit,
    });

    return { success: true, data: users };
  } catch (error) {
    const result = handleError(error);
    return { success: false, ...result };
  }
}

export async function getGlobalStats() {
  try {
    const [totalUsers, totalPosts, topCountries, topStacks] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.user.groupBy({
        by: ['country'],
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      }),
      prisma.user.findMany({
        select: { techStack: true },
        take: 100,
      }),
    ]);

    // Aggregate tech stacks
    const stackCounts: Record<string, number> = {};
    topStacks.forEach((user) => {
      user.techStack.forEach((stack) => {
        stackCounts[stack] = (stackCounts[stack] || 0) + 1;
      });
    });

    const topTechStacks = Object.entries(stackCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([stack, count]) => ({ stack, count }));

    return {
      success: true,
      data: {
        totalUsers,
        totalPosts,
        topCountries: topCountries.map((c) => ({
          country: c.country,
          count: c._count.id,
        })),
        topTechStacks,
      },
    };
  } catch (error) {
    const result = handleError(error);
    return { success: false, ...result };
  }
}
