import type { backendInterface } from '@/backend';
import { ExternalBlob, SortDirection } from '@/backend';

export interface SmokeTestResult {
  success: boolean;
  step: string;
  error?: string;
  details?: Record<string, unknown>;
}

/**
 * Smoke test for core application flows:
 * 1. Create a folder
 * 2. Create a mission
 * 3. Upload a small file
 * 4. Create a link
 * 5. Verify all items appear via list APIs
 */
export async function runCoreFlowsSmokeTest(actor: backendInterface): Promise<SmokeTestResult[]> {
  const results: SmokeTestResult[] = [];
  
  try {
    // Step 1: Create a folder
    console.log('[SmokeTest] Step 1: Creating test folder...');
    const folderName = `Test Folder ${Date.now()}`;
    const folderId = await actor.createFolder(folderName);
    
    if (!folderId) {
      results.push({
        success: false,
        step: 'Create Folder',
        error: 'No folder ID returned from backend',
      });
      return results;
    }
    
    results.push({
      success: true,
      step: 'Create Folder',
      details: { folderId, folderName },
    });
    
    // Verify folder appears in list
    const folders = await actor.getAllFolders();
    const folderExists = folders.some(f => f.id.toString() === folderId);
    
    if (!folderExists) {
      results.push({
        success: false,
        step: 'Verify Folder in List',
        error: 'Created folder does not appear in getAllFolders()',
        details: { folderId, totalFolders: folders.length },
      });
      return results;
    }
    
    results.push({
      success: true,
      step: 'Verify Folder in List',
      details: { folderId, totalFolders: folders.length },
    });
    
    // Step 2: Create a mission
    console.log('[SmokeTest] Step 2: Creating test mission...');
    const missionTitle = `Test Mission ${Date.now()}`;
    const missionId = await actor.createMission(missionTitle, [
      { taskId: BigInt(0), task: 'Test task 1', completed: false },
      { taskId: BigInt(1), task: 'Test task 2', completed: false },
    ]);
    
    results.push({
      success: true,
      step: 'Create Mission',
      details: { missionId: missionId.toString(), missionTitle },
    });
    
    // Verify mission appears in list
    const missions = await actor.listMissions();
    const missionExists = missions.some(m => m.id.toString() === missionId.toString());
    
    if (!missionExists) {
      results.push({
        success: false,
        step: 'Verify Mission in List',
        error: 'Created mission does not appear in listMissions()',
        details: { missionId: missionId.toString(), totalMissions: missions.length },
      });
      return results;
    }
    
    results.push({
      success: true,
      step: 'Verify Mission in List',
      details: { missionId: missionId.toString(), totalMissions: missions.length },
    });
    
    // Step 3: Upload a small file
    console.log('[SmokeTest] Step 3: Uploading test file...');
    const testFileContent = new TextEncoder().encode('Test file content for smoke test');
    const testBlob = ExternalBlob.fromBytes(testFileContent);
    const fileName = `test-file-${Date.now()}.txt`;
    
    const uploadResponse = await actor.uploadFile(
      fileName,
      'text/plain',
      BigInt(testFileContent.length),
      testBlob,
      null
    );
    
    results.push({
      success: true,
      step: 'Upload File',
      details: { fileId: uploadResponse.id, fileName },
    });
    
    // Verify file appears in gallery
    const filesResult = await actor.getPaginatedFiles(SortDirection.desc, BigInt(0), BigInt(100));
    const fileExists = filesResult.files.some(f => f.id === uploadResponse.id);
    
    if (!fileExists) {
      results.push({
        success: false,
        step: 'Verify File in Gallery',
        error: 'Uploaded file does not appear in getPaginatedFiles()',
        details: { fileId: uploadResponse.id, totalFiles: filesResult.files.length },
      });
      return results;
    }
    
    results.push({
      success: true,
      step: 'Verify File in Gallery',
      details: { fileId: uploadResponse.id, totalFiles: filesResult.files.length },
    });
    
    // Step 4: Create a link
    console.log('[SmokeTest] Step 4: Creating test link...');
    const linkName = `Test Link ${Date.now()}`;
    const linkUrl = 'https://example.com/test';
    
    const linkResponse = await actor.createLink(linkName, linkUrl, null, null);
    
    results.push({
      success: true,
      step: 'Create Link',
      details: { linkId: linkResponse.id, linkName, linkUrl },
    });
    
    // Verify link appears in gallery
    const filesWithLink = await actor.getPaginatedFiles(SortDirection.desc, BigInt(0), BigInt(100));
    const linkExists = filesWithLink.files.some(f => f.id === linkResponse.id && f.link === linkUrl);
    
    if (!linkExists) {
      results.push({
        success: false,
        step: 'Verify Link in Gallery',
        error: 'Created link does not appear in getPaginatedFiles()',
        details: { linkId: linkResponse.id, totalFiles: filesWithLink.files.length },
      });
      return results;
    }
    
    results.push({
      success: true,
      step: 'Verify Link in Gallery',
      details: { linkId: linkResponse.id, totalFiles: filesWithLink.files.length },
    });
    
    console.log('[SmokeTest] All steps completed successfully!');
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    results.push({
      success: false,
      step: 'Smoke Test Execution',
      error: errorMessage,
    });
  }
  
  return results;
}

/**
 * Format smoke test results for console output
 */
export function formatSmokeTestResults(results: SmokeTestResult[]): string {
  const lines: string[] = [];
  lines.push('=== Core Flows Smoke Test Results ===');
  lines.push('');
  
  let allPassed = true;
  
  for (const result of results) {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    lines.push(`${status} - ${result.step}`);
    
    if (result.error) {
      lines.push(`  Error: ${result.error}`);
      allPassed = false;
    }
    
    if (result.details) {
      lines.push(`  Details: ${JSON.stringify(result.details, null, 2)}`);
    }
    
    lines.push('');
  }
  
  lines.push('=====================================');
  lines.push(allPassed ? '✅ All tests passed!' : '❌ Some tests failed');
  
  return lines.join('\n');
}
