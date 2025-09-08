import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  useEffect(() => {
    document.title = "Privacy Policy • Ping";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/signup" className="flex items-center gap-2 hover:scale-105 transition-transform duration-200">
            <ArrowLeft className="w-5 h-5 text-primary" />
            <span className="text-lg font-semibold iridescent-text">Back to Sign Up</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="prose prose-sm max-w-none">
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
          
          <p><strong>Effective Date:</strong> [Insert Date]<br />
          <strong>Last Updated:</strong> [Insert Date]</p>

          <h2>Introduction</h2>

          <p>Welcome to Ping ("we," "our," or "us"). Ping is a professional networking platform that uses NFC-enabled rings and AI technology to facilitate meaningful professional connections. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application, website, and related services (collectively, the "Service").</p>

          <p>By using our Service, you agree to the collection and use of information in accordance with this Privacy Policy. This policy complies with applicable data protection laws including GDPR, CCPA, and platform-specific requirements from LinkedIn and Instagram.</p>

          <h2>Information We Collect</h2>

          <h3>1. Information You Provide Directly</h3>

          <p><strong>Account Information:</strong></p>
          <ul>
            <li>Full name and email address</li>
            <li>Profile photo (optional)</li>
            <li>Professional title and company</li>
            <li>Location (city/state)</li>
            <li>Contact preferences</li>
            <li>Account settings and preferences</li>
          </ul>

          <p><strong>Profile Enhancement (Optional):</strong></p>
          <ul>
            <li>Additional professional experience details</li>
            <li>Skills and expertise areas</li>
            <li>Professional interests and goals</li>
            <li>Networking preferences</li>
            <li>Event attendance history</li>
          </ul>

          <h3>2. Information from Third-Party Platforms</h3>

          <p>When you choose to connect your social media accounts, we collect:</p>

          <p><strong>LinkedIn Integration (With Your Explicit Consent):</strong></p>
          <ul>
            <li>Basic profile information (name, headline, location)</li>
            <li>Professional experience and employment history</li>
            <li>Skills and endorsements</li>
            <li>Educational background</li>
            <li>Industry and specializations</li>
            <li>Public profile summary</li>
          </ul>

          <p><strong>Instagram Integration (With Your Explicit Consent):</strong></p>
          <ul>
            <li>Public profile information (username, bio)</li>
            <li>Recent public posts and captions (last 30 days)</li>
            <li>Account type (personal/business)</li>
            <li>General interests derived from public content</li>
          </ul>

          <p><strong>Important:</strong> We only access information that you have made public or explicitly grant us permission to access through official OAuth flows. We never access private messages, private posts, or sensitive personal information.</p>

          <h3>3. Device and Usage Information</h3>

          <p><strong>Device Information:</strong></p>
          <ul>
            <li>Device type, operating system, and version</li>
            <li>Unique device identifiers</li>
            <li>IP address and general location data</li>
            <li>App version and usage statistics</li>
          </ul>

          <p><strong>NFC Ring Usage:</strong></p>
          <ul>
            <li>Ring tap events and timestamps</li>
            <li>Connection success/failure rates</li>
            <li>General usage patterns (anonymized)</li>
          </ul>

          <p><strong>App Usage:</strong></p>
          <ul>
            <li>Features used and frequency</li>
            <li>Session duration and frequency</li>
            <li>Error logs and crash reports</li>
            <li>Performance analytics</li>
          </ul>

          <h3>4. Location Information</h3>

          <ul>
            <li>General location (city/state level) for networking events</li>
            <li>Venue-level location during networking events (with permission)</li>
            <li>We do not track precise location continuously</li>
          </ul>

          <h2>How We Use Your Information</h2>

          <h3>1. Core Service Functionality</h3>

          <p><strong>Profile Generation and Enhancement:</strong></p>
          <ul>
            <li>Create comprehensive networking profiles using AI analysis</li>
            <li>Generate personalized conversation starters</li>
            <li>Identify mutual interests and networking opportunities</li>
            <li>Suggest professional connections and collaborations</li>
          </ul>

          <p><strong>Networking Features:</strong></p>
          <ul>
            <li>Facilitate connections between users</li>
            <li>Provide context for ring-tap interactions</li>
            <li>Send connection notifications and follow-ups</li>
            <li>Track networking success and engagement</li>
          </ul>

          <h3>2. AI-Powered Features</h3>

          <p><strong>Profile Analysis:</strong></p>
          <ul>
            <li>Analyze social media content to identify professional skills</li>
            <li>Extract career highlights and achievements</li>
            <li>Determine networking interests and goals</li>
            <li>Generate personality-appropriate conversation starters</li>
          </ul>

          <p><strong>Conversation Matching:</strong></p>
          <ul>
            <li>Match users with complementary skills or interests</li>
            <li>Suggest collaboration opportunities</li>
            <li>Provide contextual conversation topics</li>
            <li>Recommend networking strategies</li>
          </ul>

          <h3>3. Service Improvement</h3>

          <p><strong>Analytics and Optimization:</strong></p>
          <ul>
            <li>Improve AI accuracy and relevance</li>
            <li>Enhance user experience and app performance</li>
            <li>Develop new features and capabilities</li>
            <li>Monitor and prevent misuse</li>
          </ul>

          <p><strong>Customer Support:</strong></p>
          <ul>
            <li>Respond to user inquiries and issues</li>
            <li>Provide technical assistance</li>
            <li>Process feedback and feature requests</li>
          </ul>

          <h3>4. Communication</h3>

          <p><strong>Service-Related Communications:</strong></p>
          <ul>
            <li>Account notifications and updates</li>
            <li>Security alerts and important notices</li>
            <li>Feature announcements and tips</li>
            <li>Connection notifications and messages</li>
          </ul>

          <p><strong>Marketing Communications (Optional):</strong></p>
          <ul>
            <li>Newsletter and product updates</li>
            <li>Event invitations and networking opportunities</li>
            <li>Partnership announcements</li>
            <li>You can opt out at any time</li>
          </ul>

          <h2>Information Sharing and Disclosure</h2>

          <h3>1. With Other Users</h3>

          <p><strong>Public Profile Information:</strong></p>
          <ul>
            <li>Name, professional title, and company</li>
            <li>Profile photo and professional bio</li>
            <li>Skills, interests, and networking goals</li>
            <li>Conversation starters and networking topics</li>
            <li>General location (city/state level)</li>
          </ul>

          <p><strong>Connection Information:</strong></p>
          <ul>
            <li>Mutual connections and networking history</li>
            <li>Shared interests and potential collaboration areas</li>
            <li>Public achievements and featured work</li>
          </ul>

          <h3>2. With Service Providers</h3>

          <p>We share information with trusted third-party service providers who assist in operating our Service:</p>

          <p><strong>AI and Data Processing:</strong></p>
          <ul>
            <li>OpenAI (for profile generation and conversation matching)</li>
            <li>Cloud computing providers (AWS, Google Cloud)</li>
            <li>Analytics providers (anonymized data only)</li>
          </ul>

          <p><strong>Infrastructure and Support:</strong></p>
          <ul>
            <li>Hosting and database providers</li>
            <li>Payment processors (for subscription billing)</li>
            <li>Customer support platforms</li>
            <li>Security and monitoring services</li>
          </ul>

          <p>All service providers are bound by strict confidentiality agreements and data processing terms.</p>

          <h3>3. Legal Requirements</h3>

          <p>We may disclose information when required by law or to:</p>
          <ul>
            <li>Comply with legal processes or government requests</li>
            <li>Protect rights, property, or safety of users</li>
            <li>Prevent fraud or abuse of the Service</li>
            <li>Enforce our Terms of Service</li>
          </ul>

          <h3>4. Business Transfers</h3>

          <p>In the event of a merger, acquisition, or sale of assets, user information may be transferred as part of the transaction, subject to the same privacy protections.</p>

          <h2>Third-Party Platform Compliance</h2>

          <h3>LinkedIn Integration</h3>

          <p>Our LinkedIn integration complies with LinkedIn's API Terms of Use:</p>

          <p><strong>Data Usage:</strong></p>
          <ul>
            <li>We only request minimum necessary permissions</li>
            <li>Profile data is used solely for enhancing networking profiles</li>
            <li>We do not store LinkedIn passwords or unauthorized data</li>
            <li>Users can revoke access at any time through LinkedIn settings</li>
          </ul>

          <p><strong>Compliance Measures:</strong></p>
          <ul>
            <li>Regular compliance audits and updates</li>
            <li>Secure data handling and storage</li>
            <li>Respect for LinkedIn's rate limits and usage policies</li>
            <li>Immediate removal of data upon user request</li>
          </ul>

          <h3>Instagram Integration</h3>

          <p>Our Instagram integration follows Instagram Basic Display API policies:</p>

          <p><strong>Data Usage:</strong></p>
          <ul>
            <li>Access only to public profile information and recent posts</li>
            <li>Content analysis for professional interests only</li>
            <li>No access to private messages or restricted content</li>
            <li>Compliance with Instagram's content and usage policies</li>
          </ul>

          <p><strong>User Control:</strong></p>
          <ul>
            <li>Clear consent process before accessing Instagram data</li>
            <li>Easy disconnection through app settings</li>
            <li>Respect for Instagram's data retention policies</li>
          </ul>

          <h2>Data Security</h2>

          <h3>Security Measures</h3>

          <p><strong>Encryption:</strong></p>
          <ul>
            <li>All data transmitted using TLS 1.3 encryption</li>
            <li>Sensitive data encrypted at rest using AES-256</li>
            <li>API keys and tokens stored in secure key management systems</li>
          </ul>

          <p><strong>Access Controls:</strong></p>
          <ul>
            <li>Multi-factor authentication for all team accounts</li>
            <li>Role-based access controls and principle of least privilege</li>
            <li>Regular security audits and penetration testing</li>
            <li>SOC 2 Type II compliance (planned)</li>
          </ul>

          <p><strong>Data Protection:</strong></p>
          <ul>
            <li>Regular automated backups with encryption</li>
            <li>Secure data centers with physical security measures</li>
            <li>Network security monitoring and intrusion detection</li>
            <li>Regular security training for all team members</li>
          </ul>

          <h3>Incident Response</h3>

          <p>In the event of a data breach:</p>
          <ul>
            <li>Immediate containment and assessment procedures</li>
            <li>Notification to affected users within 72 hours</li>
            <li>Cooperation with regulatory authorities as required</li>
            <li>Transparent communication about impact and remediation</li>
          </ul>

          <h2>Your Rights and Choices</h2>

          <h3>Account Management</h3>

          <p><strong>Profile Control:</strong></p>
          <ul>
            <li>Edit or update profile information at any time</li>
            <li>Choose which information to make public</li>
            <li>Control conversation starter preferences</li>
            <li>Manage networking visibility settings</li>
          </ul>

          <p><strong>Social Media Connections:</strong></p>
          <ul>
            <li>Connect or disconnect social media accounts</li>
            <li>Control which social media data to include</li>
            <li>Revoke access permissions through third-party platforms</li>
            <li>Request fresh analysis of updated social profiles</li>
          </ul>

          <h3>Data Rights</h3>

          <p><strong>Access and Portability:</strong></p>
          <ul>
            <li>Download a copy of your personal data</li>
            <li>Request information about data processing activities</li>
            <li>Receive data in a machine-readable format</li>
          </ul>

          <p><strong>Correction and Deletion:</strong></p>
          <ul>
            <li>Correct inaccurate personal information</li>
            <li>Delete your account and associated data</li>
            <li>Request removal of specific data elements</li>
            <li>Opt out of AI-generated content features</li>
          </ul>

          <p><strong>Communication Preferences:</strong></p>
          <ul>
            <li>Unsubscribe from marketing communications</li>
            <li>Control push notifications and alerts</li>
            <li>Set communication frequency preferences</li>
            <li>Opt out of data sharing for marketing purposes</li>
          </ul>

          <h3>Geographic Rights</h3>

          <p><strong>European Users (GDPR):</strong></p>
          <ul>
            <li>Right to access, rectify, and erase personal data</li>
            <li>Right to data portability and restriction of processing</li>
            <li>Right to object to processing and withdraw consent</li>
            <li>Right to lodge complaints with supervisory authorities</li>
          </ul>

          <p><strong>California Users (CCPA):</strong></p>
          <ul>
            <li>Right to know about personal information collection and use</li>
            <li>Right to delete personal information</li>
            <li>Right to opt out of sale of personal information</li>
            <li>Right to non-discrimination for exercising privacy rights</li>
          </ul>

          <h2>Data Retention</h2>

          <h3>Retention Periods</h3>

          <p><strong>Active Accounts:</strong></p>
          <ul>
            <li>Profile and account data: Retained while account is active</li>
            <li>Social media data: Refreshed every 90 days or upon user request</li>
            <li>Usage analytics: Aggregated and anonymized after 24 months</li>
            <li>Connection history: Retained for networking relationship continuity</li>
          </ul>

          <p><strong>Inactive Accounts:</strong></p>
          <ul>
            <li>Data deleted after 18 months of inactivity</li>
            <li>Users notified before deletion with opportunity to reactivate</li>
            <li>Essential data (for legal compliance) retained as required by law</li>
          </ul>

          <p><strong>Deleted Accounts:</strong></p>
          <ul>
            <li>Immediate removal of personal profile information</li>
            <li>Anonymization of usage data within 30 days</li>
            <li>Backup data removed within 90 days</li>
            <li>Legal hold data retained only as required</li>
          </ul>

          <h3>Data Minimization</h3>

          <p>We regularly review and delete:</p>
          <ul>
            <li>Unnecessary social media data beyond profile enhancement needs</li>
            <li>Outdated usage analytics and performance data</li>
            <li>Temporary files and cached information</li>
            <li>Redundant backup copies beyond retention requirements</li>
          </ul>

          <h2>International Data Transfers</h2>

          <h3>Global Operations</h3>

          <p>Ping operates globally and may transfer data internationally:</p>

          <p><strong>Transfer Safeguards:</strong></p>
          <ul>
            <li>Standard Contractual Clauses (SCCs) for EU data transfers</li>
            <li>Privacy Shield certification (where applicable)</li>
            <li>Adequacy decisions and local data protection measures</li>
            <li>Regular compliance reviews and updates</li>
          </ul>

          <p><strong>Data Localization:</strong></p>
          <ul>
            <li>EU user data processed within EU/EEA when possible</li>
            <li>California user data processed within United States</li>
            <li>Local storage requirements respected where mandated by law</li>
          </ul>

          <h2>Children's Privacy</h2>

          <p>Ping is designed for professional networking and is not intended for use by individuals under 18 years of age. We do not knowingly collect personal information from children under 18. If we become aware that we have collected information from a child under 18, we will take immediate steps to delete such information.</p>

          <p>Parents or guardians who believe their child has provided information to us should contact us immediately at talkwithping@gmail.com.</p>

          <h2>Updates to Privacy Policy</h2>

          <h3>Change Notification</h3>

          <p>We may update this Privacy Policy periodically to reflect:</p>
          <ul>
            <li>Changes in our data practices or Service features</li>
            <li>Updates to legal requirements or regulatory guidance</li>
            <li>Enhanced security measures or privacy protections</li>
            <li>User feedback and best practice improvements</li>
          </ul>

          <p><strong>Notification Process:</strong></p>
          <ul>
            <li>Email notification for material changes</li>
            <li>In-app notifications for significant updates</li>
            <li>30-day notice period for substantial modifications</li>
            <li>Continued use constitutes acceptance of changes</li>
          </ul>

          <h3>Version History</h3>

          <p>We maintain a history of privacy policy versions and will provide previous versions upon request for transparency and compliance purposes.</p>

          <h2>Contact Information</h2>

          <h3>Privacy Inquiries</h3>

          <p>For questions about this Privacy Policy or our data practices:</p>

          <p><strong>Email:</strong> talkwithping@gmail.com<br />
          <strong>Mail:</strong> Ping Privacy Team, [Your Business Address]<br />
          <strong>Response Time:</strong> We respond to privacy inquiries within 72 hours</p>

          <h3>Data Protection Officer</h3>

          <p>For GDPR-related inquiries:<br />
          <strong>Email:</strong> talkwithping@gmail.com</p>

          <h3>Regulatory Complaints</h3>

          <p><strong>EU Users:</strong> Contact your local supervisory authority<br />
          <strong>California Users:</strong> Contact the California Attorney General's Office<br />
          <strong>Other Jurisdictions:</strong> Contact your local data protection authority</p>

          <hr />

          <h2>Platform-Specific Disclosures</h2>

          <h3>LinkedIn API Usage</h3>

          <p>This application uses LinkedIn APIs and complies with LinkedIn's API Terms of Use. LinkedIn data is used exclusively for:</p>
          <ul>
            <li>Enhancing professional networking profiles</li>
            <li>Generating relevant conversation starters</li>
            <li>Identifying mutual professional interests</li>
            <li>Facilitating meaningful professional connections</li>
          </ul>

          <p>Users can manage LinkedIn permissions through their LinkedIn account settings.</p>

          <h3>Instagram API Usage</h3>

          <p>This application uses Instagram Basic Display API in compliance with Instagram's Platform Policy. Instagram data is used exclusively for:</p>
          <ul>
            <li>Understanding professional interests and personal brand</li>
            <li>Generating authentic conversation topics</li>
            <li>Enhancing networking personality profiles</li>
            <li>Creating more engaging professional connections</li>
          </ul>

          <p>Users can manage Instagram permissions through their Instagram account settings.</p>

          <hr />

          <p><strong>This Privacy Policy is designed to be transparent, comprehensive, and compliant with all applicable laws and platform requirements. We are committed to protecting your privacy while enabling meaningful professional connections through our innovative networking platform.</strong></p>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;