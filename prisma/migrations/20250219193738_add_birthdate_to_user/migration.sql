-- CreateTable
CREATE TABLE "WishSkate" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "madero" TEXT,
    "trucks" TEXT,
    "ruedas" TEXT,
    "rodamientos" TEXT,
    "tenis" TEXT,

    CONSTRAINT "WishSkate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WishSkate_userId_key" ON "WishSkate"("userId");

-- AddForeignKey
ALTER TABLE "WishSkate" ADD CONSTRAINT "WishSkate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
