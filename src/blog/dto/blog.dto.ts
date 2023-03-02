import { getNextStrId } from 'src/utils';

export class BlogDto {
  id: string;
  createdAt: string;
  constructor(
    public name: string,
    public description: string,
    public websiteUrl: string,
  ) {
    this.id = getNextStrId();
    this.createdAt = new Date().toISOString();
  }
}
