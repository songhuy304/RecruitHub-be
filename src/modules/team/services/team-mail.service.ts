import { UserEntity } from '@/common/entities/user.entity';
import { HelperMailService } from '@/common/helper/services/helper.mail.service';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TeamMailService {
  private readonly logger = new Logger(TeamMailService.name);
  private readonly frontendUrl: string;
  private readonly appName: string;

  constructor(
    private readonly helperMailService: HelperMailService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = configService.get<string>('app.frontend');
    this.appName = configService.get<string>('app.name') ?? 'RecruitHub';
  }

  public async inviteMemberMail(
    user: Pick<UserEntity, 'email' | 'fullName'>,
    teamName: string,
    inviteCode: string,
  ): Promise<void> {
    try {
      const inviteLink = `${this.frontendUrl}/?modal=join-team&inviteCode=${inviteCode}`;

      await this.helperMailService.sendEmail({
        to: user.email,
        subject: `You're invited to join ${teamName}`,
        template: 'invite-member',
        context: {
          username: user.fullName || user.email,
          teamName,
          frontendUrl: inviteLink,
          inviteCode,
          appName: this.appName,
        },
      });

      this.logger.log(`Invite mail sent to ${user.email}`);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }
}
