import express from "express";
import {
  createAuction,
  getAllAuction,
  getAuctionById,
} from "../controllers/auction.controller";
const router = express.Router();

router.post("/create-auction", createAuction);
router.get("/", getAllAuction);
router.get("/:id", getAuctionById);

export default router;
