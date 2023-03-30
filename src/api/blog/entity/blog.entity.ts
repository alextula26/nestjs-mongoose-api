import { getNextStrId } from '../../../utils';

export class BlogEntity {
  id: string;
  createdAt: string;
  isMembership: boolean;
  isBanned: boolean;
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
    public userId: string,
    public userLogin: string,
  ) {
    this.id = getNextStrId();
    this.isMembership = false;
    this.isBanned = false;
    this.createdAt = new Date().toISOString();
  }
}
