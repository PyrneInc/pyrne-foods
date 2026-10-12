import { z } from "zod";

export const createOrderSchema = z
  .object({
    customer: z.object({
      name: z.string().trim().min(2).max(100),
      phone: z.string().trim().min(9).max(20),
      email: z
        .string()
        .trim()
        .email()
        .optional()
        .or(z.literal("")),
    }),

    orderType: z.enum([
      "PICKUP",
      "DELIVERY",
    ]),

    items: z
      .array(
        z.object({
          productId: z.string().uuid(),
          quantity: z
            .number()
            .int()
            .positive()
            .max(1000),
        }),
      )
      .min(1),

    deliveryAddress: z
      .string()
      .trim()
      .max(500)
      .optional(),

    deliveryNotes: z
      .string()
      .trim()
      .max(500)
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.orderType === "DELIVERY" &&
      !data.deliveryAddress
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["deliveryAddress"],
        message:
          "Delivery address is required.",
      });
    }

    if (
      data.orderType === "PICKUP" &&
      data.deliveryAddress
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["deliveryAddress"],
        message:
          "Delivery address should not be provided for pickup orders.",
      });
    }
  });

export type CreateOrderInput =
  z.infer<typeof createOrderSchema>;
