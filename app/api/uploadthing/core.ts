import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { getAdminBySessionToken } from "@/lib/auth/admin";

const f = createUploadthing();

export const ourFileRouter = {
  productImage: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
  })
    .middleware(async ({ req }) => {
      const token = req.cookies.get("admin_session")?.value;
      if (!token) {
        throw new UploadThingError("Требуется вход администратора");
      }
      const admin = await getAdminBySessionToken(token);
      if (!admin) {
        throw new UploadThingError("Сессия недействительна");
      }
      return { userId: admin.id };
    })
    .onUploadComplete(async ({ file }) => {
      return { url: file.ufsUrl ?? file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
