export type MakeBanModel = {
  id: string;
  blogId: string;
  blogName: string;
  userId: string;
  userLogin: string;
  isBanned: boolean;
  banDate: Date;
  banReason: string;
};
