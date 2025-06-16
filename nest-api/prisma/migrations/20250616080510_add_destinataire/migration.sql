-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "destinataire_id" TEXT;

-- CreateTable
CREATE TABLE "destinataires" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "destinataires_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "destinataires" ADD CONSTRAINT "destinataires_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_destinataire_id_fkey" FOREIGN KEY ("destinataire_id") REFERENCES "destinataires"("id") ON DELETE SET NULL ON UPDATE CASCADE;
