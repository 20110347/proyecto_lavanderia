/*
  Warnings:

  - You are about to drop the column `accessToken,` on the `user` table. All the data in the column will be lost.
  - Added the required column `accessToken` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `accessToken,`,
    ADD COLUMN `accessToken` VARCHAR(191) NOT NULL;
