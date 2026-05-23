function sanitizeUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : undefined,
  };
}

module.exports = {
  sanitizeUser,
};
