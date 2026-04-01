-- Internal user lifecycle: deactivated users cannot authenticate.
ALTER TABLE "User" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
