/*
  Warnings:

  - Added the required column `publicId` to the `PostSubmission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PostSubmission" ADD COLUMN     "publicId" TEXT NOT NULL;
