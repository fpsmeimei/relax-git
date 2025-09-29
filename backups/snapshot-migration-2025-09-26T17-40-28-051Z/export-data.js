const { PrismaClient } = require('@relax-git/shared/generated/prisma-client');
const fs = require('fs-extra');

async function exportData() {
  const prisma = new PrismaClient();

  try {
    const snapshots = await prisma.snapshot.findMany({
      include: {
        comments: true,
        timelineEvents: true,
        searchHistory: true,
      },
    });

    const sessionSnapshots = await prisma.sessionSnapshot.findMany();
    const baseSnapshots = await prisma.baseSnapshot.findMany();

    const exportData = {
      snapshots,
      sessionSnapshots,
      baseSnapshots,
      exportedAt: new Date().toISOString(),
    };

    await fs.writeJSON(
      'F:\relax-git\backups\snapshot-migration-2025-09-26T17-40-28-051Z\data-export.json',
      exportData,
      { spaces: 2 }
    );
    console.log('Data exported successfully');
  } catch (error) {
    console.error('Export failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
