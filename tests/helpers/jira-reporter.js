const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

class JiraReporter {
  constructor(options) {
    this.options = options;
  }

  onBegin(config, suite) {
    console.log(`Starting the run with ${suite.allTests().length} tests`);
  }

  onTestBegin(test) {
    console.log(`Starting test ${test.title}`);
  }

  async onTestEnd(test, result) {
    if (result.status === 'failed' || result.status === 'timedOut') {
      console.log(`❌ Test failed: ${test.title}. Preparing Jira Bug report...`);

      // Prepare log file for debugging
      const logFile = path.join(__dirname, '..', 'reports', 'jira-sync.log');
      const dir = path.dirname(logFile);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      // Extract Jira TC key (e.g., TC_AUTH_001 from 'TC_AUTH_001 — Login')
      const match = test.title.match(/^(TC_[A-Z]+_\d+)/);
      const testCaseKey = match ? match[1] : 'Unknown TC';

      // Gather artifacts attached to the test (screenshots, videos, and other files like error-context)
      const screenshots = result.attachments.filter(a => a.name === 'screenshot' && a.path).map(a => a.path);
      const videos = result.attachments.filter(a => a.name === 'video' && a.path).map(a => a.path);
      const otherFiles = result.attachments.filter(a => a.path && a.name !== 'screenshot' && a.name !== 'video').map(a => a.path);

      const errorMessage = result.error ? result.error.message : 'Unknown error';
      const codeSnippet = (result.error && result.error.snippet) ? `\n*Code Snippet where it failed:*\n{code:javascript}\n${result.error.snippet}\n{code}\n` : '';

      // Gather text-based attachments (like error-context)
      const textAttachments = result.attachments.filter(a => !a.path && a.body);
      let textAttachmentsContent = '';
      if (textAttachments.length > 0) {
          textAttachmentsContent = '\n*Error Context / Logs:*\n';
          for (const ta of textAttachments) {
              textAttachmentsContent += `{code:title=${ta.name}}\n${ta.body.toString('utf-8')}\n{code}\n`;
          }
      }

      // Format test steps
      let stepLogs = '';
      if (result.steps && result.steps.length > 0) {
          stepLogs = '\n*Test Steps Execution Log:*\n{noformat}\n';
          const printSteps = (steps, indent = '') => {
              for (const step of steps) {
                  const icon = step.error ? '❌' : '✅';
                  stepLogs += `${indent}${icon} ${step.title} (${step.duration}ms)\n`;
                  if (step.steps && step.steps.length > 0) {
                      printSteps(step.steps, indent + '  ');
                  }
              }
          };
          printSteps(result.steps);
          stepLogs += '{noformat}\n';
      }

      const bugDescription = `
*Test:* ${test.title}
*Status:* ${result.status}
*Duration:* ${result.duration}ms

*Error:*
{code}
${errorMessage}
{code}
${codeSnippet}${textAttachmentsContent}${stepLogs}
*Attachments uploaded to this Jira:*
Screenshots: ${screenshots.length > 0 ? screenshots.length : 'None'}
Videos: ${videos.length > 0 ? videos.length : 'None'}
Other Attachments: ${otherFiles.length > 0 ? otherFiles.length : 'None'}
      `.trim();

      const authHeader = `Basic ${Buffer.from(process.env.JIRA_USER_EMAIL + ':' + process.env.JIRA_API_TOKEN).toString('base64')}`;
      let targetIssueKey = null;

      // 1. Search Jira for an existing open bug for this test case
      try {
          const jql = testCaseKey !== 'Unknown TC' 
             ? `project = "${process.env.JIRA_PROJECT_KEY}" AND labels = "${testCaseKey}" AND resolution is EMPTY`
             : `project = "${process.env.JIRA_PROJECT_KEY}" AND summary ~ "\\"[AUTOTEST FAIL] ${test.title}\\"" AND resolution is EMPTY`;
             
          const searchRes = await fetch(`https://${process.env.JIRA_URL}.atlassian.net/rest/api/3/search/jql?jql=${encodeURIComponent(jql)}`, {
              headers: { 
                  'Authorization': authHeader, 
                  'Content-Type': 'application/json' 
              }
          });
          
          if (!searchRes.ok) {
              const errorText = await searchRes.text();
              console.error('Jira Search API rejected the JQL query:', errorText);
              fs.appendFileSync(logFile, `[DEBUG] Jira Search Failed. Status: ${searchRes.status}, Error: ${errorText}\n`);
          } else {
              const searchData = await searchRes.json();
              const issueList = searchData.issues || searchData.values || [];
              if (issueList.length > 0) {
                  targetIssueKey = issueList[0].key || issueList[0].id;
                  console.log(`🔄 Found existing open bug: ${targetIssueKey}`);
                  fs.appendFileSync(logFile, `[DEBUG] Found existing bug: ${targetIssueKey}\n`);
              } else {
                  fs.appendFileSync(logFile, `[DEBUG] No existing bug found. JQL: ${jql}\n`);
              }
          }
      } catch (err) {
          console.error('Error searching Jira for duplicates:', err);
      }

      // 2. Either Create a New Bug OR Update the Existing One
      if (targetIssueKey) {
          // UPDATE: Add a comment with the latest run report
          try {
              const commentRes = await fetch(`https://${process.env.JIRA_URL}.atlassian.net/rest/api/2/issue/${targetIssueKey}/comment`, {
                  method: 'POST',
                  headers: { 
                      'Authorization': authHeader, 
                      'Content-Type': 'application/json' 
                  },
                  body: JSON.stringify({ 
                      body: `*Automated Test Failed Again*\n\n${bugDescription}` 
                  })
              });
              if (!commentRes.ok) {
                  const errorText = await commentRes.text();
                  console.error(`Failed to post update comment on ${targetIssueKey}:`, errorText);
                  fs.appendFileSync(logFile, `[DEBUG] Update Comment Failed for ${targetIssueKey}. Status: ${commentRes.status}, Error: ${errorText}\n`);
              } else {
                  console.log(`💬 Added failure comment down to ${targetIssueKey}`);
                  fs.appendFileSync(logFile, `[DEBUG] Successfully updated bug: ${targetIssueKey}\n`);
              }
          } catch(err) {
               console.error('Error commenting on Jira:', err);
          }
      } else {
          // CREATE: POST to Jira REST API to generate a new bug
          try {
              const response = await fetch(`https://${process.env.JIRA_URL}.atlassian.net/rest/api/2/issue`, {
                  method: 'POST',
                  headers: {
                      'Authorization': authHeader,
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                      fields: {
                          project: { key: process.env.JIRA_PROJECT_KEY },
                          summary: `[AUTOTEST FAIL] ${test.title}`,
                          description: bugDescription,
                          issuetype: { name: 'Bug' },
                          labels: ['automation', 'playwright', 'regression', testCaseKey]
                      }
                  })
              });
              
              if (!response.ok) {
                  const errorText = await response.text();
                  console.error('Failed to create Jira issue:', errorText);
                  fs.appendFileSync(logFile, `[DEBUG] Issue Creation Failed. Status: ${response.status}, Error: ${errorText}\n`);
              } else {
                  const data = await response.json();
                  targetIssueKey = data.key;
                  console.log(`✅ Jira Bug Created: ${targetIssueKey}`);
                  fs.appendFileSync(logFile, `[DEBUG] Successfully created new bug: ${targetIssueKey}\n`);
              }
          } catch (err) {
              console.error('Error connecting to Jira:', err);
          }
      }

      // 3. Upload Attachments (Screenshots & Videos) to the target ticket
      if (targetIssueKey) {
          const allFiles = [...screenshots, ...videos, ...otherFiles];
          for (const filePath of allFiles) {
              if (fs.existsSync(filePath)) {
                  try {
                      const fileBuffer = fs.readFileSync(filePath);
                      const fileName = path.basename(filePath);
                      
                      const form = new FormData();
                      form.append('file', new Blob([fileBuffer]), fileName);

                      const attachRes = await fetch(`https://${process.env.JIRA_URL}.atlassian.net/rest/api/2/issue/${targetIssueKey}/attachments`, {
                          method: 'POST',
                          headers: {
                              'Authorization': authHeader,
                              'X-Atlassian-Token': 'no-check'
                          },
                          body: form
                      });
                      if (!attachRes.ok) {
                          console.error(`Failed to attach ${fileName} to ${targetIssueKey}:`, await attachRes.text());
                      } else {
                          console.log(`📎 Attached ${fileName} to ${targetIssueKey}`);
                      }
                  } catch (err) {
                      console.error(`Error uploading attachment ${filePath}:`, err);
                  }
              }
          }
      }

      fs.appendFileSync(logFile, `[JIRA REPORT] Action: Create Bug
Summary: [AUTOTEST FAIL] ${test.title}
Project: ${process.env.JIRA_PROJECT_KEY || 'SQ'}
Description: ${bugDescription}
----------------------------------
`);
    } else if (result.status === 'passed') {
      console.log(`✅ Test passed: ${test.title}`);
    }
  }

  onEnd(result) {
    console.log(`Finished the run: ${result.status}`);
  }
}

module.exports = JiraReporter;