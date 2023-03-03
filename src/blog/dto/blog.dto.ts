import { getNextStrId } from '../../utils';

export class BlogDto {
  id: string;
  createdAt: string;
  isMembership: boolean;
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
  ) {
    this.id = getNextStrId();
    this.isMembership = false;
    this.createdAt = new Date().toISOString();
  }
}
