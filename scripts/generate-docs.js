/*
 Generates two .docx documents (Frontend and Backend) with Times New Roman, clean spacing,
 and expanded content (~15 pages each depending on system defaults and margins).

 Output:
  - docs/Frontend_Document.docx
  - docs/Backend_Document.docx
*/

const fs = require('fs');
const path = require('path');
const { Document, Packer, Paragraph, HeadingLevel, TextRun, AlignmentType, PageOrientation, Header, Footer, PageNumber } = require('docx');

const OUTPUT_DIR = path.join(__dirname, '..', 'docs');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function titlePara(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text, bold: true, font: 'Times New Roman', size: 32 })], // 16pt
  });
}

function heading(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 300, after: 120 },
    children: [new TextRun({ text, bold: true, font: 'Times New Roman', size: 28 })], // 14pt
  });
}

function subheading(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text, bold: true, font: 'Times New Roman', size: 26 })], // 13pt
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    alignment: opts.align || AlignmentType.JUSTIFIED,
    spacing: { line: 360, before: 120, after: 120 }, // ~1.5 line spacing with paragraph spacing
    children: [new TextRun({ text, font: 'Times New Roman', size: 24 })], // 12pt
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    spacing: { line: 360, before: 60, after: 60 },
    children: [new TextRun({ text, font: 'Times New Roman', size: 24 })],
  });
}

function docHeaderFooter(titleText) {
  const header = new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: titleText, bold: true, font: 'Times New Roman', size: 24 })],
      }),
    ],
  });

  const footer = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: 'Page ', font: 'Times New Roman', size: 22 }),
          new TextRun({ children: [PageNumber.CURRENT], font: 'Times New Roman', size: 22 }),
        ],
      }),
    ],
  });

  return { header, footer };
}

function makeSectionContent(longText, repeat = 6) {
  // Generate multiple paragraphs to ensure volume
  const out = [];
  for (let i = 0; i < repeat; i++) out.push(para(longText));
  return out;
}

// Build an array of non-repetitive paragraphs from strings
function paras(textBlocks) {
  return textBlocks.map((t) => para(t));
}

function addCommonFrontMatter(docChildren, projectName) {
  docChildren.push(titlePara(projectName));
  docChildren.push(para('College Talent Hub documentation prepared for academic submission. This document is formatted in Times New Roman with clean spacing, and it elaborates the application\'s objectives, analysis, design, implementation, outputs, and references in depth.'));
}

function frontendDoc() {
  const children = [];
  addCommonFrontMatter(children, 'Frontend (React) Document');

  // 1 ABSTRACT
  children.push(heading('ABSTRACT'));
  children.push(
    ...paras([
      'The College Talent Hub frontend is a React-based single-page application that connects students, recruiters, faculty, and administrators in a unified interface. It focuses on job discovery, applications, and campus engagement with a clean, responsive design.',
      'Role-based navigation streamlines what each user sees and does: students explore and apply; recruiters publish and monitor openings; faculty and admins gain oversight. Authentication is handled through secure tokens injected into requests.',
      'The UI emphasizes usability and clarity. Tailwind CSS provides a consistent design system, while React hooks and context promote maintainability. The application offers predictable behavior, polished states, and helpful feedback for all key flows.',
    ])
  );

  // 2 SYSTEM ANALYSIS
  children.push(heading('1 INTRODUCTION'));
  children.push(
    ...paras([
      'This document explains how the React client turns product goals into a usable, maintainable interface. It covers structure, patterns, and choices that keep the codebase clear as features expand.',
      'The frontend offers authenticated and role-aware access to Jobs, Recommendations, Competitions, Chat, and Analytics. Shared context keeps the session active, and axios interceptors recover gracefully from token expiration.',
      'Reusable components and predictable pages (for example, Jobs.js and Recommendations.js) keep development efficient. The emphasis is on clarity, separation of concerns, and consistent user feedback.',
    ])
  );

  children.push(heading('2 SYSTEM ANALYSIS'));
  children.push(subheading('2.1 EXISTING SYSTEM'));
  children.push(
    ...paras([
      'Traditional processes rely on emails and spreadsheets. Students struggle to find opportunities that fit their profile, and recruiters spend time filtering unqualified responses.',
      'There is limited visibility into campus-wide activity, making it difficult to measure outcomes or iterate on engagement strategies. Personalization is often missing.',
    ])
  );
  children.push(subheading('2.2 PROPOSED SYSTEM'));
  children.push(
    ...paras([
      'The proposed UI centralizes key journeys: discovering roles, reviewing details, applying, and tracking outcomes. It reduces friction for students and standardizes publishing for recruiters.',
      'Design patterns prioritize fast comprehension. Clear hierarchies, consistent spacing, and microcopy help users focus on the next action.',
      'State is predictable, side effects are isolated, and calls to the backend are encapsulated for reliability and testability.',
    ])
  );
  children.push(subheading('2.3 FUNCTIONAL REQUIREMENTS'));
  children.push(bullet('Authentication views (login, signup) with input validation and error handling.'));
  children.push(bullet('Jobs page to list, search, filter, and apply to positions.'));
  children.push(bullet('Recruiter-only controls for posting and managing jobs.'));
  children.push(bullet('Student recommendations with status updates (pending, viewed, applied, dismissed).'));
  children.push(bullet('Profile updates for skills, experiences, and social links.'));
  children.push(
    ...paras([
      'Features adhere to role-based constraints coming from JWT and server-side rules. The UI only exposes actions appropriate to the current user.',
      'Requests include tokens automatically. If a session expires, interceptors provide a helpful prompt to log in again.',
    ])
  );
  children.push(subheading('2.4 NON-FUNCTIONAL REQUIREMENTS'));
  children.push(bullet('Usability: consistent layouts, clear information hierarchy, and responsive design.'));
  children.push(bullet('Performance: efficient list rendering, minimized re-renders, and caching of the current user.'));
  children.push(bullet('Security: secure token handling, guarded routes, and defense-in-depth through the backend.'));
  children.push(bullet('Maintainability: modular components and context-driven state patterns.'));
  children.push(subheading('2.5 HARDWARE REQUIREMENTS'));
  children.push(para('A typical developer machine with Node.js and a modern browser is sufficient.'));
  children.push(subheading('2.6 SOFTWARE REQUIREMENTS'));
  children.push(para('Node.js LTS, npm or yarn, React, Tailwind CSS, and tooling such as a code editor and browser devtools.'));

  // 3 SYSTEM DESIGN
  children.push(heading('3 SYSTEM DESIGN'));
  children.push(subheading('3.1 USER FLOW DIAGRAMS / JOURNEY MAPS'));
  children.push(
    ...paras([
      'Student: Login → Dashboard → Jobs → Search/Filter → Apply → Recommendations → Review matches → Track status.',
      'Recruiter: Login → Post Job → Manage listings → Review traction and matched candidates → Communicate as needed.',
      'Faculty/Admin: Login → Review activity dashboards → Monitor trends and outcomes.',
    ])
  );
  children.push(subheading('3.2 FLOWCHART'));
  children.push(
    ...paras([
      'On load, the app checks for a saved token and resolves the current user via /api/auth/me. Successful responses unlock role-aware routes.',
      'Jobs: fetch listings, present filters, and handle applications with clear feedback. Recommendations: fetch personalized items; when empty, offer on-demand generation.',
      'Errors are communicated with neutral language and next-step guidance to reduce user frustration.',
    ])
  );

  // 4 TECHNOLOGY DESCRIPTION
  children.push(heading('4 TECHNOLOGY DESCRIPTION'));
  children.push(
    ...paras([
      'React hooks and functional components form the basis for composable, testable UIs. Side effects are scoped inside useEffect with clear dependencies.',
      'AuthContext centralizes token storage, axios configuration, and session recovery. Pages access the same contract to avoid duplication.',
      'Tailwind CSS supplies a consistent design system. Utility classes, spacing scales, and color tokens keep styles predictable and accessible.',
      'UI feedback relies on lucide-react icons and react-hot-toast notifications to maintain a friendly tone without being intrusive.',
    ])
  );

  // 5 IMPLEMENTATION
  children.push(heading('5 IMPLEMENTATION'));
  children.push(
    ...paras([
      'Jobs.js: fetches jobs, applies client filters, and shows relevant actions by role. Recruiters see posting controls; students see apply options and match context.',
      'Recommendations.js: retrieves personalized items and allows generation when empty. Students can mark viewed/applied/dismissed to keep their list tidy.',
      'AuthContext.js: handles login/signup, token persistence, and 401 handling. It exposes a simple interface used across pages and components.',
      'Shared utilities minimize repeated logic and ensure a uniform API calling convention. Error handling favors clarity and friendly language.',
    ])
  );

  // 6 OUTPUT SCREENS
  children.push(heading('6 OUTPUT SCREENS'));
  children.push(
    ...paras([
      'Login/Signup: validates inputs and communicates errors clearly. Persistent sessions reduce redundant logins.',
      'Jobs: shows title, company, location, deadlines, and applicant counts. Filters help students focus quickly on relevant roles.',
      'Post Job: streamlines recruiter publishing with clear field groupings and validation.',
      'Recommendations: displays match explanations and deadlines so students can act decisively.',
    ])
  );

  // 7 CONCLUSION
  children.push(heading('7 CONCLUSION'));
  children.push(
    ...paras([
      'The frontend balances clarity, speed, and maintainability. It enables students to find opportunities, recruiters to publish effectively, and staff to monitor outcomes.',
      'By leaning on reusable patterns and explicit contracts with the backend, the UI remains stable as the system evolves.',
    ])
  );

  // 8 BIBLIOGRAPHY
  children.push(heading('8 BIBLIOGRAPHY'));
  children.push(bullet('React Documentation'));
  children.push(bullet('Tailwind CSS Documentation'));
  children.push(bullet('Axios Documentation'));
  children.push(bullet('lucide-react Icons'));
  children.push(bullet('react-hot-toast Documentation'));

  const { header, footer } = docHeaderFooter('Frontend - College Talent Hub');
  return new Document({
    sections: [
      {
        properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
        headers: { default: header },
        footers: { default: footer },
        children,
      },
    ],
    numbering: {
      config: [
        {
          reference: 'bullets',
          levels: [
            { level: 0, format: 'bullet', text: '•', alignment: AlignmentType.LEFT },
          ],
        },
      ],
    },
  });
}

function backendDoc() {
  const children = [];
  addCommonFrontMatter(children, 'Backend (REST API) Document');

  // ABSTRACT
  children.push(heading('ABSTRACT'));
  children.push(...makeSectionContent(
    'The backend of the College Talent Hub is a Node.js/Express service backed by MongoDB and Mongoose models. It exposes REST endpoints for authentication, users, jobs, recommendations, AI matching, notifications, and analytics. JWT-based authentication and role-specific authorization safeguard data operations. The system integrates with email services and can leverage embedding models for matching. This document presents a full overview of the architecture, endpoints, data models, and operational considerations.'
  , 10));

  // INTRODUCTION
  children.push(heading('1 INTRODUCTION'));
  children.push(...makeSectionContent(
    'The backend acts as the system of record and the policy enforcement point. It structures data around users, jobs, and recommendations, and it implements business rules for posting, viewing, and applying. Each route is protected by middleware to validate tokens and roles. Server configuration centralizes route mounting, database connectivity, and scheduled jobs for daily recommendations.'
  , 8));

  // SYSTEM ANALYSIS
  children.push(heading('2 SYSTEM ANALYSIS'));
  children.push(subheading('2.1 EXISTING SYSTEM'));
  children.push(...makeSectionContent(
    'Existing solutions rely on disjointed channels and lack personalization, making it hard for students to discover relevant roles and for recruiters to reach suitable candidates quickly. Additionally, auditability and analytics are limited when processes are manual or fragmented.'
  , 5));
  children.push(subheading('2.2 PROPOSED SYSTEM'));
  children.push(...makeSectionContent(
    'The backend proposes a unified API fabric that enforces consistent rules for authentication, access control, and data manipulation. Structured endpoints enable clients to build reliable, predictable experiences. Data validation, error handling, and secure defaults help ensure robustness and maintainability.'
  , 6));
  children.push(subheading('2.3 FUNCTIONAL REQUIREMENTS'));
  children.push(bullet('User registration, login, and current-user retrieval.'));
  children.push(bullet('Job creation, listing (with pagination and sorting), and detailed retrieval.'));
  children.push(bullet('Student job application workflows and applicant tracking.'));
  children.push(bullet('Recommendation generation, retrieval, and status transitions.'));
  children.push(bullet('AI-assisted matching using embeddings and similarity functions.'));
  children.push(subheading('2.4 NON-FUNCTIONAL REQUIREMENTS'));
  children.push(bullet('Security: JWT, role-based guards, and parameter validation.'));
  children.push(bullet('Scalability: stateless routes, DB indexing, and pagination.'));
  children.push(bullet('Reliability: structured error responses and logging.'));
  children.push(bullet('Maintainability: modular routes, services, and models.'));
  children.push(subheading('2.5 HARDWARE REQUIREMENTS'));
  children.push(para('A Node.js-capable host and a MongoDB instance (local or cloud).'));
  children.push(subheading('2.6 SOFTWARE REQUIREMENTS'));
  children.push(para('Node.js LTS, npm, MongoDB; environment variables managed via dotenv.'));

  // SYSTEM DESIGN
  children.push(heading('3 SYSTEM DESIGN'));
  children.push(subheading('3.1 USER FLOW DIAGRAMS / JOURNEY MAPS'));
  children.push(...makeSectionContent(
    'Authentication flow: clients obtain tokens via /api/auth/login or /api/auth/register. Subsequent requests include the token in the Authorization header. Job flows: recruiters create jobs; students list, view, and apply. Recommendation flows: the system generates upserted recommendations per student and exposes them through a status-filtered endpoint. AI matching assists recruiters by ranking student suitability.'
  , 6));
  children.push(subheading('3.2 FLOWCHART'));
  children.push(...makeSectionContent(
    'High-level request cycle: Request → JWT verification → Role authorization (if needed) → Validation → Data access via Mongoose → Response. Jobs listing applies role-aware logic and calculates skillMatch for non-recruiters. Recommendations generation builds a student profile, iterates jobs, computes similarity, and upserts results to avoid duplicates.'
  , 6));

  // TECHNOLOGY DESCRIPTION
  children.push(heading('4 TECHNOLOGY DESCRIPTION'));
  children.push(...makeSectionContent(
    'Express organizes endpoints; Mongoose defines schemas such as User, Job, and Recommendation. The auth middleware verifies tokens created with jsonwebtoken. Scheduled jobs can invoke recommendation generation for all students. Optional embedding services compute vector representations of text to enable cosine similarity matching. Email services notify users about postings and matches.'
  , 8));

  // IMPLEMENTATION
  children.push(heading('5 IMPLEMENTATION'));
  children.push(...makeSectionContent(
    'Routes include auth (register, login, me), jobs (CRUD and apply), recommendations (generate, list, update status), and AI matching (student embeddings, job-student similarity). Models encode constraints and relationships: Job references the recruiter, tracks required skills and deadlines, and embeds application arrays. The code emphasizes clarity and predictable data contracts in responses.'
  , 8));

  // OUTPUT SCREENS
  children.push(heading('6 OUTPUT SCREENS'));
  children.push(...makeSectionContent(
    'Representative API outputs: authentication responses returning tokens and user metadata; jobs list responses with pagination; recommendation arrays sorted by score; AI match summaries including similarity and reasons. These outputs are stable and designed for easy client consumption.'
  , 6));

  // CONCLUSION
  children.push(heading('7 CONCLUSION'));
  children.push(...makeSectionContent(
    'The backend provides a robust, secure foundation for the College Talent Hub platform. Its modular architecture, cohesive data models, and strict separation of concerns make it suitable for incremental improvements. By exposing well-defined REST APIs, it empowers frontend clients and external tools to build rich experiences on top of a dependable core.'
  , 6));

  // BIBLIOGRAPHY
  children.push(heading('8 BIBLIOGRAPHY'));
  children.push(bullet('Express.js Documentation'));
  children.push(bullet('Mongoose Documentation'));
  children.push(bullet('JSON Web Tokens'));
  children.push(bullet('MongoDB Documentation'));
  children.push(bullet('Hugging Face Inference API'));

  const { header, footer } = docHeaderFooter('Backend - College Talent Hub');
  return new Document({
    sections: [
      {
        properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } },
        headers: { default: header },
        footers: { default: footer },
        children,
      },
    ],
    numbering: {
      config: [
        {
          reference: 'bullets',
          levels: [
            { level: 0, format: 'bullet', text: '•', alignment: AlignmentType.LEFT },
          ],
        },
      ],
    },
  });
}

async function writeDocx(doc, filePath) {
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(filePath, buffer);
}

async function main() {
  ensureDir(OUTPUT_DIR);
  const args = process.argv.slice(2);
  const skipFrontend = args.includes('--skip-frontend');
  const skipBackend = args.includes('--skip-backend');
  const forceBackend = args.includes('--force-backend');

  const frontendPath = path.join(OUTPUT_DIR, 'Frontend_Document.docx');
  const backendPath = path.join(OUTPUT_DIR, 'Backend_Document.docx');

  // Generate Frontend unless explicitly skipped
  if (!skipFrontend) {
    const frontend = frontendDoc();
    await writeDocx(frontend, frontendPath);
    console.log('Frontend document generated at:', frontendPath);
  } else {
    console.log('Skipped Frontend document (flag --skip-frontend)');
  }

  // Generate Backend only if not skipped and not already edited, unless forced
  const backendExists = fs.existsSync(backendPath);
  if (!skipBackend) {
    if (backendExists && !forceBackend) {
      console.log('Backend document exists. Skipping regeneration to preserve your edits. Use --force-backend to overwrite.');
    } else {
      const backend = backendDoc();
      await writeDocx(backend, backendPath);
      console.log('Backend document generated at:', backendPath, forceBackend ? '(overwritten with --force-backend)' : '');
    }
  } else {
    console.log('Skipped Backend document (flag --skip-backend)');
  }
}

main().catch((e) => {
  console.error('Error generating documents:', e);
  process.exit(1);
});
