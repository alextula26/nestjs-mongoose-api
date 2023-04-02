import { getNextStrId } from '../../../utils';

export class BanEntity {
  id: string;
  banDate: Date;
  constructor(
    public blogId: string,
    public blogName: string,
    public userId: string,
    public userLogin: string,
    public isBanned: boolean,
    public banReason: string,
  ) {
    this.id = getNextStrId();
    this.banDate = new Date();
  }
}
