import mongoose from "mongoose"

const PaymentSettingsSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
    },
    ci: {
      type: String,
      required: true,
    },
    bank: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
      default: "BANCO VENEZOLANO DE CREDITO",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

export const PaymentSettings = mongoose.models.PaymentSettings || mongoose.model("PaymentSettings", PaymentSettingsSchema)



