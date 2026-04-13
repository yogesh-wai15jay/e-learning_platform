const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/User');
const router = express.Router();

// Topic data with subtopics
const topicsData = {
  "Secure & Responsible AI Usage": {
    id: "secure-ai",
    title: "Secure & Responsible AI Usage",
    estimatedTime: 60,
    contentAvailable: true,
    // Inside topicsData["Secure & Responsible AI Usage"]
subtopics: [
  {
    id: 1,
    title: "Module 1: The New AI Risk Landscape",
    estimatedTime: 5,
    content: `
      <div class="module-content">
        <h2 class="text-2xl font-bold text-blue-700 mb-4">Module 1: The New AI Risk Landscape</h2>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Objective</h3>
        <p class="mb-3">Understand modern AI risks and why traditional security thinking is insufficient.</p>
        <p class="mb-3">AI tools such as chatbots, code generators, and data analyzers rely heavily on user input. While this interaction may seem harmless, the data entered into these systems can be stored, processed externally, or even used to improve the model. This creates a serious risk when employees unknowingly share confidential or proprietary information.</p>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Key Risks</h3>
        <ul class="list-disc pl-6 mb-3">
          <li>Inputting sensitive data into public AI tools</li>
          <li>Data being logged or reused by providers</li>
          <li>Shadow AI (use of unapproved tools)</li>
          <li>Prompt injection or indirect exposure</li>
        </ul>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Impact</h3>
        <ul class="list-disc pl-6 mb-3">
          <li>Regulatory penalties (GDPR, DPDP Act, etc.)</li>
          <li>Reputational damage</li>
          <li>Loss of competitive advantage</li>
        </ul>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Key Insight</h3>
        <p class="italic bg-yellow-50 p-2 rounded">AI tools are <strong>not private by default</strong>—treat them as <strong>external systems</strong> unless explicitly secured.</p>
      </div>
    `
  },
  {
    id: 2,
    title: "Module 2: Core Principles of Secure AI Usage",
    estimatedTime: 5,
    content: `
      <div class="module-content">
        <h2 class="text-2xl font-bold text-blue-700 mb-4">Module 2: Core Principles of Secure AI Usage</h2>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Objective</h3>
        <p class="mb-3">Adopt a Zero-Trust mindset.</p>
        <p class="mb-3">A secure approach to AI starts with the assumption that no system is inherently safe. Every interaction with an AI tool should be treated cautiously, especially when it involves organizational data. The goal is to minimize exposure while still benefiting from AI capabilities.</p>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Principles</h3>
        <ul class="list-disc pl-6 mb-3">
          <li><strong>Never Input Sensitive Data</strong> → Assume prompts are public</li>
          <li><strong>Least Privilege</strong> → Share only minimum required data</li>
          <li><strong>Verify Outputs</strong> → AI responses must be validated</li>
          <li><strong>Document Usage</strong> → Maintain logs for compliance</li>
          <li><strong>Use Privacy-First Tools</strong> → Prefer enterprise AI</li>
        </ul>
      </div>
    `
  },
  {
    id: 3,
    title: "Module 3: Identifying Sensitive Data",
    estimatedTime: 5,
    content: `
      <div class="module-content">
        <h2 class="text-2xl font-bold text-blue-700 mb-4">Module 3: Identifying Sensitive Data</h2>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Objective</h3>
        <p class="mb-3">Recognize and classify sensitive organizational data.</p>
        <p class="mb-3">Sensitive data refers to any information that is not meant for public access and could harm the organization if exposed. Employees often underestimate what qualifies as sensitive, which increases the risk of accidental leaks.</p>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Types of Sensitive Data</h3>
        <ol class="list-decimal pl-6 mb-3">
          <li><strong>Personally Identifiable Information (PII)</strong><br>Names, phone numbers, addresses, Aadhaar, PAN</li>
          <li><strong>Financial Information</strong><br>Revenue data, transaction records, banking details</li>
          <li><strong>Business & Strategic Data</strong><br>Product roadmaps, marketing strategies, internal reports</li>
          <li><strong>Intellectual Property</strong><br>Source code, designs, proprietary algorithms</li>
          <li><strong>Confidential Communications</strong><br>Emails, internal discussions</li>
        </ol>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Key Insight</h3>
        <p class="italic bg-yellow-50 p-2 rounded">If the data is restricted within your organization, it should not be shared with external AI tools without safeguards.</p>
      </div>
    `
  },
  {
    id: 4,
    title: "Module 4: Understanding Data Leakage in AI",
    estimatedTime: 5,
    content: `
      <div class="module-content">
        <h2 class="text-2xl font-bold text-blue-700 mb-4">Module 4: Understanding Data Leakage in AI</h2>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Objective</h3>
        <p class="mb-3">Understand how and where data leakage happens.</p>
        <p class="mb-3">Data leakage in AI systems can occur at multiple stages, often without the user realizing it. From the moment a prompt is entered to how it is stored or transmitted, each step presents a potential risk if not properly secured.</p>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Leakage Points</h3>
        <ul class="list-disc pl-6 mb-3">
          <li>Input stage (prompt entry)</li>
          <li>Transmission (network risks)</li>
          <li>Storage (logs, caching, training datasets)</li>
        </ul>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Common Scenarios</h3>
        <ul class="list-disc pl-6 mb-3">
          <li>Copy-pasting source code into AI tools</li>
          <li>Uploading confidential documents</li>
          <li>Using unapproved AI tools</li>
        </ul>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Key Takeaway</h3>
        <p class="italic bg-yellow-50 p-2 rounded">Every prompt is a potential data leak.</p>
      </div>
    `
  },
  {
    id: 5,
    title: "Module 5: Safe Prompt Engineering Techniques",
    estimatedTime: 6,
    content: `
      <div class="module-content">
        <h2 class="text-2xl font-bold text-blue-700 mb-4">Module 5: Safe Prompt Engineering Techniques</h2>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Objective</h3>
        <p class="mb-3">Use AI effectively while minimizing risk.</p>
        <p class="mb-3">Safe prompt engineering focuses on extracting value from AI without exposing real data. Instead of directly sharing sensitive information, users should restructure inputs in a way that preserves confidentiality.</p>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Techniques</h3>
        <ul class="list-disc pl-6 mb-3">
          <li>Replace real data with placeholders → "Client X", "Revenue = ₹X crore"</li>
          <li>Use hypothetical scenarios</li>
          <li>Separate context from sensitive inputs</li>
          <li>Avoid sharing actual records</li>
        </ul>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Anonymization Methods</h3>
        <ul class="list-disc pl-6 mb-3">
          <li>Masking → XXXX-1234</li>
          <li>Pseudonymization → "Customer A"</li>
          <li>Aggregation → "Sales increased by 20%"</li>
        </ul>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Example</h3>
        <p><strong>Original:</strong> "Rohit Sharma from Delhi spent ₹50,000"</p>
        <p><strong>Anonymized:</strong> "Customer A from City X made a high-value purchase"</p>
      </div>
    `
  },
  {
    id: 6,
    title: "Module 6: Choosing the Right AI Access Model",
    estimatedTime: 5,
    content: `
      <div class="module-content">
        <h2 class="text-2xl font-bold text-blue-700 mb-4">Module 6: Choosing the Right AI Access Model</h2>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Objective</h3>
        <p class="mb-3">Select AI platforms based on data sensitivity.</p>
        <p class="mb-3">Not all AI tools offer the same level of privacy. Choosing the right platform is critical because it directly determines how your data is handled, stored, and potentially reused.</p>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Three-Tier Model</h3>
        <table class="min-w-full border mb-3">
          <thead><tr class="bg-gray-100"><th class="border p-2">Model</th><th class="border p-2">Risk</th><th class="border p-2">Use Case</th><th class="border p-2">Data Privacy</th></tr></thead>
          <tbody>
            <tr><td class="border p-2">Public AI</td><td class="border p-2">High</td><td class="border p-2">Brainstorming</td><td class="border p-2">Data may be used</td></tr>
            <tr><td class="border p-2">Enterprise AI</td><td class="border p-2">Low</td><td class="border p-2">Business tasks</td><td class="border p-2">No training on your data</td></tr>
            <tr><td class="border p-2">Private AI</td><td class="border p-2">Negligible</td><td class="border p-2">Sensitive data</td><td class="border p-2">Fully internal</td></tr>
          </tbody>
        </table>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Guidance</h3>
        <ul class="list-disc pl-6 mb-3">
          <li>Avoid public tools for internal data</li>
          <li>Use enterprise AI for routine work</li>
          <li>Use private AI for critical assets</li>
        </ul>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Key Takeaway</h3>
        <p class="italic bg-yellow-50 p-2 rounded">Where you use AI determines where your data goes.</p>
      </div>
    `
  },
  {
    id: 7,
    title: "Module 7: Data Classification & Organizational Policy",
    estimatedTime: 5,
    content: `
      <div class="module-content">
        <h2 class="text-2xl font-bold text-blue-700 mb-4">Module 7: Data Classification & Organizational Policy</h2>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Objective</h3>
        <p class="mb-3">Define structured data handling rules.</p>
        <p class="mb-3">A well-defined policy ensures that employees clearly understand what data can be used with AI tools and under what conditions. Without this clarity, even well-intentioned users may make risky decisions.</p>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Three-Tier Data Policy</h3>
        <ul class="list-disc pl-6 mb-3">
          <li><strong>Tier 1: Public Data</strong> – Marketing content, public documentation ✅ Safe for most AI tools</li>
          <li><strong>Tier 2: Internal Data</strong> – Project plans, internal notes ⚠ Use only enterprise AI</li>
          <li><strong>Tier 3: Highly Sensitive Data</strong> – Source code, PII, financial records ❌ Never use with public AI</li>
        </ul>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Policy Elements</h3>
        <ul class="list-disc pl-6 mb-3">
          <li>Approved AI tools list</li>
          <li>Data classification framework</li>
          <li>Usage approval workflows</li>
          <li>Defined roles and responsibilities</li>
        </ul>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Key Insight</h3>
        <p class="italic bg-yellow-50 p-2 rounded">Clear policies reduce ambiguity and prevent misuse.</p>
      </div>
    `
  },
  {
    id: 8,
    title: "Module 8: Technical Safeguards",
    estimatedTime: 6,
    content: `
      <div class="module-content">
        <h2 class="text-2xl font-bold text-blue-700 mb-4">Module 8: Technical Safeguards</h2>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Objective</h3>
        <p class="mb-3">Implement system-level protections.</p>
        <p class="mb-3">Technology plays a crucial role in preventing data leakage, especially when human error is unavoidable. A defense-in-depth strategy ensures that even if one layer fails, others continue to protect the system.</p>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Key Controls</h3>
        <ol class="list-decimal pl-6 mb-3">
          <li><strong>DLP (Data Loss Prevention)</strong> – Detects and blocks sensitive data, and can automatically redact critical information.</li>
          <li><strong>Zero Retention Settings</strong> – Disables data storage and model training on user inputs.</li>
          <li><strong>Secure Deployment</strong> – Use VPC environments and private endpoints to keep AI within controlled infrastructure.</li>
          <li><strong>Encryption</strong> – TLS protects data in transit, while encryption at rest secures stored data.</li>
          <li><strong>Access Control</strong> – SSO, role-based access, and audit logs ensure accountability.</li>
        </ol>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Emerging Solutions</h3>
        <ul class="list-disc pl-6 mb-3">
          <li>AI firewalls</li>
          <li>Confidential computing</li>
          <li>Encrypted prompts</li>
        </ul>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Key Takeaway</h3>
        <p class="italic bg-yellow-50 p-2 rounded">Even if users make mistakes, systems should prevent leakage.</p>
      </div>
    `
  },
  {
    id: 9,
    title: "Module 9: Secure AI Solutions & Architecture",
    estimatedTime: 5,
    content: `
      <div class="module-content">
        <h2 class="text-2xl font-bold text-blue-700 mb-4">Module 9: Secure AI Solutions & Architecture</h2>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Objective</h3>
        <p class="mb-3">Explore safer AI alternatives.</p>
        <p class="mb-3">Organizations handling sensitive data often move beyond public AI tools and adopt controlled environments. These solutions provide greater control over how data is processed and ensure compliance with regulatory standards.</p>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Options</h3>
        <ul class="list-disc pl-6 mb-3">
          <li>Private AI models (on-premise)</li>
          <li>Local LLM tools</li>
          <li>Secure cloud AI with strict controls</li>
          <li>RAG systems with controlled access</li>
        </ul>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Advantages</h3>
        <ul class="list-disc pl-6 mb-3">
          <li>Greater data control</li>
          <li>Reduced external exposure</li>
          <li>Improved compliance</li>
        </ul>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Best Practice</h3>
        <p class="italic bg-yellow-50 p-2 rounded">Use private or controlled AI environments for sensitive workflows.</p>
      </div>
    `
  },
  {
    id: 10,
    title: "Module 10: Employee Awareness & Culture",
    estimatedTime: 5,
    content: `
      <div class="module-content">
        <h2 class="text-2xl font-bold text-blue-700 mb-4">Module 10: Employee Awareness & Culture</h2>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Objective</h3>
        <p class="mb-3">Build secure habits across the organization.</p>
        <p class="mb-3">Most AI-related data leaks are not caused by technical failures but by human mistakes. Building awareness and promoting responsible behavior is therefore one of the most effective defenses.</p>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Common Mistakes</h3>
        <ul class="list-disc pl-6 mb-3">
          <li>Copy-pasting confidential data</li>
          <li>Uploading internal files without review</li>
          <li>Assuming AI tools are private</li>
        </ul>
        <h3 class="text-xl font-semibold text-gray-800 mt-4 mb-2">Best Practices</h3>
        <ul class="list-disc pl-6 mb-3">
          <li>Always review before sharing</li>
          <li>Use placeholders instead of real data</li>
          <li>Follow organizational policies</li>
        </ul>
        <div class="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500">
          <h3 class="text-xl font-semibold">Final Key Takeaways</h3>
          <p>AI security is no longer just a technical concern—it is a shared responsibility across the organization. The combination of proper data classification, careful tool selection, and strong user awareness forms the foundation of secure AI adoption. By integrating policy, technology, and human judgment, organizations can safely leverage AI while minimizing the risk of data leakage.</p>
        </div>
      </div>
    `
  }
]
  },
  "Server Policies": {
    id: "server-policies",
    title: "Server Policies",
    estimatedTime: 45,
    contentAvailable: false,
    subtopics: [],
    placeholderContent: "<h3>Server Policies</h3><p>Content coming soon. This topic will cover server configuration, security policies, and best practices for server management.</p>"
  },
  "Scenario based questions": {
    id: "scenario-questions",
    title: "Scenario based questions",
    estimatedTime: 50,
    contentAvailable: false,
    subtopics: [],
    placeholderContent: "<h3>Scenario Based Questions</h3><p>Content coming soon. This topic will include practical scenarios and case studies for better understanding.</p>"
  }
};

// Get all topics with user progress and module completion counts
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const topics = Object.keys(topicsData).map(topicName => {
      const topic = topicsData[topicName];
      const topicProgress = user.topicsProgress.get(topicName) || { completed: false, lastQuizAttemptDate: null, passed: false };
      const moduleProg = user.moduleProgress?.get(topic.id);
      const completedModules = moduleProg?.completedModules?.length || 0;
      const totalModules = topic.subtopics ? topic.subtopics.length : 0;
      return {
        name: topicName,
        id: topic.id,
        estimatedTime: topic.estimatedTime,
        contentAvailable: topic.contentAvailable,
        progress: topicProgress,
        completedModules,
        totalModules
      };
    });
    res.json(topics);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get topic details (unchanged)
router.get('/:topicId', auth, async (req, res) => {
  try {
    const { topicId } = req.params;
    const topic = Object.values(topicsData).find(t => t.id === topicId);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });
    const user = await User.findById(req.user.userId);
    const progress = user.topicsProgress.get(topic.title) || { completed: false, lastQuizAttemptDate: null, passed: false };
    res.json({ ...topic, progress });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Save module progress for a topic
router.post('/:topicId/progress', auth, async (req, res) => {
  try {
    const { topicId } = req.params;
    const { completedModules, currentModuleIndex } = req.body;
    const user = await User.findById(req.user.userId);
    
    const topic = Object.values(topicsData).find(t => t.id === topicId);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });
    
    if (!user.moduleProgress) user.moduleProgress = new Map();
    user.moduleProgress.set(topicId, {
      topicId,
      completedModules: completedModules || [],
      lastModuleIndex: currentModuleIndex || 0
    });
    await user.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get module progress for a topic
router.get('/:topicId/progress', auth, async (req, res) => {
  try {
    const { topicId } = req.params;
    const user = await User.findById(req.user.userId);
    const progress = user.moduleProgress?.get(topicId) || { completedModules: [], lastModuleIndex: 0 };
    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;