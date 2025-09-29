#!/usr/bin/env node

/**
 * Temporary Files Cleanup Script
 *
 * This script cleans up temporary files generated during development.
 * It removes files older than the specified retention period and
 * provides a summary of cleanup actions.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const TEMP_DIR = path.join(__dirname, '..', '..', 'temp');
const RETENTION_DAYS = 7; // Keep files for 7 days
const TIMESTAMP_PATTERN = /\[TEMP\].*?(\d{8}-\d{6})/; // Match [TEMP] files with timestamps

/**
 * Parse timestamp from filename
 * @param {string} filename - Filename with timestamp
 * @returns {Date|null} - Parsed date or null if invalid
 */
function parseTimestamp(filename) {
  const match = filename.match(TIMESTAMP_PATTERN);
  if (!match) return null;

  const timestamp = match[1];
  const year = parseInt(timestamp.substring(0, 4));
  const month = parseInt(timestamp.substring(4, 6)) - 1; // Month is 0-indexed
  const day = parseInt(timestamp.substring(6, 8));
  const hour = parseInt(timestamp.substring(9, 11));
  const minute = parseInt(timestamp.substring(11, 13));
  const second = parseInt(timestamp.substring(13, 15));

  return new Date(year, month, day, hour, minute, second);
}

/**
 * Check if file should be cleaned up
 * @param {string} filename - Filename to check
 * @returns {boolean} - True if file should be removed
 */
function shouldCleanup(filename) {
  if (!filename.startsWith('[TEMP]')) return false;

  const fileDate = parseTimestamp(filename);
  if (!fileDate) return false;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

  return fileDate < cutoffDate;
}

/**
 * Get file age in days
 * @param {string} filename - Filename to check
 * @returns {number} - Age in days
 */
function getFileAge(filename) {
  const fileDate = parseTimestamp(filename);
  if (!fileDate) return 0;

  const now = new Date();
  const diffTime = Math.abs(now - fileDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

/**
 * Main cleanup function
 */
function cleanupTempFiles() {
  console.log('🧹 Starting temporary files cleanup...\n');

  if (!fs.existsSync(TEMP_DIR)) {
    console.log('❌ Temp directory does not exist');
    return;
  }

  const files = fs.readdirSync(TEMP_DIR);
  const tempFiles = files.filter(file => file.startsWith('[TEMP]'));

  if (tempFiles.length === 0) {
    console.log('✅ No temporary files found');
    return;
  }

  console.log(`📁 Found ${tempFiles.length} temporary files:\n`);

  const toDelete = [];
  const toKeep = [];

  tempFiles.forEach(file => {
    const filePath = path.join(TEMP_DIR, file);
    const stats = fs.statSync(filePath);
    const age = getFileAge(file);

    console.log(`  📄 ${file}`);
    console.log(`     Age: ${age} days`);
    console.log(`     Size: ${(stats.size / 1024).toFixed(2)} KB`);

    if (shouldCleanup(file)) {
      toDelete.push(file);
      console.log(`     Status: 🗑️  Will be deleted`);
    } else {
      toKeep.push(file);
      console.log(`     Status: ✅ Will be kept`);
    }
    console.log('');
  });

  // Perform cleanup
  if (toDelete.length > 0) {
    console.log(`🗑️  Deleting ${toDelete.length} files...\n`);

    toDelete.forEach(file => {
      const filePath = path.join(TEMP_DIR, file);
      try {
        fs.unlinkSync(filePath);
        console.log(`  ✅ Deleted: ${file}`);
      } catch (error) {
        console.log(`  ❌ Failed to delete ${file}: ${error.message}`);
      }
    });

    console.log(`\n✅ Cleanup completed! Deleted ${toDelete.length} files.`);
  } else {
    console.log('✅ No files need cleanup.');
  }

  if (toKeep.length > 0) {
    console.log(`\n📋 Files kept (${toKeep.length}):`);
    toKeep.forEach(file => {
      console.log(`  📄 ${file}`);
    });
  }

  console.log(`\n📊 Summary:`);
  console.log(`  Total temp files: ${tempFiles.length}`);
  console.log(`  Deleted: ${toDelete.length}`);
  console.log(`  Kept: ${toKeep.length}`);
  console.log(`  Retention period: ${RETENTION_DAYS} days`);
}

/**
 * List all temporary files with details
 */
function listTempFiles() {
  console.log('📋 Listing all temporary files...\n');

  if (!fs.existsSync(TEMP_DIR)) {
    console.log('❌ Temp directory does not exist');
    return;
  }

  const files = fs.readdirSync(TEMP_DIR);
  const tempFiles = files.filter(file => file.startsWith('[TEMP]'));

  if (tempFiles.length === 0) {
    console.log('✅ No temporary files found');
    return;
  }

  console.log(`Found ${tempFiles.length} temporary files:\n`);

  tempFiles.forEach(file => {
    const filePath = path.join(TEMP_DIR, file);
    const stats = fs.statSync(filePath);
    const age = getFileAge(file);
    const createdDate = parseTimestamp(file);

    console.log(`📄 ${file}`);
    console.log(
      `   Created: ${createdDate ? createdDate.toLocaleString() : 'Unknown'}`
    );
    console.log(`   Age: ${age} days`);
    console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(
      `   Status: ${shouldCleanup(file) ? '🗑️  Eligible for cleanup' : '✅ Within retention period'}`
    );
    console.log('');
  });
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'list':
  case 'ls':
    listTempFiles();
    break;
  case 'cleanup':
  case 'clean':
  default:
    cleanupTempFiles();
    break;
}

// Export functions for use in other scripts
module.exports = {
  cleanupTempFiles,
  listTempFiles,
  shouldCleanup,
  getFileAge,
  parseTimestamp,
};
