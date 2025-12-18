import mongoose from "mongoose";

const raffleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String },
  ticketPrice: { type: Number, required: true },
  totalNumbers: { type: Number, required: true },
  soldNumbers: { type: [Number], default: [] },
  drawDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ["active", "completed", "cancelled"],
    default: "active",
  },
  winner: {
    userId: String,
    userName: String,
    userEmail: String,
    winningNumber: Number,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Raffle = mongoose.models.Raffle || mongoose.model("Raffle", raffleSchema);

export default Raffle;