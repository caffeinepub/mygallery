import type { backendInterface } from '@/backend';
import { SortDirection } from '@/backend';

export interface SmokeTestResult {
  flow: string;
  success: boolean;
  error?: string;
  details?: Record<string, any>;
}

/**
 * Development-only smoke test utility that validates core application flows
 * by executing operations via the backend actor and verifying results.
 */
export async function runCoreFlowsSmokeTest(actor: backendInterface): Promise<SmokeTestResult[]> {
  const results: SmokeTestResult[] = [];

  // Test 1: Folder creation
  try {
    const folderName = `Test Folder ${Date.now()}`;
    const folderId = await actor.createFolder(folderName);
    
    if (!folderId) {
      throw new Error('No folder ID returned');
    }

    const folders = await actor.getAllFolders();
    const createdFolder = folders.find(f => f.id.toString() === folderId);

    if (!createdFolder) {
      throw new Error('Created folder not found in list');
    }

    results.push({
      flow: 'Folder Creation',
      success: true,
      details: { folderId, folderName },
    });
  } catch (error) {
    results.push({
      flow: 'Folder Creation',
      success: false,
      error: String(error),
    });
  }

  // Test 2: Mission creation
  try {
    const missionTitle = `Test Mission ${Date.now()}`;
    const missionId = await actor.createMission(missionTitle, []);

    const missions = await actor.listMissions();
    const createdMission = missions.find(m => m.id === missionId);

    if (!createdMission) {
      throw new Error('Created mission not found in list');
    }

    results.push({
      flow: 'Mission Creation',
      success: true,
      details: { missionId: missionId.toString(), missionTitle },
    });
  } catch (error) {
    results.push({
      flow: 'Mission Creation',
      success: false,
      error: String(error),
    });
  }

  // Test 3: Link creation
  try {
    const linkName = `Test Link ${Date.now()}`;
    const linkUrl = 'https://example.com';
    const response = await actor.createLink(linkName, linkUrl, null, null);

    const files = await actor.getPaginatedFiles(SortDirection.desc, BigInt(0), BigInt(1000));
    const createdLink = files.files.find(f => f.id === response.id);

    if (!createdLink) {
      throw new Error('Created link not found in files list');
    }

    results.push({
      flow: 'Link Creation',
      success: true,
      details: { linkId: response.id, linkName },
    });
  } catch (error) {
    results.push({
      flow: 'Link Creation',
      success: false,
      error: String(error),
    });
  }

  // Test 4: Note creation
  try {
    const noteTitle = `Test Note ${Date.now()}`;
    const noteBody = 'This is a test note body';
    const response = await actor.createNote(noteTitle, noteBody, null, null);

    const notes = await actor.getPaginatedNotes(SortDirection.desc, BigInt(0), BigInt(1000));
    const createdNote = notes.notes.find(n => n.id === response.id);

    if (!createdNote) {
      throw new Error('Created note not found in notes list');
    }

    results.push({
      flow: 'Note Creation',
      success: true,
      details: { noteId: response.id, noteTitle },
    });
  } catch (error) {
    results.push({
      flow: 'Note Creation',
      success: false,
      error: String(error),
    });
  }

  return results;
}

export function formatSmokeTestResults(results: SmokeTestResult[]): string {
  const lines: string[] = [
    '='.repeat(60),
    'SMOKE TEST RESULTS',
    '='.repeat(60),
  ];

  for (const result of results) {
    const status = result.success ? '✅ PASS' : '❌ FAIL';
    lines.push(`\n${status}: ${result.flow}`);
    
    if (result.details) {
      lines.push(`  Details: ${JSON.stringify(result.details, null, 2)}`);
    }
    
    if (result.error) {
      lines.push(`  Error: ${result.error}`);
    }
  }

  const passCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  lines.push('\n' + '='.repeat(60));
  lines.push(`Summary: ${passCount}/${totalCount} tests passed`);
  lines.push('='.repeat(60));

  return lines.join('\n');
}
