import * as dealHealthService from "./dealHealth.services.js";

export const getDealHealth = async (req, res) => {
  const { id } = req.params;
  const health = await dealHealthService.calculateDealHealth(id);

  return res.status(200).json({
    success: true,
    health,
  });
};
