import { getNextStrId } from 'src/utils';

export class NewestLikesDto {
  id: string;
  createdAt: string;
  constructor(public userId: string, public userLogin: string) {
    this.id = getNextStrId();
    this.createdAt = new Date().toISOString();
  }
}
