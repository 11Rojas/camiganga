import mongoose from "mongoose"

const ExchangeRateSchema = new mongoose.Schema(
  {
    rate: {
      type: Number,
      required: true,
      min: 0,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    previousRate: {
      type: Number,
      default: 0,
    },
    change: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

export const ExchangeRate = mongoose.models.ExchangeRate || mongoose.model("ExchangeRate", ExchangeRateSchema)
