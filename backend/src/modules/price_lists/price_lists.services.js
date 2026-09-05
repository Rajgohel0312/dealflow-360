import * as priceListRepo from "./price_lists.repository.js";
import { findProductById } from "../products/products.repository.js";
import AppError from "../../shared/errors/AppError.js";

// ==========================================
// PRICE LISTS
// ==========================================

export const createPriceList = async (data) => {
  const existingName = await priceListRepo.findPriceListByName(data.name);
  if (existingName) {
    throw new AppError("Price list with this name already exists", 409);
  }

  return priceListRepo.createPriceList(data);
};

export const getAllPriceLists = async (filters = {}) => {
  return priceListRepo.findAllPriceLists(filters);
};

export const getPriceListById = async (id) => {
  const priceList = await priceListRepo.findPriceListById(id);
  if (!priceList) {
    throw new AppError("Price list not found", 404);
  }

  const items = await priceListRepo.findPriceListItemsByPriceListId(id);
  return {
    ...priceList,
    items,
  };
};

export const updatePriceList = async (id, data) => {
  const existingList = await priceListRepo.findPriceListById(id);
  if (!existingList) {
    throw new AppError("Price list not found", 404);
  }

  if (data.name && data.name.toLowerCase() !== existingList.name.toLowerCase()) {
    const duplicate = await priceListRepo.findPriceListByName(data.name, id);
    if (duplicate) {
      throw new AppError("Price list with this name already exists", 409);
    }
  }

  return priceListRepo.updatePriceList(id, data);
};

// ==========================================
// PRICE LIST ITEMS
// ==========================================

export const addPriceListItem = async (priceListId, data) => {
  const priceList = await priceListRepo.findPriceListById(priceListId);
  if (!priceList) {
    throw new AppError("Price list not found", 404);
  }

  const product = await findProductById(data.product_id);
  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const minQty = data.minimum_quantity ?? 1;
  const duplicate = await priceListRepo.findPriceListItemByUniqueKey(
    priceListId,
    data.product_id,
    minQty
  );

  if (duplicate) {
    throw new AppError(
      `Price list item for this product with minimum quantity ${minQty} already exists`,
      409
    );
  }

  return priceListRepo.createPriceListItem({
    ...data,
    price_list_id: priceListId,
    minimum_quantity: minQty,
  });
};

export const getPriceListItems = async (priceListId) => {
  const priceList = await priceListRepo.findPriceListById(priceListId);
  if (!priceList) {
    throw new AppError("Price list not found", 404);
  }

  return priceListRepo.findPriceListItemsByPriceListId(priceListId);
};

export const updatePriceListItem = async (priceListId, itemId, data) => {
  const priceList = await priceListRepo.findPriceListById(priceListId);
  if (!priceList) {
    throw new AppError("Price list not found", 404);
  }

  const existingItem = await priceListRepo.findPriceListItemById(itemId);
  if (!existingItem || existingItem.price_list_id !== priceListId) {
    throw new AppError("Price list item not found", 404);
  }

  const newMinQty = data.minimum_quantity ?? existingItem.minimum_quantity;
  const newMaxQty = data.maximum_quantity !== undefined ? data.maximum_quantity : existingItem.maximum_quantity;

  if (newMaxQty !== null && newMaxQty < newMinQty) {
    throw new AppError("Maximum quantity cannot be less than minimum quantity", 400);
  }

  if (data.minimum_quantity && data.minimum_quantity !== existingItem.minimum_quantity) {
    const duplicate = await priceListRepo.findPriceListItemByUniqueKey(
      priceListId,
      existingItem.product_id,
      newMinQty,
      itemId
    );
    if (duplicate) {
      throw new AppError(
        `Price list item for this product with minimum quantity ${newMinQty} already exists`,
        409
      );
    }
  }

  return priceListRepo.updatePriceListItem(itemId, data);
};

export const deletePriceListItem = async (priceListId, itemId) => {
  const priceList = await priceListRepo.findPriceListById(priceListId);
  if (!priceList) {
    throw new AppError("Price list not found", 404);
  }

  const existingItem = await priceListRepo.findPriceListItemById(itemId);
  if (!existingItem || existingItem.price_list_id !== priceListId) {
    throw new AppError("Price list item not found", 404);
  }

  await priceListRepo.deletePriceListItem(itemId);
  return { message: "Price list item deleted successfully" };
};
