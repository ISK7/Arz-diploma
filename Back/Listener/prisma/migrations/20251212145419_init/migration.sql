-- CreateTable
CREATE TABLE `Visitors` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `second_name` VARCHAR(191) NOT NULL,
    `patronim` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `number` VARCHAR(191) NULL,
    `image` LONGBLOB NULL,

    UNIQUE INDEX `Visitors_name_second_name_patronim_email_key`(`name`, `second_name`, `patronim`, `email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
