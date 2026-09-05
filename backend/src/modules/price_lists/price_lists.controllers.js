import * as priceListService from "./price_lists.services.js";

export const createPriceList = async (req, res) => {
  const priceList = await priceListService.createPriceList(req.body);

  return res.status(201).json({
    success: true,
    message: "Price list created successfully",
    price_list: priceList,
  });
};

export const getPriceLists = async (req, res) => {
  const filters = {};
  if (req.query.is_active !== undefined) {
    filters.is_active = req.query.is_active === "true";
  }

  const priceLists = await priceListService.getAllPriceLists(filters);

  return res.status(200).json({
    success: true,
    price_lists: priceLists,
  });
};

export const getPriceListById = async (req, res) => {
  const { id } = req.params;
  const priceList = await priceListService.getPriceListById(id);

  return res.status(200).json({
    success: true,
    price_list: priceList,
  });
};

export const updatePriceList = async (req, res) => {
  const { id } = req.params;
  const updatedList = await priceListService.updatePriceList(id, req.body);

  return res.status(200).json({
    success: true,
    message: "Price list updated successfully",
    price_list: updatedList,
  });
};

export const addPriceListItem = async (req, res) => {
  const { priceListId } = req.params;
  const item = await priceListService.addPriceListItem(priceListId, req.body);

  return res.status(201).json({
    success: true,
    message: "Price list item added successfully",
    item,
  });
};

export const getPriceListItems = async (req, res) => {
  const { priceListId } = req.params;
  const items = await priceListService.getPriceListItems(priceListId);

  return res.status(200).json({
    success: true,
    items,
  });
};

export const updatePriceListItem = async (req, res) => {
  const { priceListId, itemId } = req.params;
  const updatedItem = await priceListService.updatePriceListItem(
    priceListId,
    itemId,
    req.body
  );

  return res.status(200).json({
    success: true,
    message: "Price list item updated successfully",
    item: updatedItem,
  });
};

export const deletePriceListItem = async (req, res) => {
  const { priceListId, itemId } = req.params;
  await priceListService.deletePriceListItem(priceListId, itemId);

  return res.status(200).json({
    success: true,
    message: "Price list item deleted successfully",
  });
};
