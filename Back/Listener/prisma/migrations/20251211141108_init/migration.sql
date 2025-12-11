/*
  Warnings:

  - A unique constraint covering the columns `[name,second_name,patronim,phone]` on the table `Visitors` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Visitors_name_second_name_patronim_phone_key` ON `Visitors`(`name`, `second_name`, `patronim`, `phone`);
