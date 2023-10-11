-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "contactId" TEXT;

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_contactEmail_fkey" FOREIGN KEY ("contactEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
