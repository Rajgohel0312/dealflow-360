import * as priceListService from "./price_lists.services.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";

export const createPriceList = asyncHandler(async (req, res) => {
  const priceList = await priceListService.createPriceList(req.body);

  return res.status(201).json({
    success: true,
    message: "Price list created successfully",
    price_list: priceList,
  });
});

export const getPriceLists = asyncHandler(async (req, res) => {
  const filters = {};
  if (req.query.is_active !== undefined) {
    filters.is_active = req.query.is_active === "true";
  }

  const priceLists = await priceListService.getAllPriceLists(filters);

  return res.status(200).json({
    success: true,
    price_lists: priceLists,
    priceLists: priceLists,
  });
});

export const getPriceListById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const priceList = await priceListService.getPriceListById(id);

  return res.status(200).json({
    success: true,
    price_list: priceList,
  });
});

export const updatePriceList = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedList = await priceListService.updatePriceList(id, req.body);

  return res.status(200).json({
    success: true,
    message: "Price list updated successfully",
    price_list: updatedList,
  });
});

export const deletePriceList = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await priceListService.deletePriceList(id);

  return res.status(200).json({
    success: true,
    message: result.message || "Price list deleted successfully",
  });
});

export const addPriceListItem = asyncHandler(async (req, res) => {
  const { priceListId } = req.params;
  const item = await priceListService.addPriceListItem(priceListId, req.body);

  return res.status(201).json({
    success: true,
    message: "Price list item added successfully",
    item,
  });
});

export const getPriceListItems = asyncHandler(async (req, res) => {
  const { priceListId } = req.params;
  const items = await priceListService.getPriceListItems(priceListId);

  return res.status(200).json({
    success: true,
    items,
  });
});

export const updatePriceListItem = asyncHandler(async (req, res) => {
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
});

export const deletePriceListItem = asyncHandler(async (req, res) => {
  const { priceListId, itemId } = req.params;
  await priceListService.deletePriceListItem(priceListId, itemId);

  return res.status(200).json({
    success: true,
    message: "Price list item deleted successfully",
  });
});
