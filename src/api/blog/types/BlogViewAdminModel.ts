type BlogOwnerInfoType = {
  userId: string;
  userLogin: string;
};

type BanInfo = {
  isBanned: boolean;
  banDate: Date;
};

export type BlogViewAdminModel = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  createdAt: string;
  blogOwnerInfo: BlogOwnerInfoType;
  banInfo: BanInfo;
};
