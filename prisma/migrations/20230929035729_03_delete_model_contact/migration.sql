/*
  Warnings:

  - You are about to drop the column `contactId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the `Contact` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Contact" DROP CONSTRAINT "Contact_contactEmail_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_contactId_fkey";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "contactId";

-- DropTable
DROP TABLE "Contact";
