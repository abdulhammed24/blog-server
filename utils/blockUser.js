export const blockUsers = (user) => {
  if (user?.isBlocked) {
    throw new Error(`Access Denied ${user?.firstName} is blocked`);
  }
};
