import * as adminService from "./admin.services.js";

export const changeRole = async (req, res) => {
  const { id } = req.params;
  const { roleId } = req.body;
    
  const changeRole = await adminService.changeRole(id, roleId);

  return res.status(200).json({
    success: true,
    message: "User Role changed",
    changeRole,
  });
};
