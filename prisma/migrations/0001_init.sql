-- CreateTable
CREATE TABLE `Enquiry` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('new', 'reviewed', 'archived') NOT NULL DEFAULT 'new',
    `petType` ENUM('dog', 'cat', 'smallPet') NOT NULL,
    `customerName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `agreedToTerms` BOOLEAN NOT NULL,
    `bookingType` ENUM('holiday', 'regular', 'oneOff') NULL,
    `rawSubmission` JSON NULL,
    `clientIp` VARCHAR(64) NULL,
    `userAgent` TEXT NULL,
    `botFlags` JSON NULL,

    INDEX `Enquiry_createdAt_idx`(`createdAt`),
    INDEX `Enquiry_status_idx`(`status`),
    INDEX `Enquiry_petType_idx`(`petType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EnquiryDog` (
    `id` VARCHAR(191) NOT NULL,
    `enquiryId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `breedRuleId` VARCHAR(191) NULL,
    `ageMonths` INTEGER NOT NULL,
    `sex` ENUM('male', 'female') NOT NULL,
    `neutered` BOOLEAN NOT NULL,
    `suitability` ENUM('accepted', 'rejected') NOT NULL,
    `rejectionReasonCode` VARCHAR(64) NULL,
    `service` ENUM('daycare', 'boarding') NULL,

    INDEX `EnquiryDog_enquiryId_idx`(`enquiryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EnquiryCat` (
    `id` VARCHAR(191) NOT NULL,
    `enquiryId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `service` ENUM('popIn') NOT NULL DEFAULT 'popIn',

    UNIQUE INDEX `EnquiryCat_enquiryId_key`(`enquiryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EnquirySmallPet` (
    `id` VARCHAR(191) NOT NULL,
    `enquiryId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `animalTypeId` VARCHAR(191) NULL,
    `service` ENUM('popIn', 'boarding') NOT NULL,

    INDEX `EnquirySmallPet_enquiryId_idx`(`enquiryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BreedRule` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `breedName` VARCHAR(191) NOT NULL,
    `ruleType` ENUM('banned', 'maleNeuteredOnly', 'allowed') NOT NULL,

    UNIQUE INDEX `BreedRule_breedName_key`(`breedName`),
    INDEX `BreedRule_active_idx`(`active`),
    INDEX `BreedRule_ruleType_idx`(`ruleType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnimalType` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `name` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `AnimalType_name_key`(`name`),
    INDEX `AnimalType_active_idx`(`active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Setting` (
    `key` VARCHAR(191) NOT NULL,
    `value` LONGTEXT NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdminUser` (
    `id` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `role` ENUM('admin') NOT NULL DEFAULT 'admin',
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `AdminUser_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EnquiryDog` ADD CONSTRAINT `EnquiryDog_enquiryId_fkey` FOREIGN KEY (`enquiryId`) REFERENCES `Enquiry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnquiryDog` ADD CONSTRAINT `EnquiryDog_breedRuleId_fkey` FOREIGN KEY (`breedRuleId`) REFERENCES `BreedRule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnquiryCat` ADD CONSTRAINT `EnquiryCat_enquiryId_fkey` FOREIGN KEY (`enquiryId`) REFERENCES `Enquiry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnquirySmallPet` ADD CONSTRAINT `EnquirySmallPet_enquiryId_fkey` FOREIGN KEY (`enquiryId`) REFERENCES `Enquiry`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EnquirySmallPet` ADD CONSTRAINT `EnquirySmallPet_animalTypeId_fkey` FOREIGN KEY (`animalTypeId`) REFERENCES `AnimalType`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
