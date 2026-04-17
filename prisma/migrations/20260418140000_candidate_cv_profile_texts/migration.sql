-- Optional structured text fields for consulting CV PDF output
ALTER TABLE "Candidate" ADD COLUMN "locationCity" TEXT,
ADD COLUMN "workModality" TEXT,
ADD COLUMN "cvLanguagesText" TEXT,
ADD COLUMN "cvCertificationsText" TEXT,
ADD COLUMN "cvIndustriesText" TEXT,
ADD COLUMN "cvEducationText" TEXT;
