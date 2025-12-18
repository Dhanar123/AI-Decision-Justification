/*
  Warnings:

  - The primary key for the `decision` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `updatedAt` on the `decision` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `decision` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - Added the required column `assumptions` to the `Decision` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expectedOutcome` to the `Decision` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reasoning` to the `Decision` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `decision` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `decision` DROP PRIMARY KEY,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `assumptions` TEXT NOT NULL,
    ADD COLUMN `expectedOutcome` TEXT NOT NULL,
    ADD COLUMN `reasoning` TEXT NOT NULL,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `description` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- CreateTable
CREATE TABLE `Outcome` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `actualOutcome` TEXT NOT NULL,
    `reflection` TEXT NULL,
    `decisionId` INTEGER NOT NULL,

    UNIQUE INDEX `Outcome_decisionId_key`(`decisionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Analysis` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `result` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `decisionId` INTEGER NOT NULL,

    UNIQUE INDEX `Analysis_decisionId_key`(`decisionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Outcome` ADD CONSTRAINT `Outcome_decisionId_fkey` FOREIGN KEY (`decisionId`) REFERENCES `Decision`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Analysis` ADD CONSTRAINT `Analysis_decisionId_fkey` FOREIGN KEY (`decisionId`) REFERENCES `Decision`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
