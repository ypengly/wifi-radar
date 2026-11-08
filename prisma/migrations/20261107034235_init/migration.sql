-- CreateEnum
CREATE TYPE "Source" AS ENUM ('ANDROID', 'WINDOWS', 'LINUX', 'MACOS');

-- CreateEnum
CREATE TYPE "Confidence" AS ENUM ('VERIFIED', 'DB_ESTIMATED', 'USER_REPORTED', 'UNKNOWN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Unpaired device',
    "platform" "Source",
    "tokenHash" TEXT,
    "pairingCodeHash" TEXT,
    "pairingExpiresAt" TIMESTAMP(3),
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WifiNetwork" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ssid" TEXT NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WifiNetwork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessPoint" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "networkId" TEXT NOT NULL,
    "bssid" TEXT NOT NULL,
    "frequency" INTEGER NOT NULL,
    "channel" INTEGER NOT NULL,
    "band" TEXT NOT NULL,
    "security" TEXT NOT NULL,
    "firstSeenAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,
    "lastDbm" INTEGER NOT NULL,

    CONSTRAINT "AccessPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScanSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "source" "Source" NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "connectedBssid" TEXT,
    "scannerLat" DOUBLE PRECISION,
    "scannerLon" DOUBLE PRECISION,
    "scannerAccM" DOUBLE PRECISION,

    CONSTRAINT "ScanSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScanResult" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "apId" TEXT NOT NULL,
    "dbm" INTEGER NOT NULL,

    CONSTRAINT "ScanResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SignalHistory" (
    "id" TEXT NOT NULL,
    "apId" TEXT NOT NULL,
    "dbm" INTEGER NOT NULL,
    "at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SignalHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavedNetwork" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "apId" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "SavedNetwork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocationRecord" (
    "id" TEXT NOT NULL,
    "apId" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "accuracyM" DOUBLE PRECISION,
    "confidence" "Confidence" NOT NULL,
    "provider" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LocationRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Device_tokenHash_key" ON "Device"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "Device_pairingCodeHash_key" ON "Device"("pairingCodeHash");

-- CreateIndex
CREATE UNIQUE INDEX "WifiNetwork_userId_ssid_key" ON "WifiNetwork"("userId", "ssid");

-- CreateIndex
CREATE INDEX "AccessPoint_userId_lastSeenAt_idx" ON "AccessPoint"("userId", "lastSeenAt");

-- CreateIndex
CREATE UNIQUE INDEX "AccessPoint_userId_bssid_key" ON "AccessPoint"("userId", "bssid");

-- CreateIndex
CREATE INDEX "ScanSession_userId_startedAt_idx" ON "ScanSession"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "ScanResult_sessionId_idx" ON "ScanResult"("sessionId");

-- CreateIndex
CREATE INDEX "SignalHistory_apId_at_idx" ON "SignalHistory"("apId", "at");

-- CreateIndex
CREATE UNIQUE INDEX "SavedNetwork_userId_apId_key" ON "SavedNetwork"("userId", "apId");

-- CreateIndex
CREATE INDEX "LocationRecord_apId_idx" ON "LocationRecord"("apId");

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WifiNetwork" ADD CONSTRAINT "WifiNetwork_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessPoint" ADD CONSTRAINT "AccessPoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessPoint" ADD CONSTRAINT "AccessPoint_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "WifiNetwork"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanSession" ADD CONSTRAINT "ScanSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanSession" ADD CONSTRAINT "ScanSession_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanResult" ADD CONSTRAINT "ScanResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ScanSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScanResult" ADD CONSTRAINT "ScanResult_apId_fkey" FOREIGN KEY ("apId") REFERENCES "AccessPoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SignalHistory" ADD CONSTRAINT "SignalHistory_apId_fkey" FOREIGN KEY ("apId") REFERENCES "AccessPoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedNetwork" ADD CONSTRAINT "SavedNetwork_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedNetwork" ADD CONSTRAINT "SavedNetwork_apId_fkey" FOREIGN KEY ("apId") REFERENCES "AccessPoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocationRecord" ADD CONSTRAINT "LocationRecord_apId_fkey" FOREIGN KEY ("apId") REFERENCES "AccessPoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
