import express from "express";
import {
  bidOnPlayer,
  createAuction,
  endAuction,
  getAllAuction,
  getAuctionById,
  sellPlayer,
  startAuction,
  undoLastBid,
} from "../controllers/auction.controller";
const router = express.Router();

router.post("/create-auction", createAuction);
router.patch("/start-auction/:id", startAuction);
router.post("/end-auction/:id", endAuction);
router.get("/", getAllAuction);
router.get("/:id", getAuctionById);
router.post("/:id/bid", bidOnPlayer);
router.post("/:id/sell", sellPlayer);
router.post("/:id/undo-last-bid", undoLastBid);

export default router;
