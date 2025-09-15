import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
interface PrivacyPolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
const PrivacyPolicyModal = ({
  open,
  onOpenChange
}: PrivacyPolicyModalProps) => {
  return <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
          <DialogDescription>Effective Date: Aug 13, 2025 | Last Updated: Aug 13, 2025</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <h2 className="text-lg font-semibold mb-3">Introduction</h2>
            <p className="mb-4">
              Welcome to Ping ("we," "our," or "us"). Ping is a professional networking platform that uses NFC-enabled rings and AI technology to facilitate meaningful professional connections. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application, website, and related services (collectively, the "Service").
            </p>
            <p className="mb-4">
              By using our Service, you agree to the collection and use of information in accordance with this Privacy Policy. This policy complies with applicable data protection laws including GDPR, CCPA, and platform-specific requirements from LinkedIn and Instagram.
            </p>

            <h2 className="text-lg font-semibold mb-3 mt-6">Information We Collect</h2>
            
            <h3 className="text-base font-medium mb-2">1. Information You Provide Directly</h3>
            <p className="mb-2"><strong>Account Information:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Full name and email address</li>
              <li>Profile photo (optional)</li>
              <li>Professional title and company</li>
              <li>Location (city/state)</li>
              <li>Contact preferences</li>
              <li>Account settings and preferences</li>
            </ul>

            <p className="mb-2"><strong>Profile Enhancement (Optional):</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Additional professional experience details</li>
              <li>Skills and expertise areas</li>
              <li>Professional interests and goals</li>
              <li>Networking preferences</li>
              <li>Event attendance history</li>
            </ul>

            <h3 className="text-base font-medium mb-2">2. Information from Third-Party Platforms</h3>
            <p className="mb-2">When you choose to connect your social media accounts, we collect:</p>
            
            <p className="mb-2"><strong>LinkedIn Integration (With Your Explicit Consent):</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Basic profile information (name, headline, location)</li>
              <li>Professional experience and employment history</li>
              <li>Skills and endorsements</li>
              <li>Educational background</li>
              <li>Industry and specializations</li>
              <li>Public profile summary</li>
            </ul>

            <p className="mb-2"><strong>Instagram Integration (With Your Explicit Consent):</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Public profile information (username, bio)</li>
              <li>Recent public posts and captions (last 30 days)</li>
              <li>Account type (personal/business)</li>
              <li>General interests derived from public content</li>
            </ul>

            <p className="mb-4 text-sm bg-muted p-3 rounded">
              <strong>Important:</strong> We only access information that you have made public or explicitly grant us permission to access through official OAuth flows. We never access private messages, private posts, or sensitive personal information.
            </p>

            <h3 className="text-base font-medium mb-2">3. Device and Usage Information</h3>
            <p className="mb-2"><strong>Device Information:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Device type, operating system, and version</li>
              <li>Unique device identifiers</li>
              <li>IP address and general location data</li>
              <li>App version and usage statistics</li>
            </ul>

            <p className="mb-2"><strong>NFC Ring Usage:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Ring tap events and timestamps</li>
              <li>Connection success/failure rates</li>
              <li>General usage patterns (anonymized)</li>
            </ul>

            <p className="mb-2"><strong>App Usage:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Features used and frequency</li>
              <li>Session duration and frequency</li>
              <li>Error logs and crash reports</li>
              <li>Performance analytics</li>
            </ul>

            <h3 className="text-base font-medium mb-2">4. Location Information</h3>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>General location (city/state level) for networking events</li>
              <li>Venue-level location during networking events (with permission)</li>
              <li>We do not track precise location continuously</li>
            </ul>

            <h2 className="text-lg font-semibold mb-3 mt-6">How We Use Your Information</h2>
            
            <h3 className="text-base font-medium mb-2">1. Core Service Functionality</h3>
            <p className="mb-2"><strong>Profile Generation and Enhancement:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Create comprehensive networking profiles using AI analysis</li>
              <li>Generate personalized conversation starters</li>
              <li>Identify mutual interests and networking opportunities</li>
              <li>Suggest professional connections and collaborations</li>
            </ul>

            <p className="mb-2"><strong>Networking Features:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Facilitate connections between users</li>
              <li>Provide context for ring-tap interactions</li>
              <li>Send connection notifications and follow-ups</li>
              <li>Track networking success and engagement</li>
            </ul>

            <h3 className="text-base font-medium mb-2">2. AI-Powered Features</h3>
            <p className="mb-2"><strong>Profile Analysis:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Analyze social media content to identify professional skills</li>
              <li>Extract career highlights and achievements</li>
              <li>Determine networking interests and goals</li>
              <li>Generate personality-appropriate conversation starters</li>
            </ul>

            <p className="mb-2"><strong>Conversation Matching:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Match users with complementary skills or interests</li>
              <li>Suggest collaboration opportunities</li>
              <li>Provide contextual conversation topics</li>
              <li>Recommend networking strategies</li>
            </ul>

            <h3 className="text-base font-medium mb-2">3. Service Improvement</h3>
            <p className="mb-2"><strong>Analytics and Optimization:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Improve AI accuracy and relevance</li>
              <li>Enhance user experience and app performance</li>
              <li>Develop new features and capabilities</li>
              <li>Monitor and prevent misuse</li>
            </ul>

            <p className="mb-2"><strong>Customer Support:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Respond to user inquiries and issues</li>
              <li>Provide technical assistance</li>
              <li>Process feedback and feature requests</li>
            </ul>

            <h3 className="text-base font-medium mb-2">4. Communication</h3>
            <p className="mb-2"><strong>Service-Related Communications:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Account notifications and updates</li>
              <li>Security alerts and important notices</li>
              <li>Feature announcements and tips</li>
              <li>Connection notifications and messages</li>
            </ul>

            <p className="mb-2"><strong>Marketing Communications (Optional):</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Newsletter and product updates</li>
              <li>Event invitations and networking opportunities</li>
              <li>Partnership announcements</li>
              <li>You can opt out at any time</li>
            </ul>

            <h2 className="text-lg font-semibold mb-3 mt-6">Information Sharing and Disclosure</h2>
            
            <h3 className="text-base font-medium mb-2">1. With Other Users</h3>
            <p className="mb-2"><strong>Public Profile Information:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Name, professional title, and company</li>
              <li>Profile photo and professional bio</li>
              <li>Skills, interests, and networking goals</li>
              <li>Conversation starters and networking topics</li>
              <li>General location (city/state level)</li>
            </ul>

            <p className="mb-2"><strong>Connection Information:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Mutual connections and networking history</li>
              <li>Shared interests and potential collaboration areas</li>
              <li>Public achievements and featured work</li>
            </ul>

            <h3 className="text-base font-medium mb-2">2. With Service Providers</h3>
            <p className="mb-2">We share information with trusted third-party service providers who assist in operating our Service:</p>
            
            <p className="mb-2"><strong>AI and Data Processing:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>OpenAI (for profile generation and conversation matching)</li>
              <li>Cloud computing providers (AWS, Google Cloud)</li>
              <li>Analytics providers (anonymized data only)</li>
            </ul>

            <p className="mb-2"><strong>Infrastructure and Support:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Hosting and database providers</li>
              <li>Payment processors (for subscription billing)</li>
              <li>Customer support platforms</li>
              <li>Security and monitoring services</li>
            </ul>

            <p className="mb-4">All service providers are bound by strict confidentiality agreements and data processing terms.</p>

            <h3 className="text-base font-medium mb-2">3. Legal Requirements</h3>
            <p className="mb-2">We may disclose information when required by law or to:</p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Comply with legal processes or government requests</li>
              <li>Protect rights, property, or safety of users</li>
              <li>Prevent fraud or abuse of the Service</li>
              <li>Enforce our Terms of Service</li>
            </ul>

            <h3 className="text-base font-medium mb-2">4. Business Transfers</h3>
            <p className="mb-4">In the event of a merger, acquisition, or sale of assets, user information may be transferred as part of the transaction, subject to the same privacy protections.</p>

            <h2 className="text-lg font-semibold mb-3 mt-6">Third-Party Platform Compliance</h2>
            
            <h3 className="text-base font-medium mb-2">LinkedIn Integration</h3>
            <p className="mb-2">Our LinkedIn integration complies with LinkedIn's API Terms of Use:</p>
            
            <p className="mb-2"><strong>Data Usage:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>We only request minimum necessary permissions</li>
              <li>Profile data is used solely for enhancing networking profiles</li>
              <li>We do not store LinkedIn passwords or unauthorized data</li>
              <li>Users can revoke access at any time through LinkedIn settings</li>
            </ul>

            <p className="mb-2"><strong>Compliance Measures:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Regular compliance audits and updates</li>
              <li>Secure data handling and storage</li>
              <li>Respect for LinkedIn's rate limits and usage policies</li>
              <li>Immediate removal of data upon user request</li>
            </ul>

            <h3 className="text-base font-medium mb-2">Instagram Integration</h3>
            <p className="mb-2">Our Instagram integration follows Instagram Basic Display API policies:</p>
            
            <p className="mb-2"><strong>Data Usage:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Access only to public profile information and recent posts</li>
              <li>Content analysis for professional interests only</li>
              <li>No access to private messages or restricted content</li>
              <li>Compliance with Instagram's content and usage policies</li>
            </ul>

            <p className="mb-2"><strong>User Control:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Clear consent process before accessing Instagram data</li>
              <li>Easy disconnection through app settings</li>
              <li>Respect for Instagram's data retention policies</li>
            </ul>

            <h2 className="text-lg font-semibold mb-3 mt-6">Data Security</h2>
            
            <h3 className="text-base font-medium mb-2">Security Measures</h3>
            <p className="mb-2"><strong>Encryption:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>All data transmitted using TLS 1.3 encryption</li>
              <li>Sensitive data encrypted at rest using AES-256</li>
              <li>API keys and tokens stored in secure key management systems</li>
            </ul>

            <p className="mb-2"><strong>Access Controls:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Multi-factor authentication for all team accounts</li>
              <li>Role-based access controls and principle of least privilege</li>
              <li>Regular security audits and penetration testing</li>
              <li>SOC 2 Type II compliance (planned)</li>
            </ul>

            <p className="mb-2"><strong>Data Protection:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Regular automated backups with encryption</li>
              <li>Secure data centers with physical security measures</li>
              <li>Network security monitoring and intrusion detection</li>
              <li>Regular security training for all team members</li>
            </ul>

            <h3 className="text-base font-medium mb-2">Incident Response</h3>
            <p className="mb-2">In the event of a data breach:</p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Immediate containment and assessment procedures</li>
              <li>Notification to affected users within 72 hours</li>
              <li>Cooperation with regulatory authorities as required</li>
              <li>Transparent communication about impact and remediation</li>
            </ul>

            <h2 className="text-lg font-semibold mb-3 mt-6">Your Rights and Choices</h2>
            
            <h3 className="text-base font-medium mb-2">Account Management</h3>
            <p className="mb-2"><strong>Profile Control:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Edit or update profile information at any time</li>
              <li>Choose which information to make public</li>
              <li>Control conversation starter preferences</li>
              <li>Manage networking visibility settings</li>
            </ul>

            <p className="mb-2"><strong>Social Media Connections:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Connect or disconnect social media accounts</li>
              <li>Control which social media data to include</li>
              <li>Revoke access permissions through third-party platforms</li>
              <li>Request fresh analysis of updated social profiles</li>
            </ul>

            <h3 className="text-base font-medium mb-2">Data Rights</h3>
            <p className="mb-2"><strong>Access and Portability:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Download a copy of your personal data</li>
              <li>Request information about data processing activities</li>
              <li>Receive data in a machine-readable format</li>
            </ul>

            <p className="mb-2"><strong>Correction and Deletion:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Correct inaccurate personal information</li>
              <li>Delete your account and associated data</li>
              <li>Request removal of specific data elements</li>
              <li>Opt out of AI-generated content features</li>
            </ul>

            <p className="mb-2"><strong>Communication Preferences:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Unsubscribe from marketing communications</li>
              <li>Control push notifications and alerts</li>
              <li>Set communication frequency preferences</li>
              <li>Opt out of data sharing for marketing purposes</li>
            </ul>

            <h3 className="text-base font-medium mb-2">Geographic Rights</h3>
            <p className="mb-2"><strong>European Users (GDPR):</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Right to access, rectify, and erase personal data</li>
              <li>Right to data portability and restriction of processing</li>
              <li>Right to object to processing and withdraw consent</li>
              <li>Right to lodge complaints with supervisory authorities</li>
            </ul>

            <p className="mb-2"><strong>California Users (CCPA):</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Right to know about personal information collection and use</li>
              <li>Right to delete personal information</li>
              <li>Right to opt out of sale of personal information</li>
              <li>Right to non-discrimination for exercising privacy rights</li>
            </ul>

            <h2 className="text-lg font-semibold mb-3 mt-6">Data Retention</h2>
            
            <h3 className="text-base font-medium mb-2">Retention Periods</h3>
            <p className="mb-2"><strong>Active Accounts:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Profile and account data: Retained while account is active</li>
              <li>Social media data: Refreshed every 90 days or upon user request</li>
              <li>Usage analytics: Aggregated and anonymized after 24 months</li>
              <li>Connection history: Retained for networking relationship continuity</li>
            </ul>

            <p className="mb-2"><strong>Inactive Accounts:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Data deleted after 18 months of inactivity</li>
              <li>Users notified before deletion with opportunity to reactivate</li>
              <li>Essential data (for legal compliance) retained as required by law</li>
            </ul>

            <p className="mb-2"><strong>Deleted Accounts:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Immediate removal of personal profile information</li>
              <li>Anonymization of usage data within 30 days</li>
              <li>Backup data removed within 90 days</li>
              <li>Legal hold data retained only as required</li>
            </ul>

            <h3 className="text-base font-medium mb-2">Data Minimization</h3>
            <p className="mb-2">We regularly review and delete:</p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Unnecessary social media data beyond profile enhancement needs</li>
              <li>Outdated usage analytics and performance data</li>
              <li>Temporary files and cached information</li>
              <li>Redundant backup copies beyond retention requirements</li>
            </ul>

            <h2 className="text-lg font-semibold mb-3 mt-6">International Data Transfers</h2>
            
            <h3 className="text-base font-medium mb-2">Global Operations</h3>
            <p className="mb-2">Ping operates globally and may transfer data internationally:</p>
            
            <p className="mb-2"><strong>Transfer Safeguards:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Standard Contractual Clauses (SCCs) for EU data transfers</li>
              <li>Privacy Shield certification (where applicable)</li>
              <li>Adequacy decisions and local data protection measures</li>
              <li>Regular compliance reviews and updates</li>
            </ul>

            <p className="mb-2"><strong>Data Localization:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>EU user data processed within EU/EEA when possible</li>
              <li>California user data processed within United States</li>
              <li>Local storage requirements respected where mandated by law</li>
            </ul>

            <h2 className="text-lg font-semibold mb-3 mt-6">Children's Privacy</h2>
            <p className="mb-4">
              Ping is designed for professional networking and is not intended for use by individuals under 18 years of age. We do not knowingly collect personal information from children under 18. If we become aware that we have collected information from a child under 18, we will take immediate steps to delete such information.
            </p>
            <p className="mb-4">
              Parents or guardians who believe their child has provided information to us should contact us immediately at talkwithping@gmail.com.
            </p>

            <h2 className="text-lg font-semibold mb-3 mt-6">Updates to Privacy Policy</h2>
            
            <h3 className="text-base font-medium mb-2">Change Notification</h3>
            <p className="mb-2">We may update this Privacy Policy periodically to reflect:</p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Changes in our data practices or Service features</li>
              <li>Updates to legal requirements or regulatory guidance</li>
              <li>Enhanced security measures or privacy protections</li>
              <li>User feedback and best practice improvements</li>
            </ul>

            <p className="mb-2"><strong>Notification Process:</strong></p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Email notification for material changes</li>
              <li>In-app notifications for significant updates</li>
              <li>30-day notice period for substantial modifications</li>
              <li>Continued use constitutes acceptance of changes</li>
            </ul>

            <h3 className="text-base font-medium mb-2">Version History</h3>
            <p className="mb-4">We maintain a history of privacy policy versions and will provide previous versions upon request for transparency and compliance purposes.</p>

            <h2 className="text-lg font-semibold mb-3 mt-6">Contact Information</h2>
            
            <h3 className="text-base font-medium mb-2">Privacy Inquiries</h3>
            <p className="mb-2">For questions about this Privacy Policy or our data practices:</p>
            <ul className="list-none mb-4 space-y-1">
              <li><strong>Email:</strong> talkwithping@gmail.com</li>
              <li><strong>Response Time:</strong> We respond to privacy inquiries within 72 hours</li>
            </ul>

            <h3 className="text-base font-medium mb-2">Data Protection Officer</h3>
            <p className="mb-2">For GDPR-related inquiries:</p>
            <p className="mb-4"><strong>Email:</strong> talkwithping@gmail.com</p>

            <h3 className="text-base font-medium mb-2">Regulatory Complaints</h3>
            <ul className="list-none mb-4 space-y-1">
              <li><strong>EU Users:</strong> Contact your local supervisory authority</li>
              <li><strong>California Users:</strong> Contact the California Attorney General's Office</li>
              <li><strong>Other Jurisdictions:</strong> Contact your local data protection authority</li>
            </ul>

            <div className="border-t pt-6 mt-6">
              <h2 className="text-lg font-semibold mb-3">Platform-Specific Disclosures</h2>
              
              <h3 className="text-base font-medium mb-2">Social Profile Links</h3>
              <p className="mb-4">
                Users can manually add their social media profile links (LinkedIn, Instagram, etc.) to enhance their networking profiles. These links are used to display contact information and help facilitate professional connections. Users have full control over which links they choose to include.
              </p>
            </div>

            <div className="border-t pt-4 mt-6">
              <p className="text-sm text-muted-foreground">
                <strong>This Privacy Policy is designed to be transparent, comprehensive, and compliant with all applicable laws and platform requirements. We are committed to protecting your privacy while enabling meaningful professional connections through our innovative networking platform.</strong>
              </p>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>;
};
export default PrivacyPolicyModal;