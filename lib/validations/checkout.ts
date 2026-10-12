import { z } from "zod";

export const checkoutSchema =
  z
    .object({
      customer: z.object({
        name: z
          .string()
          .trim()
          .min(2)
          .max(100),

        phone: z
          .string()
          .trim()
          .min(9)
          .max(20),

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
            productId: z
              .string()
              .uuid(),

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
    .superRefine(
      (data, ctx) => {
        const productIds =
          data.items.map(
            (item) =>
              item.productId,
          );

        if (
          new Set(productIds).size !==
          productIds.length
        ) {
          ctx.addIssue({
            code: "custom",
            path: ["items"],
            message:
              "Duplicate products are not allowed.",
          });
        }

        if (
          data.orderType ===
            "DELIVERY" &&
          !data.deliveryAddress
        ) {
          ctx.addIssue({
            code: "custom",
            path: [
              "deliveryAddress",
            ],
            message:
              "Delivery address is required.",
          });
        }

        if (
          data.orderType ===
            "PICKUP" &&
          data.deliveryAddress
        ) {
          ctx.addIssue({
            code: "custom",
            path: [
              "deliveryAddress",
            ],
            message:
              "Delivery address should not be provided for pickup.",
          });
        }
      },
    );

export type CheckoutInput =
  z.infer<typeof checkoutSchema>;