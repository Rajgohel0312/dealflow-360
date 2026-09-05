import * as adminRepo from "./admin.repository.js";
import * as authRoute from "../auth/auth.repository.js";
export const changeRole = async (id, roleId) => {
  const user = await authRoute.findById(id);
  if (!user) {
    throw new AppError("No user found", 404);
  }
  const roleExist = await adminRepo.findRoleById(roleId);
  if (!roleExist) {
    throw new AppError("Role not found", 404);
  }

  const changeRole = await adminRepo.changeRole(id, roleId);

  return changeRole;
};
