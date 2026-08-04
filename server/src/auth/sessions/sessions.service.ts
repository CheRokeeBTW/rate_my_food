import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { createHash } from 'crypto';
import { randomBytes } from 'crypto';

@Injectable()
export class SessionsService {

    constructor(
        private readonly prisma: PrismaService,
    ) {}

  async createSession({
    refreshToken,
    userId
  }: {
    refreshToken: string;
    userId: string;
  }) {

    const tokenHash = createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const expiresAt = new Date();

    expiresAt.setDate(
      expiresAt.getDate() + 7,
    );

    return this.prisma.refreshToken.create({
      data: {
        tokenHash,
        userId,
        expiresAt,
      },
    });
  }

  async findSession(refreshToken: string){
    const hashRefreshToken = createHash('sha256')
        .update(refreshToken)
        .digest('hex');

    const session = await this.prisma.refreshToken.findUnique({
        where: {
            tokenHash: hashRefreshToken,
        }
    });

    if(!session){
        throw new NotFoundException('Session not found');
    }

    return session;
  }

  async revokeSession(refreshToken: string) {
  const session = await this.findSession(refreshToken);

  return this.prisma.refreshToken.update({
    where: {
      id: session.id,
    },
    data: {
      revokedAt: new Date(),
    },
  });
 }

 async rotateSession(
    refreshToken: string,
    userId: string,
 ) {
    const oldTokenHash = createHash('sha256')
        .update(refreshToken)
        .digest('hex');

    const newRefreshToken = randomBytes(64).toString('hex');

    const newTokenHash = createHash('sha256')
        .update(newRefreshToken)
        .digest('hex');

    const expiresAt = new Date();

    expiresAt.setDate(
        expiresAt.getDate() + 7,
    );

    const now = new Date();

    await this.prisma.$transaction(async (tx) => {

        const revoked = await tx.refreshToken.updateMany({
            where: {
                tokenHash: oldTokenHash,
                userId,
                revokedAt: null,
                expiresAt: {
                gt: now,
                },
            },
            data: {
                revokedAt: now,
            },
        });

    if (revoked.count !== 1) {
      throw new UnauthorizedException(
        'Refresh token is no longer valid',
      );
    }

    await tx.refreshToken.create({
      data: {
        tokenHash: newTokenHash,
        userId,
        expiresAt,
      },
    });
  });

  return newRefreshToken;
 }
}
