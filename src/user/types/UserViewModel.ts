export type UserViewModel = {
  /**
   * id of existing user
   * login of existing user
   * email of existing user
   * createdAt of existing user
   */
  id: string;
  login: string;
  email: string;
  // passwordHash: string
  // passwordSalt: string
  createdAt: string;
};

export type UserAuthViewModel = {
  /**
   * userId of existing user
   * login of existing user
   * email of existing user
   */
  userId: string;
  login: string;
  email: string;
};
