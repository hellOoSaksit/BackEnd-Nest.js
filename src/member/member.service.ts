import { Injectable } from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
@Injectable()
export class MemberService {
  create(createMemberDto: CreateMemberDto) {
    return 'This action adds a new member';
  }

}
