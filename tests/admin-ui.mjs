import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

// Render the actual UI components with the existing build dependencies.
const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(path.join(root, 'frontend/package.json'));
const { build } = require('esbuild');
const result = await build({
  absWorkingDir: path.join(root, 'frontend'), bundle: true, write: false,
  platform: 'node', format: 'cjs', jsx: 'automatic', packages: 'external',
  loader: { '.png': 'dataurl' },
  define: { 'import.meta.env': JSON.stringify({ VITE_SUPABASE_URL: 'https://example.supabase.co', VITE_SUPABASE_ANON_KEY: 'test-publishable-key', VITE_API_BASE_URL: 'http://127.0.0.1' }) },
  stdin: { resolveDir: path.join(root, 'frontend'), loader: 'jsx', contents: `
    import assert from 'node:assert/strict';
    import { renderToStaticMarkup as render } from 'react-dom/server';
    import { RoleSelector } from './src/components/auth/RoleSelector';
    import { AdminLogin } from './src/components/auth/AdminLogin';
    import { AdminApprovals } from './src/components/admin/AdminApprovals';
    import { VerificationBanner } from './src/components/mentor/VerificationBanner';
    import { DocumentPicker } from './src/components/auth/DocumentPicker';
    const picker = render(<RoleSelector t={(s) => s} lang="en" setLang={() => {}} onPick={() => {}} />);
    assert(picker.includes('Administrator login'));
    assert(!picker.includes('roleAdmin'));
    assert(picker.includes('roleMentor') && picker.includes('roleStudent'));
    const admin = render(<AdminLogin onBack={() => {}} onAuthenticated={() => {}} />);
    assert(admin.includes('Administrator login') && admin.includes('type="password"'));
    assert(!admin.includes('Create account') && !admin.includes('Google'));
    const pending = render(<VerificationBanner session={{verification:{tiers:['id']}}} application={{status:'pending'}} />);
    assert(pending.includes('awaiting DHET review'));
    assert(!pending.includes('Complete verification') && !pending.includes('ID Verified'));
    const approved = render(<VerificationBanner session={{}} application={{status:'approved',idDocumentFilename:'id.pdf'}} />);
    assert(approved.includes('Approved') && approved.includes('ID Verified'));
    assert(!approved.includes('Complete verification'));
    const rejected = render(<VerificationBanner session={{}} application={{status:'rejected'}} />);
    assert(rejected.includes('Complete verification'));
    const failure = render(<AdminApprovals applications={[]} error={{status:403}} onRefresh={() => {}} />);
    assert(failure.includes('Administrator access is required') && !failure.includes('No pending applications'));
    const dashboard = render(<AdminApprovals applications={[]} onRefresh={() => {}} />);
    assert(dashboard.includes('Administrator dashboard') && dashboard.includes('Approved') && dashboard.includes('Rejected'));
    const documents = render(<DocumentPicker label="Identity document" onChange={() => {}} />);
    assert(documents.includes('type="file"'));
    console.log('PASS: public roles exclude admin registration; dedicated admin login; pending/approved/rejected states; denied dashboard; history tabs; real file picker.');
  ` },
});
new Function('require', result.outputFiles[0].text)(require);
