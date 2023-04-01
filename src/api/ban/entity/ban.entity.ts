import { getNextStrId } from '../../../utils';

export class BanEntity {
  id: string;
  constructor(
    public blogId: string,
    public blogName: string,
    public userId: string,
    public userLogin: string,
    public isBanned: boolean,
    public banDate: Date,
    public banReason: string,
  ) {
    this.id = getNextStrId();
  }
}
